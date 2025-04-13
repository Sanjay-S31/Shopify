require('dotenv').config();
const nodemailer = require('nodemailer');

function sendMail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
    console.log("User:", process.env.EMAIL_USER);
console.log("Pass:", process.env.EMAIL_PASS ? '********' : 'MISSING');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error('Error sending email:', error);
        }
        console.log('Email sent successfully:', info.response);
    });
}

module.exports = sendMail;
