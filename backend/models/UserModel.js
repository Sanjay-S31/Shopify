const mongoose = require('mongoose')
const Schema  = mongoose.Schema
const bcrypt = require('bcrypt')
const validator = require('validator')

const userSchema = new Schema({
    username : {
        type: String,
        required : true
    },
    email : {
        type: String,
        required : true
    },
    password : {
        type: String,
        required : true
    },
    userType : {
        type : String,
        required : true
    }
} , {timestamps : true})


//static signup method
userSchema.statics.signup = async function(username , email , password , userType){

    //validation
    if(!username || !email || !password){
        throw Error('Fields cannot be empty')
    }
    if(!validator.isEmail(email)){
        throw Error('Invalid email address')
    }
    if(!validator.isStrongPassword(password)){
        throw Error('Please provide a strong password')
    }

    const emailExists = await this.findOne({email})
    if(emailExists){
        throw Error('Email already exists')
    }

    const salt  = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password,salt)

    const user = await this.create({username , email , password : hash , userType})

    return user
}


//static login method
userSchema.statics.login = async function(email , password){

    //validation
    if(!email || !password){
        throw Error('Fields cannot be empty')
    }

    const user = await this.findOne({email})
    if(!user){
        throw Error('Incorrect Email address')
    }

    const passCompare = await bcrypt.compare(password, user.password)
    if(!passCompare){
        throw Error("Incorrect password")
    }
    
    return user
}

module.exports = mongoose.model('User' , userSchema)