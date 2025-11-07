const { check } = require('express-validator');

const UserModel = require('../../models/userModel');
const APIError = require('../apiError');

const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const signupValidator = [
  // 1- rules
  check('firstName')
    .notEmpty()
    .withMessage('User firstName required')
    .isLength({ min: 3 })
    .withMessage('Too short User firstName'),

  check('lastName')
    .notEmpty()
    .withMessage('User lastName required')
    .isLength({ min: 3 })
    .withMessage('Too short User lastName'),

  check('email')
    .notEmpty()
    .withMessage('User email required')
    .isEmail()
    .withMessage('User email Invalid')
    .custom(async (value) => {
      const user = await UserModel.findOne({ email: value });

      if (user) {
        throw new APIError(`This email already exists: ${value}`, 400);
      }
      return true;
    }),

  check('password')
    .notEmpty()
    .withMessage('User password required')
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters')
    .custom((password, { req }) => {
      const { passwordConfirm } = req.body;
      if (password !== passwordConfirm) {
        throw new APIError(`Password Confirmation is incorrect`, 400);
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('User passwordConfirm required'),

  // 2- Middleware => catch errors from rules if exist
  validatorMiddleware,
];

const loginValidator = [
  // 1- rules

  check('email')
    .notEmpty()
    .withMessage('User email required')
    .isEmail()
    .withMessage('User email Invalid'),

  check('password')
    .notEmpty()
    .withMessage('User password required')
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters'),

  // 2- Middleware => catch errors from rules if exist
  validatorMiddleware,
];

module.exports = {
  signupValidator,
  loginValidator,
};
