process.env.AWS_ACCESS_KEY_ID = 'AKIAILHCJ3NT44XFWMLA';
process.env.AWS_SECRET_ACCESS_KEY = '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';
const _ = require('underscore');

var AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-southeast-1'
});

// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html

var dynamodb = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

// dynamodb.listTables({}, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });


// dynamodb.getItem({Key: {id: {S: 'test3'}}, TableName: 'my_driving_api'}, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else console.log(data);
//   // else     console.log(fromDynamoValue(data.Item));           // successful response
// });

function toDynamoValue(obj) {
  function attr(x) {
    switch (typeof x) {
      case 'string':
        return {S: x};
      case 'number':
        return {N: x.toString()};
      case 'boolean':
        return {BOOL: x};
      case 'object':
        if (x === null) {
          return {NULL: true}
        }
        else if (Array.isArray(x)) {
          // do not check the subtype
          return {L: x.map(attr)}
        }
        else {
          return {M: _.mapObject(x, attr)}
        }
      default:
        throw new Error('Unsupported typeof x:' + typeof x);
    }
  }

  return _.mapObject(obj, attr);
}

function fromDynamoValue(obj) {
  function parse(x) {
    if ('S' in x) return x.S;
    if ('N' in x) return parseFloat(x.N);
    if ('BOOL' in x) return x.BOOL;
    if ('NULL' in x) return null;
    if ('L' in x) return x.L.map(parse);
    if ('M' in x) return _.mapObject(x.M, parse);
    throw new Error('Unsupported format: ' + JSON.stringify(x));
  }

  return _.mapObject(obj, parse);
}

var Item = toDynamoValue({
  id: "test3",
  str: 'abc',
  num: 123,
  float: 123.123,
  bool: false,
  routes: [
    [1, 2],
    [3, 4],
    [5, 6]
  ]
});

// console.log(JSON.stringify(Item, null, 4));
// console.log(fromDynamoValue(Item));


// var params = {
//   Item,
//   ReturnConsumedCapacity: "TOTAL",
//   TableName: "my_driving_api"
// };
// dynamodb.putItem(params, function (err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else console.log(data);           // successful response
//   /*
//   data = {
//    ConsumedCapacity: {
//     CapacityUnits: 1,
//     TableName: "Music"
//    }
//   }
//   */
// });

buf = Buffer('123');
console.log(buf);
buf2 = Buffer.from(buf.toString('Base64'), 'Base64');
console.log(buf2.toString('ascii'));

expect = require('expect');
console.log(expect(buf2).toEqual(buf));