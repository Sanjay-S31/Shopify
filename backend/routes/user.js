const express = require('express')
const route = express.Router()

const {
    loginUser,
    signupUser
} = require('../controllers/userController')

//login
route.post('/login' , loginUser)

//signup 
route.post('/signup' , signupUser)

module.exports = route