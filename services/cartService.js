const asyncHandler = require('express-async-handler');

const CartModel = require('../models/cartModel');
const ProductModel = require('../models/productModel');
const CouponModel = require('../models/couponModel');
const APIError = require('../utils/apiError');

// UTILS

const calculateTotalCartPrice = (cart) => {
  const totalCartPrice = cart.cartItems.reduce(
    (accumlator, currentItem) =>
      +currentItem.quantity * +currentItem.price + accumlator,
    0
  );

  cart.totalPriceAfterDiscount = undefined;

  return totalCartPrice;
};

// @ desc   Add Product to cart
// @ route  POST    /api/v2/cart
// @ access Protect/User

const addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const quantity = req.body.quantity || 1;

  const product = await ProductModel.findById(productId);

  // 1- Get logged user cart
  const userId = req.user._id;
  let cart = await CartModel.findOne({ user: userId });

  if (!cart) {
    // Create Cart for logged user with Product
    cart = await CartModel.create({
      user: userId,
      cartItems: [
        { product: productId, color, price: product.price, quantity },
      ],
    });
  } else {
    // Product exists in Cart, update Product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productIndex > -1) {
      const updatedCartItem = cart.cartItems[productIndex];
      updatedCartItem.quantity += 1;

      cart.cartItems[productIndex] = updatedCartItem;
    } else {
      // Product doesn't exist in Cart
      // Push Product to cartItems array
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
        quantity,
      });
    }
  }

  //   Calculate total cart price
  cart.totalCartPrice = calculateTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully ',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @ desc   Get Logged User Cart
// @ route  GET    /api/v2/cart
// @ access Protect/User

const getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await CartModel.findOne({ user: userId }).populate({
    path: 'cartItems.product',
    select: 'title price imageCover',
  });
  if (!cart) {
    return next(new APIError(`No Cart for this User Id : ${userId}`, 404));
  }

  res.status(200).json({
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @ desc   Remove specific cart item
// @ route  GET    /api/v2/cart/:id
// @ access Protect/User

const removeItemFromCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const itemId = req.params.id;

  const cart = await CartModel.findOneAndUpdate(
    { user: userId },
    {
      $pull: { cartItems: { _id: itemId } },
    },
    { new: true }
  );

  // Update cart total price
  const totalPrice = calculateTotalCartPrice(cart);
  cart.totalCartPrice = totalPrice;
  await cart.save();

  if (!cart) {
    return next(new APIError(`No Cart for this User Id : ${userId}`, 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Product removed from cart successfully ',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @ desc  Clear Logged User Cart
// @ route  DELETE    /api/v2/cart
// @ access Protect/User

const clearLoggedUserCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  await CartModel.findOneAndDelete({ user: userId });

  res.status(204).json();
});

// @ desc   Update specific cart item quantity
// @ route  PUT    /api/v2/cart/:id
// @ access Protect/User

const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const itemId = req.params.id;
  const { quantity } = req.body;

  const cart = await CartModel.findOne({ user: userId });

  if (!cart) {
    return next(new APIError(`No Cart for user with Id: ${userId}`, 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex > -1) {
    const updatedtCartItem = cart.cartItems[itemIndex];
    updatedtCartItem.quantity = quantity;
    cart.cartItems[itemIndex] = updatedtCartItem;
  } else {
    return next(new APIError(`No cartItem with Id: ${itemId}`, 404));
  }

  calculateTotalCartPrice(cart);

  // Update cart total price
  const totalPrice = calculateTotalCartPrice(cart);
  cart.totalCartPrice = totalPrice;
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Item quantity updated successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @ desc   Apply coupon on user cart
// @ route  PUT    /api/v2/cart/applyCoupon
// @ access Protect/User

const applyCoupon = asyncHandler(async (req, res, next) => {
  const { coupon: couponName } = req.body;
  const userId = req.user._id;

  // 1- Get coupon by coupon name
  const coupon = await CouponModel.findOne({
    name: couponName,
    expiryDate: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new APIError(`Ivalid or expired Coupon ${couponName}`, 401));
  }

  // 2- Get logged user cart
  const cart = await CartModel.findOne({ user: userId });

  // 3- Calculate price afetr discount
  const totalPriceAfterDiscount = (
    cart.totalCartPrice -
    (cart.totalCartPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

module.exports = {
  addProductToCart,
  removeItemFromCart,
  getLoggedUserCart,
  clearLoggedUserCart,
  updateCartItemQuantity,
  applyCoupon,
};
