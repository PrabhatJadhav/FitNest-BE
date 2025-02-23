import { Request, Response } from 'express';
import {
  AuthenticatedRequest,
  AuthRequestBody,
} from '../model/request-models/auth-request';
import { User } from '../model/user';
import {
  userLogin,
  createNewUser,
  generateTokenWithRefreshToken,
  sendOtpToUser,
} from '../utils/authUtils';
import {
  DATA_NOT_FOUND,
  GENERAL_ERROR,
  NO_DATA_TO_UPDATE,
  REFRESH_TOKEN_MISSING,
  USER_ID_NOT_FOUND,
  USER_NOT_UPDATED,
  USER_UPDATED,
} from '../constants/messages';

const login = async (
  req: Request<{}, {}, AuthRequestBody>,
  res: Response,
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ where: { email } });

    // console.log('user', user?.get('id'));

    if (user?.get('id')) {
      return userLogin(req, res, user, true);
    } else {
      user = await createNewUser(email, password);

      if (user) return userLogin(req, res, user, false);

      return res.status(500).json({ message: GENERAL_ERROR });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: GENERAL_ERROR });
  }
};

const getRefreshToken = async (req: any, res: any, next: any) => {
  try {
    let { refreshToken } = req.body;

    if (refreshToken) {
      generateTokenWithRefreshToken(req, res, next);
    } else {
      return res
        .status(400)
        .json({ message: GENERAL_ERROR, devMessage: REFRESH_TOKEN_MISSING });
    }
  } catch (e) {
    console.log('e', e);
    return res.status(500).json({ message: GENERAL_ERROR });
  }
};

const sendOtp = async (req: any, res: any, next: any) => {
  const user = req.user;

  if (!user?.id) {
    return res.status(400).json({ message: USER_ID_NOT_FOUND });
  }

  sendOtpToUser(req, res, next);
};

async function updateUser(
  req: AuthenticatedRequest<{ data: any }>,
  res: Response,
) {
  const { data } = req.body;
  const user = req.user;

  if (!user?.id) {
    return res.status(400).json({ message: USER_ID_NOT_FOUND });
  }

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ message: DATA_NOT_FOUND });
  }

  const allowedFieldsToUpdate = [
    'password',
    'email',
    'lifestyle_type',
    'diet_type',
    'total_sleep',
    'eat_out',
  ]; // Only these fields can be updated

  const filteredUpdates: Record<string, any> = {};

  for (const key of Object.keys(data)) {
    if (allowedFieldsToUpdate.includes(key)) {
      filteredUpdates[key] = data[key];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    return res.status(400).json({ message: NO_DATA_TO_UPDATE });
  }

  try {
    const [updatedCount, updatedUsers] = await User.update(data, {
      where: { id: user.dataValues.id },
      returning: true,
    });

    if (updatedCount && updatedUsers[0]) {
      const updatedUser = updatedUsers[0].toJSON();
      delete updatedUser.password;
      delete updatedUser.createAt;
      delete updatedUser.updatedAt;

      return res.status(200).json({ message: USER_UPDATED, user: updatedUser });
    } else {
      return res.status(500).json({ message: USER_NOT_UPDATED });
    }
  } catch (e) {
    console.log('error updating user', e);
    return res.status(500).json({ message: USER_NOT_UPDATED });
  }
}

export { login, getRefreshToken, sendOtp, updateUser };
