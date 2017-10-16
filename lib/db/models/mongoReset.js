const Meta = require('./meta');
const Block = require('./block');
const Tx = require('./transaction');
const Entry = require('./entry');
const StateCache = require('./stateCache');
const Tip = require('./tip');
const Address = require('./address');
const Undo = require('./undo');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/bcoin');

async function reset() {
  await Address.remove({});
  await Block.remove({});
  await Tx.remove({});
  await Entry.remove({});
  await Tip.remove({});
  await Meta.remove({});
  await StateCache.remove({});
  await Undo.remove({});
  console.log('db cleared');
  mongoose.disconnect();
}

reset();
