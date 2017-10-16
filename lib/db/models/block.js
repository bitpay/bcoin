const mongoose = require('mongoose');
const util = require('./util');

const Schema = mongoose.Schema;
// These limits can be overriden higher up the stack
const MAX_BLOCKS = 100;

const BlockSchema = new Schema({
  hash:       { type: String, default: '' },
  height:     { type: Number, default: 0 },
  size:       { type: Number, default: 0 },
  version:    { type: Number, default: 0 },
  prevBlock:  { type: String, default: '' },
  nextBlock:  { type: Buffer, default: '' },
  merkleRoot: { type: String, default: '' },
  ts:         { type: Number, default: 0 },
  bits:       { type: Number, default: 0 },
  nonce:      { type: Number, default: 0 },
  txs:        [{ type: String, default: '' }],
  chainwork:  { type: Number, default: 0 },
  reward:     { type: Number, default: 0 },
  network:    { type: String, default: '' },
  poolInfo:   { type: Object, default: {} },
  rawBlock:   { type: Buffer, default: '' }
}, {
  toJSON: {
    virtuals: true
  },
  id: false
});

BlockSchema.index({ hash: 1 });
BlockSchema.index({ height: 1 });

BlockSchema.statics.byHeight = function byHeight(height) {
  return this.model('Block').findOne({ height });
};

BlockSchema.statics.byHash = function byHash(hash) {
  return this.model('Block').findOne({ hash });
};

BlockSchema.statics.getRawBlock = function getRawBlock(hash) {
  return new Promise((res, rej) => {
    return this.model('Block').findOne(
      { hash },
      { rawBlock: 1 },
      (err, block) => {
        return err ? rej(err) : res(Buffer.from(block.rawBlock, 'hex'));
      });
  });
};

BlockSchema.statics.last = function last(cb) {
  return this.model('Block').find(
    {},
    cb)
    .limit(MAX_BLOCKS)
    .sort({ height: -1 });
};

BlockSchema.statics.getHeights = function getHeights(cb) {
  return this.model('Block').find(
    {},
    { height: 1 },
    cb)
    .sort({ height: 1 });
};

BlockSchema.statics.tipHash =  function tipHash(cb)  {
  return this.last((err, block) => {
    if (err) {
      return cb(err);
    }
    return cb(null, block.hash);
  })
    .limit(1);
};

BlockSchema.statics.getBlockHeightByHash = function getBlockHeightByHash(hash) {
  return this.model('Block').findOne({ hash });
};

BlockSchema.statics.getBlockHashByHeight = function getBlockHashByHeight(height) {
  return new Promise((res, rej) => {
    return this.model('Block').findOne(
      { height },
      { hash: 1 },
        (err, block) => {
        return err ? rej(err) : res(Buffer.from(block.hash, 'hex'));
      });
  });
};

BlockSchema.statics.updateNextBlock = function updateNextBlock(hash, nextHash) {
  return this.model('Block').findOne(
    {hash: hash},
    (err, block) => {
      if (!err && block) {
        block.nextBlock = nextHash;
        return block.save();
      }
    }
  );
};

BlockSchema.statics.getNextHash = function getNextHash(hash) {
  return new Promise((res, rej) => {
    return this.model('Block').findOne(
      { hash: hash },
      (err, block) => {
        if (err || !block) {
          rej(err);
        }
        res(block.nextBlock);
      }
    );
  });
};

BlockSchema.statics.saveBcoinBlock = function saveBcoinBlock(entry, block) {
  const Block = this.model('Block');
  const rawBlock = block.toRaw();
  const blockJSON = block.toJSON();
  const reward = util.calcBlockReward(entry.height);

  return new Block({
    hash: block.hash().toString('hex'),
    height: entry.height,
    size: block.getSize(),
    version: blockJSON.version,
    prevBlock: blockJSON.prevBlock,
    merkleRoot: blockJSON.merkleRoot,
    ts: blockJSON.ts,
    bits: blockJSON.bits,
    nonce: blockJSON.nonce,
    txs: block.txs.map((tx) => {
      const txJSON = tx.toJSON();
      return txJSON.hash;
    }),
    chainwork: entry.chainwork,
    reward,
    network: 'main',
    poolInfo: {},
    rawBlock
  }).save();
};

BlockSchema.statics.deleteBcoinBlock = function deleteBcoinBlock(hash) {
  return this.model('Block').find({ hash }).remove();
};

module.exports = mongoose.model('Block', BlockSchema);
