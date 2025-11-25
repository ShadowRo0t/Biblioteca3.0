// const nodemailer = require('nodemailer'); // Removed to avoid dependency issue in mock

// Mock service for now, or use Ethereal for testing
const sendActivationEmail = async (email, token) => {
    console.log(` [MOCK EMAIL] Sending activation email to ${email}`);
    console.log(` Activation Link: http://localhost:8000/api/auth/activate/${token}`);
    return true;
};

const sendLoanReminder = async (email, libroTitulo, fechaDevolucion) => {
    console.log(` [MOCK EMAIL] Sending reminder to ${email}`);
    console.log(` Book: ${libroTitulo}, Due: ${fechaDevolucion}`);
    return true;
};

module.exports = {
    sendActivationEmail,
    sendLoanReminder
};
