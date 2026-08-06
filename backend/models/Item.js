const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['lost', 'found']
    },
    location: {
      type: String,
      required: true
    },
    // Image stored directly in MongoDB instead of on local disk
    imageData: {
      type: Buffer,
      default: null
    },
    imageMimeType: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'claimed', 'returned'],
      default: 'active'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
