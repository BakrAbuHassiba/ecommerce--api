const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

const UserModel = require('../models/userModel');
const factory = require('./handlerFactory');

const APIError = require('../utils/apiError');
const { createToken } = require('../utils/auth');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const { resizeImage } = require('../middlewares/resizeImageMiddleware');
const {
  deleteCloudinaryImages,
} = require('../middlewares/deleteImageMiddleware');

// Middlewares

const uploadUserImage = uploadSingleImage('profileImage');
const resizeUserImage = resizeImage('users', 'user', 'profileImage');
const deleteUserImage = deleteCloudinaryImages();




// @ desc   Create user
// @ route  POST    /api/v2/users
// @ access Private

const createUser = factory.createOne(UserModel);

// @ desc   Get list of users
// @ route  GET    /api/v2/users
// @ access Private

const getUsers = factory.getAll(UserModel);

// @ desc   Get specific user by id
// @ route  GET    /api/v2/users/:id
// @ access Private

const getUserById = factory.getOneById(UserModel);

// @ desc   Update specific user
// @ route  PUT    /api/v2/users/:id
// @ access Private

const updateUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const document = await UserModel.findById(id);

  if (!document) {
    return next(new APIError(`No User for this Id ${id}`, 404));
  }

  const updatedDocument = await UserModel.findByIdAndUpdate(
    id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // If there is an image in the request and the document has an existing image, delete the old image
  if (req.file && document.profileImage) {
    res.locals.image = document.profileImage;
    next();
  }

  res.status(200).json({ data: updatedDocument });
});

// @ desc   Change Password for a specific user
// @ route  PUT    /api/v2/users/changePassword/:id
// @ access Private

const changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const document = await UserModel.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!document) {
    return next(new APIError(`No User for this Id ${id}`, 404));
  }

  res.status(200).json({ data: document });
});

// @ desc   Delete specific user
// @ route  DELETE    /api/v2/users/:id
// @ access Private

const deleteUserById = factory.deleteOne(UserModel, 'profileImage');

// @ desc   Get Logged user data
// @ route  GET    /api/v2/users/loggedUser
// @ access Private/Protect

const getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @ desc   Change Logged User Password for
// @ route  PUT    /api/v2/users/changePassword
// @ access Private/Protect

const changeLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const { password } = req.body;

  // 1) Update User Password

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(new APIError(`No User for this Id ${id}`, 404));
  }

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @ desc   Update Logged User Data (Without password, role)
// @ route  PUT    /api/v2/users/updateMe
// @ access Private/Protect

const updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const id = req.user._id;

  const loadedUser = await UserModel.findById(id);

  if (!loadedUser) {
    return next(new APIError(`No User for this Id ${id}`, 404));
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // If there is an image in the request and the document has an existing image, delete the old image
  if (req.file && loadedUser.profileImage) {
    res.locals.filename = loadedUser.profileImage;
    next();
  }

  res.status(200).json({ data: updatedUser });
});

// @ desc   Deactivate Logged User
// @ route  PUT    /api/v2/users/deactivateMe
// @ access Private/Protect

const deactivateLoggedUser = asyncHandler(async (req, res, next) => {
  const id = req.user._id;

  await UserModel.findByIdAndUpdate(
    id,
    {
      active: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(204).json({ status: 'Success' });
});

// @ desc   Deactivate Logged User
// @ route  PUT    /api/v2/users/deactivateMe
// @ access Private/Protect

const reactivateUserAccount = asyncHandler(async (req, res, next) => {
  // 1- Check if password and email in the body (valdiation)
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  // 2- Check if users exists and password is correct
  const isMatch = await bcrypt.compare(password, user.password);

  if (!user || !isMatch) {
    return next(new APIError(`Invalid email or password`, 401));
  }

  // 3- Generate JWT token
  const token = createToken(user._id);

  // 4- Activate user account
  user.active = true;
  await user.save();

  res.status(200).json({ data: user, token });
});

module.exports = {
  // ADMIN
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  changeUserPassword,
  deleteUserById,

  // USER
  getLoggedUserData,
  changeLoggedUserPassword,
  updateLoggedUserData,
  deactivateLoggedUser,
  reactivateUserAccount,

  // Middlewares
  uploadUserImage,
  resizeUserImage,
  deleteUserImage,
};
