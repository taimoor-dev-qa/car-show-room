const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOTPEmail = async (to, otp, purpose = 'verification') => {
  const subject = purpose === 'reset'
    ? 'CarZone - Password Reset Code'
    : 'CarZone - Verify Your Email';

  const text = `Your OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`;

  await transporter.sendMail({
    from: `"CarZone" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = { sendOTPEmail };