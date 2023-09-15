const nodemailer = require('nodemailer');

// Create a nodemailer transporter with your email service configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'timescart11@gmail.com', // Your Gmail email address
        pass: 'orishwpjnyrudbjc' // Your Gmail password or an app-specific password
    }
});

module.exports = {
    transporter
}