// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

// 1) Configure OpenAI with the v3 style
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 2) Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// 3) Example route for AI fix-code
app.post("/api/ai/fix-code", async (req, res) => {
  try {
    const { code, language } = req.body;
    console.log("Received code:", code);
    console.log("Language:", language);

    // Build a simple prompt
    const prompt = `
      You are a coding assistant. The user has provided the following ${language} code:
      ---
      ${code}
      ---
      Please analyze the code for bugs or improvements, 
      and provide a short explanation plus a revised code snippet.
    `;

    // 4) Use createChatCompletion with GPT-3.5-turbo
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a coding assistant. Keep answers concise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const suggestions = response.data.choices[0].message.content.trim();

    return res.json({ suggestions });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res
      .status(500)
      .json({ error: "AI request failed", details: error.message });
  }
});

// 5) Export the app for server.js to use
module.exports = app;
