/**
 * @param {{name:string, role:string, company:string, skills:string, resumeText?:string}} fields
 * @returns {string} the full prompt to send to the LLM
 */
function buildCoverLetterPrompt({ name, role, company, skills, resumeText }) {
  const resumeBlock = resumeText
    ? `\nHere is additional context extracted from the candidate's resume — use it to make the letter specific and credible, but do not quote it verbatim at length:\n"""\n${resumeText}\n"""\n`
    : "";

  return `You are a professional career coach writing a concise, compelling cover letter.

Candidate name: ${name}
Target role: ${role}
Target company: ${company}
Key skills: ${skills}
${resumeBlock}
Write a cover letter (3-4 short paragraphs) that:
- Opens by naming the role and company
- Connects the candidate's skills (and resume context, if provided) to what the role likely requires
- Sounds genuine and specific, not generic or overly formal
- Closes with a brief, confident call to action

Return ONLY the letter text, with paragraphs separated by a blank line. Do not include a subject line, markdown formatting, or any commentary before or after the letter.`;
}

module.exports = { buildCoverLetterPrompt };