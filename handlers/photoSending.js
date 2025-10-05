export default function registerPhoto(bot) {
  bot.on("photo", (msg) => {
    bot.sendMessage(msg.chat.id, "📸 Nice photo!");
  });
}
