const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  delay: {
    type: Number,
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
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
  attachment: {
    filename: {
      type: String,
      required: false,
    },
    path: {
      type: String,
      required: false,
    },
  },
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
