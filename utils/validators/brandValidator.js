const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const getBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand Id format.'),
  validatorMiddleware,
];

const createBrandValidator = [
  check('name')
    .notEmpty()
    .withMessage('Brand name required.')
    .isLength({ min: 3 })
    .withMessage('Min Length is 3')
    .isLength({ max: 32 })
    .withMessage('Max Length is 32'),
  check('image').notEmpty().withMessage('Brand image required.'),
  validatorMiddleware,
];

const updateBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand Id format.'),
  validatorMiddleware,
];

const deleteBrandValidator = [
  check('id').isMongoId().withMessage('Invalid Brand Id format.'),
  validatorMiddleware,
];

module.exports = {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
};
