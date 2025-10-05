export default function registerDocument(bot) {
  bot.on("document", (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `Got your document: ${msg.document.file_name}`
    );
  });
}
