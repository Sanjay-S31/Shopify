const Product = require('../models/productModel')
const mongoose = require('mongoose')

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
        return res.status(400).json({error : "Deletion of product failed"})
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

module.exports = {
    getProducts,
    getAllProducts,
    getProductWithId,
    createProduct,
    deleteProduct,
    updateProduct,
    searchProduct
}