const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StateCacheSchema = new Schema({
  key: Buffer,
  value: Buffer
});

StateCacheSchema.index({ key: 1 });

StateCacheSchema.statics.saveStateCache = function saveStateCache(key, value) {
  const StateCache = this.model('StateCache');

  return new StateCache({
    key,
    value
  }).save();
};

StateCacheSchema.statics.getStateCache = function getStateCache(key) {
  return this.model('StateCache').findOne({ key });
};

StateCacheSchema.statics.getStateCaches = function getStateCaches() {
  return this.model('StateCache').find({});
};

StateCacheSchema.statics.invalidate = function invalidate() {
  return this.model('StateCache').remove({});
};

module.exports = mongoose.model('StateCache', StateCacheSchema);
