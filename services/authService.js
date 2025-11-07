const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const UserModel = require('../models/userModel');
const APIError = require('../utils/apiError');

const sendEmail = require('../utils/sendEmail');
const sendToken = require('../utils/sendToken');

const {
  verifyToken,
  generateResetCode,
  hashResetCode,
  hashAndVerifyResetCode,
} = require('../utils/auth');

// MIDDLEWARES

// @ desc   Check if user is logged in

const protect = asyncHandler(async (req, res, next) => {
  // 1- Check if token exist

  const { cookies, headers } = req;

  let token;

  if (cookies.token) {
    ({ token } = cookies); // Read from cookie
  } else if (
    headers.authorization &&
    headers.authorization.startsWith('Bearer')
  ) {
    token = headers.authorization.split(' ')[1]; // fallback for mobile / API testing / postman
  }

  if (!token) {
    return next(new APIError(`You are not logged in`, 401));
  }

  // 2- Verify token (Change in token - Expired token)

  const decodedToken = verifyToken(token);

  // 3- Check if User exists

  const user = await UserModel.findById(decodedToken.userId);

  if (!user) {
    return next(new APIError(`User for this token no longer exists`, 401));
  }

  // 4- Check if user is deactivated

  if (!user.active) {
    return next(
      new APIError(
        `User account has been deactivated, please activate your account`,
        401
      )
    );
  }

  // 5- Check if User changed password after token creation

  if (user.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );

    //  Password changed after token creation
    if (passwordChangedTimestamp > decodedToken.iat) {
      return next(
        new APIError(
          `User recently changed his password, Please login again`,
          401
        )
      );
    }
  }

  // Add user to request object
  req.user = user;

  next();
});

// @desc Authorization (User Permissions)

const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1- Access roles
    // 2- Access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new APIError(`You are not allowed to access this route`, 403)
      );
    }

    next();
  });

// // // // // // // // // // // // // // // // // // // // // // // // // //

// @ desc   Signup
// @ route  POST    /api/v2/auth/signup
// @ access Public

const signup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await UserModel.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  // 2- Generate JWT token and send it in cookies and response
  sendToken(user, 201, res);
});

// @ desc   Login
// @ route  POST    /api/v2/auth/login
// @ access Public

const login = asyncHandler(async (req, res, next) => {
  // 1- Check if password and email in the body (valdiation)
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    return next(new APIError(`Invalid email or password`, 401));
  }

  // 2- Check if users exists and password is correct
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new APIError(`Invalid email or password`, 401));
  }

  // 3- Generate JWT token and send it in cookies and response
  sendToken(user, 200, res);
});

// @ desc   Logout
// @ route  POST    /api/v2/auth/logout
// @ access Public

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Authenticate user with Google and issue JWT
// @route   GET    /api/v2/auth/google/callback
// @access  Public

const googleAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new APIError('Google authentication failed', 400));
  }

  if (process.env.CLIENT_URL) {
    sendToken(req.user, 200, res);
    return res.redirect(`${process.env.CLIENT_URL}/home`);
  }
});

// @desc    Handle Google authentication failure
// @route   GET    /api/v2/auth/google/failure
// @access  Public

const googleFailure = (req, res) => {
  if (process.env.CLIENT_URL) {
    return res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
  res.status(400).json({ message: 'Google authentication failed' });
};

// @ desc   Forget Password
// @ route  POST    /api/v2/auth/forgotPassword
// @ access Public

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1) Get User by email
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new APIError(`No user for this Email ${email}`, 404));
  }

  // 2) If user exists, Generate random 6 digits (Reset Code)
  const resetCode = generateResetCode();

  const hashedResetCode = hashResetCode(resetCode, user.id);

  // 3) Save hashed Reset Code in Database

  user.passwordResetCode = hashedResetCode;

  // Add Expiration time for Reset Code (10 Minutes)
  user.passwordResetCodeExpiredAt = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 4) Send the reset code via email

  // const message = `Hi ${user.firstName},
  // \n We received a request to reset the password on your E-shop Account. \n
  // ${resetCode} \n
  // Enter this code to complete the reset. \n
  // Thanks for helping us keep your acount secure.
  // `;
  const htmlMessage = `
  <div style="font-family:Arial, sans-serif; padding:20px; background:#f8f9fa;">
    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px; border:1px solid #ddd;">
      <h2 style="color:#333;">Password Reset Request</h2>

      <p>Hi <strong>${user.firstName}</strong>,</p>

      <p>We received a request to reset your password for your <strong>E-Shop</strong> account.</p>

      <p>Use the verification code below to reset your password:</p>

      <div style="text-align:center; margin:25px 0;">
        <span style="
          font-size:28px;
          letter-spacing:6px;
          font-weight:bold;
          color:#2c7be5;
          display:inline-block;
          padding:10px 20px;
          border:1px dashed #2c7be5;
          border-radius:6px;
        ">
          ${resetCode}
        </span>
      </div>

      <p>This code will expire in <strong>10 minutes</strong>.</p>

      <p>If you didn’t request this, you can safely ignore this email.</p>

      <br />
      <p style="color:#555;">Thanks,</p>
      <p style="color:#2c7be5; font-weight:bold;">E-Shop Security Team</p>
    </div>
  </div>
`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Code',
      html: htmlMessage,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiredAt = undefined;
    user.passwordResetVerified = undefined;

    return next(new APIError(`An error occured during sending the email`, 500));
  }

  res
    .status(200)
    .json({ status: 'Success', message: 'Reset Code sent to the email' });
});

// @ desc  Verify Password Reset Code
// @ route  POST    /api/v2/auth/verifyResetCode
// @ access Public

const verifyResetCode = asyncHandler(async (req, res, next) => {
  const { email, resetCode } = req.body;

  // 1) Get User by Email
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new APIError(`No user for this Email ${email}`, 404));
  }

  // 2) Check expiry of Reset Code
  const resetCodeExpired =
    Date.now() > new Date(user.passwordResetCodeExpiredAt).getTime();
  if (resetCodeExpired) {
    return next(new APIError(`Invalid or expired Reset Code`, 400));
  }

  // 3) Verify the Reset Code

  const isValidResetCode = hashAndVerifyResetCode(
    resetCode,
    user.id,
    user.passwordResetCode
  );
  if (!isValidResetCode) {
    return next(new APIError(`Invalid or expired Reset Code`, 400));
  }

  // 2) Reset Code Valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: 'Success' });
});

// @ desc  Reset Password
// @ route  POST    /api/v2/auth/resetPassword
// @ access Public

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get User by email
  const { email, newPassword } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return next(new APIError(`No User for this email: ${email}`, 404));
  }

  // 2) Check if Reset Code is verified
  if (!user.passwordResetVerified) {
    return next(new APIError(`Reset Code not verifed`, 400));
  }

  user.password = newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetCodeExpiredAt = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) Generate JWT token and send it in cookies and response
  sendToken(user, 200, res);
});

module.exports = {
  signup,
  login,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  // Middlewares
  protect,
  allowedTo,
  googleAuth,
  googleFailure,
};
