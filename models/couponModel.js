const mongoose = require("mongoose");

// 1- Create Schema
const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Coupon name is required"],
      unique: [true, "Coupon name must be unique"],
      minLength: [
        3,
        "Coupoun name is too short. Must be at least 3 characters",
      ],
      maxLength: [
        32,
        "Coupoun name is too long. Maximum length is 32 characters",
      ],
    },
    expiryDate: {
      type: Date,
      required: [true, "Coupon expiryDate is required"],
    },
    discount: {
      type: Number,
      required: [true, "Coupon discount is required"],
      min: [1, "Coupon discount must be between 1 and 100"],
      max: [100, "Coupon discount must be between 1 and 100"],
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

// 2- Create model
const CouponModel = mongoose.model("Coupon", couponSchema);

module.exports = CouponModel;
