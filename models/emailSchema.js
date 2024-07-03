const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  to: String,
  subject: String,
  body: String,
  delay: Number,
  scheduledAt: Date,
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed', 'opened'],
    default: 'scheduled',
  },
  sentAt: Date,
  openedAt: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;

