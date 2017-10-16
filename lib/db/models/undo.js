const mongoose = require('mongoose');
const util = require('./util');

const Schema = mongoose.Schema;

const UndoSchema = new Schema({
  key: Buffer,
  data: Buffer
});

UndoSchema.index({ key: 1 });

UndoSchema.statics.saveUndoCoins = function saveUndoCoins(key, data) {
  const Undo = this.model('Undo');
  return new Undo({
    key,
    data
  }).save();
};

UndoSchema.statics.getUndoCoins = function getUndoCoins(key) {
  return new Promise((res, rej) => {
    return this.model('Undo').findOne({ key },
      (err, coins) => {
        if (err) {
          return rej(err);
        }
        return coins ? res(coins.data) : res(coins);
      });
  });
};

UndoSchema.statics.removeUndoCoins = function removeUndoCoins(key) {
  return this.model('Undo').find({ key }).remove();
};

module.exports = mongoose.model('Undo', UndoSchema);
