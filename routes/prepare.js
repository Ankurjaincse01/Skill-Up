const express = require('express');
const router = express.Router();
const User = require('../models/user');
const axios = require('axios');

// Auth check middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/');
};

// Prepare section route - Fetches content from GitHub raw API
router.get('/:topic', isAuthenticated, async (req, res) => {
  try {
    const { topic } = req.params;
    const user = await User.findById(req.session.userId);
    
    // Map topics to GitHub raw JSON URLs
    const topicUrls = {
      'python': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/python.json',
      'java': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/java.json',
      'cpp': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/cpp.json',
      'javascript': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/javascript.json',
      'c': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/c.json',
      'data-structures': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/data-structures.json',
      'algorithms': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/algorithms.json',
      'oops': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/oops.json',
      'dbms': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/dbms.json',
      'os': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/os.json',
      'cn': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/cn.json',
      'web-dev': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/web-dev.json',
      'system-design': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/system-design.json',
      'interview-prep': 'https://raw.githubusercontent.com/Ankurjaincse01/Skill-Up/main/content/interview-prep.json'
    };
    
    const url = topicUrls[topic];
    if (!url) {
      return res.status(404).render('index', { error: 'Topic not found' });
    }
    
    // Fetch content from GitHub
    const response = await axios.get(url);
    const content = response.data;
    
    res.render('prepare', {
      title: `${content.title || topic} - Skill Up`,
      topic,
      content,
      userName: user ? user.name : 'User'
    });
  } catch (error) {
    console.error('Error loading prepare content:', error.message);
    res.status(500).render('index', { 
      error: 'Content not available yet. Please try again later.' 
    });
  }
});

module.exports = router;
