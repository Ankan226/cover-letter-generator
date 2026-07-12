const BACKEND_BASE = "https://cover-letter-generator-pb95.onrender.com";

class GenerationError extends Error {
  constructor(message) {
    super(message);
    this.name = "GenerationError";
  }
}

/**
 * Sends form fields (+ optional extracted resume text) to our backend,
 * which forwards a prompt to the LLM and returns the generated letter.
 * @param {{name:string, role:string, company:string, skills:string, resumeText?:string}} payload
 * @returns {Promise<string>} the generated letter text
 */
async function generateLetterWithAI(payload) {
  let response;
  try {
    response = await fetch(`${BACKEND_BASE}/api/generate-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    throw new GenerationError(
      "Could not reach the backend. Is `npm start` running in /server?"
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new GenerationError(body.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  return data.letter;
}