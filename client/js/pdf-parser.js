/**
 * pdf-parser.js

 * @param {File} file
 * @returns {Promise<string>}
 */
async function extractTextFromPdf(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF parsing library failed to load.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += `${pageText}\n\n`;
  }

  return fullText.trim();
}