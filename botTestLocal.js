import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
dotenv.config();

// ---------------------------
// CONFIG
// ---------------------------
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
if (!TELEGRAM_TOKEN) {
  console.error("Missing TELEGRAM_TOKEN");
  process.exit(1);
}
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Simple HTML escape
function esc(str = "") {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------------------------
// Utils for dates (use IST by default)
// ---------------------------
const DEFAULT_TZ = process.env.TIMEZONE || "Asia/Kolkata";

function _datePartsInTZ(timeZone = DEFAULT_TZ) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const parts = fmt.formatToParts(now);
  const day = parts.find((p) => p.type === "day").value;
  const month = parts.find((p) => p.type === "month").value;
  const year = parts.find((p) => p.type === "year").value;
  return { day, month, year, monthIndex: Number(month) - 1 };
}

function getTodayDate_DDMMYYYY() {
  const { day, month, year } = _datePartsInTZ();
  return `${day}-${month}-${year}`;
}

// human-readable date + time helpers (uses DEFAULT_TZ)
function getCurrentTime_HHMMSS() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: DEFAULT_TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return fmt.format(now);
}

function getCurrentDate_Readable() {
  const { day, monthIndex, year } = _datePartsInTZ();
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
  return `${day} ${months[monthIndex]} ${year}`;
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

    // Scan all candidate nodes once
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
                lastDriveLink = link; // keep updating so we end with the last drive link
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
    `👋 Welcome to Bot!

/check to see today's papers.

/date Today's Date.

/time Current Time 
 
/health to see bot status.

`
  );
});

bot.onText(/\/health/, (msg) => {
  bot.sendMessage(msg.chat.id, "✅ The service is running smoothly.");
});

bot.onText(/\/check/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "⏳Ruk Check Karne De");

  const [bs, nb, toi] = await Promise.all([
    checkNavbharatTimes(),
    checkBusinessStandard(),
    checkTimesofIndia(),
  ]);

  bot.sendMessage(chatId, `${bs}\n\n${nb}\n\n${toi}`, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
});

bot.onText(/\/dusmnpalty/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Unse bade madarchod meine aaj tak nahi dekhe. 🤣"
  );
});

bot.onText(/\/protienPrice/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "⏳ Kya Re Bhikmangya Aagaya Check Karne");
});

// ---------------------------
// Time / Date commands
// ---------------------------
bot.onText(/\/date/, (msg) => {
  const chatId = msg.chat.id;
  const dateReadable = getCurrentDate_Readable();
  bot.sendMessage(chatId, `📅 Date: ${dateReadable}`);
});

bot.onText(/\/time/, (msg) => {
  const chatId = msg.chat.id;
  const time = getCurrentTime_HHMMSS();
  bot.sendMessage(chatId, `⏰ Time: ${time}`);
});
