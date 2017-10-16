const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const InputSchema = new Schema({
  prevout: Object,
  script: String,
  witness: String,
  sequence: Number,
  address: String
});

module.exports = mongoose.model('Input', InputSchema);
