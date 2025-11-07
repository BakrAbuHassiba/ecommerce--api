const { check } = require('express-validator');
const bcrypt = require('bcryptjs');

const UserModel = require('../../models/userModel');
const APIError = require('../apiError');

const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id format'),
  validatorMiddleware,
];

const createUserValidator = [
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

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('User phone Invalid; Only accept ar-EG and ar-SA'),

  check('profileImage').optional(),

  check('role').optional(),

  // 2- Middleware => catch errors from rules if exist
  validatorMiddleware,
];

const updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id format'),

  check('firstName')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short User firstName'),

  check('lastName')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short User lastName'),

  check('email')
    .optional()
    .isEmail()
    .withMessage('User email Invalid')
    .custom(async (value, { req }) => {
      const { id } = req.params;
      const user = await UserModel.findOne({
        email: value,
        _id: { $ne: id },
      });

      if (user) {
        throw new APIError(`This email already exists: ${value}`, 400);
      }
      return true;
    }),

  check('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters'),

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('User phone Invalid'),

  check('profileImage').optional(),

  check('role').optional(),

  validatorMiddleware,
];

const changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid User Id format'),

  check('currentPassword')
    .notEmpty()
    .withMessage('User currentPassword required'),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('User passwordConfirm required'),

  check('password')
    .notEmpty()
    .withMessage('User password required')
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters')
    .custom(async (password, { req }) => {
      const { id } = req.params;
      const { currentPassword } = req.body;
      // 1- Verify Current Password
      const user = await UserModel.findById(id);
      if (!user) {
        throw new APIError(`No User for this Id ${id}`, 404);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        throw new APIError(`Incorrect currentPassword`, 400);
      }

      // 2- Verify Password Confirmation
      const { passwordConfirm } = req.body;
      if (password !== passwordConfirm) {
        throw new APIError(`Password Confirmation is incorrect`, 400);
      }
      return true;
    }),

  validatorMiddleware,
];

const deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User Id format'),
  validatorMiddleware,
];

// USER

const changeLoggedUserPasswordValidator = [
  check('currentPassword')
    .notEmpty()
    .withMessage('User currentPassword required'),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('User passwordConfirm required'),

  check('password')
    .notEmpty()
    .withMessage('User password required')
    .isLength({ min: 6 })
    .withMessage('User password must be at least 6 characters')
    .custom(async (password, { req }) => {
      const id = req.user._id;
      const { currentPassword } = req.body;
      // 1- Verify Current Password
      const user = await UserModel.findById(id);
      if (!user) {
        throw new APIError(`No User for this Id ${id}`, 404);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        throw new APIError(`Incorrect currentPassword`, 400);
      }

      // 2- Verify Password Confirmation
      const { passwordConfirm } = req.body;
      if (password !== passwordConfirm) {
        throw new APIError(`Password Confirmation is incorrect`, 400);
      }
      return true;
    }),

  validatorMiddleware,
];

const updateLoggedUserValidator = [
  check('firstName')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short User firstName'),

  check('lastName')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short User lastName'),

  check('email')
    .optional()
    .isEmail()
    .withMessage('User email Invalid')
    .custom(async (value) => {
      const user = await UserModel.findOne({ email: value });

      if (user) {
        throw new APIError(`This email already exists: ${value}`, 400);
      }
      return true;
    }),

  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('User phone Invalid'),

  check('profileImage').optional(),

  validatorMiddleware,
];

module.exports = {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  changeUserPasswordValidator,
  deleteUserValidator,
  // User
  changeLoggedUserPasswordValidator,
  updateLoggedUserValidator,
};
