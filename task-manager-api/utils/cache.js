const NodeCache = require("node-cache");

// Cache data for 60 seconds
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
});

module.exports = cache;
