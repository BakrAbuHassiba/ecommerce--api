const express = require('express');

const {
  createCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
  updateCategoryNameValidator,
  updateCategoryImageValidator,
  deleteCategoryValidator,
} = require('../utils/validators/categoryValidator');

const {
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
} = require('../services/categoryService');

const { protect, allowedTo } = require('../services/authService');

const subcategoryRoute = require('./subcategoryRoute');
const { sendUpdatedDocResponse } = require('../middlewares/updateResponse');
const { sendDeleteResponse } = require('../middlewares/deleteResponse');

const router = express.Router();

// Nested Route
router.use('/:categoryId/subcategories', subcategoryRoute);

router.post(
  '/',
  protect,
  allowedTo('admin', 'manager'),
  uploadCategoryImage,
  resizeCategoryImage,
  createCategoryValidator,
  setSlugToBody,
  createCategory
);
router.get('/', getCategories);
router.get('/:id', getCategoryValidator, getCategoryById);
router.put(
  '/:id',
  protect,
  allowedTo('admin', 'manager'),
  uploadCategoryImage,
  resizeCategoryImage,
  updateCategoryValidator,
  setSlugToBody,
  updateCategoryById,
  deleteCategoryImage,
  sendUpdatedDocResponse
);


// ✅ Update only the category name
router.patch(
  '/:id/name',
  protect,
  allowedTo('admin', 'manager'),
  updateCategoryNameValidator,
  setSlugToBody,
  updateCategoryName,
  sendUpdatedDocResponse
);

// ✅ Update only the category image
router.patch(
  '/:id/image',
  protect,
  allowedTo('admin', 'manager'),
  uploadCategoryImage,
  resizeCategoryImage,
  updateCategoryImageValidator,
  updateCategoryImage,
  deleteCategoryImage,
  sendUpdatedDocResponse
);



router.delete(
  '/:id',
  protect,
  allowedTo('admin'),
  deleteCategoryValidator,
  deleteCategoryById,
  deleteCategoryImage,
  sendDeleteResponse
);

module.exports = router;
