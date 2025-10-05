export default function registerMessage(bot) {
  bot.on("message", (msg) => {
    const text = msg.text;
    if (text && !text.startsWith("/")) {
      bot.sendMessage(msg.chat.id, `${text}`);
    }
  });
}
