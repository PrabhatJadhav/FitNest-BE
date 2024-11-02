// import cron from "node-cron";
// import { OtpSchema } from "../model/otpModel";
// import moment from "moment-timezone";

// // Schedule the task to run every hour
// cron.schedule("0 * * * *", async () => {
//   console.log("Running OTP cleanup job");

//   const now = new Date();

//   try {
//     // Delete OTPs that are expired
//     const result = await OtpSchema.deleteMany({ expiresAt: { $lt: now } });
//     console.log(`Deleted ${result.deletedCount} expired OTPs`);
//   } catch (error) {
//     console.error("Error while deleting expired OTPs", error);
//   }
// });

/**
 * If we want to run a cron job at a specific time
 *
 *
 */

// Function to delete expired OTPs
// const deleteExpiredOtps = async () => {
//   const now = new Date();
//   try {
//     const result = await OtpSchema.deleteMany({ expiresAt: { $lt: now } });
//     console.log(`Deleted ${result.deletedCount} expired OTPs`);
//   } catch (error) {
//     console.error('Error while deleting expired OTPs', error);
//   }
// };

// Schedule the task to run at 03:00 AM Asia/Kolkata time
// cron.schedule('0 3 * * *', () => {
//   const currentTime = moment().tz('Asia/Kolkata').format('HH:mm');
//   if (currentTime === '03:00') {
//     console.log('Running OTP cleanup job at 03:00 AM Asia/Kolkata time');
//     deleteExpiredOtps();
//   }
// });
