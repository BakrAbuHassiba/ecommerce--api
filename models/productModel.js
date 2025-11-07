const mongoose = require("mongoose");
const getImageUrl = require("../utils/getImageUrl");

// 1- Create Schema
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Product title is required"],
      unique: [true, "Product must be unique"],
      minLength: [
        3,
        "Product title is too short. Must be at least 3 characters",
      ],
      maxLength: [
        100,
        "Product title is too long. Maximum length is 100 characters",
      ],
    },
    // A and B => shopping.com/a-and-b
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minLength: [
        20,
        "Product descrition is too short. Must be at least 20 characters.",
      ],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [1, "Product quantity  must be more than or equal 1"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.01, "Product Price must be more than or equal to 0.01"],
      max: [200000, "Product Price must be less than 200,000"],
    },
    priceAfterDiscount: {
      type: Number,
      min: [0.01, "Product Price must be more than or equal to 0.01"],
    },
    colors: {
      type: [String],
    },
    imageCover: {
      type: String,
      required: [true, "Product Image Cover is required"],
    },
    images: {
      type: [String],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
    },
    subcategories: {
      type: [mongoose.Schema.ObjectId],
      ref: "Subcategory",
    },
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    averageRating: {
      type: Number,
      min: [1, "Product Rating must be more than or equal 1.0"],
      max: [5, "Product Rating must be more than or equal 5.0"],
    },
    numOfRatings: {
      type: Number,
      default: 0,
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

// Mongoose Virtuals

productSchema.virtual("imageCoverUrl").get(function () {
  // If there's an image filename, generate the full URL, otherwise return null
  if (this.imageCover) {
    return getImageUrl(this.imageCover, "products");
  }
  return null; // If no image exists
});

productSchema.virtual("imageUrls").get(function () {
  // If there's an image filename, generate the full URL, otherwise return null
  if (this.images) {
    const imageUrls = this.images.map((image) =>
      getImageUrl(image, "products")
    );

    return imageUrls;
  }
  return null; // If no image exists
});

// Get reviews on product (used with findOne)
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

// Mongoose query middleware

// Populate Category
productSchema.pre(/^find/, function (next) {
  this.populate({ path: "category", select: "name" });
  this.populate({ path: "brand", select: "name" });
  next();
});

// 2- Create model
const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
