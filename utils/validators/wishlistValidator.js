const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const APIError = require('../apiError');

const ProductModel = require('../../models/productModel');

const addProductToWishlistValidator = [
  // 1- rules
  check('productId')
    .isMongoId()
    .withMessage('Invalid product Id format')
    .custom(async (val, { req }) => {
      const { productId } = req.body;
      const product = await ProductModel.findById(productId);

      if (!product) {
        throw new APIError(`No product with this Id :${productId}`, 404);
      }
      // return true if valdiation passes
      return true;
    }),

  // 2- Middleware to catch errors from rules if exist
  validatorMiddleware,
];

const removeProductFromWishlistValidator = [
  // 1- rules
  check('id')
    .isMongoId()
    .withMessage('Invalid product Id format')
    .custom(async (val, { req }) => {
      const { productId } = req.body;
      const product = await ProductModel.findById(productId);

      if (!product) {
        throw new APIError(`No product with this Id :${productId}`, 404);
      }
      // return true if valdiation passes
      return true;
    }),

  // 2- Middleware to catch errors from rules if exist
  validatorMiddleware,
];

module.exports = {
  addProductToWishlistValidator,
  removeProductFromWishlistValidator,
};
