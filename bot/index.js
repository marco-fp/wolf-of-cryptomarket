const TelegramBot = require('node-telegram-bot-api');
const api = require('./api');

class WolfBot {
  constructor(token){
    if (!token) {
      throw 'No token provided';
    }
    this.bot = new TelegramBot(token, {polling: true});
    this.watchLoop = null;
    this.defaultSource = 'coinbase';
  }

  start() {
    const bot = this.bot;
    bot.onText(/\/start/, (message) => {
      const answer = "Gotta pump those numbers up! Those are rookie numbers!";
      bot.sendMessage(message.chat.id, answer);
    });

    bot.onText(/\/price/, (message) => {
      this.getExchangeRates(message);
    });

    bot.onText(/\/watch start/, (message) => {
      bot.sendMessage(message.chat.id, "Starting watch loop, interval: 5 minutes.");
      this.watchLoop = setInterval(() => {
        this.getExchangeRates(message);
      }, 300000);
    });

    bot.onText(/\/watch stop/, (message) => {
      bot.sendMessage(message.chat.id, "Stopping watch loop.");
      this.watchLoop = null;
    });
  }

  getExchangeRates(message) {
    api.get('exchange-rates', this.defaultSource)
      .then((response) => {
        const euro = response.data['data']['rates']['EUR'];
        const usd = response.data['data']['rates']['USD'];
        const answer = "1 ETH = " + euro + "EUR | " + usd + "USD";
        this.bot.sendMessage(message.chat.id, answer);
      })
      .catch((error) => {
        console.log('Error: ', error);
      })
  }

}

module.exports = WolfBot;
