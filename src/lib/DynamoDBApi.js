const _ = require('underscore');

module.exports = function (Config) {
  let db = require('./aws/RawDynamoDBApi')(Config);

  async function write(value) {
    if (!('id' in value)) throw new Error('Item must have a `id` field');
    return await db.putItem(toDynamoValue(value));
  }

  async function read(key, consistent = false) {
    let res = await db.getItem({id: {S: key}}, consistent);
    return fromDynamoValue(res.Item);
  }

  /**
   * do not support set types e.g. StringSet, NumberSet, BufferSet
   * so as to remain one-to-one mapping between Dynamo value and JSON
   */
  function fromDynamoValue(obj) {
    function parse(x) {
      if ('S' in x) return x.S;
      if ('N' in x) return parseFloat(x.N);
      if ('BOOL' in x) return x.BOOL;
      if ('B' in x) return Buffer.from(x.B, 'Base64');
      if ('NULL' in x) return null;
      if ('L' in x) return x.L.map(parse);
      if ('M' in x) return _.mapObject(x.M, parse);
      throw new Error('Unsupported format: ' + JSON.stringify(x));
    }

    // top level is an object
    return _.mapObject(obj, parse);
  }

  function toDynamoValue(x) {
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
          else if (Buffer.isBuffer(x)) {
            // return {B: x.toString('Base64')}
            // aws SDK auto convert to base64
            return {B: x}
          }
          else {
            return {M: _.mapObject(x, attr)}
          }
        default:
          throw new Error('Unsupported typeof x:' + typeof x);
      }
    }

    // top level is an object
    return _.mapObject(x, attr);
  }

  return {read, write, fromDynamoValue, toDynamoValue};
};