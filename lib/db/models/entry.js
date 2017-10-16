const mongoose = require('mongoose');
const util = require('./util');

const Schema = mongoose.Schema;

const EntrySchema = new Schema({
  hash: String,
  height: Number,
  data: Buffer
});

EntrySchema.index({ hash: 1 });
EntrySchema.index({ height: 1 });

EntrySchema.statics.saveEntry = function saveEntry(hash, height, entry) {
  const Entry = this.model('Entry');

  return new Entry({
    'hash': hash.toString('hex'),
    'height': height,
    'data': Buffer.from(entry, 'hex')
  }).save();
};

EntrySchema.statics.deleteEntry = function deleteEntry(hash) {
  return this.model('Entry').find({ hash }).remove();
};

EntrySchema.statics.getEntries = function getEntries() {
  return this.model('Entry').find({});
};

EntrySchema.statics.getEntryByHash = function getEntryByHash(hash) {
  return new Promise((res, rej) => {
    return this.model('Entry').findOne(
      { hash: hash },
      (err, entry) => {
        if (err) {
          rej(err);
        }
        return entry ? res(entry.data) : res(null);
      }
    );
  });
};

EntrySchema.statics.getEntryByHeight = function getEntryByHeight(height) {
  return new Promise((res, rej) => {
    return this.model('Entry').findOne(
      { height: height },
      (err, entry) => {
        if (err) {
          rej(err);
        }
        res(entry.data);
      }
    );
  });
};

module.exports = mongoose.model('Entry', EntrySchema);
