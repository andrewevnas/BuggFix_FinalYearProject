
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');

require("dotenv").config();
const express = require("express");
const cors = require("cors");


const { OpenAI } = require("openai");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

////////////////////
// AI API /////////
///////////////////

const baseURL = "https://api.aimlapi.com/v1";
const apiKey = process.env.AIML_API_KEY;

const aimlAPI = new OpenAI({
  apiKey,
  baseURL,
});

app.post("/api/ai/fix-code", async (req, res) => {
  try {
    const { code, language } = req.body;

    const systemPrompt = `You are an advanced coding assistant specializing in ${language} code improvement.

Your response MUST follow this exact format with these specific markers:

1. ALWAYS place improved code between <AI_CODE> and </AI_CODE> tags
2. Do NOT include the language name, backticks, or any other markers inside these tags - ONLY the actual code
3. After the code block, provide a detailed explanation of your changes

Example of proper format:

<AI_CODE>
// Improved code here
function improvedExample() {
  // Implementation details
}
</AI_CODE>

Explanation:
- Point-by-point details about the changes
- Rationale for each improvement
- Any performance or readability benefits

If no significant improvements are needed, still provide the original code between <AI_CODE> and </AI_CODE> tags followed by your assessment.

IMPORTANT: The code between the <AI_CODE> tags will be automatically inserted into the user's editor. Everything else will be shown as feedback. DO NOT use backticks or any other code formatting inside or near these tags.`;

    const userPrompt = `Review and suggest improvements for the following ${language} code:
${code}`;

    const completion = await aimlAPI.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.5, 
      max_tokens: 1024, 
    });

    const response = completion.choices[0].message.content;

    return res.json({ suggestions: response });
  } catch (error) {
    console.error("AIML API Error:", error);
    return res
      .status(500)
      .json({ error: "AIML API request failed", details: error.message });
  }
});



////////////////////
// DB API /////////
///////////////////

// Routes
app.use('/api/users', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('BuggFix API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;