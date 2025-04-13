const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    // Check if the email already exists in the DB
    console.log(profile.emails[0].value)
    const existingUser = await User.findOne({ email: profile.emails[0].value });
    console.log(existingUser)
    if (!existingUser) {
        // If the user doesn't exist, respond with 'User not registered'
        console.log("not exixts in db")
        return done(null, false, { message: 'User not registered' });
    }
    console.log("exists in db")
    // If the user exists, return the existing user
    done(null, existingUser);
}));



