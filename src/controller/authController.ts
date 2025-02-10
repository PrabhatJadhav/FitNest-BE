import bcrypt from 'bcrypt';

var validator = require('validator');
import { ApiResponse } from '../utils/apiResponse';
import { createOtp, sendOtp, verifyEmailOtp } from '../utils/otpSender';
import {
  generateRefreshToken,
  generateToken,
  verifyToken,
} from '../utils/authUtils';
import { UserRoles } from '../enums/roleEnums';
import { JwtTokenPayload } from '../model/jwtTokenPayload.model';

const customerLogin = async (req: any, res: any, next: any) => {
  //   try {
  //     let userEmail = req.body.email;
  //     let isValidEmail;
  //     if (userEmail) {
  //       isValidEmail = validator.isEmail(userEmail);
  //     }
  //     if (userEmail && isValidEmail) {
  //       const user = await RegisteredUser.findOne({ email: userEmail });
  //       if (user?.email == userEmail && user?._id) {
  //         const otp = await createOtp(user._id.toString());
  //         await sendOtp(userEmail, otp);
  //         res.status(200).json(ApiResponse.success(null, 'Otp sent!', 200));
  //       } else {
  //         res.status(500).json(ApiResponse.failure('User not found!', 500));
  //       }
  //     } else {
  //       res
  //         .status(400)
  //         .json(ApiResponse.success(null, 'Please provide valid Email!', 400));
  //     }
  //   } catch (e) {
  //     console.log('e', e);
  //     res.status(500).json(ApiResponse.failure('Something Went Wrong!', 500));
  //   }
  // for passwords
  // bcrypt
  //   .hash(request.body.password, 10)
  //   .then((hashedPassword) => {
  //     const user = new UserLogin({
  //       email: request.body.email,
  //       password: hashedPassword,
  //     });
  //     user
  //       .save()
  //       .then((result) => {
  //         response.status(200).send({
  //           message: "User Created Successfully",
  //           result,
  //         });
  //       })
  //       .catch((error) => {
  //         response.status(500).send({
  //           message: "Error creating user",
  //           error,
  //         });
  //       });
  //   })
  //   .catch((e) => {
  //     response.status(500).send({
  //       message: "Password was not hashed successfully",
  //       e,
  //     });
  //   });
};

const customerRegister = (req: any, res: any, next: any) => {
  // console.log("req.body", _.get(req.body));
  try {
    let userEmail = req.body.email;
    let isValidEmail;

    if (userEmail) {
      isValidEmail = validator.isEmail(userEmail);
    }

    // if (userEmail && isValidEmail) {
    //   const user = new RegisteredUser({
    //     email: userEmail,
    //   });

    //   user
    //     .save()
    //     .then((result) => {
    //       res.status(200).send({
    //         message: 'User Created Successfully',
    //         result,
    //       });
    //     })
    //     .catch((error) => {
    //       console.log('error', error);
    //       if (
    //         error?.errorResponse?.code == 11000 &&
    //         error?.errorResponse?.keyPattern?.email
    //       ) {
    //         res.status(500).send({
    //           message: 'Email Already Exists!',
    //           error,
    //         });

    //         return;
    //       }

    //       res.status(500).send({
    //         message: 'Error creating user',
    //         error,
    //       });
    //     });
    // } else {
    //   res
    //     .status(400)
    //     .json(ApiResponse.success(null, 'Please provide valid Email!', 400));
    // }
  } catch (e) {
    console.log('e', e);
    res.status(500).json(ApiResponse.failure('Something Went Wrong!', 500));
  }
};

const verifyOtp = async (req: any, res: any, next: any) => {
  try {
    let { otp, userId } = req.body;

    if (otp && userId) {
      try {
        const isValidOtp = await verifyEmailOtp(userId, otp);

        if (!isValidOtp) {
          return res
            .status(500)
            .json(ApiResponse.failure('Invalid or Expired OTP!', 500));
        }

        //  Respond with tokens

        try {
          let payload: JwtTokenPayload = {
            userId: userId,
            role: UserRoles.CUSTOMER,
          };

          const token = generateToken(payload);
          const refreshToken = generateRefreshToken(payload);

          res
            .status(200)
            .json(
              ApiResponse.success(
                { token: token, refreshToken: refreshToken },
                'Otp verified successfully!',
                200,
              ),
            );
        } catch (err) {
          console.log('err with token', err);
          res
            .status(500)
            .json(ApiResponse.failure('Something Went Wrong!', 500));
        }
      } catch {
        res.status(500).json(ApiResponse.failure('Something Went Wrong!', 500));
      }
    } else if (otp && !userId) {
      res.status(400).json(ApiResponse.success(null, 'User not found!', 400));
    } else {
      res
        .status(400)
        .json(ApiResponse.success(null, 'Please provide valid otp!', 400));
    }
  } catch (e) {
    console.log('e', e);
    res.status(500).json(ApiResponse.failure('Something Went Wrong!', 500));
  }
};

const getRefreshToken = async (req: any, res: any, next: any) => {
  try {
    let { refreshToken, userId } = req.body;

    if (refreshToken && userId) {
      const refreshTokenDetails: JwtTokenPayload | null =
        verifyToken(refreshToken);

      if (refreshTokenDetails?.role) {
        try {
          let payload: JwtTokenPayload = {
            userId: userId,
            role: refreshTokenDetails?.role,
          };

          const token = generateToken(payload);

          res
            .status(200)
            .json(
              ApiResponse.success(
                { token: token, refreshToken: refreshToken },
                'New access token generated successfully!',
                200,
              ),
            );
        } catch (err) {
          console.log('err with token', err);
          res
            .status(500)
            .json(ApiResponse.failure('Something Went Wrong!', 500));
        }
      } else {
        res
          .status(401)
          .json(
            ApiResponse.success(
              null,
              'Please provide valid refresh token!',
              401,
            ),
          );
      }
    } else if (refreshToken && !userId) {
      res.status(400).json(ApiResponse.success(null, 'User not found!', 400));
    } else {
      res
        .status(401)
        .json(
          ApiResponse.success(null, 'Please provide valid refresh token!', 401),
        );
    }
  } catch (e) {
    console.log('e', e);
    res.status(500).json(ApiResponse.failure('Something Went Wrong!', 500));
  }
};

export { customerRegister, customerLogin, verifyOtp, getRefreshToken };
