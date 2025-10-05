import axios from "axios";
import * as cheerio from "cheerio";
import { getTodayDate_DDMMYYYY } from "../utils/dates.js";
import { esc } from "../utils/misc.js";

export default async function checkNavbharatTimes() {
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
              if (link.includes("drive.google.com")) lastDriveLink = link;
            }
          }
        });
    });

    const chosen = lastDriveLink || lastLink;
    result += chosen
      ? `✅ Found Epaper:\n👉 ${esc(chosen)}`
      : `❌ No link found for ${esc(today)}`;
  } catch (err) {
    result += `⚠️ Error: ${esc(err.message)}`;
  }
  return result;
}
