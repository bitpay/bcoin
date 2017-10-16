const mongoose   = require('mongoose');
const Block      = require('./models/block');
const Meta       = require('./models/meta');
const Entry      = require('./models/entry');
const StateCache = require('./models/stateCache');
const Tip        = require('./models/tip');
const Tx         = require('./models/transaction');
const Coin       = require('./models/coin');
const Address    = require('./models/address');
const Undo       = require('./models/undo');
const Logger     = require('../node/logger');
const co         = require('../utils/co');
const batch      = require('./batch');

const LOW = Buffer.from([0x00]);
const HIGH = Buffer.from([0xff]);

function mongoDB(options) {
  if (!(this instanceof mongoDB))
    return new mongoDB(options);

  if (options && options.logger && options.logger.context) {
    this.logger = options.logger.context('mongodb');
  } else {
    this.logger = Logger.global;
  }

  this.binding = batch();
  this.dbhost = options.dbhost;
  this.dbname = options.dbname;
  this.connectionString = `mongodb://${this.dbhost}/${this.dbname}`;
  mongoose.Promise = global.Promise;
}

mongoDB.prototype.open = async function () {
  this.logger.info('Opening MongoDB Connection');

  await mongoose.connect(this.connectionString, {
    useMongoClient: true,
    poolSize: 100
  });
  this.logger.info(`MongoDB Connected @ ${this.connectionString}`);
  this.loaded = true;
};

mongoDB.prototype.close = function() {
  mongoose.disconnect(() => {
    this.logger.info('Mongoose connection with DB disconnected through app termination');
  });
};

// Temp function. Ensure integrity of mongo at startup.
mongoDB.prototype.preflight = async function(state) {
  const tipHash = state.tip.toString('hex');
  const tipBlock = await this.getBlockHeightByHash(tipHash);
  await Block.remove({ height: { $gt: tipBlock.height }});
  await Entry.remove({ height: { $gt: tipBlock.height }});
};

mongoDB.prototype.getTipHash = async function() {
  return await Meta.getTipHash();
};

mongoDB.prototype.setTipHash = function(hash, cb) {
  return Meta.setTipHash(hash, (err) => {
    if (err) {
      return cb(err);
    }
  });
};

mongoDB.prototype.setChainOptions = async function setChainOptions(options)  {
  return await Meta.setChainOptions(options);
};

mongoDB.prototype.getChainOptions = async function getChainOptions()  {
  return await Meta.getChainOptions();
};

mongoDB.prototype.saveEntry = async function saveEntry(hash, height, entry) {
  return Entry.saveEntry(hash, height, entry);
};

mongoDB.prototype.deleteEntry = function deleteEntry(hash) {
  return Entry.deleteEntry(hash);
};

mongoDB.prototype.getEntries = function getEntries() {
  return Entry.getEntries();
};

mongoDB.prototype.getEntryByHash = async function getEntryByHash(hash) {
  return Entry.getEntryByHash(hash);
};

mongoDB.prototype.getEntryByHeight = async function getEntryByHeight(height) {
  return Entry.getEntryByHeight(height);
};

mongoDB.prototype.getBlockHeightByHash = async function getBlockHeightByHash(hash) {
  return Block.getBlockHeightByHash(hash);
};

mongoDB.prototype.getBlockHashByHeight = async function getBlockHashByHeight(height) {
  return Block.getBlockHashByHeight(height);
};

mongoDB.prototype.updateNextBlock = function updateNextBlock(hash, nextHash) {
  return Block.updateNextBlock(hash, nextHash);
};

mongoDB.prototype.getNextHash = function getNextHash(hash)  {
  return Block.getNextHash(hash);
};

mongoDB.prototype.saveTip = async function saveTip(hash, height) {
  return Tip.saveTip(hash, height);
};

mongoDB.prototype.removeTip = async function removeTip(hash) {
  return Tip.removeTip(hash);
};

mongoDB.prototype.getTips = async function getTips()  {
  return Tip.getTips();
};

mongoDB.prototype.saveBcoinBlock = function saveBcoinBlock(entry, block) {
  return Block.saveBcoinBlock(entry, block);
};

mongoDB.prototype.deleteBcoinBlock = function deleteBcoinBlock(entry, block) {
  return Block.deleteBcoinBlock(entry, block);
};

mongoDB.prototype.hasTx = function hasTx(hash)  {
  return Tx.has(hash);
};

mongoDB.prototype.getTxMeta = function getTxMeta(hash)  {
  return Tx.getTxMeta(hash);
};

mongoDB.prototype.getHashesByAddress = function getHashesByAddress(addr) {
  return Tx.getHashesByAddress(addr);
};

mongoDB.prototype.getNextHash = function getNextHash(hash) {
  return Block.getNextHash(hash);
};

mongoDB.prototype.getBlockByHeight = function getBlockByHeight(height) {
  return Block.byHeight(height);
};

mongoDB.prototype.setDeploymentBits = function setDeploymentBits(bits) {
  return Meta.setDeploymentBits(bits);
};

mongoDB.prototype.getDeploymentBits = function getDeploymentBits() {
  return Meta.getDeploymentBits();
};

mongoDB.prototype.getRawBlock = function getRawBlock(hash) {
  return Block.getRawBlock(hash);
};

mongoDB.prototype.saveBcoinTx = function saveBcoinTx(entry, tx, meta) {
  return Tx.saveBcoinTx(entry, tx, meta);
};

mongoDB.prototype.deleteBcoinTx = function deleteBcoinTx(hash) {
  return Tx.deleteBcoinTx(hash);
};

mongoDB.prototype.saveStateCache = function saveStateCache(key, value) {
  return StateCache.saveStateCache(key, value);
};

mongoDB.prototype.getStateCaches = function getStateCaches() {
  return StateCache.getStateCaches();
};

mongoDB.prototype.invalidateStateCache = function invalidateStateCache() {
  return StateCache.invalidate();
};

mongoDB.prototype.saveCoins = function saveCoins(key, data, coin) {
  return Coin.saveCoins(key, data, coin);
};

mongoDB.prototype.removeCoins = function removeCoins(key) {
  return Coin.removeCoins(key);
};

mongoDB.prototype.getCoins = function getCoins(key) {
  return Coin.getCoins(key);
};

mongoDB.prototype.hasCoins = function hasCoins(key) {
  return Coin.hasCoins(key);
};

mongoDB.prototype.hasDupeCoins = function hasDupeCoins(key, height) {
  return Coin.hasDupeCoins(key, height);
};

mongoDB.prototype.saveAddress = function saveAddress(key, addr, hash, idx) {
  return Address.saveAddress(key, addr, hash, idx);
};

mongoDB.prototype.getAddress = function getAddress(key) {
  return Address.getAddress(key);
};

mongoDB.prototype.getAddressesByHash160 = function getAddressesByHash160(hash) {
  return Address.getAddressesByHash160(hash);
};

mongoDB.prototype.removeAddress = function removeAddress(key) {
  return Address.removeAddress(key);
};

mongoDB.prototype.saveUndoCoins = function saveUndoCoins(key, data) {
  return Undo.saveUndoCoins(key, data);
};

mongoDB.prototype.getUndoCoins = function getUndoCoins(key) {
  return Undo.getUndoCoins(key);
};

mongoDB.prototype.removeUndoCoins = function removeUndoCoins(key) {
  return Undo.removeUndoCoins(key);
};

mongoDB.prototype.reset = async function reset(height = 0) {
  await Block.remove({ 'height': { $gte: height }});
  await Tx.remove({ 'height': { $gte: height } });
  await Entry.remove({ 'height': { $gte: height } });
  await Tip.remove({});
  await Meta.remove({});
  await Coin.remove({});
  await Address.remove({});
  await StateCache.remove({});
  await Undo.remove({});
};

mongoDB.prototype.batch = function(ops) {
  if (!ops) {
    if (!this.loaded)
      throw new Error('Database is closed.');
    return new Batch(this);
  }

  return new Promise((resolve, reject) => {
    if (!this.loaded) {
      reject(new Error('Database is closed.'));
      return;
    }
    this.binding.batch(ops, co.wrap(resolve, reject));
  });
};

function Batch(db) {
  this.batch = db.binding.batch();
}

/**
 * Write a value to the batch.
 * @param {String|Buffer} key
 * @param {Buffer} value
 */

Batch.prototype.put = function put(key, value) {
  if (!value)
    value = LOW;

  this.batch.put(key, value);

  return this;
};

/**
 * Delete a value from the batch.
 * @param {String|Buffer} key
 */

Batch.prototype.del = function del(key) {
  this.batch.del(key);
  return this;
};

/**
 * Write batch to database.
 * @returns {Promise}
 */

Batch.prototype.write = function write() {
  return new Promise((resolve, reject) => {
    this.batch.write(co.wrap(resolve, reject));
  });
};

/**
 * Clear the batch.
 */

Batch.prototype.clear = function clear() {
  this.batch.clear();
  return this;
};

module.exports = mongoDB;
