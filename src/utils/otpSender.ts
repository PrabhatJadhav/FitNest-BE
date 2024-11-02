// import { authenticator } from "otplib";
// import nodemailer from "nodemailer";
// import { OtpSchema } from "../model/otpModel";
// require("dotenv").config();

// const otpExpiry = 1 * 60 * 1000; // OTP expiry time in milliseconds (1 minute)

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // Use `true` for port 465, `false` for all other ports
//   auth: {
//     user: process.env.EMAIL_SENDER_ACCOUNT,
//     pass: process.env.EMAIL_SENDER_ACCOUNT_PASSWORD,
//   },
// });

// export const generateOtp = () => {
//   return authenticator.generateSecret();
// };

// export const sendOtp = async (userEmail: string, otp: string) => {
//   if (process.env.EMAIL_SENDER_ACCOUNT) {
//     await transporter.sendMail({
//       from: {
//         name: "Prabhat Test Mails",
//         address: process.env.EMAIL_SENDER_ACCOUNT,
//       }, // sender address
//       to: userEmail, // list of receivers
//       subject: "Your OTP Code",
//       text: `Your OTP code is ${otp}`,
//     });
//   }
// };

// export const verifyEmailOtp = async (userId: string, otp: string) => {
//   try {
//     const otpRecord = await OtpSchema.findOne({ userId, otp });
//     if (!otpRecord || otpRecord.expiresAt < new Date()) {
//       return false;
//     }
//     await OtpSchema.deleteOne({ _id: otpRecord._id });
//     return true;
//   } catch (err) {
//     console.log("err with verify otp", err);
//     return false;
//   }
// };

// export const createOtp = async (userId: string) => {
//   const otp = authenticator.generate(generateOtp());
//   const otpRecord = new OtpSchema({
//     userId,
//     otp,
//     expiresAt: new Date(Date.now() + otpExpiry),
//   });
//   await otpRecord.save();
//   return otp;
// };
