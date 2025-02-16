import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
require('dotenv').config();
import { User } from '../model/user';
import {
  AuthenticatedRequest,
  AuthRequestBody,
} from '../model/request-models/auth-request';
import { JwtTokenPayload } from '../model/jwtTokenPayload.model';
import type { StringValue } from 'ms';
import { UserRoles } from '../enums/roleEnums';
import {
  DECODING_TOKEN_ERROR,
  GENERAL_ERROR,
  INVALID_TOKEN_ERROR,
  NO_TOKEN_ERROR,
  TOKEN_EXPIRED_ERROR,
} from '../constants/messages';

const generateToken = (tokenPayload: JwtTokenPayload): string | null => {
  if (process.env.ACCESS_TOKEN_SECRET && process.env.TOKEN_EXPIRY) {
    const TOKEN_EXPIRY: StringValue = process.env.TOKEN_EXPIRY
      ? isNaN(Number(process.env.TOKEN_EXPIRY))
        ? (process.env.TOKEN_EXPIRY as StringValue)
        : '20m'
      : '20m';

    const options: SignOptions = { expiresIn: TOKEN_EXPIRY };
    try {
      return jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, options);
    } catch (e) {
      return null;
    }
  }

  return null;
};

const createNewUser = async (email: string, password: string) => {
  if (process.env.BCRYPT_SALT) {
    try {
      const hashedPassword = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_SALT, 10),
      );

      const newUser = await User.create({ email, password: hashedPassword });

      return newUser;
    } catch (e) {
      console.log('error creating user', e);
      return null;
    }
  }

  return null;
};

async function authorizeUser(
  req: Request<{}, {}, AuthRequestBody>,
  res: Response,
  user: User,
  existingUser: boolean,
) {
  try {
    const { email, password } = req.body;

    if (existingUser) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    let userPayload: JwtTokenPayload = {
      email: email,
      password: password,
      role: UserRoles.CUSTOMER,
    };

    const token = generateToken(userPayload);

    if (token) {
      return res.status(200).json({ message: 'Login successful', token });
    }

    return res.status(500).json({ message: GENERAL_ERROR });
  } catch (e) {
    console.log('error in authorizeUser', e);
    return res.status(500).json({ message: GENERAL_ERROR });
  }
}

// Middleware to verify JWT token
const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Response | void => {
  try {
    // const token:string = req.headers.Authorization;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: NO_TOKEN_ERROR, devMessage: INVALID_TOKEN_ERROR });
    }

    if (process.env.ACCESS_TOKEN_SECRET) {
      try {
        const decoded: JwtTokenPayload = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET,
        ) as JwtTokenPayload;

        if (!decoded?.email || !decoded?.password || !decoded?.role) {
          return res.status(401).json({
            message: NO_TOKEN_ERROR,
            devMessage: DECODING_TOKEN_ERROR,
          });
        }

        req.user = decoded;
        next();
      } catch (error) {
        return res.status(500).json({
          message: NO_TOKEN_ERROR,
          devMessage: TOKEN_EXPIRED_ERROR,
        });
      }
    } else {
      return res.status(500).json({ message: GENERAL_ERROR });
    }
  } catch (e) {
    console.log('error in authorizeUser', e);
    return res.status(500).json({ message: GENERAL_ERROR });
  }
};

export { authorizeUser, createNewUser, authenticateToken };

// if (process.env.ACCESS_TOKEN_SECRET) {
//   try {
//     let decodedResult: JwtTokenPayload = jwt.verify(
//       token,
//       process.env.ACCESS_TOKEN_SECRET,
//     ) as JwtTokenPayload;

//     if (decodedResult?.userId) {
//       return decodedResult;
//     } else {
//       return null;
//     }
//   } catch (err) {
//     console.log('verifyToken catch', err);
//     return null;
//   }
// } else {
//   return null;
// }
