const express = require('express');

const {
  addProductToWishlistValidator,
  removeProductFromWishlistValidator,
} = require('../utils/validators/wishlistValidator');

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require('../services/wishlistService');

const { protect, allowedTo } = require('../services/authService');

const router = express.Router({ mergeParams: true });

// Middleware for all upcoming routes
router.use(protect, allowedTo('user'));

router.post('/', addProductToWishlistValidator, addProductToWishlist);

router.get('/', getLoggedUserWishlist);

router.delete(
  '/:id',
  removeProductFromWishlistValidator,
  removeProductFromWishlist
);

module.exports = router;
