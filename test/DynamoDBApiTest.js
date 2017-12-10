const Config = require('../config.test');

const expect = require('expect');

describe('DynamoDB', function () {
  let db;

  before(async function () {
    db = await require("../src/lib/DynamoDBApi")(Config);
  });

  describe('basic', function () {


    it('should read the same value after write', async function () {
      this.timeout(5000);

      let value = {
        id: 'test',
        str: 'abc',
        num: 123,
        float: 123.123,
        bool: false,
        array: [1, 2, 3],
        buffer: Buffer.from('123')
      };
      await db.write(value);
      let value2 = await db.read('test', true);
      expect(value2).toEqual(value);
    });


    it('should read the latest value', async function () {
      this.timeout(5000);

      let value = {
        id: 'test',
        str: 'abc',
        num: 123,
        float: 123.123,
        bool: false,
        array: [1, 2, 3],
        buffer: Buffer.from('123')
      };
      await db.write(value);
      value.str = 'xyz';
      await db.write(value);
      let value2 = await db.read('test', true);
      expect(value2.str).toBe('xyz');
      expect(value2).toEqual(value);
    })

  })

});