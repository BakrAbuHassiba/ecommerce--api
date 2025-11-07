const express = require('express');
const passport = require('passport');

const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

const {
  signup,
  login,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  googleAuth,
  googleFailure,
} = require('../services/authService');

const router = express.Router();

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/logout', logout);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/v2/auth/google/failure',
    session: false,
  }),
  googleAuth
);
router.get('/google/failure', googleFailure);

router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyResetCode);
router.patch('/resetPassword', resetPassword);

module.exports = router;
