// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai"); // From the official openai npm package

const app = express();
app.use(cors());
app.use(express.json());

// 1) Setup your AI/ML API constants
const baseURL = "https://api.aimlapi.com/v1";
const apiKey = process.env.AIML_API_KEY; // Store your AI/ML API key in .env

// 2) Create an instance of the "OpenAI" client pointing to the AI/ML API baseURL
const aimlAPI = new OpenAI({
  apiKey,  // e.g., "sk-key-xxxxx"
  baseURL, // "https://api.aimlapi.com/v1"
});

// 3) Example route to test or "fix code"
app.post("/api/ai/fix-code", async (req, res) => {
  try {
    // For now, let's treat the user code as the "user prompt"
    // or you can pass in something else to keep it simple
    const { code } = req.body;

    // Hard-code a system prompt or build it from your needs
    const systemPrompt = "You are a coding assistant. Provide concise improvements.";
    // Or use your travel example snippet for testing:
    // const systemPrompt = "You are a travel agent. Be descriptive and helpful.";

    // If you want to skip code entirely for now, you can do something simple:
    // const userPrompt = "Tell me a joke about JavaScript";
    // But let's assume you at least read some user input from the front end
    const userPrompt = code || "Tell me about San Francisco"; // fallback if none

    // 4) Make the chat completion request
    const completion = await aimlAPI.chat.completions.create({
      // The AI/ML API’s example uses Mistral-7B:
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
      temperature: 0.7,
      max_tokens: 256,
    });

    // 5) Extract the text from the response
    const response = completion.choices[0].message.content;

    // 6) Send it back to the front-end
    return res.json({ suggestions: response });
  } catch (error) {
    console.error("AIML API Error:", error);
    return res
      .status(500)
      .json({ error: "AIML API request failed", details: error.message });
  }
});

module.exports = app;
