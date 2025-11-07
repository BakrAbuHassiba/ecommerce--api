const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const APIError = require('../apiError');
const CategoryModel = require('../../models/categoryModel');
const SubcategoryModel = require('../../models/subcategoryModel');

const createProductValidator = [
  check('title')
    .notEmpty()
    .withMessage('Product title required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Product title must be between (3 - 100) characters'),

  check('description')
    .notEmpty()
    .withMessage('Product description required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Product description must be between (20 - 2000) characters'),

  check('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .isNumeric()
    .withMessage('Product quantity must be a number')
    .isInt({ min: 1 })
    .withMessage('Product quantity must be equal or more than 1'),

  check('sold')
    .optional()
    .isNumeric('Product sold must be a number')
    .isInt({ min: 1 })
    .withMessage('Product sold must be equal or more than 1'),

  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('Product price must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Product price must be equal or more than 0.01'),

  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('Product priceAfterDiscount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Product priceAfterDiscount must be equal or more than 0.01')
    .custom((value, { req }) => {
      const { price } = req.body;
      if (price <= value) {
        throw new APIError('priceAfterDiscount must be lower than price');
      }
      return true;
    }),

  check('colors')
    .optional()
    .isArray()
    .withMessage('colors must be an array of string'),

  check('imageCover').notEmpty().withMessage('Product imageCover is required'),

  check('images')
    .optional()
    .isArray()
    .withMessage('images must be an array of string'),

  check('category')
    .notEmpty()
    .withMessage('Product category is required')
    .isMongoId()
    .withMessage('Invalid Id format')
    .custom(async (category) => {
      const loadedCategory = await CategoryModel.findById(category);
      if (!loadedCategory) {
        throw new APIError(`No category for this Id: ${category}`);
      }
      return true;
    }),

  check('subcategories')
    .optional()
    .isMongoId()
    .withMessage('Invalid Id format')

    // Check duplicate entry in subcategories id array
    .custom((subcategoriesIds) => {
      const subcategoriesIdsSet = new Set(subcategoriesIds);

      if (subcategoriesIds.length !== subcategoriesIdsSet.size) {
        throw new APIError(`Duplicate entry in subcategories Ids`);
      }

      return true;
    })

    // Check that all subcategories exists in the database
    .custom(async (subcategoriesIds) => {
      const result = await SubcategoryModel.find({
        _id: { $exists: true, $in: subcategoriesIds },
      });

      // Check that all subcategories id are in database
      if (result.length === 0 || result.length !== subcategoriesIds.length) {
        throw new APIError(`Invalid subcategories Ids`);
      }

      return true;
    })
    // Check that subcategories belong to the same category
    .custom(async (subcategoriesIds, { req }) => {
      const { category } = req.body;

      const subcategories = await SubcategoryModel.find({
        _id: { $in: subcategoriesIds },
        category,
      });

      if (subcategories.length !== subcategoriesIds.length) {
        throw new APIError(
          `Some or all subcategories doesn't belong to the correct category`
        );
      }
      return true;
    }),

  check('brand').optional().isMongoId().withMessage('Invalid Id format'),

  check('averageRating')
    .optional()
    .isNumeric()
    .isFloat({ min: 1, max: 5 })
    .withMessage('averageRating must be a number between (1.0 - 5.0)'),

  check('numOfRatings')
    .optional()
    .isNumeric()
    .isInt()
    .withMessage('averageRating must be a number'),

  validatorMiddleware,
];

const getProductValidator = [
  check('id').isMongoId().withMessage('Invalid Product Id format.'),

  validatorMiddleware,
];

const updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid Product Id format.'),

  validatorMiddleware,
];

const deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid Product Id format.'),

  validatorMiddleware,
];

module.exports = {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
};
