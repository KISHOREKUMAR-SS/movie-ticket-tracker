const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendAlertEmail = (movieTitle, theater) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL, // <-- Change this to RECEIVER_EMAIL
    subject: `🚨 TICKETS LIVE: ${movieTitle} 🚨`,
    text: `Hurry! Bookings are now open for ${movieTitle} at ${theater}. Book your tickets immediately!`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log("Error sending email:", error);
    else console.log("Alert email sent successfully!");
  });
};

module.exports = sendAlertEmail;