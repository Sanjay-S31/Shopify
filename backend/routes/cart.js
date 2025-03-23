const express = require('express')
const route = express.Router()

const {
    displayCartItems,
    addCartItem,
    removeCartItem,
    clearCartItems
} = require('../controllers/cartController')

const requireAuth = require('../middleware/requireAuth')

route.use(requireAuth)

route.get('/', displayCartItems)

route.put('/add/:id' , addCartItem)

route.put('/remove/:id' , removeCartItem)

route.put('/removeItems', clearCartItems);

module.exports = route