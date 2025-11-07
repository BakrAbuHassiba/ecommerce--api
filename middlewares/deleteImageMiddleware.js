const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const APIError = require('../utils/apiError');

const deleteCloudinaryImages = () =>
  asyncHandler(async (req, res, next) => {
    const { image, images } = res.locals;

    try {
      if (Array.isArray(images) && images.length > 0) {
        await Promise.all(
          images.filter(Boolean).map((id) => cloudinary.uploader.destroy(id))
        );
      }
      if (image) {
        await cloudinary.uploader.destroy(image);
      }
    } catch (error) {
      next(new APIError('Error deleting image from Cloudinary', 500));
    }

    next();
  });

module.exports = {
  deleteCloudinaryImages,
};
