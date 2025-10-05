import TelegramBot from "node-telegram-bot-api";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import registerHandlers from "./handlers/index.js";

const PROD_TOKEN = process.env.TELEGRAM_TOKEN;
const LOCAL_TOKEN = process.env.LOCAL_TELEGRAM_TOKEN;
const APP_URL = process.env.APP_URL;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const IS_PROD_WEBHOOK =
  process.env.NODE_ENV === "production" && APP_URL && WEBHOOK_SECRET;

const TELEGRAM_TOKEN = IS_PROD_WEBHOOK ? PROD_TOKEN : LOCAL_TOKEN || PROD_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error("Missing TELEGRAM_TOKEN (or LOCAL_TELEGRAM_TOKEN)");
  process.exit(1);
}

const app = express();
app.use(express.json());

let bot;
if (IS_PROD_WEBHOOK) {
  bot = new TelegramBot(TELEGRAM_TOKEN, { webHook: true });
  bot.setWebHook(`${APP_URL}/${WEBHOOK_SECRET}`);
  app.post(`/${WEBHOOK_SECRET}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  console.log("Running in production webhook mode");
} else {
  bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
  console.log("Running in polling mode (local)");
}

registerHandlers(bot); // wire all command handlers

app.get("/", (_req, res) => res.send("✅ Newspaper Bot running"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on", PORT));
