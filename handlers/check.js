import checkNavbharatTimes from "../scrapers/navbharat.js";
import checkBusinessStandard from "../scrapers/businessStandard.js";
import checkTimesofIndia from "../scrapers/timesOfIndia.js";

export default function registerCheck(bot) {
  bot.onText(/^\/check$/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "⏳ Checking newspapers...");
    try {
      const [nb, bs, toi] = await Promise.all([
        checkNavbharatTimes(),
        checkBusinessStandard(),
        checkTimesofIndia(),
      ]);
      await bot.sendMessage(chatId, `${nb}\n\n${bs}\n\n${toi}`, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } catch (err) {
      await bot.sendMessage(chatId, `⚠️ Error: ${err.message}`);
    }
  });
}
