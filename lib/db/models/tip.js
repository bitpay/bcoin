const mongoose = require('mongoose');
const util = require('./util');

const Schema = mongoose.Schema;

const TipSchema = new Schema({
  hash: String,
  tipHeight: Buffer
});

TipSchema.index({ hash: 1 });

TipSchema.statics.saveTip = function saveTip(hash, height) {
  const Tip = this.model('Tip');

  return new Tip({
    hash: hash.toString('hex'),
    tipHeight: height
  }).save();
};

TipSchema.statics.removeTip = function removeTip(hash) {
  return this.model('Tip').remove({ hash: hash });
};

TipSchema.statics.getTips = function getTips() {
  return this.model('Tip').find();
};

module.exports = mongoose.model('Tip', TipSchema);
