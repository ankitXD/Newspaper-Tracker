import {
  getTodayDate_DDMMYYYY,
  getCurrentDate_Readable,
  getCurrentTime_HHMMSS,
  DEFAULT_TZ,
} from "../utils/dates.js";

export default function registerDateTime(bot) {
  bot.onText(/^\/date$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      `📅 Date (${DEFAULT_TZ}): ${getCurrentDate_Readable()} (${getTodayDate_DDMMYYYY()})`
    );
  });

  bot.onText(/^\/time$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      `⏰ Time (${DEFAULT_TZ}): ${getCurrentTime_HHMMSS()}`
    );
  });

  bot.onText(/^\/getDate$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      `📅 ${getCurrentDate_Readable()} (${getTodayDate_DDMMYYYY()})`
    );
  });

  bot.onText(/^\/getTime$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `⏰ ${getCurrentTime_HHMMSS()}`);
  });
}
