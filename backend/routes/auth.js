const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Step 1: Start Google OAuth process
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login?error=User+not+registered'
}), (req, res) => {
    const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    const username = req.user.username;
    const userType = req.user.userType;

    const redirectUrl = `http://localhost:3000/google-redirect?token=${token}&username=${username}&userType=${userType}`;
    res.redirect(redirectUrl);
});


module.exports = router;
