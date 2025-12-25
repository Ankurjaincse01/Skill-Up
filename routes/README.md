# Routes Structure

Yeh folder contain karta hai saare application routes ko separate files mein.

## Files:

### 1. **index.js** - Main Pages Routes
- `GET /` - Home page
- `GET /dashboard` - User dashboard (protected)
- `GET /mock-test` - Mock test page (protected)

### 2. **auth.js** - Authentication Routes
- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `GET /logout` - User logout

### 3. **prepare.js** - Preparation Content Routes
- `GET /prepare/:topic` - Specific topic preparation page (protected)
  - Topics: python, java, cpp, javascript, c, data-structures, algorithms, oops, dbms, os, cn, web-dev, system-design, interview-prep

### 4. **questionBank.js** - Question Bank Routes
- `GET /question-bank` - DSA questions page (protected)
- `GET /question-bank/api` - Questions JSON API (protected)

## How to Add New Routes:

1. **Create new route file** in `routes/` folder:
```javascript
const express = require('express');
const router = express.Router();

router.get('/your-route', (req, res) => {
  // Your logic here
});

module.exports = router;
```

2. **Import in server.js**:
```javascript
const yourRoutes = require('./routes/yourFile');
app.use('/your-path', yourRoutes);
```

## Protected Routes:
Routes that need authentication use `isAuthenticated` middleware defined in each route file.

## Benefits:
- ✅ Clean code organization
- ✅ Easy to maintain
- ✅ Reusable middleware
- ✅ Better debugging
- ✅ Scalable structure
