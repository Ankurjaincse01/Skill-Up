# 🤖 AI Features Setup Guide

## Google Gemini AI Integration

Your Skill-Up platform now has **3 powerful AI features**:

### ✨ Features Implemented:

1. **AI DSA Question Generator**
   - Generates custom coding problems
   - Adjustable difficulty (Easy/Medium/Hard)
   - Multiple programming languages support
   - Includes hints, examples, and complexity analysis

2. **AI Code Explainer**
   - Analyzes your code solutions
   - Explains time & space complexity
   - Suggests optimizations
   - Identifies edge cases

3. **AI Interview Practice**
   - Interactive mock interviews
   - Real-time feedback
   - Natural conversation flow
   - Follow-up questions

---

## 🚀 Setup Instructions:

### Step 1: Get Free Gemini API Key

1. Visit: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key

### Step 2: Add API Key to Project

Create a `.env` file in your project root:

```env
MONGODB_URI=mongodb://localhost:27017/skillup_db
SESSION_SECRET=your-secret-key-change-in-production
GEMINI_API_KEY=your-actual-gemini-api-key-here
PORT=3000
```

### Step 3: Test the Features

1. Start server: `node server.js`
2. Login to your account
3. Go to **Prepare → Any Topic (e.g., Python)**
4. Click **"✨ Generate Question"**
5. AI will create a custom DSA problem!

---

## 📡 API Endpoints:

### 1. Generate DSA Question
```
POST /api/generate-dsa-question
Body: {
  "topic": "Arrays",
  "difficulty": "medium",
  "language": "Python"
}
```

### 2. Explain Code
```
POST /api/explain-code
Body: {
  "code": "your code here",
  "language": "Python",
  "question": "problem description"
}
```

### 3. AI Interview
```
POST /api/ai-interview
Body: {
  "topic": "Data Structures",
  "difficulty": "medium",
  "conversationHistory": []
}
```

---

## 🎯 Usage Limits (Free Tier):

- **Requests per minute:** 60
- **Requests per day:** Unlimited
- **Rate limiting:** Automatic

---

## 🔧 Troubleshooting:

**Error: "API key not valid"**
- Check your `.env` file has the correct key
- Restart the server after adding the key

**Error: "Rate limit exceeded"**
- Wait 1 minute between requests
- Free tier allows 60 requests/min

**Error: "Failed to parse AI response"**
- The AI might return malformed JSON
- Try again with different parameters

---

## 💡 Tips:

- **Best Topics:** Arrays, Linked Lists, Trees, Dynamic Programming
- **Best Difficulty:** Start with "medium" for balanced questions
- **Language Templates:** Include code templates for practice
- **Save Questions:** Copy generated questions to a file for later

---

## 🎨 Where to Find:

1. **Question Generator:**
   - Dashboard → Prepare → Select any topic
   - Look for the purple "AI-Powered Question Generator" section
   - Choose difficulty and language
   - Click "Generate Question"

2. **Code Explainer:**
   - Available via API (add UI button if needed)

3. **Interview Practice:**
   - Available via API (add UI page if needed)

---

Enjoy your AI-powered learning platform! 🚀
