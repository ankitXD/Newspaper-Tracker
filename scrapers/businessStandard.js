import axios from "axios";
import * as cheerio from "cheerio";
import { getTodayDate_DDMMYYYY } from "../utils/dates.js";
import { esc } from "../utils/misc.js";

export default async function checkBusinessStandard() {
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
