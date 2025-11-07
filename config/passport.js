const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

const UserModel = require("../models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/v2/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const firstName = profile.name.givenName || "";
        const lastName = profile.name.familyName || "";

        let user = await UserModel.findOne({ email });

        if (!user) {
          user = await UserModel.create({
            firstName,
            lastName,
            email,
            password: Math.random().toString(36).slice(-8), // dummy password (required by schema)
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
