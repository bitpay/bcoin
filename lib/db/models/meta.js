const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MetaSchema = new Schema({
  idx: Number,
  tipHash: Buffer,
  chainOptions: Buffer,
  deploymentBits: Buffer
});

MetaSchema.index({ idx: 1 });

MetaSchema.statics.setTipHash = function setTipHash(hash, cb) {
  this.model('Meta').update(
    { 'idx': 0},
    { '$set': {
      'tipHash': Buffer.from(hash, 'hex')
      }
    },
    { upsert: true },
    cb
  );
};

MetaSchema.statics.getTipHash = async function getTipHash() {
  // Needs a preflight - if no document exists create a blank one
  return new Promise((res, rej) => {
    return this.model('Meta').findOne(
      { 'idx': 0},
      (err, meta) => {
        const tipHash = meta ? meta.tipHash : null;
        return err ? rej(err) : res(tipHash);
      }
    );
  });
};

MetaSchema.statics.setChainOptions = function setChainOptions(options) {
  return this.model('Meta').update(
    { 'idx': 0 },
    { '$set': {
      'chainOptions': Buffer.from(options, 'hex')
    }},
    { upsert: true },
  );
};

// Wrapped in Promise to change results before returning to async/await
MetaSchema.statics.getChainOptions = function getChainOptions() {
  return new Promise((res, rej) => {
    return this.model('Meta').findOne(
      { 'idx': 0 },
      (err, meta) => {
        return err ? rej(err) : res(meta.chainOptions);
      }
    );
  });
};

MetaSchema.statics.setDeploymentBits = function setDeploymentBits(bits) {
  return this.model('Meta').update(
    { 'idx': 0 },
    { '$set': {
      deploymentBits: bits
    }},
    { upsert: true }
  );
};

MetaSchema.statics.getDeploymentBits = function getDeploymentBits() {
  return new Promise((res, rej) => {
    return this.model('Meta').findOne(
      { 'idx': 0 },
      (err, meta) => {
        return err ? rej(err) : res(meta.deploymentBits);
      }
    );
  });
};

module.exports = mongoose.model('Meta', MetaSchema);
