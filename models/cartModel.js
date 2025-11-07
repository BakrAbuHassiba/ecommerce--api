const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: { type: Number, default: 1 },
        color: { type: String },
        price: { type: Number },
      },
    ],

    totalCartPrice: { type: Number },
    totalPriceAfterDiscount: { type: Number },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
const CartModel = mongoose.model("Cart", cartSchema);

module.exports = CartModel;
