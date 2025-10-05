export default function registerErrorHandler(bot) {
  bot.on("polling_error", (err) => {
    console.error("Polling error:", err);
  });
}