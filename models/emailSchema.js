const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'sent', 'opened'], default: 'scheduled' }, // Include 'opened' status
  delay: { type: Number, required: true }, // Delay in minutes
  scheduledAt: { type: Date, required: true },
  sentAt: { type: Date },
  openedAt: { type: Date },
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
