export default function registerButtons(bot) {
  bot.onText(/^\/buttons$/, (msg) => {
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "👍 Yes", callback_data: "yes" }],
          [{ text: "👎 No", callback_data: "no" }],
        ],
      },
    };
    bot.sendMessage(msg.chat.id, "Do you like this bot?", opts);
  });

  bot.on("callback_query", (query) => {
    const data = query.data;
    const response =
      data === "yes" ? "🔥 Awesome!" : "😢 I’ll try to improve!";
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(query.message.chat.id, response);
  });
}
