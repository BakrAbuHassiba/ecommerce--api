const multer = require('multer');
const APIError = require('../utils/apiError');

const multerOptions = () => {
  // 1- diskStorage engine
  // const multerStorage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, 'uploads/categories');
  //   },
  //   filename(req, file, cb) {
  //     const extension = file.mimetype.split('/')[1];
  //     const id = uuid();

  //     // category-${id}-Date.now().jpeg
  //     const filename = `category-${id}-${Date.now()}.${extension}`;
  //     cb(null, filename);
  //   },
  // });

  // 2- memoryStorage engine (to return buffer for sharp pacakge)
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      const error = new APIError('Only Image files allowed', 400);
      cb(error, false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

// 1- Uplaod a Single Images
const uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

// 2- Uplaod mix of Images
const uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);

module.exports = {
  uploadSingleImage,
  uploadMixOfImages,
};
