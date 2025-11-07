const slugify = require('slugify');
const asyncHandler = require('express-async-handler');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const { resizeImage } = require('../middlewares/resizeImageMiddleware');
const {
  deleteCloudinaryImages,
} = require('../middlewares/deleteImageMiddleware');

const CategoryModel = require('../models/categoryModel');
const factory = require('./handlerFactory');
const APIError = require('../utils/apiError');

// Middlewares
const uploadCategoryImage = uploadSingleImage('image');
const resizeCategoryImage = resizeImage('categories', 'category', 'image');
const deleteCategoryImage = deleteCloudinaryImages();

const setSlugToBody = (req, res, next) => {
  if (req.body.name) {
    const { name } = req.body;
    req.body.slug = slugify(name);
  }

  next();
};

// @ desc   Create category
// @ route  POST    /api/v2/categories
// @ access Private

const createCategory = factory.createOne(CategoryModel);

// @ desc   Get list of categories
// @ route  GET    /api/v2/categories
// @ access Public

const getCategories = factory.getAll(CategoryModel);

// @ desc   Get specific category by id
// @ route  GET    /api/v2/categories/:id
// @ access Public

const getCategoryById = factory.getOneById(CategoryModel);

// @ desc   Update specific category
// @ route  PUT    /api/v2/categories/:id
// @ access Private

const updateCategoryById = factory.updateOneWithImage(CategoryModel, 'image');

// @ desc   Delete specific category
// @ route  DELETE    /api/v2/categories/:id
// @ access Private

const deleteCategoryById = factory.deleteOne(CategoryModel, 'image');

// PATCH /categories/:id/name
const updateCategoryName = asyncHandler(async (req, res, next) => {
  const category = await CategoryModel.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, slug: req.body.slug },
    { new: true }
  );

  if (!category) {
    return next(new APIError('No category found for this ID', 404));
  }

  res.locals.updatedDocument = category;
  next();
});

// PATCH /categories/:id/image
const updateCategoryImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new APIError('No image uploaded', 400));
  }

  const category = await CategoryModel.findById(req.params.id);
  if (!category) {
    return next(new APIError('No category found for this ID', 404));
  }

  // Store old image to delete later
  res.locals.image = category.image;

  //  Update with new image info from resizeImage middleware
  if (req.body.image) category.image = req.body.image;
  if (req.body.imageUrl) category.imageUrl = req.body.imageUrl;

  await category.save();

  res.locals.updatedDocument = category;
  next();
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategoryById,
  updateCategoryName,
  updateCategoryImage,
  deleteCategoryById,
  // Middlewares
  uploadCategoryImage,
  resizeCategoryImage,
  setSlugToBody,
  deleteCategoryImage,
};
