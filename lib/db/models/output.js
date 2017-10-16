const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OutputSchema = new Schema({
  address: String,
  script: String,
  value: Number,
  type: String
});

module.exports = mongoose.model('Output', OutputSchema);
