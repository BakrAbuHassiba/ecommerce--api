const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
      unique: [true, "Subcategory must be unique"],
      minLength: [
        2,
        "Subcategory name is too short. Must be at least 2 characters",
      ],
      maxLength: [
        32,
        "Subcategory name is too long. Maximum length is 32 characters",
      ],
    },
    slug: {
      type: String,
      required: [true, "Subcategory slug is required"],
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      requried: [true, "Subcategory must belong to a Category"],
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

const SubcategoryModel = mongoose.model("Subcategory", subcategorySchema);

module.exports = SubcategoryModel;
