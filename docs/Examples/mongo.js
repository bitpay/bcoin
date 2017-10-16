'use strict';

const bcoin = require('../../');
const FullNode = bcoin.fullnode;

const node = new FullNode({
  network: 'main',
  dbname: 'bcoin',
  dbhost: 'localhost',
  checkpoints: true,
  workers: true,
  logLevel: 'info',
  'max-inbound': 8,
  'max-outbound': 8,
  'http-port': 8332
});

(async () => {
  await node.open();
  await node.connect();

  node.startSync();
})().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});
