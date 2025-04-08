const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recommendationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    recommendedProductIds: {
      type: [String], // Array of product IDs
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
