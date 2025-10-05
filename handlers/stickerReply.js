export default function registerSticker(bot) {
  bot.on("sticker", (msg) => {
    const jokes = ["Mat Bhej Yar 🙏"];

    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

    bot.sendMessage(msg.chat.id, randomJoke);
  });
}
