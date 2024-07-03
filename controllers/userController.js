const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


require('dotenv').config();

// User registration
const signup = async (req, res) => {
  try {
    const { email, password } = req.body; // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    } // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Create new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User login
const login = async (req, res) =>{
  try {
    const { email, password } = req.body; // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    } // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET); 
    res.json({ token, userId: user._id}); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }

};
const userDetails = async (req, res) => {
  const { userId } = req.params; // Get userId from query parameters

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { userId, emailFrom, emailPass } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.emailFrom = emailFrom || user.emailFrom;
    user.emailPass = emailPass || user.emailPass;
    await user.save();

    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = {
    signup,
    login,
    userDetails,
    updateUserDetails,
    

  };