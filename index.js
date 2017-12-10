const Config = require('./config.js');
const Server = require('./src/lib/Server');

!async function () {
  let server = await Server(Config);
  await server.start();
  console.log('Listening', server.info.uri);
}().catch(err => console.error(err));



