const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'no-reply@example.com';
const APP_NAME = process.env.APP_NAME || 'Newsletter';

if (!SENDGRID_API_KEY) {
  console.warn('Warning: SENDGRID_API_KEY is not set. Email sending will fail until you set it in .env.');
}

sgMail.setApiKey(SENDGRID_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const possibleStaticPaths = [
  path.join(__dirname, 'newsletter_signup-main', 'newsletter_signup'),
  path.join(__dirname, 'newsletter_signup'),
  path.join(__dirname, 'newsletter_signup-main'),
  __dirname,
];

const staticPath = possibleStaticPaths.find((candidate) => fs.existsSync(candidate));

if (!staticPath) {
  console.error('Unable to locate the newsletter signup static files.');
  process.exit(1);
}

app.use(express.static(staticPath));

app.post('/subscribe', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: `Confirm your ${APP_NAME} subscription`,
    text: `Thanks for subscribing to ${APP_NAME}! You will now receive updates at ${email}.`,
    html: `
      <p>Thanks for subscribing to <strong>${APP_NAME}</strong>!</p>
      <p>You will now receive updates at <strong>${email}</strong>.</p>
      <p>Welcome aboard!</p>
    `,
  };

  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured.');
    }
    await sgMail.send(msg);
    return res.json({ success: true });
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message || error);
    return res.status(500).json({ error: 'Unable to send confirmation email right now.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'newsletter-signup.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
