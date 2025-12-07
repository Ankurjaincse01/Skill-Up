const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
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
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/skillup_db',
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

app.use(logger); // Custom logger middleware

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillup_db')
.then(() => console.log(' MongoDB Connected Successfully'))
.catch((err) => console.log(' MongoDB Connection Error:', err));

// Auth check middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/');
};

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Skill Up - Interviews Optimized',
    activeUsers: '10,000+'
  });
});

// Dashboard route (after login)
app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('dashboard', { 
      title: 'Dashboard - Skill Up',
      userName: user ? user.name : 'User'
    });
  } catch (error) {
    res.status(500).render('index', { error: 'Error loading dashboard' });
  }
});

// Mock Test route
app.get('/mock-test', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('mock-test', { 
      title: 'Mock Test - Skill Up',
      userName: user ? user.name : 'User'
    });
  } catch (error) {
    res.status(500).render('index', { error: 'Error loading mock test' });
  }
});

// Question Bank route
app.get('/question-bank', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('question-bank', { 
      title: 'Question Bank - Skill Up',
      userName: user ? user.name : 'User'
    });
  } catch (error) {
    res.status(500).render('index', { error: 'Error loading question bank' });
  }
});

// API route for signup
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
    
    // Create new user (password will be hashed automatically via pre-save hook)
    const newUser = new User({
      name,
      email,
      phone,
      password
    });
    
    await newUser.save();
    
    // Create session after successful signup
    req.session.userId = newUser._id;
    req.session.userEmail = newUser.email;
    
    res.json({ 
      success: true, 
      message: 'Signup successful!',
      redirectUrl: '/dashboard'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API route for login
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
    
    // Compare password using bcrypt
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Create session after successful login
    req.session.userId = user._id;
    req.session.userEmail = user.email;
    
    res.json({ 
      success: true, 
      message: 'Login successful!',
      redirectUrl: '/dashboard'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.redirect('/');
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
