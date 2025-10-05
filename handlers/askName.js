export default function registerAskName(bot) {
  bot.onText(/^\/name$/, (msg) => {
    bot
      .sendMessage(msg.chat.id, "What’s your name? (Reply to this message)")
      .then((sentMsg) => {
        bot.onReplyToMessage(msg.chat.id, sentMsg.message_id, (reply) => {
          bot.sendMessage(msg.chat.id, `Nice to meet you, ${reply.text}! 😎`);
        });
      });
  });
}
