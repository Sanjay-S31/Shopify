const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const validator = require('validator');

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '2d' })
}

//login user function
const loginUser = async (req, res) => {

    const { email, password } = req.body
    try {
        const user = await User.login(email, password)

        const username = user.username
        const userType = user.userType
        // token creation
        const token = createToken(user._id)
        res.status(200).json({ username, userType, token })
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
}


//signup function
const signupUser = async (req, res) => {
    const { username, email, password, userType } = req.body

    try {
        const user = await User.signup(username, email, password, userType)

        // token creation
        const token = createToken(user._id)

        res.status(200).json({ username, userType, email, token })
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
}

//  product click stream data for a specific user
const addProductId = async (req, res) => {
    const userId = req.user._id; // From requireAuth middleware
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
    }

    try {
        // Add productId only if it's not already in the array
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { product_ids: productId } }, // $addToSet avoids duplicates
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Product ID added", product_ids: user.product_ids });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// liked products by the user
const addLikedProduct = async (req, res) => {
    const userId = req.user._id;
    const { productId } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user.liked_items) {
            user.liked_items = [];
        }

        const index = user.liked_items.indexOf(productId);
        if (index === -1) {
            // Not liked yet, add it
            user.liked_items.push(productId);
        } else {
            // Already liked, remove it (toggle off)
            user.liked_items.splice(index, 1);
        }

        await user.save();
        res.status(200).json({ liked_items: user.liked_items });
    } catch (error) {
        console.error("Error toggling liked product:", error);
        res.status(500).json({ error: "Failed to toggle liked product" });
    }
};


const getLikedProducts = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ liked_items: user.liked_items || [] });
    } catch (error) {
        console.error("Error fetching liked products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
};

// Edit user profile
const editUserProfile = async (req, res) => {
    const { mobile_no, gender, address } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { mobile_no, gender, address },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ message: "Profile updated", user });
    } catch (err) {
        res.status(500).json({ error: "Failed to update profile" });
    }
};

// Change password
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(400).json({ error: "Old password is incorrect" });

        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).json({ error: "New password is not strong enough" });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        user.password = hash;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to change password" });
    }
};

module.exports = {
    loginUser,
    signupUser,
    addProductId,
    addLikedProduct,
    getLikedProducts,
    getUserProfile,
    editUserProfile,
    changePassword
};