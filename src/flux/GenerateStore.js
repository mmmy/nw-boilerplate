if (process.env.NODE_ENV !== 'development') {
  module.exports = require('./GenerateStore.prod');
} else {
  module.exports = require('./GenerateStore.dev');
}
