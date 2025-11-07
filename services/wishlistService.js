const asyncHandler = require('express-async-handler');

const UserModel = require('../models/userModel');

// @ desc   Add Product to Wishlist
// @ route  POST    /api/v2/wishlist
// @ access Protect/User

const addProductToWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      //  $addToSet => adds a unique element to array
      $addToSet: { wishlist: productId },
    },
    { new: true }
  );

  res.status(200).json({
    data: user.wishlist,
    status: 'Succees',
    message: 'Product added succesfully to your wishlist',
  });
});

// @ desc   Remove Product to Wishlist
// @ route  DELETE    /api/v2/wishlist/:productId
// @ access Protect/User

const removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { id: productId } = req.params;

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      //  $addToSet => adds a unique element to array
      $pull: { wishlist: productId },
    },
    { new: true }
  );

  res.status(200).json({
    data: user.wishlist,
    status: 'Succees',
    message: 'Product removed succesfully to your wishlist',
  });
});

// @ desc   Get Logged User Wishlist
// @ route  Get    /api/v2/wishlist
// @ access Protect/User

const getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const user = await UserModel.findById(userId).populate('wishlist');

  res.status(200).json({
    results: user.wishlist.length,
    data: user.wishlist,
  });
});

module.exports = {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
};
