const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generate answer for a single interview question
   * @param {string} question - The interview question
   * @param {string} role - The job role (e.g., "Frontend Developer")
   * @param {string} context - Additional context or topics
   * @returns {Promise<string>} - Generated answer
   */
  async generateAnswer(question, role = '', context = '') {
    if (!this.genAI) {
      throw new Error('Gemini AI is not initialized. Please check your API key.');
    }

    try {
      const prompt = `You are an expert technical interviewer helping candidates prepare for ${role} interviews.
      
Question: ${question}

${context ? `Context/Topics: ${context}` : ''}

Provide a comprehensive, well-structured answer that:
1. Directly answers the question
2. Includes technical details and best practices
3. Provides examples where relevant
4. Is concise but thorough (3-5 paragraphs)
5. Uses clear, professional language

Answer:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating answer with Gemini:', error);
      throw new Error('Failed to generate answer: ' + error.message);
    }
  }

  /**
   * Generate multiple interview questions with answers for a role
   * @param {string} role - The job role
   * @param {string} topics - Topics to focus on
   * @param {number} count - Number of questions to generate
   * @returns {Promise<Array>} - Array of question-answer pairs
   */
  async generateQuestions(role, topics, count = 10) {
    if (!this.genAI) {
      throw new Error('Gemini AI is not initialized. Please check your API key.');
    }

    try {
      const prompt = `Generate ${count} interview questions with detailed answers for a ${role} position.
      
Topics to focus on: ${topics}

For each question, provide:
1. A clear, specific interview question
2. A comprehensive answer (3-4 paragraphs)

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here",
    "answer": "Detailed answer here"
  }
]

Ensure questions are:
- Relevant to ${role}
- Cover different aspects of ${topics}
- Range from basic to advanced
- Practical and commonly asked in real interviews`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from response
      const jsonMatch = text.match(/\[\s*{[\s\S]*}\s*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return raw text if JSON parsing fails
      throw new Error('Could not parse response as JSON');
    } catch (error) {
      console.error('Error generating questions with Gemini:', error);
      throw new Error('Failed to generate questions: ' + error.message);
    }
  }

  /**
   * Generate learning resources for a topic
   * @param {string} topic - The topic to get resources for
   * @param {string} role - The job role context
   * @returns {Promise<string>} - Learning resources and tips
   */
  async generateLearningResources(topic, role = '') {
    if (!this.genAI) {
      throw new Error('Gemini AI is not initialized. Please check your API key.');
    }

    try {
      const prompt = `Provide learning resources and tips for ${topic} in the context of ${role} interviews.

Include:
1. Key concepts to understand
2. Recommended learning approach
3. Best practices
4. Common pitfalls to avoid
5. Practice suggestions

Keep it concise and actionable.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating resources with Gemini:', error);
      throw new Error('Failed to generate resources: ' + error.message);
    }
  }
}

module.exports = new GeminiService();
