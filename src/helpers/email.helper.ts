import nodemailer from "nodemailer";
import { ENV } from "../config/env";
import { logger } from "../config/logger";

const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: false,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Zonerlost" <${ENV.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error("Email send failed:", error);
    throw error;
  }
};

export const otpEmailTemplate = (
  otp: string,
  firstName: string
): string => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verify Your Email</title></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:10px;padding:30px;">
    <h2 style="color:#1a1a2e;">Hi ${firstName},</h2>
    <p style="color:#555;">Your verification code for Zonerlost is:</p>
    <div style="text-align:center;margin:30px 0;">
      <span style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#00b4a6;">${otp}</span>
    </div>
    <p style="color:#555;">This code expires in 10 minutes.</p>
    <p style="color:#999;font-size:12px;">If you did not create an account, please ignore this email.</p>
  </div>
</body>
</html>`;

export const resetPasswordEmailTemplate = (
  otp: string,
  firstName: string
): string => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Your Password</title></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:10px;padding:30px;">
    <h2 style="color:#1a1a2e;">Hi ${firstName},</h2>
    <p style="color:#555;">Your password reset code is:</p>
    <div style="text-align:center;margin:30px 0;">
      <span style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#00b4a6;">${otp}</span>
    </div>
    <p style="color:#555;">This code expires in 10 minutes.</p>
    <p style="color:#999;font-size:12px;">If you did not request this, please ignore this email.</p>
  </div>
</body>
</html>`;