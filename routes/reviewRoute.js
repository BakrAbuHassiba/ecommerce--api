const express = require('express');

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require('../utils/validators/reviewValidator');

const {
  createReview,
  getReviews,
  getReviewById,
  updateReviewById,
  deleteReviewById,
  createFilterObject,
  setProductIdAndUserIdToBody,
} = require('../services/reviewService');

const { protect, allowedTo } = require('../services/authService');

const router = express.Router({ mergeParams: true });

router.get('/', createFilterObject, getReviews);
router.get('/:id', getReviewValidator, getReviewById);

// Protected Routes

router.use(protect);

router.post(
  '/',
  allowedTo('user'),
  setProductIdAndUserIdToBody,
  createReviewValidator,
  createReview
);
router.put('/:id', allowedTo('user'), updateReviewValidator, updateReviewById);
router.delete(
  '/:id',
  allowedTo('user', 'admin'),
  deleteReviewValidator,
  deleteReviewById
);

module.exports = router;
