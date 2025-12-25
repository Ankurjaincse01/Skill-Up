# Gemini AI Integration Guide for Interview Questions

## Overview
This guide explains how to use Google's Gemini AI to generate answers for interview questions in your Skill Up application.

## Setup Steps

### 1. Get Your Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key

### 2. Add API Key to Environment
Edit the `.env` file in your project root:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/skillup_db
GEMINI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your real Gemini API key.

### 3. Restart the Server
```bash
nodemon server.js
```

## How to Use

### Method 1: Generate Answer for a Single Question

**API Endpoint:** `POST /question-bank/api/generate-answer`

**Request Body:**
```json
{
  "question": "What is Docker and why is it useful?",
  "role": "DevOps Engineer",
  "context": "CI/CD, containerization"
}
```

**Example JavaScript (Frontend):**
```javascript
async function generateAnswer(question) {
  const response = await fetch('/question-bank/api/generate-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: question,
      role: 'DevOps Engineer',
      context: 'CI/CD, Docker, Kubernetes'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Generated Answer:', data.answer);
    return data.answer;
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/question-bank/api/generate-answer \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Kubernetes?","role":"DevOps Engineer"}'
```

---

### Method 2: Generate Multiple Questions with Answers

**API Endpoint:** `POST /question-bank/api/generate-questions`

**Request Body:**
```json
{
  "role": "Frontend Developer",
  "topics": "React, JavaScript, CSS, HTML",
  "count": 10
}
```

**Example JavaScript:**
```javascript
async function generateQuestions() {
  const response = await fetch('/question-bank/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'Frontend Developer',
      topics: 'React, JavaScript, CSS, HTML',
      count: 10
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Generated Questions:', data.questions);
    // data.questions is an array of { question, answer } objects
    return data.questions;
  }
}
```

---

### Method 3: Generate Learning Resources

**API Endpoint:** `POST /question-bank/api/generate-resources`

**Request Body:**
```json
{
  "topic": "Kubernetes",
  "role": "DevOps Engineer"
}
```

**Example JavaScript:**
```javascript
async function getResources(topic) {
  const response = await fetch('/question-bank/api/generate-resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: topic,
      role: 'DevOps Engineer'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Learning Resources:', data.resources);
    return data.resources;
  }
}
```

---

## Integration Examples

### Example 1: Add "Generate Answer" Button to Questions

Add this to your `interview-prep.ejs` or `question-bank.ejs`:

```html
<button class="btn-action btn-generate" onclick="generateAnswerForQuestion('<%= q.question %>', '<%= q.id %>')">
  <i class="fas fa-magic"></i> Generate Answer
</button>

<script>
async function generateAnswerForQuestion(question, questionId) {
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  
  try {
    const response = await fetch('/question-bank/api/generate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        role: '<%= role %>',
        context: '<%= skills %>'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Display the generated answer
      document.getElementById('answer-' + questionId).innerHTML = data.answer;
      btn.innerHTML = '<i class="fas fa-check"></i> Answer Generated';
    } else {
      alert('Error: ' + data.error);
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-magic"></i> Generate Answer';
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to generate answer');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-magic"></i> Generate Answer';
  }
}
</script>
```

### Example 2: Auto-Generate Questions When Creating Session

Update your modal form submission:

```javascript
document.getElementById('interviewForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const role = document.getElementById('targetRole').value;
  const topics = document.getElementById('topicsFocus').value;
  
  // Show loading
  const btn = this.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = 'Generating Questions...';
  
  try {
    // Generate questions with AI
    const response = await fetch('/question-bank/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, topics, count: 10 })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Save questions to your database or session
      console.log('Generated questions:', data.questions);
      
      // Redirect to interview prep page
      const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
      window.location.href = '/question-bank/' + roleSlug;
    }
  } catch (error) {
    console.error('Error:', error);
    btn.disabled = false;
    btn.innerHTML = 'Create Session';
  }
});
```

---

## API Response Formats

### Generate Answer Response
```json
{
  "success": true,
  "question": "What is Docker?",
  "answer": "Docker is a containerization platform that packages applications..."
}
```

### Generate Questions Response
```json
{
  "success": true,
  "role": "Frontend Developer",
  "topics": "React, JavaScript",
  "count": 2,
  "questions": [
    {
      "question": "What is React and why is it useful?",
      "answer": "React is a JavaScript library for building user interfaces..."
    },
    {
      "question": "Explain the Virtual DOM concept in React.",
      "answer": "The Virtual DOM is a lightweight copy of the actual DOM..."
    }
  ]
}
```

### Generate Resources Response
```json
{
  "success": true,
  "topic": "Kubernetes",
  "resources": "Key concepts to understand:\n1. Pods and containers\n2. Services and networking..."
}
```

---

## Error Handling

All API endpoints return error responses in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common errors:
- `"Gemini AI is not initialized"` - API key not set in .env
- `"Question is required"` - Missing required parameter
- `"Failed to generate answer"` - API call failed (check API key, quota)

---

## Best Practices

1. **Cache Generated Answers**: Store generated answers in your database to avoid regenerating the same content
2. **Rate Limiting**: Implement rate limiting to avoid exceeding API quotas
3. **Loading States**: Always show loading indicators while generating content
4. **Error Messages**: Display user-friendly error messages
5. **Fallback Content**: Have default questions/answers in case AI generation fails

---

## Cost Optimization

Gemini API has usage limits:
- Free tier: 60 requests per minute
- Monitor your usage at: https://console.cloud.google.com/

Tips to reduce costs:
1. Cache generated content in MongoDB
2. Only generate when user explicitly requests
3. Batch requests when possible
4. Use shorter prompts for faster responses

---

## Troubleshooting

### Issue: "GEMINI_API_KEY not found"
**Solution:** Make sure your `.env` file has the API key and restart the server

### Issue: "Failed to generate answer"
**Solutions:**
- Check if API key is valid
- Verify internet connection
- Check API quota at Google AI Studio
- Review console logs for detailed error

### Issue: "Could not parse response as JSON"
**Solution:** The AI returned unexpected format. This is handled with fallback in the code.

---

## Next Steps

1. Replace `your_gemini_api_key_here` in `.env` with your actual key
2. Test the API using cURL or Postman
3. Add generate buttons to your UI
4. Implement caching to store generated answers
5. Add loading spinners for better UX

For more information, visit: https://ai.google.dev/tutorials/get_started_web
