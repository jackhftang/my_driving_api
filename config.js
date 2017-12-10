const _ = require('underscore');
const ConfigDefault = require('./config.default');

let envConfig = {
};
for (let v of Object.keys(ConfigDefault)) {
  if (v in process.env) envConfig[v] = process.env[v];
}

module.exports = _.defaults(envConfig, ConfigDefault);