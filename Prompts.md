## Architecture decision: why a backend exists at all
- Discussed the sprint's warning that a committed API key is an automatic
  fail, and confirmed that putting the key in a frontend `.env` does not actually protect it — frontend env vars get
  bundled into the shipped JS and are readable in DevTools. Built a small
  Express backend so the key never reaches the browser at all.

## Prompt engineering
- Structured the LLM prompt with explicit fields (name, role, company,
  skills, optional resume excerpt) and an explicit instruction to return
  plain text with paragraph breaks and no markdown, so the response is
  easy to split into `<p>` tags on the client without extra cleanup.

## PDF parsing
- Used pdf.js for browser-side PDF text extraction, so the
  resume file itself never leaves the browser — only the extracted text
  is sent to the backend.

## Debugging the Gemini free-tier quota issue (real, documented problem)
- Initial implementation used Google's Gemini API, as recommended by the
  sprint FAQ. Testing consistently returned `429 RESOURCE_EXHAUSTED` with
  `limit: 0`, even on a freshly created API key and a freshly created
  Google Cloud project.
- Researched the error and found this is a widely-reported, current issue:
  Google's Gemini free tier now requires a linked Cloud Billing account
  to unlock non-zero quota, even for usage that would stay within free
  limits — the old "Free Tier" bucket is effectively deprecated at `0`
  for most models.
- Decided against linking billing for a learning project and switched the
  backend to OpenRouter instead, using the `openrouter/free` model string,
  which auto-routes to whichever specific free model is currently live —
  chosen specifically so the app doesn't break again the next time an
  individual free model gets retired or moved to paid.
- This required rewriting `server.js`'s request/response shape (OpenRouter
  uses an OpenAI-compatible `messages` array and `choices[0].message.content`
  response shape, different from Gemini's `contents`/`candidates` shape)
  and updating `.env.example` and the mode-explainer copy in `app.js`
  accordingly.

## Deployment
- Discussed why Netlify alone can't host the whole project: it serves
  static files, but the backend is a persistently-running Express server,
  which Netlify doesn't support directly. Split the deployment: Netlify
  for `client/`, Render for `server/`.
- Learned that Render assigns its own `PORT` and expects the app to read
  it via `process.env.PORT` rather than a hardcoded value — an early
  deploy attempt failed because a manual `PORT=3000` environment variable was overriding Render's own
  assignment. Removed that variable and let the existing  `process.env.PORT || 3000` fallback in `server.js` do its job correctly.

## Error handling
- Distinguished "backend unreachable" (network error, e.g. server not
  running locally) from "backend reachable but returned an error" (e.g.
  missing key, provider quota/API error) so the UI can show a more
  specific message in each case.

## What I wrote/verified myself
- Tested Demo Mode end-to-end with my own form inputs.
- Generated my own OpenRouter API key, set up `.env` locally, and
  verified AI Mode against the real API before considering Phase 2 done.
- Uploaded my own resume PDF to confirm text extraction and the character
  count shown in the UI, and confirmed the AI output actually referenced
  specific resume content (not generic filler).
- Ran `git status` before every commit to confirm `.env` never appeared
  in the staged files, and ran
  `git log --all --full-history -- "*.env"` as a final check before
  pushing — confirmed empty.
- Deployed both services myself (Netlify for client, Render for server),
  debugged the Render `PORT` misconfiguration by reading the platform's
  own logs, and re-tested the full flow against the live URLs before
  considering the submission complete.
