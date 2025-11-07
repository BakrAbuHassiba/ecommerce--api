const dotenv = require('dotenv');
// Configure .env file
dotenv.config({ path: '../config.env' });

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const createToken = (id) =>
  jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

const generateResetCode = () => {
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
  return resetCode;
};

const hashResetCode = (resetCode, userId) => {
  const secret = userId; // Use user ID or email as a secret key
  const hash = crypto
    .createHmac('sha256', secret)
    .update(resetCode)
    .digest('hex');

  return hash;
};

const hashAndVerifyResetCode = (resetCode, userId, storedHashedCode) => {
  const hashedResetCode = hashResetCode(resetCode, userId);
  return hashedResetCode === storedHashedCode; // Returns true if codes match
};

module.exports = {
  createToken,
  verifyToken,
  generateResetCode,
  hashResetCode,
  hashAndVerifyResetCode,
};
