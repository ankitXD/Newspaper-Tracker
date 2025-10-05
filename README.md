# Newspaper-Tracker

Lightweight Telegram bot that scrapes daily newspaper e‑paper links and returns the best (prefer Google Drive) link. Supports polling for local testing and webhook mode for production.

## Features

- /check — scrape configured sources and return today's epaper links
- /getDate, /date — return current date (DD-MM-YYYY and readable) in configured timezone
- /getTime, /time — return current time in configured timezone
- /health, /start — basic bot info and health check
- Modular handlers (handlers/) and scrapers (scrapers/) for easy extensibility

## Prerequisites

- Node.js 18+ and npm
- Telegram bot token(s) (create via @BotFather)

## Install

Open a terminal in the project folder (Windows):

```
git clone https://github.com/ankitXD/Newspaper-Tracker
cd Newspaper-Tracker
npm install
node --watch bot.js
```

## Environment (.env)

Create a `.env` file in the project root. Example:

```
TELEGRAM_TOKEN=xxxxxxxx:prod_token_here
LOCAL_TELEGRAM_TOKEN=yyyyyyyy:local_test_token_here
APP_URL=https://your-app.onrender.com   # only for webhook/prod
WEBHOOK_SECRET=some-secret-path         # only for webhook/prod
PORT=3000
TIMEZONE=Asia/Kolkata
TIMEZONE_LABEL=Delhi (IST)
NODE_ENV=development
```

Notes:

- For local testing, set `LOCAL_TELEGRAM_TOKEN` and leave `NODE_ENV` unset or not equal to `production`. The app will use polling.
- For production webhook mode set `NODE_ENV=production`, `APP_URL`, `WEBHOOK_SECRET` and `TELEGRAM_TOKEN`. The app will call `setWebHook` and expect incoming webhook posts at `/<WEBHOOK_SECRET>`.

## Run

Local (polling mode):

```
node bot.js
```

Production (webhook mode):

- Ensure the server is reachable at `APP_URL` and `PORT` is bound (Render requires binding to `process.env.PORT`).
- Start normally (Render or other host will run `node bot.js`).

If deploying to Render: either

- Create a Web Service and ensure your app binds to the assigned PORT (keep express server in bot.js), or
- Create a Background Worker (no port required) and run in polling mode using `LOCAL_TELEGRAM_TOKEN` / `TELEGRAM_TOKEN` as appropriate.

## Project structure

- bot.js — entrypoint wiring bot + server
- handlers/ — per-command handlers (register functions)
- scrapers/ — per-newspaper scraping logic (return a result string)
- utils/ — shared helpers (dates, escaping, etc.)
- README.md — this file

## Adding a new command

1. Create `handlers/newCommand.js` exporting a register function that accepts `bot`.
2. Import and register it in `handlers/index.js`.
3. If you need scraping, add a new module in `scrapers/` and keep logic testable.

## Timezone

Default timezone used is `TIMEZONE` (fallback `Asia/Kolkata`). To show a custom label (e.g., "Delhi") set `TIMEZONE_LABEL` in `.env`.

## Testing tips

- Use a separate Telegram bot token for local testing (LOCAL_TELEGRAM_TOKEN).
- For quick debugging log outputs, run `node bot.js` and watch console.
- If links are missing or formatting issues occur, enable `disable_web_page_preview: true` or switch parse mode between HTML and Markdown as needed.

## Troubleshooting

- Render shows "No open ports detected" if your process does not bind to `process.env.PORT`. Either add a small HTTP server (already present in bot.js) or deploy as a Background Worker.
- Underscores in links may be interpreted by Markdown; use HTML parse mode or escape underscores.
