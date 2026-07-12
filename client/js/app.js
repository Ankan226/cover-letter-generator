const letterForm = document.getElementById("letter-form");
const nameInput = document.getElementById("candidate-name");
const roleInput = document.getElementById("job-role");
const companyInput = document.getElementById("target-company");
const skillsInput = document.getElementById("key-skills");

const outputStatus = document.getElementById("output-status");
const outputEmpty = document.getElementById("output-empty");
const outputResult = document.getElementById("output-result");
const letterTextEl = document.getElementById("letter-text");
const copyBtn = document.getElementById("copy-btn");
const copyConfirm = document.getElementById("copy-confirm");

let currentMode = "demo";
let lastGeneratedLetter = "";
let extractedResumeText = "";

function getFormFields() {
  return {
    name: nameInput.value.trim(),
    role: roleInput.value.trim(),
    company: companyInput.value.trim(),
    skills: skillsInput.value.trim(),
  };
}

/**
 * Handles form submission for letter generation.
 * @param {Event} event
 */
async function handleGenerate(event) {
  event.preventDefault();

  const fields = getFormFields();
  if (!areFieldsValid(fields)) {
    renderError(outputStatus, "Please fill in every field before generating.");
    return;
  }

  if (currentMode === "demo") {
    outputEmpty.hidden = true;
    clearStatus(outputStatus);
    const letter = buildSimulatedLetter(fields);
    lastGeneratedLetter = letter;
    renderLetter(outputEmpty, outputResult, letterTextEl, letter);
    return;
  }

  // AI Mode is handled by handleGenerateWithAI, wired in a later commit.
  await handleGenerateWithAI(fields);
}

letterForm.addEventListener("submit", handleGenerate);


copyBtn.addEventListener("click", async () => {
  if (!lastGeneratedLetter) return;
  const ok = await copyToClipboard(lastGeneratedLetter);
  if (ok) flashCopyConfirm(copyConfirm);
});

/* ---------- Mode switch: Demo vs AI ---------- */

const modeDemoBtn = document.getElementById("mode-demo");
const modeAiBtn = document.getElementById("mode-ai");
const modeExplainer = document.getElementById("mode-explainer");

const MODE_COPY = {
  demo: "Demo Mode fills a template locally — no API calls, works offline.",
  ai: "AI Mode sends your details to our backend, which asks Gemini to write the letter (takes a few seconds).",
};

function setMode(mode) {
  currentMode = mode;

  modeDemoBtn.classList.toggle("mode-btn--active", mode === "demo");
  modeAiBtn.classList.toggle("mode-btn--active", mode === "ai");
  modeExplainer.textContent = MODE_COPY[mode];
}

modeDemoBtn.addEventListener("click", () => setMode("demo"));
modeAiBtn.addEventListener("click", () => setMode("ai"));

/**
 * Sends the form fields (+ any extracted resume text) to our backend and renders the result. Shows a loading state for the 2-5s LLM latency, and a clear error state if the backend/LLM call fails.
 * @param {{name:string, role:string, company:string, skills:string}} fields
 */
async function handleGenerateWithAI(fields) {
  outputEmpty.hidden = true;
  outputResult.hidden = true;
  renderLoading(outputStatus, "Generating with AI...");

  try {
    const payload = { ...fields, resumeText: extractedResumeText };
    const letter = await generateLetterWithAI(payload);
    lastGeneratedLetter = letter;
    clearStatus(outputStatus);
    renderLetter(outputEmpty, outputResult, letterTextEl, letter);
  } catch (error) {
    clearStatus(outputStatus);
    renderError(outputStatus, error.message || "Generation failed. Try again.");
  }
}

const resumeInput = document.getElementById("resume-upload");
const resumeStatusEl = document.getElementById("resume-status");

// pdf.js needs to know where to find its worker script (loaded via CDN in index.html)
if (window["pdfjsLib"]) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

resumeInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  extractedResumeText = "";
  renderResumeStatus(resumeStatusEl, "Reading resume...", null);

  try {
    const text = await extractTextFromPdf(file);
    extractedResumeText = truncateResumeText(text);
    renderResumeStatus(
      resumeStatusEl,
      `Resume loaded (${text.length.toLocaleString()} characters extracted).`,
      "ready"
    );
  } catch (error) {
    renderResumeStatus(resumeStatusEl, "Couldn't read that PDF. Try a different file.", "error");
  }
});