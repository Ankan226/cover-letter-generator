/**
 * Builds a simulated cover letter string from the given fields.
 * @param {{name:string, role:string, company:string, skills:string}} fields
 * @returns {string}
 */
function buildSimulatedLetter({ name, role, company, skills }) {
  const skillList = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");

  return [
    `Dear Hiring Manager at ${company},`,
    ``,
    `My name is ${name}, and I am writing to express my interest in the ${role} position at ${company}. Over the course of my studies and projects, I have developed hands-on experience with ${skillList || "a range of relevant technologies"}, which I believe align well with the demands of this role.`,
    ``,
    `I am particularly drawn to ${company} because of its reputation for building thoughtful, well-engineered products, and I would welcome the opportunity to contribute to that work as a ${role}.`,
    ``,
    `Thank you for considering my application. I look forward to the possibility of discussing how my background could be a good fit for your team.`,
    ``,
    `Sincerely,`,
    `${name}`,
  ].join("\n");
}

/**
 * Validates that all required text fields are non-empty.
 * @param {Record<string,string>} fields
 * @returns {boolean}
 */
function areFieldsValid(fields) {
  return Object.values(fields).every((v) => typeof v === "string" && v.trim().length > 0);
}

/**
 * Copies a string to the clipboard using the async Clipboard API,
 * falling back to a legacy approach if it's unavailable.
 * @param {string} text
 * @returns {Promise<boolean>} whether the copy succeeded
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch (_) {
    return false;
  }
}

/**
 * Converts double-newline-separated plain text into an array of paragraph strings, used to render AI/markdown output as clean <p> tags.
 * @param {string} text
 * @returns {string[]}
 */
function splitIntoParagraphs(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Truncates extracted resume text to keep the LLM payload a reasonable size. */
function truncateResumeText(text, maxChars = 6000) {
  if (!text) return "";
  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
}