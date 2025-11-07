const express = require("express");

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  changeUserPasswordValidator,
  deleteUserValidator,

  changeLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const { loginValidator } = require("../utils/validators/authValidator");

const {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  changeUserPassword,
  deleteUserById,
  // Middlewares

  uploadUserImage,
  resizeUserImage,

  getLoggedUserData,
  changeLoggedUserPassword,
  updateLoggedUserData,
  deactivateLoggedUser,
  reactivateUserAccount,
  deleteUserImage,
} = require("../services/userService");

const { protect, allowedTo } = require("../services/authService");
const { sendUpdatedDocResponse } = require("../middlewares/updateResponse");
const { sendDeleteResponse } = require("../middlewares/deleteResponse");

const router = express.Router();

router.post("/activateAccount", loginValidator, reactivateUserAccount);

router.use(protect);

// USER

router.get("/profile", protect, getLoggedUserData, getUserById);
router.patch(
  "/changeMyPassword",
  changeLoggedUserPasswordValidator,
  changeLoggedUserPassword
);
router.put(
  "/updateMe",
  uploadUserImage,
  resizeUserImage,
  updateLoggedUserValidator,
  updateLoggedUserData,
  deleteUserImage,
  sendUpdatedDocResponse
);
router.delete("/deactivateMe", deactivateLoggedUser);

// ADMIN
// Apply to all upcoming routes
router.use(allowedTo('admin'));

router.post(
  "/",
  uploadUserImage,
  resizeUserImage,
  createUserValidator,

  createUser
);
router.get("/", getUsers);

router.get("/:id", getUserValidator, getUserById);

router.put(
  "/:id",
  uploadUserImage,
  resizeUserImage,
  updateUserValidator,

  updateUserById,
  deleteUserImage,
  sendUpdatedDocResponse
);

router.delete(
  "/:id",
  deleteUserValidator,
  deleteUserById,
  deleteUserImage,
  sendDeleteResponse
);

router.patch(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

module.exports = router;
