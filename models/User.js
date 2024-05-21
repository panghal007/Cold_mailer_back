const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Make the email field unique
    password: { type: String, required: true },
    status: { type: String, enum: ['AVAILABLE', 'BUSY'], default: 'AVAILABLE' },
});

const User = mongoose.model('User', userSchema);

module.exports = User; // Export the User model