const asyncHandler = require("express-async-handler");
const { v4: uuid } = require("uuid");
const sharp = require("sharp");
const streamifier = require("streamifier");
const APIError = require("../utils/apiError");
const cloudinary = require("../config/cloudinary");

const MAIN_FOLDER = process.env.CLOUDINARY_MAIN_FOLDER || "default-folder";

//  Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder, filename) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${MAIN_FOLDER}/${folder}`,
        public_id: filename,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

//  Utility: Optimize image (WebP + fallback JPEG)
async function processImage(buffer, width, height, quality = 75) {
  try {
    // Try WebP first — better compression
    return await sharp(buffer)
      .resize(width, height, { fit: "cover" })
      .toFormat("webp")
      .webp({ quality })
      .toBuffer();
  } catch (err) {
    console.error("WebP conversion failed, using JPEG fallback:", err.message);
    return await sharp(buffer)
      .resize(width, height, { fit: "cover" })
      .toFormat("jpeg")
      .jpeg({ quality })
      .toBuffer();
  }
}

//  Single Image Resize Middleware
const resizeImage = (folderName, entityName, imageField) =>
  asyncHandler(async (req, res, next) => {
    // Validate file existence
    if (!req.file) return next();

    try {
      //  Generate unique filename
      const id = uuid();
      const filename = `${entityName}-${id}-${Date.now()}`;

      // 3️⃣ Process image (Sharp resize + convert to WebP)
      let buffer;
      try {
        buffer = await processImage(req.file.buffer, 600, 600, 75);
      } catch (err) {
        throw new APIError("Failed to process image", 500, err);
      }

      // 4️⃣ Upload to Cloudinary
      let uploadResult;
      try {
        uploadResult = await uploadToCloudinary(buffer, folderName, filename);
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);

        throw new APIError("Image upload to Cloudinary failed", 502, err);
      }

      // 5️⃣ Assign image data to req.body for DB
      if (!uploadResult.public_id || !uploadResult.secure_url) {
        throw new APIError("Invalid Cloudinary response", 500);
      }

      req.body[imageField] = uploadResult.public_id;
      req.body.imageUrl = uploadResult.secure_url;

      next();
    } catch (err) {
      // Log and forward to global error handler
      console.error("Error in resizeImage middleware:", err);
      next(err);
    }
  });

//  Multiple Images Resize Middleware
const resizeMixOfImages = (
  folderName,
  entityName,
  singleImageField,
  multipleImagesField
) =>
  asyncHandler(async (req, res, next) => {
    if (!req.files) return next();

    //  Single image (e.g. cover)
    if (req.files[singleImageField]) {
      const image = req.files[singleImageField][0];
      const id = uuid();
      const filename = `${entityName}-${id}-${Date.now()}-cover`;

      const buffer = await processImage(image.buffer, 2000, 1333, 80);
      const result = await uploadToCloudinary(buffer, folderName, filename);

      req.body[singleImageField] = result.public_id;
      req.body.imageUrl = result.secure_url;
    }

    //  Multiple images
    if (req.files[multipleImagesField]) {
      const images = req.files[multipleImagesField];
      const results = await Promise.all(
        images.map(async (image, index) => {
          const id = uuid();
          const filename = `${entityName}-${id}-${Date.now()}-${index + 1}`;

          const buffer = await processImage(image.buffer, 900, 900, 75);
          const uploadResult = await uploadToCloudinary(
            buffer,
            folderName,
            filename
          );

          return {
            image: uploadResult.public_id,
            imageUrl: uploadResult.secure_url,
          };
        })
      );

      req.body.images = results.map((r) => r.image);
      req.body.imagesUrls = results.map((r) => r.imageUrl);
    }

    next();
  });

module.exports = {
  resizeImage,
  resizeMixOfImages,
};
