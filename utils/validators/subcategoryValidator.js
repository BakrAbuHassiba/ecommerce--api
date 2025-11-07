const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const getSubcategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory Id format.'),
  validatorMiddleware,
];

const createSubcategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Subcategory name required.')
    .isLength({ min: 2 })
    .withMessage('Min Length is 2')
    .isLength({ max: 32 })
    .withMessage('Max Length is 32'),
  check('category').notEmpty().isMongoId().withMessage('category is required'),
  validatorMiddleware,
];

const updateSubcategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory Id format.'),
  validatorMiddleware,
];

const deleteSubcategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory Id format.'),
  validatorMiddleware,
];

module.exports = {
  createSubcategoryValidator,
  getSubcategoryValidator,
  updateSubcategoryValidator,
  deleteSubcategoryValidator,
};
