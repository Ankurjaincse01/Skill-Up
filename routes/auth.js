const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { validateSignup, validateLogin } = require('../middleware/validation');

// Signup API
router.post('/signup', validateSignup, async (req, res) => {
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

// Login API
router.post('/login', validateLogin, async (req, res) => {
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
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.redirect('/');
  });
});

// DSA Questions API
router.get('/dsa-questions', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const questionsPath = path.join(__dirname, '../content/questions-dsa.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading questions' });
  }
});

module.exports = router;
