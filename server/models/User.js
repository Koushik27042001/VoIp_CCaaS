const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'On Call', 'Break'], 
    default: 'Available' 
  },
  calls: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
