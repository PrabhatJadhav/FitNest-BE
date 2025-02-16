import { Request, Response } from 'express';
import { AuthRequestBody } from '../model/request-models/auth-request';
import { User } from '../model/user';
import { authorizeUser, createNewUser } from '../utils/authUtils';
import { GENERAL_ERROR } from '../constants/messages';

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

    if (user?.email) {
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

export { login };
// export { customerRegister, customerLogin, verifyOtp, getRefreshToken };
