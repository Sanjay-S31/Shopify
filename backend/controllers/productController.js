const Product = require('../models/productModel')
const mongoose = require('mongoose')
const axios = require("axios");
const path = require('path');
const fs = require('fs');

const getProducts = async (req,res) => {

    const user_id = req.user._id
    const products = await Product.find({user_id}).sort({createdAt:-1})
    res.status(200).json(products)

}


const getAllProducts = async (req,res) => {

    const products = await Product.find().sort({createdAt:-1})
    res.status(200).json(products)

}

const getProductWithId = async (req,res) => {

    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(200).json({error : "No such product"})
    }

    const product = await Product.findById({_id : id})
    if(!product){
        return res.status(400).json({error : "Cannot find the product with this id"})
    }
    res.status(200).json(product)
    
}

const createProduct = async (req,res) => {

    const {productName, productType, description, cost, quantity, tags , productImage} = req.body
    const emptyFields = []
    
    if(!productName){
        emptyFields.push("productName")
    }
    if(!productType){
        emptyFields.push("productType")
    }
    if(!description){
        emptyFields.push("description")
    }
    if(!cost){
        emptyFields.push("cost")
    }
    if(!quantity){
        emptyFields.push("quantity")
    }
    if(!tags){
        emptyFields.push("tags")
    }
    if(!productImage){
        emptyFields.push("productImage")
    }

    if(emptyFields.length > 0){
        return res.status(400).json({error: "Fields cannot be empty" , emptyFields})
    }

    try{
        const user_id = req.user._id
        const product = await Product.create({productName, productType, description, cost, quantity, tags, productImage, user_id})
        res.status(200).json(product)
    }
    catch(error){
        res.status(400).json({error :error.message})
    }

}


const deleteProduct = async (req,res) => {

    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(200).json({error : "No such product"})
    }

    const product = await Product.findByIdAndDelete({_id : id})
    if(!product){
        return res.status(400).json({error : "Deletion of product failed"})
    }
    res.status(200).json(product)    

}


const updateProduct = async (req,res) => {

    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(200).json({error : "No such product"})
        return
    }

    const product = await Product.findOneAndUpdate({_id: id}, {...req.body}, {new :true})
    if(!product){
        return res.status(400).json({error : "Updation of product failed"})
    }

    res.status(200).json(product)  

}

//searching product functionality
const searchProduct = async (req,res) => {
    try{
        const { searchInput } = req.body
        const product = await Product.find({
            $or: [
                { productName: { $regex: searchInput, $options: 'i' } }, 
                { tags: { $regex: searchInput, $options: 'i' } } 
            ]
        })
        res.status(200).json(product)
    }
    catch(error){
        console.log(error)
    }
}

// searching the product based on the image given by the user

const searchProductImage = async (req,res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: "Missing image data" });
    }

    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid image format" });
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const mimeType = matches[1];
    let extension = '.png';  // default extension

    if (mimeType === 'image/jpeg') extension = '.jpg';
    else if (mimeType === 'image/webp') extension = '.webp';

    const uniqueFilename = 'image-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + extension;

    const dir = path.join(__dirname, '..', 'images');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const filePath = path.join(dir, uniqueFilename);

    fs.writeFile(filePath, imageBuffer, (err) => {
        if (err) {
            console.error("Error saving image:", err);
            return res.status(500).json({ error: "Failed to save image" });
        }
        res.status(200).json({ message: "Image uploaded successfully", filename: uniqueFilename });
    });
}

// filtering the product based on category
const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.body;
        
        if (!category) {
            return res.status(400).json({ error: "Category is required" });
        }

        const products = await Product.find({ productType: category }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } 
    catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// adding review to a particular product
const addReviewToProduct = async (req, res) => {
    const { id } = req.params;
    const { review, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid product ID" });
    }

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Send review to Flask API for sentiment analysis
        const flaskApiUrl = "http://localhost:5000/analyze-review"; // Ensure Flask is running
        const sentimentResponse = await axios.post(flaskApiUrl, { review });

        const sentiment = sentimentResponse.data.sentiment; // "positive", "negative", or "neutral"

        // Add review to product reviews array
        product.productReviews.push(review);

        // add rating to the product
        product.productRatings.push(rating);

        // Update sentiment count based on response
        if (sentiment === "positive") {
            product.positiveReviewCount += 1;
        } else if (sentiment === "negative") {
            product.negativeReviewCount += 1;
        }

        // Check if negative reviews exceed threshold (3)
        if (product.negativeReviewCount > 5) {
            await Product.findByIdAndDelete(id);
            return res.status(200).json({ message: "Product deleted due to excessive negative reviews." });
        }

        await product.save();
        res.status(200).json(product);
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getProducts,
    getAllProducts,
    getProductWithId,
    createProduct,
    deleteProduct,
    updateProduct,
    searchProduct,
    searchProductImage,
    getProductsByCategory,
    addReviewToProduct
}
