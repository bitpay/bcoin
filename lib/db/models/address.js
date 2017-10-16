const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  key: Buffer,
  addr: String,
  hash: String,
  index: Number
});

AddressSchema.index({ key: 1 });
AddressSchema.index({ hash: 1 });

AddressSchema.statics.saveAddress = function saveAddress(key, addr, hash, idx) {
  const Address = this.model('Address');
  return new Address({
    key,
    addr: addr ? addr.toString('hex') : '',
    hash: hash ? hash.toString('hex') : '',
    index: idx
  }).save();
};

AddressSchema.statics.getAddress = function getAddress(key) {
  return new Promise((res, rej) => {
    return this.model('Address').findOne({ key },
      (err, addr) => {
        if (err || !addr) {
          return rej(err);
        }
        return res(addr.key);
      });
  });
};

AddressSchema.statics.removeAddress = function removeAddress(key) {
  return this.model('Address').find({ key }).remove();
};

AddressSchema.statics.getAddressesByHash160 = function getAddressesByHash160(hash) {
  return new Promise((res, rej) => {
    return this.model('Address').find({ addr: hash.toString('hex') },
    (err, addrs) => {
      if (err || !addrs || addrs.length === 0) {
        return rej(err);
      }
      return res(addrs.map((addr) => {
        return [addr.hash, addr.index];
      }));
    });
  });
};

module.exports = mongoose.model('Address', AddressSchema);
