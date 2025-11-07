const express = require('express');

const {
  createCouponValidator,
  getCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
} = require('../utils/validators/couponValidator');

const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
} = require('../services/couponService');

const { protect, allowedTo } = require('../services/authService');

const router = express.Router();

router.use(protect, allowedTo('admin'));

router.post('/', createCouponValidator, createCoupon);
router.get('/', getCoupons);
router.get('/:id', getCouponValidator, getCouponById);
router.put('/:id', updateCouponValidator, updateCouponById);
router.delete('/:id', deleteCouponValidator, deleteCouponById);

module.exports = router;
