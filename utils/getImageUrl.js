const cloudinary = require('../config/cloudinary');


function getImageUrl(publicIdOrFilename) {
  if (!publicIdOrFilename) return null;

  // Detect Cloudinary image (it will start with "shoply/")
  // if (publicIdOrFilename.startsWith('shoply/')) {
  // generate full URL from public_id
  const url = cloudinary.url(publicIdOrFilename, { secure: true });
  console.log(url);
  return cloudinary.url(publicIdOrFilename, { secure: true });
  // }

  // otherwise, assume it's a local image
  // return `${process.env.BASE_URL}/${folderName}/${publicIdOrFilename}`;
}

module.exports = getImageUrl;
