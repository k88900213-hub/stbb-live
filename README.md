# Neural Sync Infinity · Live Textbook

An AI-powered **live textbook** where every page explains itself, answers questions, translates,
speaks, builds quizzes, flashcards and notes — and adapts to how you learn.

Built with **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4**, deployable to **Railway**
or any Node.js host. Works fully offline with a built-in demo AI engine, and upgrades to real AI
(OpenAI, Gemini, or any OpenAI-compatible provider) when a key is configured.

## Features

- **AI Live Reading Engine** — explain any paragraph as Beginner / Intermediate / Expert / Child /
  Exam, with a free-form audience (e.g. "Grade 6", "Engineering").
- **Ask Anything** — select any text and ask: *what does this mean*, *in Urdu*, *give an example*,
  *explain like I'm 10*, *mathematically*.
- **Paragraph actions** — hover any paragraph for Explain, Ask AI, Translate (8 languages), Listen
  (text-to-speech), Read aloud, and Save note.
- **Personal AI Tutor** — remembers session progress, answers with chapter context, quick prompts,
  reply-language selector.
- **Note Generator** — Smart Notes, Key Points, Cheat Sheet, Flashcards — one click per section.
- **Quiz Engine** — easy/medium/hard MCQs with instant feedback, explanations, and score tracking.
- **Simulations** — a **Force Simulator** (Newton's First Law demo) and an interactive **Circuit
  Builder** (series vs parallel, Ohm's Law, animated electrons).
- **Progress analytics** — reading time, focus level, quiz averages, concept mastery, weak topics,
  achievements.
- Glassmorphism UI, orange/white/cream theme, dark & light modes, responsive layout.

## Tech stack

| Layer    | Choice |
| -------- | ------ |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Math | KaTeX |
| Icons | lucide-react |
| AI | Server-side proxy — OpenAI / Gemini (OpenAI-compatible), offline demo fallback |
| Persistence | Browser `localStorage` (no database needed for this version) |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

The app runs with the **offline demo engine** by default. To enable real AI, create `.env.local`:

```bash
cp .env.example .env.local
```

Then set one of:

- `OPENCODE_API_KEY` — OpenCode Zen (free models included, e.g. `deepseek-v4-flash-free`, `big-pickle`); default provider
- `GEMINI_API_KEY` — Google Gemini (via the OpenAI-compatible endpoint)
- `OPENAI_API_KEY` (optionally `OPENAI_BASE_URL` + `AI_MODEL`) — OpenAI or any compatible provider
- `AI_MODEL` — override the model name

## Commands

```bash
npm run dev      # development server
npm run build    # production build + type check
npm run start    # serve production build
npm run lint     # ESLint (flat config)
```

## Project structure

```
src/
  app/
    page.tsx                 # home / library
    read/[slug]/page.tsx     # live reader pages (SSG)
    api/ai/*/route.ts        # explain · ask · translate · quiz · notes · tutor
  components/
    reader/                  # reader shell, nav, block renderer, explain card
    tutor/                   # AI tutor chat
    tools/                   # notes, quiz, flashcards panels
    sim/                     # ForceSim, CircuitBuilder
    progress/                # analytics dashboard
  lib/
    ai/                      # provider + prompts + offline demo engine
    content/                 # textbook data model + chapters
    reader/                  # markdown-lite + KaTeX renderers
    client/ai.ts             # typed fetch helpers
  store/progress.tsx         # localStorage progress store
```

## Deploy to Railway

1. Push this repository to GitHub/GitLab.
2. In Railway, **New Project → Deploy from GitHub repo**.
3. Railway auto-detects Next.js:
   - Build: `npm run build`
   - Start: `npm run start`
   - Node version: 20.9+ (Railway's default is fine).
4. Set environment variables in the service's **Variables** tab (from `.env.example`):
   - `OPENCODE_API_KEY` (recommended — free AI models) or `OPENAI_API_KEY` / `GEMINI_API_KEY` (optional — offline demo works without any)
   - `AI_MODEL` (optional)
5. Deploy. The app serves at your `*.up.railway.app` URL.

No database or extra services are required; all learner progress is stored per-browser.

## Notes

- Formulas use KaTeX: `$...$` inline, `[[...]]` in block formulas are rendered in content blocks.
- Text-to-speech uses the browser's Web Speech API and works offline.
- Progress, notes and theme are stored locally per browser (keys prefixed `ns-`).
