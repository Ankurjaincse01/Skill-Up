const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import middleware
const logger = require('./middleware/logger');
const { validateSignup, validateLogin } = require('./middleware/validation');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import models
const User = require('./models/user');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger); // Custom logger middleware

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillup_db')
.then(() => console.log(' MongoDB Connected Successfully'))
.catch((err) => console.log(' MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Skill Up - Interviews Optimized',
    activeUsers: '10,000+'
  });
});

// Dashboard route (after login)
app.get('/dashboard', (req, res) => {
  // In a real app, you would check if user is authenticated
  // For now, we'll use a sample user name
  res.render('dashboard', { 
    title: 'Dashboard - Skill Up',
    userName: 'Ankur' // This would come from session/auth
  });
});

// Mock Test route
app.get('/mock-test', (req, res) => {
  res.render('mock-test', { 
    title: 'Mock Test - Skill Up',
    userName: 'Ankur'
  });
});

// Question Bank route
app.get('/question-bank', (req, res) => {
  res.render('question-bank', { 
    title: 'Question Bank - Skill Up',
    userName: 'Ankur'
  });
});

// API route for signup (example)
app.post('/api/signup', validateSignup, async (req, res) => {
  try {
    const { email, name, phone, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password // In production, hash the password before saving
    });
    
    await newUser.save();
    
    res.json({ 
      success: true, 
      message: 'Signup successful!',
      redirectUrl: '/dashboard'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API route for login (example)
app.post('/api/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Check password (In production, use bcrypt to compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Login successful!',
      redirectUrl: '/dashboard'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
