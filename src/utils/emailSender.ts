/*** 
Code not in use,
 
Only kept for testing purpose and understanding the functionality

***/

import nodemailer from "nodemailer";
require("dotenv").config();

async function sentEmail(receiverEmail: string) {
  if (!receiverEmail) {
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_SENDER_ACCOUNT,
      pass: process.env.EMAIL_SENDER_ACCOUNT_PASSWORD,
    },
  });

  // send mail with defined transport object
  if (process.env.EMAIL_SENDER_ACCOUNT) {
    const info: any = await transporter.sendMail({
      from: {
        name: "Prabhat Test Mails",
        address: process.env.EMAIL_SENDER_ACCOUNT,
      }, // sender address
      to: receiverEmail, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: `<b>Hello world?</b> OTP ==> ${Math.floor(
        100000 + Math.random() * 900000
      )}`,
    });

    console.log("Message sent: %s", info?.messageId);
  }

  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

export { sentEmail };
