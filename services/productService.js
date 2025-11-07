const slugify = require('slugify');

const ProductModel = require('../models/productModel');
const factory = require('./handlerFactory');

const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');
const { resizeMixOfImages } = require('../middlewares/resizeImageMiddleware');
const {
  deleteCloudinaryImages,
} = require('../middlewares/deleteImageMiddleware');

// Middlewares
const uploadProductImages = uploadMixOfImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);
const resizeProductImages = resizeMixOfImages(
  'products',
  'product',
  'imageCover',
  'images'
);

const deleteProductImages = deleteCloudinaryImages();

const setSlugToBody = (req, res, next) => {
  if (req.body.title) {
    const { title } = req.body;
    req.body.slug = slugify(title);
  }

  next();
};

// @ desc   Create Product
// @ route  POST    /api/v2/products
// @ access Private

const createProduct = factory.createOne(ProductModel);

// @ desc   Get list of products
// @ route  GET    /api/v2/products
// @ access Public

const getproducts = factory.getAll(ProductModel);

// @ desc   Get specific Product by id
// @ route  GET    /api/v2/products/:id
// @ access Public

const getProductById = factory.getOneById(ProductModel, 'reviews');

// @ desc   Update specific Product
// @ route  PUT    /api/v2/products/:id
// @ access Private

const updateProductById = factory.updateOneWithMultipleImages(
  ProductModel,
  'imageCover',
  'images'
);

// const updateProductById = factory.updateOneById(
//   ProductModel,
//   'Product',
//   'imageCover',
//   'images'
// );

// @ desc   Delete specific Product
// @ route  DELETE    /api/v2/products/:id
// @ access Private

const deleteProductById = factory.deleteOne(
  ProductModel,
  'Product',
  'imageCover',
  'images'
);

module.exports = {
  createProduct,
  getproducts,
  getProductById,
  updateProductById,
  deleteProductById,
  // Middlewares
  setSlugToBody,
  uploadProductImages,
  resizeProductImages,
  deleteProductImages,
};
