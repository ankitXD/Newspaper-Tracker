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

    // Site format: "27-11-2025: [Delhi](link) | [Other Editions](link)"
    // or "27-11-2025: [Click Here to Download](link)"
    $("p, li, div").each((_, el) => {
      const text = $(el).text().trim();
      // Check if this element contains today's date
      if (!text.includes(today)) return;

      $(el)
        .find("a")
        .each((_, a) => {
          const link = $(a).attr("href");
          const aText = $(a).text().toLowerCase();
          if (!link) return;

          // Accept links that are:
          // - Google Drive links
          // - Links with text "delhi", "download", or "click here"
          // - Skip telegram links (Other Editions)
          if (link.includes("t.me")) return;

          if (
            link.includes("drive.google.com") ||
            aText.includes("download") ||
            aText.includes("delhi") ||
            aText.includes("click here")
          ) {
            lastLink = link;
            if (link.includes("drive.google.com")) lastDriveLink = link;
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
