const express = require('express');

const {
  addProductToCart,
  getLoggedUserCart,
  removeItemFromCart,
  clearLoggedUserCart,
  updateCartItemQuantity,
  applyCoupon,
} = require('../services/cartService');

const { protect, allowedTo } = require('../services/authService');

const router = express.Router();

router.use(protect, allowedTo('user'));

router.post('/', addProductToCart);

router.get('/', getLoggedUserCart);

router.delete('/', clearLoggedUserCart);

router.put('/applyCoupon', applyCoupon);

router.put('/:id', updateCartItemQuantity);

router.delete('/:id', removeItemFromCart);

module.exports = router;
