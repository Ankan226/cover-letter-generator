function renderLoading(statusEl, message = "Drafting your letter...") {
  statusEl.hidden = false;
  statusEl.className = "status status--loading";
  statusEl.textContent = message;
}

function renderError(statusEl, message) {
  statusEl.hidden = false;
  statusEl.className = "status status--error";
  statusEl.textContent = message;
}

function clearStatus(statusEl) {
  statusEl.hidden = true;
  statusEl.textContent = "";
  statusEl.className = "status";
}

/**
 * Renders the generated letter as clean <p> tags per the Phase 3 requirement, and shows the output panel.
 * @param {HTMLElement} emptyEl
 * @param {HTMLElement} resultEl
 * @param {HTMLElement} letterTextEl
 * @param {string} letterText
 */
function renderLetter(emptyEl, resultEl, letterTextEl, letterText) {
  emptyEl.hidden = true;
  resultEl.hidden = false;

  const paragraphs = splitIntoParagraphs(letterText);
  letterTextEl.innerHTML = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

/** Briefly shows a "Copied!" confirmation next to the copy button. */
function flashCopyConfirm(confirmEl) {
  confirmEl.hidden = false;
  clearTimeout(flashCopyConfirm._t);
  flashCopyConfirm._t = setTimeout(() => {
    confirmEl.hidden = true;
  }, 1800);
}

/** Updates the resume-upload status line below the file input. */
function renderResumeStatus(statusEl, message, variant) {
  statusEl.textContent = message;
  statusEl.className = `resume-status ${variant ? `resume-status--${variant}` : ""}`.trim();
}

/** Escapes a string for safe insertion into innerHTML. */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}