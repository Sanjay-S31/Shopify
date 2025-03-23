const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	items: [
		{
			productId: {
				type: Schema.Types.ObjectId,
				ref: 'Product',
				required: true
			},
			productName: {
				type: String,
				required: true
			},
			productImage: {
				type: String,
				required: true
			},
			quantity: {
				type: Number,
				required: true,
				min: 1
			},
			cost: {
				type: Number,
				required: true
			}
		}
	],
	totalAmount: {
		type: Number,
		required: true
	},
	shippingInfo: {
		name: {
			type: String,
			required: true
		},
		address: {
			type: String,
			required: true
		},
		city: {
			type: String
		},
		state: {
			type: String
		},
		pincode: {
			type: String
		},
		mobile: {
			type: String,
			required: true
		}
	},
	paymentMethod: {
		type: String,
		enum: ['card', 'upi', 'cod'],
		default: 'cod'
	},
	paymentStatus: {
		type: String,
		enum: ['pending', 'completed', 'failed'],
		default: 'pending'
	},
	orderStatus: {
		type: String,
		enum: ['processing', 'shipped', 'delivered', 'cancelled'],
		default: 'processing'
	},
	orderDate: {
		type: Date,
		default: Date.now
	},
	deliveryDate: {
		type: Date
	}
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
