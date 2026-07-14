# Math Quest

Small, touch-friendly daily math game for kids (designed for iPhone/iPad).

## Features

- Wordle-like row-by-row mission flow with large, touch-first keypad.
- Daily puzzle generated from the current date and student, so it is stable when reopening the same day.
- Score tracking in browser storage (no backend required).
- Streaks, high score, and level progression.
- Parent tools:
  - Export today’s JSON summary.
  - Download all stored data for local backup.
  - Copy raw localStorage object for automation pipelines.
- Story voice helper:
  - Tap a generated story word to hear that word.
  - Tap “Read whole story” to hear the full sentence.
- Built to run on GitHub Pages (static hosting).

## Folder

Open the project from `Codex_Version`.

## Run locally

You can serve this with any static server:

- `python -m http.server`
- open `http://localhost:8000/index.html`

On iPhone/iPad, open the same local or published URL and add to Home Screen if desired.

## GitHub Pages

1. Create a new GitHub repository (or use an existing one).
2. Push the `Codex_Version` folder contents to the repository root.
3. In GitHub Pages settings, set source to `main / root` (or `/docs` if you keep it there).
4. The app is static and requires no server-side code.

## Automation handoff format

Each day’s summary is stored under:

- `localStorage["math-quest-v2"]` on the browser.
- in `student.days[YYYY-MM-DD]` inside that JSON.

Example day payload shape:

```json
{
  "date": "2026-07-14",
  "scorePercent": 86,
  "totalQuestions": 8,
  "correct": 7,
  "accuracy": 0.875,
  "levelStart": 2,
  "levelEnd": 3,
  "opAccuracy": {
    "+": { "correct": 5, "total": 6, "accuracy": 83 }
  },
  "lessonPlan": {
    "focus": "+",
    "message": "Focus more on addition in tomorrow’s review."
  }
}
```

For Claude-based lesson generation, use **Copy today (JSON)** in the result screen and pass it to your automation.

## Reading support

- If your browser supports the Web Speech API (`speechSynthesis`), the game includes a story card on each question.
- Tap a word to hear it.
- Tap **Read whole story** to hear the entire line.

## Files

- `index.html` – app shell and views.
- `styles.css` – touchscreen-first visual style.
- `app.js` – game engine, progression, storage, and export helpers.
