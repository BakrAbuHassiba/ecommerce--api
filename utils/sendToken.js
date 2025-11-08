const { sanitizeUser } = require("./sanitizeData");
const { createToken } = require("./auth");

const sendToken = (user, statusCode, res) => {
  const token = createToken(user._id);

  const cookieOptions = {
    httpOnly: true, // JS can't access cookie (XSS safe)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // cross-origin in prod
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };

  res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    data: sanitizeUser(user),
  });
};

module.exports = sendToken;
