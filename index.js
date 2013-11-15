module.exports = process.env.MODEL_COV
  ? require('./lib-cov')
  : require('./lib');
