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
    try {
        const { 
            searchInput = '', 
            category = '', 
            minPrice = 200, 
            maxPrice = 300000,
            sortOrder = ''
        } = req.body

        // Build the query dynamically
        const query = {
            cost: { 
                $gte: Number(minPrice), 
                $lte: Number(maxPrice) 
            }
        }

        // Add category filter if provided
        if (category) {
            query.productType = category
        }

        // Add search input filter if provided
        if (searchInput) {
            query.$or = [
                { productName: { $regex: searchInput, $options: 'i' } }, 
                { tags: { $regex: searchInput, $options: 'i' } },
                { productType: { $regex: searchInput, $options: 'i' } }
            ]
        }

        // Prepare sorting
        let sort = { createdAt: -1 }
        if (sortOrder === 'low-to-high') {
            sort = { cost: 1 }
        } else if (sortOrder === 'high-to-low') {
            sort = { cost: -1 }
        }

        // Find products matching the query
        const products = await Product.find(query).sort(sort)

        res.status(200).json({
            products
        })
    }
    catch(error) {
        console.error('Search and filter error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
}


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
    addReviewToProduct
}
