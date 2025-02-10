require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const userRouter = require('./routes/user')
const productRouter = require('./routes/products')
const cartController = require('./routes/cart')
const app = express()

app.use(express.json({limit : '20mb'}))


mongoose.connect(process.env.MONGO_CONN)
    .then(() => {
        console.log("Database connected")
        app.listen(process.env.PORT ,() => {
            console.log("Server Listening on",process.env.PORT)
        })
    })
    .catch(error => {
        console.log("Database not connected ",error)
    })

//Routes
app.use('/api/user' , userRouter)
app.use('/api/products' , productRouter)
app.use('/api/cart' , cartController)
