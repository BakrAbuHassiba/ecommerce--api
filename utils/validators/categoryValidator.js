const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const APIError = require('../apiError');
const Category = require('../../models/categoryModel');

const getCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Category Id format.'),
  validatorMiddleware,
];

const createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category name required.')
    .isLength({ min: 3 })
    .withMessage('Min Length is 3')
    .isLength({ max: 32 })
    .withMessage('Max Length is 32')
    .custom(async (val) => {
      const existingCategory = await Category.findOne({ name: val });
      if (existingCategory) {
        throw new APIError(`Category with name "${val}" already exists`, 400);
      }
      return true;
    }),
  check('image').notEmpty().withMessage('Category image required.'),

  validatorMiddleware,
];

const updateCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Category Id format.'),
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Min Length is 3')
    .isLength({ max: 32 })
    .withMessage('Max Length is 32')
    .custom(async (val) => {
      const existingCategory = await Category.findOne({ name: val });
      if (existingCategory) {
        throw new APIError(`Category with name "${val}" already exists`, 400);
      }
      return true;
    }),
  check('image').optional(),
  validatorMiddleware,
];

const updateCategoryNameValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category name is required.')
    .isLength({ min: 3 })
    .withMessage('Too short category name.')
    .isLength({ max: 32 })
    .withMessage('Too long category name.'),
  validatorMiddleware,
];

const updateCategoryImageValidator = [
  check('image').custom((value, { req }) => {
    if (!req.file) {
      throw new Error('Category image is required.');
    }
    return true;
  }),
  validatorMiddleware,
];

const deleteCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Category Id format.'),
  validatorMiddleware,
];

module.exports = {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  updateCategoryNameValidator,
  updateCategoryImageValidator,
  deleteCategoryValidator,
};
