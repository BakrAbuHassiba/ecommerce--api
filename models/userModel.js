const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const APIError = require("../utils/apiError");
const getImageUrl = require("../utils/getImageUrl");

// 1- Create Schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "User firstName is required"],
      minLength: [2, "First name must be at least 2 characters long."],
      maxLength: [50, "First name cannot exceed 50 characters."],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "User lastName is required"],
      minLength: [2, "Last name must be at least 2 characters long."],
      maxLength: [50, "Last name cannot exceed 50 characters."],
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      unique: [true, "User email must be unique"],
      lowercase: true,
    },
    phone: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      minLength: [6, "Too short User password"],
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetCode: {
      type: String,
    },
    passwordResetCodeExpiredAt: {
      type: Date,
    },
    passwordResetVerified: {
      type: Boolean,
    },
    role: {
      type: String,
      emum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },

    // Child refrence (one to many)
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    // Child refrence (one to many)
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        // i.e => "Home"  -  "Work"
        alias: {
          type: String,
          // unique: [true, 'Address alias must be unique'],
        },
        country: {
          type: String,
          required: [true, "Address country is required"],
        },
        city: {
          type: String,
          required: [true, "Address city is required"],
        },
        street: {
          type: String,
          required: [true, "Address street is required"],
        },
        building: {
          type: String,
          required: [true, "Address building is required"],
        },
        apartment: {
          type: String,
          required: [true, "Address apartment is required"],
        },
        details: {
          type: String,
        },
        phone: {
          type: String,
          required: [true, "Phone number is required"],
        },
        postalCode: {
          type: String,
        },
      },
    ],
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

// Function to hash password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  // Hash only if password is new or modified
  if (!user.isModified("password")) return next();

  const hashedPassword = await bcrypt.hash(user.password, 12);
  if (hashedPassword) {
    user.password = hashedPassword;
    next();
  }

  return next(new APIError("Failed to hash password.", 500));
});

// Mongoose Virtuals

userSchema.virtual("fullName").get(function () {
  return `${this.firstName}  ${this.lastName}`;
});

userSchema.virtual("profileImageUrl").get(function () {
  // If there's an image filename, generate the full URL, otherwise return null
  if (this.profileImage) {
    return getImageUrl(this.profileImage, "users");
  }
  return null; // If no image exists
});

// 2- Create model
// const UserModel = mongoose.model('User', userSchema); // NEW
const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = UserModel;
