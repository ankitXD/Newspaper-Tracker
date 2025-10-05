import axios from "axios";
import * as cheerio from "cheerio";
import { getTodayDate_DDMMYYYY } from "../utils/dates.js";
import { esc } from "../utils/misc.js";

export default async function checkTimesofIndia() {
  const url = "https://epaperwave.com/the-times-of-india-epaper-pdf-download/";
  const today = getTodayDate_DDMMYYYY();
  let result = `📰 <b>Times of India</b>\nChecking for: ${esc(today)}\n`;

  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);

    let lastLink = null;
    let lastDriveLink = null;

    // Scan blocks that mention today's date and capture download links,
    // prefer the last Google Drive link found.
    $("p, li, div, a").each((_, el) => {
      const text = $(el).text().trim();
      if (!text.includes(today)) return;

      // collect anchors inside this element (or the element itself if it's an <a>)
      const anchors = $(el).is("a") ? [el] : $(el).find("a").toArray();
      anchors.forEach((a) => {
        const link = $(a).attr("href");
        if (!link) return;
        // prefer links that look like downloads or are google drive
        const aText = $(a).text().toLowerCase();
        if (
          aText.includes("download") ||
          link.includes("drive.google.com") ||
          link.includes("download")
        ) {
          lastLink = link;
          if (link.includes("drive.google.com")) lastDriveLink = link;
        } else if (!lastLink) {
          // keep a fallback link if none matched above
          lastLink = link;
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
