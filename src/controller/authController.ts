import { Request, Response } from 'express';
import { AuthRequestBody } from '../model/request-models/auth-request';
import { User } from '../model/user';
import {
  authorizeUser,
  createNewUser,
  generateTokenWithRefreshToken,
} from '../utils/authUtils';
import { GENERAL_ERROR, REFRESH_TOKEN_MISSING } from '../constants/messages';

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

    console.log('user', user?.get('id'));

    if (user?.get('id')) {
      return authorizeUser(req, res, user, true);
    } else {
      user = await createNewUser(email, password);

      if (user) return authorizeUser(req, res, user, false);

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

export { login, getRefreshToken };
// export { customerRegister, customerLogin, verifyOtp, getRefreshToken };
