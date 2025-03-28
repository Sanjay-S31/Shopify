const express = require('express')
const route = express.Router()

const {
    getProducts,
    getAllProducts,
    getProductWithId,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
    addReviewToProduct
} = require('../controllers/productController')

const requireAuth = require('../middleware/requireAuth')

route.use(requireAuth)

//get product details for particular user
route.get('/' , getProducts)

//get all the product
route.get('/all' , getAllProducts)

//get product with id
route.get('/:id' , getProductWithId)

//create a product
route.post('/', createProduct)

//delete a product
route.delete('/:id' , deleteProduct)

//update a product
route.put('/:id' , updateProduct)

//search a product
route.post('/search',searchProduct)

// adding a review for a product
route.put('/addReview/:id', addReviewToProduct);

module.exports = route