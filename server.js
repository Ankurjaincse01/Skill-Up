  const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo;
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Import middleware
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const prepareRoutes = require('./routes/prepare');
const prepAIRoutes = require('./routes/prep-ai');

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

// Mount routes
app.use('/', indexRoutes);
app.use('/api', authRoutes);
app.use('/prepare', prepareRoutes);
app.get('/dsa-question', (req, res) => res.redirect('/prep-ai/dsa'));
app.use('/prep-ai', prepAIRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
