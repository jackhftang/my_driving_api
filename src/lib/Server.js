const fs = require('fs');
const join = require('path').join;
const {promisify} = require('util');
const hapi = require('hapi');

module.exports = async function (Config) {

  const server = new hapi.Server({
    host: Config.host,
    port: Config.port
  });

  // set relative path
  server.path(Config.rootDir);

  // load routes
  const routeDir = Config.routeDir;
  let files = await promisify(fs.readdir)(routeDir);
  for (let file of files) {
    if (file.match(/(\.js|\.json)$/)) {
      const p = join(routeDir, file);
      server.route(require(p));
    }
  }

  return server
};