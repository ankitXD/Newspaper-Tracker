import axios from "axios";
import * as cheerio from "cheerio";

// ---------------------------
// Utils for date formatting
// ---------------------------
function getTodayDate_DDMMYYYY() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`; // e.g. 03-10-2025
}

function getTodayDate_DDMonYYYY() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`; // e.g. 03 Oct 2025
}

// ---------------------------
// Check Business Standard (CareersWave)
// ---------------------------
async function checkBusinessStandard() {
  const url = "https://www.careerswave.in/business-standard-newspaper-in-pdf/";
  const today = getTodayDate_DDMMYYYY();
  console.log("\n===============================");
  console.log("📰 Business Standard (CareersWave)");
  console.log("===============================");
  console.log("Checking for:", today);

  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);

    let links = [];
    $("tr").each((_, row) => {
      const tds = $(row).find("td");
      if (tds.length >= 2) {
        const dateText = $(tds[0]).text().trim();
        const link = $(tds[1]).text().trim();
        if (dateText === today) {
          links.push(link);
        }
      }
    });

    if (links.length > 0) {
      console.log(`✅ Found ${links.length} link(s) for ${today}:`);
      links.forEach((l, i) => console.log(`   [${i+1}] ${l}`));
    } else {
      console.log(`❌ No links found for ${today}`);
    }
  } catch (err) {
    console.error("⚠️ Error fetching Business Standard:", err.message);
  }
}

// ---------------------------
// Check Navbharat Times (DailyEpaper)
// ---------------------------
async function checkNavbharatTimes() {
  const url = "https://dailyepaper.in/navbharat-times-epaper-2025/";
  const today = getTodayDate_DDMonYYYY();
  console.log("\n===============================");
  console.log("📰 Navbharat Times (DailyEpaper)");
  console.log("===============================");
  console.log("Checking for:", today);

  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    const $ = cheerio.load(data);

    let found = false;
    $("p, li, div").each((_, el) => {
      const text = $(el).text().trim();
      if (text.startsWith(today)) {
        const link = $(el).find("a:contains('Download')").attr("href");
        if (link) {
          console.log(`✅ Found epaper for ${today}`);
          console.log("👉 Link:", link);
          found = true;
        }
      }
    });

    if (!found) {
      console.log(`❌ No link found for ${today}`);
    }
  } catch (err) {
    console.error("⚠️ Error fetching Navbharat Times:", err.message);
  }
}

// ---------------------------
// Run both checks
// ---------------------------
async function main() {
  await checkBusinessStandard();
  await checkNavbharatTimes();
}

main();
