const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  number: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  duration: { type: Number }, // in seconds
  status: { type: String, enum: ['Completed', 'Missed', 'Busy'], default: 'Completed' }
}, { timestamps: true });

module.exports = mongoose.model('CallLog', callLogSchema);
