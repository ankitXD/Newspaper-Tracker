export default function registerHealth(bot) {
  bot.onText(/^\/health$/, (msg) => {
    bot.sendMessage(msg.chat.id, "✅ The service is running smoothly.");
  });
}
