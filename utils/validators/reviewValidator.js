const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const APIError = require('../apiError');

const ReviewModel = require('../../models/reviewModel');
const UserModel = require('../../models/userModel');
const ProductModel = require('../../models/productModel');

const getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review Id format.'),
  validatorMiddleware,
];

const createReviewValidator = [
  check('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Min Length is 3')
    .isLength({ max: 32 })
    .withMessage('Max Length is 32'),

  check('rating')
    .notEmpty()
    .withMessage('Review rating is required')
    .isNumeric()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Review rating must be a number between (1.0 - 5.0)'),

  check('user')
    .notEmpty()
    .withMessage('Review user is required')
    .isMongoId()
    .withMessage('Invalid Id format')
    .custom(async (userId, { req }) => {
      // 1- Check that user in req.body is the same as logged in User

      if (req.body.user.toString() !== req.user._id.toString()) {
        throw new APIError(
          `User in the request body is not the same as  logged in User`,
          400
        );
      }

      // 2- Check that User exists

      const loadedUser = await UserModel.findById(userId);
      if (!loadedUser) {
        throw new APIError(`No User for this Id: ${userId}`, 404);
      }
      return true;
    }),

  check('product')
    .notEmpty()
    .withMessage('Review product is required')
    .isMongoId()
    .withMessage('Invalid Id format')
    .custom(async (productId, { req }) => {
      // 1- Check that Product exists

      const loadedProduct = await ProductModel.findById(productId);
      if (!loadedProduct) {
        throw new APIError(`No Product for this Id: ${productId}`, 404);
      }

      // 2- Check that User didn't create a Review for this Product before

      const userId = req.user._id;

      const review = await ReviewModel.findOne({
        user: userId,
        product: productId,
      });

      if (review) {
        throw new APIError(
          `Review already exists on Product with Id :${productId}, for User with Id: ${userId}`,
          400
        );
      }

      return true;
    }),

  validatorMiddleware,
];

const updateReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review Id format')
    .custom(async (reviewId, { req }) => {
      // 1- Check that Review exists

      const loadedReview = await ReviewModel.findById(reviewId);
      if (!loadedReview) {
        throw new APIError(`No Review for this Id: ${reviewId}`, 404);
      }

      // 2- Check that review.user is same as logged in User
      if (loadedReview.user._id.toString() !== req.user._id.toString()) {
        throw new APIError(`You're not allowed to update this Review`, 403);
      }

      return true;
    }),
  validatorMiddleware,
];

const deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review Id format')
    .custom(async (reviewId, { req }) => {
      if (req.user.role === 'user') {
        // 1- Check that Review exists

        const loadedReview = await ReviewModel.findById(reviewId);
        if (!loadedReview) {
          throw new APIError(`No Review for this Id: ${reviewId}`, 404);
        }

        // 2- Check that review.user is same as logged in User
        if (loadedReview.user._id.toString() !== req.user._id.toString()) {
          throw new APIError(`You're not allowed to delete this Review`, 403);
        }
      }

      return true;
    }),
  validatorMiddleware,
];

module.exports = {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
};
