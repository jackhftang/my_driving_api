const Server = require('../src/lib/Server');
const request = require('request-promise');
const expect = require('expect');
const Config = require('../config.test');
const {delay} = require('../src/lib/util');


describe('API: route', function () {
  let server;

  before(async function () {
    server = await Server(Config);
    await server.start();
  });

  after(async function () {
    await server.stop();
  });

  describe('POST /routes', function () {
    let token;

    it('should return token', async function () {
      const body = [
        ["22.372081", "114.107877"],
        ["22.284419", "114.159510"],
        ["22.326442", "114.167811"]
      ];
      let res = await request.post({
        uri: `${server.info.uri}/route`,
        body,
        json: true
      });
      expect(res).toHaveProperty('token');
      token = res.token;
      console.log(token);
    });


    it('should success after some time', async function () {
      this.timeout(50 * 1000);
      await delay(5 * 1000);
      let res = await request.get(`${server.info.uri}/route/${token}`).json();
      expect(res).toHaveProperty('status');
      expect(res.status).toBe('success');
    });

  });

  describe('GET /routes/:token', function () {

    it('should not found /routes/abc', async function () {
      let res = await request(`${server.info.uri}/route/abc`).json();
      expect(res).toHaveProperty('status');
      expect(res.status).toEqual('failure');
      expect(res).toHaveProperty('error');
    });

  })


});