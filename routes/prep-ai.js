const express = require('express');
const router = express.Router();
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const geminiService = require('../services/geminiService');

// Auth check middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/');
};

// Prep AI page
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('question-bank', { 
      title: 'Prep AI - Skill Up',
      userName: user ? user.name : 'User'
    });
  } catch (error) {
    res.status(500).render('index', { error: 'Error loading prep AI' });
  }
});

// DSA Questions only page
router.get('/dsa', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('dsa-questions', { 
      title: 'DSA Questions - Skill Up',
      userName: user ? user.name : 'User'
    });
  } catch (error) {
    res.status(500).render('index', { error: 'Error loading DSA questions' });
  }
});

// Role-specific interview prep page (e.g., /prep-ai/frontend-developer)
router.get('/:role', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const roleSlug = req.params.role.toLowerCase();
    // Convert slug back to readable format (frontend-developer → Frontend Developer)
    const roleTitle = roleSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    // Map role to skills
    const roleSkillsMap = {
      'frontend-developer': 'React.js, DOM manipulation, CSS Flexbox',
      'backend-developer': 'Node.js, Express, REST APIs, MongoDB',
      'full-stack-developer': 'MERN stack, deployment strategies, authentication',
      'data-analyst': 'SQL, Excel, Data Visualization, Power BI',
      'devops-engineer': 'CI/CD, Docker, Kubernetes, AWS',
      'ui-ux-designer': 'Figma, user journey, wireframing, accessibility',
      'java-developer': 'Spring Boot, Hibernate, Microservices, JPA',
      'qa-engineer': 'Selenium, TestNG, Automation, API Testing',
      'python-developer': 'Django, Flask, FastAPI, Pandas',
      'ml-engineer': 'TensorFlow, PyTorch, Scikit-learn, NLP',
      'cloud-engineer': 'AWS, Azure, GCP, Terraform'
    };
    
    const skills = roleSkillsMap[roleSlug] || 'Technical Skills';
    let questions = [];
    
    // Check if we should generate questions with AI
    if (req.query.generate === 'true') {
      try {
        console.log(`Generating AI questions for ${roleTitle}...`);
        const aiQuestions = await geminiService.generateQuestions(roleTitle, skills, 10);
        questions = aiQuestions.map((q, index) => ({
          id: index + 1,
          question: q.question,
          answer: q.answer
        }));
        console.log(`Successfully generated ${questions.length} questions`);
      } catch (error) {
        console.error('Error generating questions with AI:', error);
        // Fall back to loading from file
      }
    }
    
    // If no AI questions, try loading from file
    if (questions.length === 0) {
      const roleFilePath = path.join(__dirname, '../content', `${roleSlug}.json`);
      if (fs.existsSync(roleFilePath)) {
        const fileContent = fs.readFileSync(roleFilePath, 'utf-8');
        questions = JSON.parse(fileContent);
      }
    }
    
    res.render('interview-prep', { 
      title: `${roleTitle} - Interview Prep - Skill Up`,
      user: user,
      role: roleTitle,
      skills: skills,
      experience: req.query.experience || '3',
      questions: questions
    });
  } catch (error) {
    console.error('Error loading interview prep:', error);
    res.status(500).render('index', { error: 'Error loading interview prep' });
  }
});

// API: Get all DSA questions
router.get('/api/all', isAuthenticated, (req, res) => {
  try {
    const questionsPath = path.join(__dirname, '../content', 'questions-dsa.json');
    if (!fs.existsSync(questionsPath)) {
      return res.json({ success: true, data: [], count: 0 });
    }
    const fileContent = fs.readFileSync(questionsPath, 'utf-8');
    const dsaQuestions = JSON.parse(fileContent);
    res.json({ success: true, data: dsaQuestions, count: dsaQuestions.length });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to load questions' });
  }
});

// API: Get questions by topic
router.get('/api/topic/:topicName', isAuthenticated, (req, res) => {
  try {
    const topicName = req.params.topicName.toLowerCase();
    const questionsPath = path.join(__dirname, '../content', 'questions-dsa.json');
    if (!fs.existsSync(questionsPath)) {
      return res.json({ success: true, topic: topicName, data: [], count: 0 });
    }
    const fileContent = fs.readFileSync(questionsPath, 'utf-8');
    let dsaQuestions = JSON.parse(fileContent);
    const filtered = dsaQuestions.filter(q => 
      q.topic && q.topic.toLowerCase() === topicName
    );
    res.json({ success: true, topic: topicName, data: filtered, count: filtered.length });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to load questions' });
  }
});

// API: Get questions by role
router.get('/api/role/:roleSlug', isAuthenticated, (req, res) => {
  try {
    const roleSlug = req.params.roleSlug.toLowerCase();
    
    // Check if there's a dedicated file for this role
    const roleFilePath = path.join(__dirname, '../content', `${roleSlug}.json`);
    
    if (fs.existsSync(roleFilePath)) {
      // Load from dedicated role file
      const fileContent = fs.readFileSync(roleFilePath, 'utf-8');
      const questions = JSON.parse(fileContent);
      return res.json({ success: true, role: roleSlug, data: questions, count: questions.length });
    }
    
    // Fallback to DSA questions filtered by role
    // Map role slugs to topic arrays (customize based on your logic)
    const roleTopicMap = {
      'frontend-developer': ['arrays', 'strings', 'trees', 'graphs'],
      'backend-developer': ['arrays', 'trees', 'graphs', 'dp'],
      'full-stack-developer': ['arrays', 'strings', 'trees', 'graphs', 'dp'],
      'devops-engineer': ['system-design', 'dbms', 'os'],
      'mobile-developer': ['arrays', 'strings', 'trees'],
      'data-engineer': ['arrays', 'dp', 'system-design']
    };
    
    const topicsForRole = roleTopicMap[roleSlug] || [];
    const questionsPath = path.join(__dirname, '../content', 'questions-dsa.json');
    
    if (!fs.existsSync(questionsPath)) {
      return res.json({ success: true, role: roleSlug, data: [], count: 0 });
    }
    
    const fileContent = fs.readFileSync(questionsPath, 'utf-8');
    let dsaQuestions = JSON.parse(fileContent);
    
    // Filter questions by topics relevant to the role
    const filtered = dsaQuestions.filter(q => 
      topicsForRole.includes(q.topic && q.topic.toLowerCase())
    );
    
    res.json({ success: true, role: roleSlug, data: filtered, count: filtered.length });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Failed to load questions' });
  }
});

// API: Search questions
router.get('/api/search', isAuthenticated, (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }
    const questionsPath = path.join(__dirname, '../content', 'questions-dsa.json');
    if (!fs.existsSync(questionsPath)) {
      return res.json({ success: true, query: query, data: [], count: 0 });
    }
    const fileContent = fs.readFileSync(questionsPath, 'utf-8');
    let dsaQuestions = JSON.parse(fileContent);
    const filtered = dsaQuestions.filter(q => 
      q.question && q.question.toLowerCase().includes(query.toLowerCase())
    );
    res.json({ success: true, query: query, data: filtered, count: filtered.length });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// ===== GEMINI AI ENDPOINTS =====

// API: Generate answer for a specific question
router.post('/api/generate-answer', isAuthenticated, async (req, res) => {
  try {
    const { question, role, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    const answer = await geminiService.generateAnswer(question, role || '', context || '');
    
    res.json({ 
      success: true, 
      question: question,
      answer: answer 
    });
  } catch (error) {
    console.error('Error generating answer:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate answer'
    });
  }
});

// API: Generate multiple questions for a role
router.post('/api/generate-questions', isAuthenticated, async (req, res) => {
  try {
    const { role, topics, count } = req.body;
    
    if (!role || !topics) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role and topics are required' 
      });
    }

    const questionCount = parseInt(count) || 10;
    const questions = await geminiService.generateQuestions(role, topics, questionCount);
    
    res.json({ 
      success: true, 
      role: role,
      topics: topics,
      questions: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate questions'
    });
  }
});

// API: Generate learning resources
router.post('/api/generate-resources', isAuthenticated, async (req, res) => {
  try {
    const { topic, role } = req.body;
    
    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const resources = await geminiService.generateLearningResources(topic, role || '');
    
    res.json({ 
      success: true, 
      topic: topic,
      resources: resources 
    });
  } catch (error) {
    console.error('Error generating resources:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate resources'
    });
  }
});

module.exports = router;
