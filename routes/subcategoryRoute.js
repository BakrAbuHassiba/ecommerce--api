const express = require('express');

const {
  createSubcategoryValidator,
  getSubcategoryValidator,
  updateSubcategoryValidator,
  deleteSubcategoryValidator,
} = require('../utils/validators/subcategoryValidator');

const {
  createSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategoryById,
  deleteSubcategoryById,
  // Middlewares
  setCategoryIdToBody,
  createFilterObject,
  setSlugToBody,
} = require('../services/subcategoryService');

const { protect, allowedTo } = require('../services/authService');

// mergeParams: Allow us to access parameters on other routers
// Example: we need to acces categoryId from category router
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  protect,
  allowedTo('admin', 'manager'),
  setCategoryIdToBody,
  setSlugToBody,
  createSubcategoryValidator,
  createSubcategory
);
router.get('/', createFilterObject, getSubcategories);
router.get('/:id', getSubcategoryValidator, getSubcategoryById);
router.put(
  '/:id',
  protect,
  allowedTo('admin', 'manager'),
  updateSubcategoryValidator,
  setSlugToBody,
  updateSubcategoryById
);
router.delete(
  '/:id',
  protect,
  allowedTo('admin'),
  deleteSubcategoryValidator,
  deleteSubcategoryById
);

module.exports = router;
