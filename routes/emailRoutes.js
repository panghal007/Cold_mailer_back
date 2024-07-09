const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const userController = require('../controllers/userController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/schedule', emailController.scheduleEmail);
router.get('/emails', emailController.getEmailStatus);

// New template routes
router.post('/templates',upload.single('file'), emailController.createTemplate);
router.get('/templates/:userId', emailController.getTemplates);

// Handle signup form submission
router.post('/signup', userController.signup);

// Handle login form submission
router.post('/login', userController.login);
router.get('/profile/:userId', userController.userDetails);
router.put('/profile', userController.updateUserDetails);

router.get('/track/:emailId',emailController.trackEmailOpened);
module.exports = router;
