const express = require('express');
const router = express.Router();

// Educational chatbot endpoint
router.post('/ask', async (req, res) => {
  try {
    const { question, context, sessionActive } = req.body;

    // Validate educational content only
    if (!isEducationalQuestion(question)) {
      return res.status(400).json({
        error: 'Please ask educational questions only',
        answer: '⚠️ This chatbot is for educational purposes only. Please ask questions about:\n\n• Math & Science\n• Programming\n• Study techniques\n• Homework help\n\nStay focused on your studies! 📚'
      });
    }

    // Option 1: Use OpenAI API (if you have API key)
    if (process.env.OPENAI_API_KEY) {
      const answer = await getOpenAIAnswer(question);
      return res.json({ answer });
    }

    // Option 2: Use Google Gemini API (free tier available)
    if (process.env.GEMINI_API_KEY) {
      const answer = await getGeminiAnswer(question);
      return res.json({ answer });
    }

    // Option 3: Fallback to rule-based responses
    const answer = generateEducationalAnswer(question);
    res.json({ answer });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process question',
      answer: 'Sorry, I encountered an error. Please try rephrasing your question.'
    });
  }
});

// Check if question is educational
function isEducationalQuestion(question) {
  const q = question.toLowerCase();
  
  // Block non-educational topics
  const blockedKeywords = [
    'game', 'movie', 'entertainment', 'celebrity', 'gossip',
    'social media', 'dating', 'shopping', 'sports score'
  ];
  
  if (blockedKeywords.some(keyword => q.includes(keyword))) {
    return false;
  }

  // Allow educational topics
  const educationalKeywords = [
    'math', 'calculus', 'algebra', 'geometry', 'equation',
    'physics', 'chemistry', 'biology', 'science',
    'programming', 'code', 'python', 'javascript',
    'history', 'geography', 'literature', 'language',
    'study', 'learn', 'homework', 'assignment', 'exam',
    'how to', 'what is', 'explain', 'solve', 'calculate'
  ];

  return educationalKeywords.some(keyword => q.includes(keyword)) || q.endsWith('?');
}

// OpenAI integration
async function getOpenAIAnswer(question) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant helping students with homework and study questions. Keep answers concise, clear, and educational. Focus on teaching concepts, not just giving answers.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// Google Gemini integration (free tier)
async function getGeminiAnswer(question) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an educational assistant. Answer this student's question concisely and clearly: ${question}`
        }]
      }]
    })
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Rule-based educational answers
function generateEducationalAnswer(question) {
  const q = question.toLowerCase();

  // Math topics
  if (q.includes('derivative') || q.includes('calculus')) {
    return `📐 **Calculus - Derivatives**

Basic derivative rules:
1. Power rule: d/dx(x^n) = nx^(n-1)
2. Constant rule: d/dx(c) = 0
3. Sum rule: d/dx(f + g) = f' + g'
4. Product rule: d/dx(fg) = f'g + fg'
5. Chain rule: d/dx(f(g(x))) = f'(g(x)) × g'(x)

Example: d/dx(3x²) = 6x

Need help with a specific problem? Share it!`;
  }

  if (q.includes('quadratic') || q.includes('x²')) {
    return `🔢 **Quadratic Equations**

Standard form: ax² + bx + c = 0

Quadratic formula:
x = (-b ± √(b² - 4ac)) / 2a

Steps:
1. Identify a, b, c values
2. Calculate discriminant: b² - 4ac
3. Apply formula
4. Simplify

Example: x² - 5x + 6 = 0
a=1, b=-5, c=6
x = (5 ± √(25-24)) / 2 = (5 ± 1) / 2
x = 3 or x = 2`;
  }

  // Programming topics
  if (q.includes('python') && q.includes('loop')) {
    return `💻 **Python Loops**

**For Loop:**
\`\`\`python
for i in range(5):
    print(i)  # Prints 0 to 4
\`\`\`

**While Loop:**
\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

**Loop through list:**
\`\`\`python
fruits = ['apple', 'banana', 'cherry']
for fruit in fruits:
    print(fruit)
\`\`\`

What specific loop problem are you working on?`;
  }

  if (q.includes('function') && (q.includes('python') || q.includes('javascript'))) {
    return `⚙️ **Functions**

**Python:**
\`\`\`python
def greet(name):
    return f"Hello {name}"

result = greet("Alice")
print(result)  # Hello Alice
\`\`\`

**JavaScript:**
\`\`\`javascript
function greet(name) {
    return \`Hello \${name}\`;
}

const result = greet("Alice");
console.log(result);  // Hello Alice
\`\`\`

Functions help organize code and reuse logic!`;
  }

  // Science topics
  if (q.includes('newton') || q.includes('force')) {
    return `⚛️ **Newton's Laws of Motion**

**First Law (Inertia):**
An object at rest stays at rest, an object in motion stays in motion unless acted upon by a force.

**Second Law (F=ma):**
Force = Mass × Acceleration
F = ma

**Third Law (Action-Reaction):**
For every action, there is an equal and opposite reaction.

Example: Pushing a wall - you feel force back!`;
  }

  if (q.includes('photosynthesis')) {
    return `🌱 **Photosynthesis**

Process where plants make food using sunlight:

**Equation:**
6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂

**Steps:**
1. Light absorption (chlorophyll)
2. Water splitting
3. Oxygen release
4. Glucose production

**Location:** Chloroplasts in plant cells

Plants convert light energy to chemical energy!`;
  }

  // Study techniques
  if (q.includes('study') || q.includes('memorize')) {
    return `📚 **Effective Study Techniques**

**1. Active Recall**
Test yourself instead of re-reading

**2. Spaced Repetition**
Review material at increasing intervals

**3. Pomodoro Technique**
25 min focus + 5 min break

**4. Feynman Technique**
Explain concepts in simple terms

**5. Practice Problems**
Apply what you learned

**6. Sleep Well**
Memory consolidation happens during sleep

Stay consistent and focused! 🎯`;
  }

  // Default helpful response
  return `🤔 I'm here to help with educational questions!

**Topics I can help with:**
• Mathematics (Algebra, Calculus, Geometry)
• Science (Physics, Chemistry, Biology)
• Programming (Python, JavaScript, etc.)
• Study techniques and tips
• Homework problems

**How to ask:**
Be specific! Instead of "help with math", try:
"How do I solve x² - 5x + 6 = 0?"

What would you like to learn about?`;
}

// Log educational queries for analytics
router.post('/log-query', async (req, res) => {
  try {
    const { question, answer, userId, sessionId } = req.body;
    
    // Store in database for analytics
    // This helps improve the chatbot over time
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log query' });
  }
});

module.exports = router;