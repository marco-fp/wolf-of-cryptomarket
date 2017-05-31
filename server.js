const WolfBot = require('./bot');

const botToken = process.env.BOT_TOKEN;
if (botToken) {
  const bot = new WolfBot(botToken);
  bot.start();
} else {
  console.log('Error: Bot token not defined.');
}
