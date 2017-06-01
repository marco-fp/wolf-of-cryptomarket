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
    this.store = {};
  }

  start() {
    const bot = this.bot;
    bot.onText(/\/start/, (message) => {
      const answer = "Gotta pump those numbers up! Those are rookie numbers!";
      bot.sendMessage(message.chat.id, answer);
    });

    bot.onText(/\/price/, (message) => {
      this.getExchangeRates(message, true);
    });

    bot.onText(/\/watch price start/, (message) => {
      bot.sendMessage(message.chat.id, "Starting watch loop, interval: 5 minutes.");
      this.watchLoop = setInterval(() => {
        this.getExchangeRates(message);
      }, 300000);
    });

    bot.onText(/\/watch stop/, (message) => {
      bot.sendMessage(message.chat.id, "Stopping watch loop.");
      this.watchLoop = null;
    })

    bot.onText(/\/watch changes start/, (message) => {
      bot.sendMessage(message.chat.id, "Starting watch loop on price changes: checking every 1 minute. \nUpdates will be displayed only if price changes.");
      this.watchLoop = setInterval(() => {
        this.getExchangeRates(message);
      }, 60000);
    });

  }

  getRatesChanges(message) {
    api.get('exchange-rates', this.defaultSource)
      .then((response) => {
        console.log('Got response');
        const euro = response.data['data']['rates']['EUR'];
        const usd = response.data['data']['rates']['USD'];
        const answer = "1 ETH = " + euro + "EUR | " + usd + "USD";
        this.bot.sendMessage(message.chat.id, answer);
      })
      .catch((error) => {
        console.log('Error: ', error);
      })
  }

  getExchangeRates(message, forceAnswer = false) {
    api.get('exchange-rates', this.defaultSource)
      .then((response) => {
        const euro = response.data['data']['rates']['EUR'];
        const usd = response.data['data']['rates']['USD'];

        const oldValues = {
          usd: this.store.currentUSD,
          euro: this.store.currentEUR
        }

        let answer = "";
        this.store.currentUSD = usd;
        this.store.currentEUR = euro;

        if(!oldValues.usd && !oldValues.euro) {
          answer = "1 ETH = " + euro + "EUR | " + usd + "USD";
        } else if((oldValues.usd != usd || oldValues.euro != euro) || forceAnswer) {
          const diffEUR = euro - euro;
          const percentage = (diffEUR / euro) * 100;
          answer = "1 ETH = " + euro + "EUR | " + usd + "USD";
          if (diffEUR) {
            answer += (diffEUR > 0) ?
              ' | Up ' + percentage + ' %'
              :
              ' | Down ' + percentage + ' %';
          }
        }

        console.log('Answer is: ', answer);
        if (answer) {
          this.bot.sendMessage(message.chat.id, answer);
        }
      })
      .catch((error) => {
        console.log('Error: ', error);
      })
  }

}

module.exports = WolfBot;
