const mongoose = require("mongoose");
const getImageUrl = require("../utils/getImageUrl");

// 1- Create Schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Brand name is required"],
      unique: [true, "Brand name must be unique"],
      minLength: [3, "Brand name is too short. Must be at least 3 characters"],
      maxLength: [
        32,
        "Brand name is too long. Maximum length is 32 characters",
      ],
    },
    // A and B => shopping.com/a-and-b
    slug: {
      type: String,
      required: [true, "Brand slug is required"],
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    // Ensure virtuals are included when converting documents to JSON and omitting _id and adding id
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret && ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        return ret;
      },
    },
  }
);

brandSchema.virtual("imageUrl").get(function () {
  // If there's an image filename, generate the full URL, otherwise return null
  if (this.image) {
    return getImageUrl(this.image, "brands");
  }
  return null; // If no image exists
});

// 2- Create model
const BrandModel = mongoose.model("Brand", brandSchema);

module.exports = BrandModel;
