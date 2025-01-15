const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  clientName: String,
  clientAddress: String,
  invoiceDate: Date,
  dueDate: Date,
  items: [{
    description: String,
    quantity: Number,
    amount: Number,
  }],
  gstRate: Number,
  discountRate: Number,
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid'],
    default: 'draft',
  },
  total: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

module.exports = mongoose.model('Invoice', invoiceSchema); 