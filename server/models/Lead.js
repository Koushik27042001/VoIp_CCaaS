const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Interested', 'Closed'], 
    default: 'New' 
  },
  priority: { 
    type: String, 
    enum: ['Hot', 'Warm', 'Cold'], 
    default: 'Warm' 
  },
  lastTouch: { type: String },
  notes: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
