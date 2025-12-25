const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Auth check middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/');
};

// Home page
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Skill Up - Interviews Optimized',
    activeUsers: '10,000+'
  });
});

// Dashboard route (after login)
router.get('/dashboard', isAuthenticated, async (req, res) => {
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
router.get('/mock-test', isAuthenticated, async (req, res) => {
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

module.exports = router;
