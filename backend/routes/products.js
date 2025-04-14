const express = require('express')
const route = express.Router()

const {
    getProducts,
    getProductWithId,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
    addReviewToProduct,
    topRatedProducts
} = require('../controllers/productController')

const requireAuth = require('../middleware/requireAuth')

route.use(requireAuth)

//get product details for particular user
route.get('/' , getProducts)

// getting the top rated products
route.get('/topProducts' , topRatedProducts)

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