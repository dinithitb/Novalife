const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });
}

async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('SMTP not configured. Skipping email send.');
    return { skipped: true };
  }
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  return transporter.sendMail({ from, to, subject, text, html });
}

module.exports = { sendEmail };
