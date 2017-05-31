const axios = require('axios');

const api = {
  get(item, source) {
    switch (item) {
      case 'exchange-rates':
        return getExchangeRates(source);
        break;
      default:
        break;
    }
  }
}

/* TODO: Separate operations into files */
const getExchangeRates = (source) => {
  switch (source) {
    case 'coinbase':
      return axios.get("https://api.coinbase.com/v2/exchange-rates?currency=ETH");
      break;
    default:
      break;
  }
}

module.exports = api;
