import {
  getTodayDate_DDMMYYYY,
  getCurrentDate_Readable,
  getCurrentTime_HHMMSS,
  DEFAULT_TZ,
} from "../utils/dates.js";

export default function registerDateTime(bot) {
  bot.onText(/^\/date$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `📅 Date: ${getTodayDate_DDMMYYYY()}`);
  });

  bot.onText(/^\/time$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `⏰ Time: ${getCurrentTime_HHMMSS()}`);
  });
}
