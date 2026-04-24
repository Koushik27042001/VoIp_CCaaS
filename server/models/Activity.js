const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['call', 'note', 'status'], 
    required: true 
  },
  text: { type: String, required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  time: { type: String } 
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
