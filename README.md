# Letterhead — AI Cover Letter Generator

A cover letter generator with two modes: a fully offline **Demo Mode**
(template interpolation, no network calls) and an **AI Mode** that calls
a real LLM through a small backend — never directly from the browser.

**Live demo:** https://cover-letter-generator-ankan.netlify.app

**Backend health check:** https://cover-letter-generator-pb95.onrender.com/health

## Why there's a backend at all

A common mistake in this kind of project is putting the LLM API key in a
frontend `.env` file. That does **not** keep it
secret: frontend `.env` variables get bundled straight into the JavaScript
the browser downloads, so anyone can open DevTools → Sources and read it
out in plain text.

The only real fix is to never send the key to the browser. This project
uses a tiny Express server that holds the key and makes the AI provider
call on the client's behalf — the browser only ever talks to our own
backend, never to the AI provider directly.

```
Browser  →  our backend (/api/generate-letter)  →  OpenRouter API
         (no key here)      (key lives here, as an env var)
```

## Why OpenRouter instead of Gemini

The sprint originally recommended Google's Gemini API. During development,
Gemini's free tier consistently returned `429 RESOURCE_EXHAUSTED` with
`limit: 0` on brand-new API keys and brand-new Google Cloud projects — a
widely-reported issue as of mid-2026, where Google now requires a linked
Cloud Billing account to unlock non-zero free quota, even for usage that
stays within the free allowance. Rather than add a billing method for a
learning project, the backend was switched to **OpenRouter**
(https://openrouter.ai), which offers genuinely free models
(`openrouter/free`, which auto-routes to whichever free model is
currently live) with no billing setup required. The architecture —
backend-held key, prompt engineering, error handling — is unchanged;
only the provider and endpoint differ. This decision and the debugging
process behind it are documented in `Prompts.md`.

## Folder Structure

```
cover-letter-generator/
├── client/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── utils.js         # template simulation, clipboard, formatting
│       ├── api.js           # calls OUR backend only, never the AI provider directly
│       ├── dom.js           # all rendering
│       ├── pdf-parser.js    # resume PDF → plain text (Phase 3)
│       └── app.js           # event wiring / orchestration
├── server/
│   ├── server.js            # Express app, holds the OpenRouter key
│   ├── promptBuilder.js     # isolated prompt-engineering logic
│   ├── package.json
│   └── .env.example         # template — copy to .env, never commit .env
├── .gitignore                # excludes .env from day one
├── Prompts.md
└── README.md
```

## Running it locally

**1. Start the backend**

```bash
cd server
npm install
cp .env.example .env
# open .env and paste your real OpenRouter key into OPENROUTER_API_KEY
npm start
```

You should see `Cover letter backend listening on http://localhost:3000`.

**2. Open the client**

Just open `client/index.html` in a browser, or serve it:

```bash
cd client
npx serve .
```

Note: `client/js/api.js` currently points at the deployed Render backend
URL. For fully local testing, change `BACKEND_BASE` back to
`http://localhost:3000` temporarily.

## Deployment

- **Frontend** — deployed on Netlify, pointed at the `client/` subfolder,
  no build step (plain HTML/CSS/JS).
- **Backend** — deployed on Render as a Node web service, pointed at the
  `server/` subfolder. The `OPENROUTER_API_KEY` is set as an environment
  variable directly in Render's dashboard — never committed to git.
  Render assigns its own `PORT` automatically; the app reads it via
  `process.env.PORT`.

## Modes

- **Demo Mode** (default): fills a hardcoded template with your form
  inputs. No network call, works with the backend off.
- **AI Mode**: sends your fields (+ optional extracted resume text) to
  `POST /api/generate-letter` on the backend, which prompts an LLM via
  OpenRouter and returns the generated letter.

## Resume upload (Phase 3)

Uploading a PDF resume is optional. The file is parsed **entirely in the
browser** using pdf.js — the PDF itself is never uploaded anywhere. Only
the extracted text is sent along with the AI Mode request, to give the
model more context for a personalized letter.

## Screenshots

### 1. Demo Mode
<img width="1237" height="912" alt="image" src="https://github.com/user-attachments/assets/39949c1c-c437-4994-bd87-f76445f76c87" />


### 2. AI Mode (live, via OpenRouter)
<img width="1227" height="913" alt="image" src="https://github.com/user-attachments/assets/00d68897-cc3c-4764-b3ca-a33d236192bb" />
