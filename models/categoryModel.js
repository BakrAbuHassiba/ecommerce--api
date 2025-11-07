const mongoose = require("mongoose");
const getImageUrl = require("../utils/getImageUrl");

// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Category name is required"],
      unique: [true, "Category name must be unique"],
      minLength: [
        3,
        "Category name is too short. Must be at least 3 characters.",
      ],
      maxLength: [
        32,
        "Category name is too long. Maximum length is 32 characters.",
      ],
    },
    // A and B => shopping.com/a-and-b
    slug: {
      type: String,
      required: [true, "Category slug is required"],
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

categorySchema.virtual("imageUrl").get(function () {
  // If there's an image filename, generate the full URL, otherwise return null
  if (this.image) {
    return getImageUrl(this.image, "categories");
  }
  return null; // If no image exists
});

// 2- Create model
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
