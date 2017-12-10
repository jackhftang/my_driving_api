const _ = require('underscore');
const Config = require('./config');

module.exports = _.defaults({
  dynamoTable: 'my_driving_api_test'
}, Config);