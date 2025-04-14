const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const validator = require('validator');
const Recommendation = require('../models/recommendationModel')
const Product = require('../models/productModel');
const sendMail = require('../utils/mailer')

const axios = require("axios"); // Import axios for making HTTP requests

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '2d' })
}

//login user function
// In controllers/userController.js

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        // Verify password (you can add more logic here like bcrypt)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Send back full user data, including email, username, and token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            email: user.email,
            username: user.username,  // Ensure this is included
            userType: user.userType,  // If you have userType, include this
            token
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};



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

        try {
            const response = await axios.post("http://localhost:5000/update-products", { 
                userId, 
                productIds: user.product_ids 
            });
            
            let recommendedProducts = response.data.recommended_products
            if(response.data.recommended_products.length==0){
                recommendedProducts=response.data.elsecase;
            }
            
            await Recommendation.findOneAndUpdate(
                { userId },
                { $set: { recommendedProductIds: recommendedProducts } }, // Replace old recommendations with new ones
                { upsert: true, new: true } // Create a new record if not exists
            );

        } catch (notificationError) {
            console.error("Error notifying related product service:", notificationError.message);
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

const getRecommendedProducts = async (req, res) => {
    const userId = req.user._id;
    
    
    try {
        // Find the recommended products for the user
        const recommendation = await Recommendation.findOne({ userId });
        
        if (!recommendation || !recommendation.recommendedProductIds.length) {
            return res.status(200).json({ recommendedProducts: [] });
        }

        // Fetch product details
        const products = await Product.find({ _id: { $in: recommendation.recommendedProductIds } });
        
        res.status(200).json({ recommendedProducts: products });
    } catch (error) {
        console.error("Error fetching recommended products:", error);
        res.status(500).json({ error: "Failed to fetch recommended products" });
    }
};

// Controller function for forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    // Validate email
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // Check if user exists with the provided email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: "No account exists with this email" });
        }

        // Generate a new secure password
        const { generateSecurePassword } = require('../utils/passwordGenerator');
        const newPassword = generateSecurePassword();

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        
        // Update user's password in the database
        user.password = hash;
        await user.save();

        // Prepare email content
        const emailSubject = "Your Password Reset Request";
        const emailContent = `
            <h2>Password Reset</h2>
            <p>Hello ${user.username},</p>
            <p>Your password has been reset as requested. Here is your new password:</p>
            <p><strong>${newPassword}</strong></p>
            <p>Please login with this new password and change it immediately for security reasons.</p>
            <p>If you did not request this password reset, please contact support immediately.</p>
            <p>Best regards,<br>The Shopify Team</p>
        `;

        // Send email with the new password
        await sendMail(email, emailSubject, emailContent);

        return res.status(200).json({ 
            message: "Password reset successful. A new password has been sent to your email." 
        });
        
    } catch (err) {
        console.error("Error in forgot password:", err);
        return res.status(500).json({ error: "Failed to process password reset" });
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
    changePassword,
    forgotPassword,
    getRecommendedProducts,
};
