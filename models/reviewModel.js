const mongoose = require('mongoose');
const ProductModel = require('./productModel');

// 1- Create Schema

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxLength: [
        150,
        'Review title is too long. Maximum length is 150 characters',
      ],
    },
    rating: {
      type: Number,
      min: [1, 'Minimun rating value is 1.0'],
      max: [5, 'Minimun rating value is 5.0'],
      required: [true, 'Review rating is required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User'],
    },

    // Parent refrence (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a Product'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    // Ensure virtuals are included when converting documents to JSON and omitting _id and adding id
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

// Populate User on Review
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'firstName lastName profileImage' });
  next();
});

// Mongoose Static methods
reviewSchema.statics.calculateAverageRatingsAndQuantity = async function (
  productId
) {
  const result = await this.aggregate([
    // Stage 1 : Get all reviews in a specific product
    {
      $match: { product: productId },
    },
    // Stage 2 : Group reviews based on productId and calc averageRating, numOfRatings
    {
      $group: {
        _id: 'product',
        averageRating: { $avg: '$rating' },
        numOfRatings: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await ProductModel.findByIdAndUpdate(productId, {
      averageRating: result[0].averageRating,
      numOfRatings: result[0].numOfRatings,
    });
  } else {
    await ProductModel.findByIdAndUpdate(productId, {
      averageRating: 0,
      numOfRatings: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRatingsAndQuantity(this.product);
});

// 2- Create model
const ReviewModel = mongoose.model('Review', reviewSchema);

module.exports = ReviewModel;
