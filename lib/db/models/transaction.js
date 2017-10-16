const mongoose = require('mongoose');
const Input = require('./input');
const Output = require('./output');
const util = require('./util');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  hash: String,
  witnessHash: String,
  fee: Number,
  rate: Number,
  ps: Number,
  height: Number,
  block: String,
  index: Number,
  version: Number,
  flag: Number,
  lockTime: Number,
  inputs: [Input.schema],
  outputs: [Output.schema],
  size: Number,
  network: String,
  rawTx: Buffer,
  meta: Buffer
});

TransactionSchema.index({ hash: 1 });
TransactionSchema.index({ 'inputs.address': 1 });
TransactionSchema.index({ 'outputs.address': 1 });

TransactionSchema.statics.saveBcoinTx = function saveBcoinTx(entry, tx, meta)  {
  const Transaction = this.model('Transaction');
  const txJSON = tx.toJSON();

  const t = new Transaction({
    hash: txJSON.hash,
    witnessHash: txJSON.witnessHash,
    fee: txJSON.fee,
    rate: txJSON.rate,
    ps: txJSON.ps,
    height: entry.height,
    block: entry.hash,
    ts: entry.ts,
    date: txJSON.date,
    index: txJSON.index,
    version: txJSON.version,
    flag: txJSON.flag,
    inputs: tx.inputs.map((input) => {
      const inputJSON = input.toJSON();
      return new Input({
        prevout: inputJSON.prevout,
        script: inputJSON.script,
        witness: inputJSON.witness,
        sequence: inputJSON.sequence,
        address: inputJSON.address
      });
    }),
    outputs: tx.outputs.map((output) => {
      const outputJSON = output.toJSON();
      return new Output({
        address: outputJSON.address,
        script: outputJSON.script,
        value: outputJSON.value
      });
    }),
    lockTime: txJSON.locktime,
    network: 'main',
    meta: meta.toRaw()
  });
  t.save((err) => {
    if (err) {
      console.log(err);
    }
  });
};

TransactionSchema.statics.deleteBcoinTx = function deleteBcoinTx(hash) {
  return this.model('Transaction').find({ hash }).remove();
};

TransactionSchema.statics.getHashesByAddress = function getHashesByAddress(addr) {
  return new Promise((res, rej) => {
    return this.model('Transaction').find(
      {
        $or: [
          { 'inputs.address': addr },
          { 'outputs.address': addr }]
      },
      {
        hash: 1
      },
        (err, txs) => {
          err ? rej(err) : res(txs.map((tx) => {
            return util.revHex(tx.hash);
          }));
        }
    );
  });
};

TransactionSchema.statics.has = function has(hash) {
  return new Promise((res, rej) => {
    return this.model('Transaction')
      .findOne({ hash })
      .count((err, count) => {
        err ? rej(err) : res(count >= 1);
      });
  });
};

TransactionSchema.statics.getTxMeta = function getTxMeta(hash)  {
  return new Promise((res, rej) => {
    return this.model('Transaction').findOne(
      { hash: util.revHex(hash) },
      { meta: 1 },
      (err, tx) => {
        if (tx === null  || tx.meta === null) {
          res(null);
        } else {
          err ? rej(err) : res(Buffer.from(tx.meta, 'hex'));
        }
      });
  });
};

module.exports = mongoose.model('Transaction', TransactionSchema);
