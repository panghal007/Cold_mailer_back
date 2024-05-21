const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const userController = require('../controllers/userController');

// Define routes
router.post('/schedule', emailController.scheduleEmail);
router.get('/emails', emailController.getEmailStatus);

// Handle signup form submission
router.post('/signup', userController.signup);

// Handle login form submission
router.post('/login', userController.login);
module.exports = router;
