const Product = require('../models/productModel')

const displayCartItems = async (req,res) => {
    //const user_id = req.user._id

    const products = await Product.find({ inCart: true }).sort({createdAt:-1})

    res.status(200).json(products)
}

const addCartItem = async (req,res) => {
    const { id } = req.params
    const product = await Product.findByIdAndUpdate({_id: id}, {inCart : true}, {new : true})

    if(product){
        res.status(200).json(product)
    }
    else{
        console.log("Error occured")
        res.status(400).json({error : "Couldn't find the product"})
    }

}

const removeCartItem = async (req,res) => {

    const {id} = req.params
    const product = await Product.findByIdAndUpdate({_id: id}, {inCart : false},{new : true})

    if(product){
        res.status(200).json(product)
    }
    else{
        res.status(400).json({error : "Couldn't find the product"})
    }
}

const removeAllItems = async (req,res) => {

    try{
        await Product.updateMany({}, {inCart : false})
        res.status(200).json({msg : "ok"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({error : "Error occured"})
    }
}


module.exports = {
    displayCartItems,
    addCartItem,
    removeCartItem,
    removeAllItems
}