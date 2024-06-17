const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const emailRoutes = require('./routes/emailRoutes');
require('dotenv').config();
require('./config/agenda');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/api', emailRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => console.error(err));
