const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo;
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

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

// Prepare section route - Fetches content from GitHub raw API
app.get('/prepare/:topic', isAuthenticated, async (req, res) => {
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

// AI-powered DSA Question Generator
app.post('/api/generate-dsa-question', isAuthenticated, async (req, res) => {
  try {
    const { topic, difficulty, language } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Generate a ${difficulty || 'medium'} level Data Structures and Algorithms problem on ${topic || 'Arrays'}.

Requirements:
1. Problem Title (catchy and descriptive)
2. Problem Description (clear and detailed)
3. Input Format
4. Output Format
5. Constraints
6. Sample Input/Output (2 examples)
7. Hints (2-3 hints without giving away the solution)
8. Time Complexity expected
9. Space Complexity expected
${language ? `10. Code template in ${language}` : ''}

Format the response as a JSON object with these keys: title, description, inputFormat, outputFormat, constraints, examples (array), hints (array), timeComplexity, spaceComplexity${language ? ', codeTemplate' : ''}.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    let questionData;
    try {
      // Try to parse as JSON directly
      questionData = JSON.parse(responseText);
    } catch {
      // If not valid JSON, extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        questionData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not parse AI response');
      }
    }
    
    res.json({ 
      success: true, 
      question: questionData 
    });
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate question. Please try again.' 
    });
  }
});

// AI Code Explanation
app.post('/api/explain-code', isAuthenticated, async (req, res) => {
  try {
    const { code, language, question } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Analyze this ${language || 'code'} solution:

Problem: ${question || 'Not provided'}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. **Algorithm Explanation**: Step-by-step breakdown
2. **Time Complexity**: Big O notation with explanation
3. **Space Complexity**: Big O notation with explanation
4. **Strengths**: What's good about this solution
5. **Optimization Suggestions**: How to improve (if any)
6. **Edge Cases**: Potential issues to consider

Format as markdown with clear sections.`;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();
    
    res.json({ 
      success: true, 
      explanation 
    });
  } catch (error) {
    console.error('AI Explanation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate explanation.' 
    });
  }
});

// AI Interview Practice
app.post('/api/ai-interview', isAuthenticated, async (req, res) => {
  try {
    const { topic, difficulty, conversationHistory } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let prompt;
    if (!conversationHistory || conversationHistory.length === 0) {
      // Start new interview
      prompt = `You are a friendly technical interviewer conducting a ${difficulty || 'medium'} level coding interview on ${topic || 'Data Structures'}.

Start the interview by:
1. Greeting the candidate warmly
2. Asking a ${difficulty} level DSA problem related to ${topic}
3. Keep the tone encouraging and professional

Provide the question in a clear, structured format.`;
    } else {
      // Continue conversation
      const history = conversationHistory.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n\n');
      
      prompt = `You are continuing a technical interview. Here's the conversation so far:

${history}

As the interviewer:
- If the candidate asked a clarifying question, answer it clearly
- If the candidate provided a solution, give constructive feedback
- Ask follow-up questions about time/space complexity
- Guide them with hints if they're stuck (don't give away the answer)
- Be encouraging and professional

Respond naturally as an interviewer would.`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    res.json({ 
      success: true, 
      message: response 
    });
  } catch (error) {
    console.error('AI Interview Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Interview session error. Please try again.' 
    });
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
    
    // Create sess
    // ion after successful signup
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
