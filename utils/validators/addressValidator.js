const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const addAddressValidator = [
  // 1- rules
  check('alias')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Address alias must be less than 100 characters'),

  check('country')
    .notEmpty()
    .withMessage('Address country required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Address country must be between (3 - 100) characters'),

  check('city')
    .notEmpty()
    .withMessage('Address city required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Address city must be between (2 - 100) characters'),

  check('street')
    .notEmpty()
    .withMessage('Address street required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Address street must be between (3 - 100) characters'),

  check('building')
    .notEmpty()
    .withMessage('Address building required')
    .isLength({ max: 100 })
    .withMessage('Address building must be less than 100 characters'),

  check('apartment')
    .notEmpty()
    .withMessage('Address apartment required')
    .isLength({ max: 100 })
    .withMessage('Address apartment must be less than 100 characters'),

  check('details')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Address details must be between (3 - 200) characters'),

  check('postalCode')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Address details must be between (3 - 100) characters'),

  check('phone')
    .notEmpty()
    .withMessage('Address phone is required')
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Address phone invalid'),

  // 2- Middleware to catch errors from rules if exist
  validatorMiddleware,
];

const removeAddressValidator = [
  // 1- rules
  check('id').isMongoId().withMessage('Invalid Address Id format'),
  // 2- Middleware to catch errors from rules if exist
  validatorMiddleware,
];

module.exports = {
  addAddressValidator,
  removeAddressValidator,
};
