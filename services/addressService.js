const asyncHandler = require('express-async-handler');

const UserModel = require('../models/userModel');

// @ desc   Add Address to addresses list
// @ route  POST    /api/v2/addresses
// @ access Protect/User

const addAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const {
    alias,
    country,
    city,
    street,
    building,
    apartment,
    details,
    phone,
    postalCode,
  } = req.body;

  const newAddress = {
    alias,
    country,
    city,
    street,
    building,
    apartment,
    details,
    phone,
    postalCode,
  };

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      //  $addToSet => adds a unique element to array
      $addToSet: {
        addresses: newAddress,
      },
    },
    { new: true }
  );

  res.status(200).json({
    data: user.addresses,
    status: 'Succees',
    message: 'Address added succesfully',
  });
});

// @ desc   Edit secific
// @ route  PATCH    /api/v2/addresses
// @ access Protect/User

const editAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { id: addressId } = req.params;

  const user = await UserModel.findById(userId);

  const addressIndex = user.addresses.findIndex(
    (address) => address._id.toString() === addressId
  );

  const udatedAddress = {
    ...user.addresses[addressIndex],
    ...req.body,
  };

  user.addresses[addressIndex] = udatedAddress;

  await user.save();

  res.status(200).json({
    data: udatedAddress,
    status: 'Succees',
    message: 'Address edited succesfully',
  });
});

// @ desc   Remove Address
// @ route  DELETE    /api/v2/addresses/:id
// @ access Protect/User

const removeAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { id: addressId } = req.params;

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: { addresses: { _id: addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    data: user.addresses,
    status: 'Succees',
    message: 'Address removed succesfully',
  });
});

// @ desc   Get Logged User Addresses
// @ route  Get    /api/v2/addresses
// @ access Protect/User

const getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const user = await UserModel.findById(userId);

  res.status(200).json({
    results: user.addresses.length,
    data: user.addresses,
  });
});

module.exports = {
  addAddress,
  editAddress,
  removeAddress,
  getLoggedUserAddresses,
};
