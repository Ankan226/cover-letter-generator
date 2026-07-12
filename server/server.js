require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { buildCoverLetterPrompt } = require("./promptBuilder");

const app = express();
const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.post("/api/generate-letter", async (req, res) => {
  const { name, role, company, skills, resumeText } = req.body || {};

  if (!name || !role || !company || !skills) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: "Server is missing OPENROUTER_API_KEY. Add it to server/.env (see .env.example).",
    });
  }

  const prompt = buildCoverLetterPrompt({ name, role, company, skills, resumeText });

  try {
    const aiResponse = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text();
      console.error("OpenRouter API error:", aiResponse.status, errBody);
      return res.status(502).json({ error: "The AI provider returned an error." });
    }

    const data = await aiResponse.json();
    const letter = data?.choices?.[0]?.message?.content;

    if (!letter) {
      return res.status(502).json({ error: "The AI provider returned an empty response." });
    }

    res.json({ letter: letter.trim() });
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ error: "Unexpected server error." });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Cover letter backend listening on http://localhost:${PORT}`);
});