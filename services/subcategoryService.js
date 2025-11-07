const slugify = require('slugify');

const SubcategoryModel = require('../models/subcategoryModel');
const factory = require('./handlerFactory');

// Middlewares
const setCategoryIdToBody = (req, res, next) => {
  // Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

const createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObject = filterObject;

  next();
};

const setSlugToBody = (req, res, next) => {
  if (req.body.name) {
    const { name } = req.body;
    req.body.slug = slugify(name);
  }

  next();
};

// @ desc   Create Subcategory
// @ route  POST    /api/v2/subcategories
// @ access Private

const createSubcategory = factory.createOne(SubcategoryModel);

// @ desc   Get list of Subcategories
// @ route  GET    /api/v2/subcategories
// @ access Public

const getSubcategories = factory.getAll(SubcategoryModel, 'category');

// @ desc   Get specific Subcategory by id
// @ route  GET    /api/v2/subcategories/:id
// @ access Public

const getSubcategoryById = factory.getOneById(SubcategoryModel);

// @ desc   Update specific SubCategory
// @ route  PUT    /api/v2/subcategories/:id
// @ access Private

const updateSubcategoryById = factory.updateOneById(SubcategoryModel);

// @ desc   Delete specific Subcategory
// @ route  DELETE    /api/v2/subcategories/:id
// @ access Private

const deleteSubcategoryById = factory.deleteOne(SubcategoryModel);

module.exports = {
  createSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategoryById,
  deleteSubcategoryById,
  // Middlewares
  setCategoryIdToBody,
  createFilterObject,
  setSlugToBody,
};
