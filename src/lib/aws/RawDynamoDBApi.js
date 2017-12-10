// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html
// http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.API.html

const {promisify} = require('util');

module.exports = function (Config) {
  const TableName = Config.dynamoTable;

  process.env.AWS_ACCESS_KEY_ID = Config.awsAccessKey;
  process.env.AWS_SECRET_ACCESS_KEY = Config.awsSecretKey;

  const AWS = require('aws-sdk');
  AWS.config.update({
    region: Config.awsRegion
  });

  const dynamodb = new AWS.DynamoDB({
    apiVersion: '2012-08-10'
  });

  function listTables(param = {}) {
    return promisify(dynamodb.listTables.bind(dynamodb, param))();
  }

  function getItem(Key, ConsistentRead=false) {
    let param = {Key, TableName, ConsistentRead};
    return promisify(dynamodb.getItem.bind(dynamodb, param))();
  }

  function putItem(Item) {
    let param = {Item, TableName, ReturnConsumedCapacity: "TOTAL"};
    return promisify(dynamodb.putItem.bind(dynamodb, param))();
  }

  function deleteItem(Key) {
    let param = {Key, TableName};
    return promisify(dynamodb.deleteItem.bind(dynamodb, param))();
  }

  return {listTables, getItem, putItem, deleteItem};
};

