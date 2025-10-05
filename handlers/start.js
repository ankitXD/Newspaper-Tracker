import { esc } from "../utils/misc.js";

export default function registerStart(bot) {
  bot.onText(/^\/start$/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `👋 Welcome!\n\n/check - Get today's papers\n\n/date - Readable date\n\n/time - Current time\n\n/health - Bot status\n\n/stats - Total Users\n\n/buttons - To Rate The Bot\n\nSend an Image\n\nSend a Document\n\nSend a Sticker`
    );
  });
}
