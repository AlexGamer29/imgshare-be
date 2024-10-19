// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const models = require('../models');

// Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await models.users.findOne({ where: { googleId: profile.id } });

        if (!user) {
          user = await models.users.create({
            googleId: profile.id,
            email,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Facebook OAuth
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await models.users.findOne({ where: { facebookId: profile.id } });

        if (!user) {
          user = await models.users.create({
            facebookId: profile.id,
            email,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Apple OAuth
passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      callbackURL: '/auth/apple/callback',
      keyID: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
      scope: ['name', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.email;
        let user = await models.users.findOne({ where: { appleId: profile.id } });

        if (!user) {
          user = await models.users.create({
            appleId: profile.id,
            email,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
