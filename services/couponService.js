const factory = require('./handlerFactory');
const CouponModel = require('../models/couponModel');

// @ desc   Create coupon
// @ route  POST    /api/v2/coupons
// @ access Protect/Admin

const createCoupon = factory.createOne(CouponModel);

// @ desc   Get list of coupons
// @ route  GET    /api/v2/coupons
// @ access Protect/Admin

const getCoupons = factory.getAll(CouponModel);

// @ desc   Get specific coupon by id
// @ route  GET    /api/v2/coupons/:id
// @ access Protect/Admin

const getCouponById = factory.getOneById(CouponModel);

// @ desc   Update specific coupon
// @ route  PUT    /api/v2/coupons/:id
// @ access Protect/Admin

const updateCouponById = factory.updateOneById(CouponModel);

// @ desc   Delete specific coupon
// @ route  DELETE    /api/v2/coupons/:id
// @ access Protect/Admin

const deleteCouponById = factory.deleteOne(CouponModel);

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
};
