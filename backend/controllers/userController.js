const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const createToken = (_id) =>{
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '2d'})
}

//login user function
const loginUser = async (req,res) => {

    const { email,password } = req.body
    try{
        const user = await User.login(email,password)

        const username = user.username
        const userType = user.userType
        // token creation
        const token = createToken(user._id)
        res.status(200).json({ username, userType, token})
    }
    catch(err){
        res.status(400).json({error : err.message})
    }
}


//signup function
const signupUser = async (req,res) => {
    const { username,email,password,userType } = req.body

    try {
        const user = await User.signup(username , email, password,userType)

        // token creation
        const token = createToken(user._id)

        res.status(200).json({username,userType,email,token})
    }
    catch(err){
        res.status(400).json({error : err.message})
    }
}

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


module.exports = {
    loginUser,
    signupUser,
    addProductId
}