const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, default: 'scheduled' }, // 'scheduled', 'sent', 'failed'
  delay: { type: Number, required: true }, // Delay in minutes
  scheduledAt: { type: Date, required: true },
  sentAt: { type: Date },
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
