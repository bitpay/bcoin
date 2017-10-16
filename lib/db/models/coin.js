const mongoose = require('mongoose');
const util = require('./util');

const Schema = mongoose.Schema;

const CoinSchema = new Schema({
  key: Buffer,
  data: Buffer,
  version: Number,
  height: Number,
  coinbase: Boolean,
  spent: Boolean,
  output: Object
});

CoinSchema.index({ key: 1 });
CoinSchema.index({ height: 1 });

CoinSchema.statics.saveCoins = function saveCoins(key, data, coin) {
  const Coin = this.model('Coin');
  return new Coin({
    key,
    data,
    version: coin.version,
    height: coin.height,
    coinbase: coin.coinbase,
    spent: coin.spent,
    output: coin.output
  }).save();
};

CoinSchema.statics.getCoins = function getCoins(key) {
  return new Promise((res, rej) => {
    return this.model('Coin').findOne({ key },
    (err, coins) => {
      if (err) {
        return rej(err);
      }
      return coins ? res(coins.data) : res(coins);
    });
  });
};

CoinSchema.statics.hasCoins = function hasCoins(key) {
  return new Promise((res, rej) => {
    return this.model('Coin')
      .findOne({ key })
      .count((err, count) => {
        err ? rej(err) : res(count >= 1);
      });
  });
};

CoinSchema.statics.hasDupeCoins = function hasDupeCoins(key, height) {
  return new Promise((res, rej) => {
    return this.model('Coin')
      .findOne({
        key: key,
        height: { $lte: height }
      })
      .count((err, count) => {
        err ? rej(err) : res(count >= 1);
      });
  });
};

CoinSchema.statics.removeCoins = function removeCoins(key) {
  return this.model('Coin').find({ key }).remove();
};

module.exports = mongoose.model('Coin', CoinSchema);
