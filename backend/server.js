require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');

const userRouter = require('./routes/user');
const productRouter = require('./routes/products');
const cartController = require('./routes/cart');
const orderController = require('./routes/order');
const authRouter = require('./routes/auth'); // Import auth routes
require('./config/passport'); // Custom passport config

const app = express();

app.use(express.json({ limit: '20mb' }));

// CORS configuration for front-end communication
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

// Session middleware to handle user sessions
app.use(session({
    secret: 'your-session-secret', 
    resave: false, 
    saveUninitialized: false
}));

// Passport middleware initialization
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONN)
    .then(() => {
        console.log("Database connected");
        app.listen(process.env.PORT, () => {
            console.log("Server listening on", process.env.PORT);
        });
    })
    .catch(error => {
        console.log("Database not connected ", error);
    });

// Routes for User, Products, Cart, Orders
app.use('/api/user', userRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartController);
app.use('/api/orders', orderController);

// Add the Google OAuth routes
app.use('/auth', authRouter);

