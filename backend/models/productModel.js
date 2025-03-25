const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({

    productName:{
        type : String,
        required : true
    },
    productType:{
        type: String,
        required : true
    },
    description:{
        type : String,
        required : true
    },
    cost : {
        type : Number,
        require:true
    },
    quantity : {
        type : Number,
        require:true
    },
    tags:{
        type : String,
        required : true
    },
    productImage:{
        type : String,
        required : true
    },
    user_id : {
        type:String,
        required : true
    },
    inCart : {
        type : Boolean,
        default : false
    },
    productReviews : {
        type: [String],
        default: []
    },
    positiveReviewCount : {
        type : Number,
        default : 0
    },
    negativeReviewCount : {
        type : Number,
        default : 0
    },
    productRatings: {
        type: [Number],
        default: []
    },

} , {timestamps : true})

module.exports = mongoose.model('Product', productSchema)
