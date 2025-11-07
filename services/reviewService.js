const ReviewModel = require('../models/reviewModel');
const factory = require('./handlerFactory');

// Nested route (Create)
const setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;

  console.log(req.body.product);
  console.log(req.body.user);
  next();
};

// @ desc   Create review
// @ route  POST    /api/v2/reviews
// @ access Private/Protect/User

const createReview = factory.createOne(ReviewModel);

// Nested route (Get)
// GET /api/v2/products/:productId/reviews

const createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObject = filterObject;

  next();
};

// @ desc   Get list of reviews
// @ route  GET    /api/v2/reviews
// @ access Public

const getReviews = factory.getAll(ReviewModel);

// @ desc   Get specific review by id
// @ route  GET    /api/v2/reviews/:id
// @ access Public

const getReviewById = factory.getOneById(ReviewModel);

// @ desc   Update specific review
// @ route  PUT    /api/v2/reviews/:id
// @ access Private/Protect/User

const updateReviewById = factory.updateOneById(ReviewModel);

// @ desc   Delete specific review
// @ route  DELETE    /api/v2/reviews/:id
// @ access Private/Protect/User-Admin

const deleteReviewById = factory.deleteOne(ReviewModel);

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReviewById,
  deleteReviewById,
  setProductIdAndUserIdToBody,
  createFilterObject,
};
