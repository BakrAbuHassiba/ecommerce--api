const asyncHandler = require('express-async-handler');

const APIError = require('../utils/apiError');
const APIFeature = require('../utils/apiFeature');

const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    await document.save();

    res.status(201).json({ data: document });
  });

const getAll = (Model, populateOptions) =>
  asyncHandler(async (req, res) => {
    // Check for filter
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }

    // Build Query
    const apiFeature = new APIFeature(Model.find(filter), req.query)
      .filter()
      .search(Model.modelName)
      .limitFields()
      .sort();

    await apiFeature.count();

    apiFeature.paginate(apiFeature.totalDocs);

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeature;

    let query = mongooseQuery;
    if (populateOptions) {
      query = mongooseQuery.populate(populateOptions);
    }

    // Populate and execute
    const documents = await query.exec();

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

const getOneById = (Model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // 1- Build query
    let query = Model.findById(id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    // 2- Execute query
    const document = await query;

    if (!document) {
      return next(new APIError(`No ${Model.modelName} for this Id ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });

const updateOneById = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new APIError(`No ${Model.modelName} found for this ID`, 404));
    }

    res.status(200).json({ data: document });
  });

const updateOneWithImage = (Model, imageField = 'image') =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);
    if (!document) {
      return next(new APIError(`No ${Model.modelName} found for this ID`, 404));
    }

    const updatedDocument = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    await updatedDocument.save();

    //  Only mark old image if a new one is uploaded
    if (req.file && document[imageField]) {
      res.locals.image = document[imageField];
    }

    res.locals.updatedDocument = updatedDocument;
    next();
  });

const updateOneWithMultipleImages = (
  Model,
  imageField = 'imageCover',
  multipleImagesField = 'images'
) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);
    if (!document) {
      return next(new APIError(`No ${Model.modelName} found for this ID`, 404));
    }

    const updatedDocument = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    await updatedDocument.save();

    //  Capture old images only if new ones uploaded
    if (req.files) {
      if (req.files[imageField]) {
        res.locals.image = document[imageField];
      }
      if (req.files[multipleImagesField]) {
        res.locals.images = document[multipleImagesField];
      }
    }

    res.locals.updatedDocument = updatedDocument;
    next();
  });

// const updateOneById = (Model, imageField, multipleImagesField) =>
//   asyncHandler(async (req, res, next) => {
//     const { id } = req.params;

//     const document = await Model.findById(id);
//     if (!document) {
//       return next(new APIError(`No ${Model.modelName} for this Id ${id}`, 404));
//     }

//     const updatedDocument = await Model.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     // Trigger "save" hooks if needed (slug updates, etc.)
//     await updatedDocument.save();

//     //  Case 1: multiple or single images uploaded
//     if (req.files && imageField && multipleImagesField) {
//       if (req.files[imageField]) {
//         res.locals.image = document[imageField];
//       }
//       if (req.files[multipleImagesField]) {
//         res.locals.images = document[multipleImagesField];
//       }

//       // Stop here, pass control to next middleware (image deletion)
//       return next();
//     }

//   //  Case 2: single image only
//   if (req.file && document[imageField] && !multipleImagesField) {
//     res.locals.image = document[imageField];
//     return next();
//   }

//   //  Case 3: no images were updated
//   res.status(200).json({ data: updatedDocument });
// });

const deleteOne = (Model, imageField, multipleImagesField) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new APIError(`No ${Model.modelName} for this Id ${id}`, 404));
    }

    // Special case: review model recalculation
    if (Model.modelName === 'Review') {
      const productId = document.product;
      await Model.calculateAverageRatingsAndQuantity(productId);
    }

    // Attach Cloudinary info to res.locals for later deletion
    if (imageField) {
      res.locals.image = document[imageField];
    }
    if (multipleImagesField) {
      res.locals.images = document[multipleImagesField];
    }

    // Save deleted doc if you want to include in response (optional)
    res.locals.deletedDocument = document;

    // Don't send a response yet → wait for Cloudinary cleanup
    next();
  });

module.exports = {
  createOne,
  getAll,
  getOneById,
  updateOneById,
  updateOneWithImage,
  updateOneWithMultipleImages,
  deleteOne,
};
