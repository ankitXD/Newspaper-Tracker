import { esc } from "../utils/misc.js";

export default function registerStart(bot) {
  bot.onText(/^\/start$/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `👋 Welcome!\n\n/check - get today's papers\n/date - readable date\n/time - current time\n/health - bot status`
    );
  });
}
