require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per 15 minutes per IP
  message: { error: "Too many requests, please try again later." },
});

// OpenAI setup
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve only public folder

// Input validation helper
function validateInputs({ name, email, education, workExperience, skills }) {
  if (!name || !email || !education || !workExperience || !skills) {
    return "All fields are required.";
  }
  if (name.length > 100) return "Name is too long.";
  if (email.length > 100) return "Email is too long.";
  if (education.length > 500) return "Education is too long.";
  if (workExperience.length > 1000) return "Work experience is too long.";
  if (skills.length > 500) return "Skills is too long.";
  return null; // null means all inputs are valid
}

// AI Improve endpoint
app.post("/api/ai-improve", limiter, async (req, res) => {
  const validationError = validateInputs(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }
  try {
    const { name, email, education, workExperience, skills } = req.body;

    // Instruction for ChatGPT
    const prompt = `
        You are a professional resume writer. Output ONLY an HTML fragment (no <html>, <head>, or <body> tags).
Do NOT include <style> tags or inline style="" attributes.
Use only semantic HTML and the following class names EXACTLY where appropriate:
  - resume
  - resume-header
  - name
  - contact
  - section
  - section-title
  - section-item
  - skills-list
  - skill-item

Fill in missing fields, make the language professional and concise. Output only the HTML fragment. Use original name and email address
Resume data:
Name: ${name}
Email: ${email}
Education: ${education}
Work Experience: ${workExperience}
Skills: ${skills}

      `;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const improvedResume = response.choices[0].message.content;

    res.json({ improvedResume });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: "Failed to improve resume" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
