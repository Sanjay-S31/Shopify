const User = require('../models/userModel')
const Product = require('../models/productModel')

// Display cart items for the current user
const displayCartItems = async (req, res) => {
    const userId = req.user._id

    try {
        const user = await User.findById(userId)

        // Find all products in user's cart_items array
        const products = await Product.find({ _id: { $in: user.cart_items } })

        res.status(200).json(products)
    } catch (error) {
        console.error("Error fetching cart:", error)
        res.status(500).json({ error: "Failed to fetch cart items" })
    }
}

// Add a product to cart
const addCartItem = async (req, res) => {
    const userId = req.user._id
    const { id } = req.params

    try {
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        const user = await User.findById(userId)

        // Add product ID to cart_items only if it's not already there
        if (!user.cart_items.includes(id)) {
            user.cart_items.push(id)
            await user.save()
        }

        res.status(200).json({ cart_items: user.cart_items })
    } catch (error) {
        console.error("Error adding to cart:", error)
        res.status(500).json({ error: "Failed to add item to cart" })
    }
}

// Remove a product from cart
const removeCartItem = async (req, res) => {
    const userId = req.user._id
    const { id } = req.params

    try {
        const user = await User.findById(userId)

        // Remove the product ID from cart_items array
        user.cart_items = user.cart_items.filter(itemId => itemId !== id)
        await user.save()

        res.status(200).json({ cart_items: user.cart_items })
    } catch (error) {
        console.error("Error removing from cart:", error)
        res.status(500).json({ error: "Failed to remove item from cart" })
    }
}

// removes or clears all the cart items for the user
const clearCartItems = async (req, res) => {
	const userId = req.user._id;

	try {
		const user = await User.findById(userId);

		// Clear all items in cart_items array
		user.cart_items = [];
		await user.save();

		res.status(200).json({ message: "Cart cleared successfully", cart_items: user.cart_items });
	} catch (error) {
		console.error("Error clearing cart:", error);
		res.status(500).json({ error: "Failed to clear cart" });
	}
};


module.exports = {
    displayCartItems,
    addCartItem,
    removeCartItem,
    clearCartItems
}
