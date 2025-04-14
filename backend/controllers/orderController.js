const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel'); // Assuming you have a Product model
const sendMail = require('../utils/mailer');

const mongoose = require('mongoose');

// Create a new order
const createOrder = async (req, res) => {
    const { items, totalAmount, shippingInfo, paymentMethod } = req.body;
    
    try {
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in order' });
        }

        // Transform cart items to order items format
        const orderItems = items.map(item => ({
            productId: item._id,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.selectedQuantity || 1,
            cost: item.cost
        }));

        // Create new order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalAmount,
            shippingInfo,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
        });

        // If payment method is not COD, update product inventory
        if (paymentMethod !== 'cod') {
            // Update product inventory (decrease quantity)
            for (const item of orderItems) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { quantity: -item.quantity } }
                );
            }
        }

        const user = await User.findById(req.user._id);
        
        if (user && user.email) {

            // Create email subject
            const emailSubject = `Order Confirmation - Order #${order._id}`;
            
            // Create receipt HTML
            const receiptHTML = generateOrderReceiptHTML(order, shippingInfo);
            
            // Send the email
            sendMail(user.email, emailSubject, receiptHTML);
        }

        res.status(201).json({ 
            success: true, 
            order: order,
            message: 'Order created successfully' 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

function generateOrderReceiptHTML(order, shippingInfo) {
    // Create items list HTML
    const itemsHTML = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.cost.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.cost * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #eee; }
            .order-details { margin: 20px 0; }
            .order-table { width: 100%; border-collapse: collapse; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
            .summary { margin-top: 20px; text-align: right; }
            .address-section { margin: 20px 0; }
            .payment-section { margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Thank you for your order!</h1>
                <p>Order #${order._id}</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="order-details">
                <h2>Order Details</h2>
                <table class="order-table">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Product</th>
                            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #eee;">Quantity</th>
                            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #eee;">Price</th>
                            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #eee;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div class="summary">
                    <p><strong>Total Amount: ₹${order.totalAmount.toFixed(2)}</strong></p>
                </div>
            </div>
            
            <div class="address-section">
                <h2>Shipping Information</h2>
                <p>
                    ${shippingInfo.name}<br>
                    ${shippingInfo.address}, ${shippingInfo.city}<br>
                    ${shippingInfo.state}, ${shippingInfo.zipCode}<br>
                    ${shippingInfo.country}<br>
                    Phone: ${shippingInfo.phone}
                </p>
            </div>
            
            <div class="payment-section">
                <h2>Payment Information</h2>
                <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            </div>
            
            <div class="footer">
                <p>If you have any questions about your order, please contact our customer support.</p>
                <p>© ${new Date().getFullYear()} Your Store Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}


// Get all orders for a user
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 }); // Most recent first
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'No such order exists' });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ error: 'No such order exists' });
        }

        // Check if the order belongs to the requesting user (unless admin)
        if (order.user.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to view this order' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Cancel an order
const cancelOrder = async (req, res) => {
    const { id } = req.params;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'No such order exists' });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ error: 'No such order exists' });
        }

        // Check if order can be cancelled
        if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
            return res.status(400).json({ 
                error: `Order cannot be cancelled (current status: ${order.orderStatus})` 
            });
        }

        // Update the order status to cancelled
        order.orderStatus = 'cancelled';
        await order.save();

        // Return the items to inventory if payment was made
        if (order.paymentStatus === 'completed') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { quantity: item.quantity } }
                );
            }
        }

        res.status(200).json({ 
            success: true, 
            order: order,
            message: 'Order cancelled successfully' 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { orderStatus } = req.body;
    
    try {
        // Check if user is admin
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to update order status' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'No such order exists' });
        }

        if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
            return res.status(400).json({ error: 'Invalid order status' });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ error: 'No such order exists' });
        }

        // Handle inventory if changing to or from cancelled status
        if (order.orderStatus !== 'cancelled' && orderStatus === 'cancelled' && order.paymentStatus === 'completed') {
            // Return items to inventory
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { quantity: item.quantity } }
                );
            }
        } else if (order.orderStatus === 'cancelled' && orderStatus !== 'cancelled' && order.paymentStatus === 'completed') {
            // Remove items from inventory again
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { quantity: -item.quantity } }
                );
            }
        }

        // Update delivery date if status changed to delivered
        if (orderStatus === 'delivered') {
            order.deliveryDate = new Date();
        }

        order.orderStatus = orderStatus;
        await order.save();
        
        res.status(200).json({
            success: true,
            order: order,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .sort({ createdAt: -1 });
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    getAllOrders
};