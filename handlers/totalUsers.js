import fs from "fs";

export default function registerUserTracker(bot) {
  const file = "./users/users.json";
  let users = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];

  bot.on("message", (msg) => {
    const id = msg.from.id;
    if (!users.includes(id)) {
      users.push(id);
      fs.writeFileSync(file, JSON.stringify(users));
    }
  });

  bot.onText(/^\/stats$/, (msg) => {
    bot.sendMessage(msg.chat.id, `👥 Total users: ${users.length}`);
  });
}
