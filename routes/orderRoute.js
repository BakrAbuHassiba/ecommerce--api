const express = require('express');

const {
  createCashOrder,
  checkoutSession,
  getOrders,
  getOrderById,
  filterOrderForLoggedUsers,
  updateOrderToPaid,
  updateOrderToDelivered,
} = require('../services/orderService');

const { protect, allowedTo } = require('../services/authService');

const router = express.Router();

router.use(protect);

router.post('/:cartId', allowedTo('user'), createCashOrder);

router.get('/checkout-session/:cartId', allowedTo('user'), checkoutSession);

router.get(
  '/',
  allowedTo('user', 'admin'),
  filterOrderForLoggedUsers,
  getOrders
);

router.get('/:id', getOrderById);

router.put('/:id/pay', allowedTo('admin'), updateOrderToPaid);
router.put('/:id/deliver', allowedTo('admin'), updateOrderToDelivered);

module.exports = router;
