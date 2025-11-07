const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const CouponModel = require('../../models/couponModel');
const APIError = require('../apiError');

const getCouponValidator = [
  check('id').isMongoId().withMessage('Invalid Coupon Id format'),
  validatorMiddleware,
];

const createCouponValidator = [
  check('name')
    .notEmpty()
    .withMessage('Coupon name required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Coupon name must be between (3 - 100) characters')
    .custom(async (value) => {
      const coupon = await CouponModel.findOne({ name: value });

      if (coupon) {
        throw new APIError(
          `Coupon with this name already exists: ${value}`,
          400
        );
      }
      return true;
    }),

  check('expiryDate')
    .notEmpty()
    .withMessage('Coupon expiryDate required')
    .isDate()
    .withMessage('Coupon expiryDate invalid'),

  check('discount')
    .notEmpty()
    .withMessage('Coupon discount is required')
    .isNumeric()
    .withMessage('Coupon discount must be a number')
    .isInt({ min: 1, max: 100 })
    .withMessage('Coupon discount must be between (1 - 100)'),
  validatorMiddleware,
];

const updateCouponValidator = [
  check('id').isMongoId().withMessage('Invalid Coupon Id format'),

  check('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Coupon name must be between (3 - 100) characters')
    .custom(async (value, { req }) => {
      const { id } = req.params;
      const coupon = await CouponModel.findOne({
        name: value,
        _id: { $ne: id },
      });

      if (coupon) {
        throw new APIError(
          `Coupon with this name already exists: ${value}`,
          400
        );
      }
      return true;
    }),

  check('expiryDate')
    .optional()
    .isDate()
    .withMessage('Coupon expiryDate invalid'),

  check('discount')
    .optional()
    .isNumeric()
    .withMessage('Coupon discount must be a number')
    .isInt({ min: 1, max: 100 })
    .withMessage('Coupon discount must be between (1 - 100)'),

  validatorMiddleware,
];

const deleteCouponValidator = [
  check('id').isMongoId().withMessage('Invalid Coupon Id format'),
  validatorMiddleware,
];

module.exports = {
  getCouponValidator,
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
};
