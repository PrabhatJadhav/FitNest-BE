import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import twilioClient from 'twilio';
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
  INVALID_OTP_ERROR,
  INVALID_TOKEN_ERROR,
  NEW_TOKEN_GENERATION_SUCCESS,
  NO_OTP_ERROR,
  NO_TOKEN_ERROR,
  OTP_SENDING_ERROR,
  OTP_SENDING_SUCCESSFULLY,
  OTP_VERIFIED_SUCCESSFULLY,
  REFRESH_TOKEN_MISSING,
  SESSION_EXPIRED,
  TOKEN_EXPIRED_ERROR,
  USER_ID_MISSING,
  USER_ID_NOT_FOUND,
} from '../constants/messages';
import { Otp } from '../model/otp';

const generateToken = (tokenPayload: JwtTokenPayload): string | null => {
  if (
    process.env.ACCESS_TOKEN_SECRET &&
    process.env.TOKEN_EXPIRY &&
    tokenPayload?.id
  ) {
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

const generateRefreshToken = (tokenPayload: JwtTokenPayload): string | null => {
  if (process.env.REFRESH_TOKEN_SECRET && process.env.TOKEN_EXPIRY) {
    const TOKEN_EXPIRY: StringValue = process.env.TOKEN_EXPIRY
      ? isNaN(Number(process.env.TOKEN_EXPIRY))
        ? (process.env.TOKEN_EXPIRY as StringValue)
        : '20m'
      : '20m';

    const options: SignOptions = { expiresIn: TOKEN_EXPIRY };
    try {
      return jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET, options);
    } catch (e) {
      return null;
    }
  }

  return null;
};

const generateTokenWithRefreshToken = async (req: any, res: any, next: any) => {
  try {
    let { refreshToken } = req.body;

    if (refreshToken && process.env.REFRESH_TOKEN_SECRET) {
      try {
        const refreshTokenDetails: JwtTokenPayload | null = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        ) as JwtTokenPayload;

        if (refreshTokenDetails?.id) {
          let user = await User.findOne({
            where: { id: refreshTokenDetails?.id },
          });

          if (user?.id) {
            try {
              let payload: JwtTokenPayload = {
                id: user?.id,
                role: UserRoles.CUSTOMER,
              };

              const token = generateToken(payload);

              return res.status(200).json({
                message: NEW_TOKEN_GENERATION_SUCCESS,
                token,
                refreshToken,
              });
            } catch (e) {
              return res.status(500).json({ message: GENERAL_ERROR });
            }
          } else {
            return res.status(500).json({
              message: GENERAL_ERROR,
              devMessage: USER_ID_NOT_FOUND,
            });
          }
        } else {
          return res.status(500).json({ message: GENERAL_ERROR });
        }
      } catch (err) {
        console.log('err with token', err);
        return res
          .status(401)
          .json({ message: SESSION_EXPIRED, devMessage: TOKEN_EXPIRED_ERROR });
      }
    } else if (!refreshToken) {
      return res
        .status(400)
        .json({ message: GENERAL_ERROR, devMessage: REFRESH_TOKEN_MISSING });
    }
  } catch (e) {
    console.log('e', e);
    return res.status(500).json({ message: GENERAL_ERROR });
  }
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
      id: user.id,
      role: UserRoles.CUSTOMER,
    };

    const token = generateToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    if (token && refreshToken) {
      return res
        .status(200)
        .json({ message: 'Login successful', token, refreshToken });
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

        if (!decoded?.id || !decoded?.role) {
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

const verifyOtp = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  let { otp } = req.body;

  if (!otp) {
    return res.status(500).json({ message: NO_OTP_ERROR });
  }

  try {
    // const isValidOtp = await verifyEmailOtp(userId, otp);

    if (true) {
      return res.status(200).json({ message: OTP_VERIFIED_SUCCESSFULLY });
    } else {
      return res.status(500).json({ message: INVALID_OTP_ERROR });
    }
  } catch (e) {
    console.log('e', e);
    return res.status(500).json({ message: GENERAL_ERROR });
  }
};

const sendOtpToUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  // const user = req.user;
  // if (user?.id) {
  //   try {
  //     if (
  //       process.env.TWILIO_ACCOUNT_SID &&
  //       process.env.TWILIO_AUTH_TOKEN &&
  //       process.env.TWILIO_SERVICE_SID
  //     ) {
  //       let otpSendResult = await twilioClient(
  //         process.env.TWILIO_ACCOUNT_SID,
  //         process.env.TWILIO_AUTH_TOKEN,
  //       )
  //         .verify.v2.services(process.env.TWILIO_SERVICE_SID)
  //         .verifications.create({ to: '+917506514656', channel: 'sms' });
  //       console.log('otpSendResult', otpSendResult);
  //       if (otpSendResult) {
  //         return res.status(200).json({ message: OTP_SENDING_SUCCESSFULLY });
  //       } else {
  //         return res.status(500).json({ message: OTP_SENDING_ERROR });
  //       }
  //     } else {
  //       return res.status(500).json({ message: OTP_SENDING_ERROR });
  //     }
  //   } catch (e) {
  //     console.log('e', e);
  //     return res.status(500).json({ message: OTP_SENDING_ERROR });
  //   }
  // }
  // return res
  //   .status(500)
  //   .json({ message: GENERAL_ERROR, devMessage: USER_ID_MISSING });
};

export {
  authorizeUser,
  createNewUser,
  authenticateToken,
  generateTokenWithRefreshToken,
  verifyOtp,
  sendOtpToUser,
};

// .then(async (verification) => {
//             console.log('otp send ==>', verification);

//             // const newOtp = await Otp.create({
//             //   userId: user.id,
//             //   otp: otp,
//             // });

//             // console.log('newOtp', newOtp);
//             res.status(200).json({ message: OTP_SENDING_SUCCESSFULLY });
//           })

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
