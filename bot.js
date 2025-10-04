import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import express from "express";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// ---------------------------
// CONFIG
// ---------------------------
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const APP_URL = process.env.APP_URL; // e.g. https://your-app.herokuapp.com
if (!TELEGRAM_TOKEN || !APP_URL) {
  console.error("Missing TELEGRAM_TOKEN or APP_URL");
  process.exit(1);
}

// Init bot in webhook mode
const bot = new TelegramBot(TELEGRAM_TOKEN, { webHook: true });
bot.setWebHook(`${APP_URL}/bot${TELEGRAM_TOKEN}`);

// Express setup
const app = express();
app.use(express.json());

// Route for Telegram webhook
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("✅ Newspaper Bot is running fine!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot server running on port", PORT);
});

// ---------------------------
// Simple HTML escape
// ---------------------------
function esc(str = "") {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------------------------
// Utils for dates
// ---------------------------
function getTodayDate_DDMMYYYY() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function getTodayDate_DDMonYYYY() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ---------------------------
// Check Business Standard
// ---------------------------
async function checkBusinessStandard() {
  const url = "https://www.careerswave.in/business-standard-newspaper-in-pdf/";
  const today = getTodayDate_DDMMYYYY();
  let result = `📰 <b>Business Standard</b>\nChecking for: ${esc(today)}\n`;

  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);

    const links = [];
    $("tr").each((_, row) => {
      const tds = $(row).find("td");
      if (tds.length >= 2) {
        const dateText = $(tds[0]).text().trim();
        const link = $(tds[1]).text().trim();
        if (dateText === today) links.push(link);
      }
    });

    if (links.length) {
      result += `✅ Found ${links.length} link(s):\n`;
      links.forEach((l, i) => {
        result += `   [${i + 1}] ${esc(l)}\n`;
      });
    } else {
      result += `❌ No links found for ${esc(today)}`;
    }
  } catch (err) {
    result += `⚠️ Error: ${esc(err.message)}`;
  }
  return result;
}

// ---------------------------
// Check Navbharat Times
// ---------------------------
async function checkNavbharatTimes() {
  const url =
    "https://epaperwave.com/navbharat-times-epaper-delhi-pdf-download/";
  const today = getTodayDate_DDMMYYYY();
  let result = `📰 <b>Navbharat Times</b>\nChecking for: ${esc(today)}\n`;

  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);

    let lastLink = null;
    let lastDriveLink = null;

    $("p, li, div").each((_, el) => {
      const text = $(el).text().trim();
      if (!text.includes(today)) return;

      $(el)
        .find("a")
        .each((_, a) => {
          const aText = $(a).text().toLowerCase();
          if (aText.includes("download")) {
            const link = $(a).attr("href");
            if (link) {
              lastLink = link;
              if (link.includes("drive.google.com")) {
                lastDriveLink = link;
              }
            }
          }
        });
    });

    const chosen = lastDriveLink || lastLink;

    if (chosen) {
      result += `✅ Found Epaper:\n👉 ${esc(chosen)}`;
    } else {
      result += `❌ No link found for ${esc(today)}`;
    }
  } catch (err) {
    result += `⚠️ Error: ${esc(err.message)}`;
  }
  return result;
}

// ---------------------------
// Check Times of India
// ---------------------------
async function checkTimesofIndia() {
  const url = "https://epaperwave.com/the-times-of-india-epaper-pdf-download/";
  const today = getTodayDate_DDMMYYYY();
  let result = `📰 <b>Times of India</b>\nChecking for: ${esc(today)}\n`;

  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);

    let lastLink = null;
    let lastDriveLink = null;

    $("p, li, div").each((_, el) => {
      const text = $(el).text().trim();
      if (!text.includes(today)) return;

      $(el)
        .find("a")
        .each((_, a) => {
          const aText = $(a).text().toLowerCase();
          if (aText.includes("download")) {
            const link = $(a).attr("href");
            if (link) {
              lastLink = link;
              if (link.includes("drive.google.com")) {
                lastDriveLink = link;
              }
            }
          }
        });
    });

    const chosen = lastDriveLink || lastLink;

    if (chosen) {
      result += `✅ Found Epaper:\n👉 ${esc(chosen)}`;
    } else {
      result += `❌ No link found for ${esc(today)}`;
    }
  } catch (err) {
    result += `⚠️ Error: ${esc(err.message)}`;
  }
  return result;
}

// ---------------------------
// Telegram Commands
// ---------------------------
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Hi! I’m your Vibe Coded Newspaper Tracker Bot.\n\nClick /check to see today’s papers.\n\nClick /health to see bot status."
  );
});

bot.onText(/\/health/, (msg) => {
  bot.sendMessage(msg.chat.id, "The service is running smoothly. ✅");
});

bot.onText(/\/check/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "⏳Ruk Check Karne De");

  const [nb, bs, toi] = await Promise.all([
    checkNavbharatTimes(),
    checkBusinessStandard(),
    checkTimesofIndia(),
  ]);

  bot.sendMessage(chatId, `${nb}\n\n${bs}\n\n${toi}`, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
});
