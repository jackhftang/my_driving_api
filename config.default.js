const join = require('path').join;

module.exports = {
  version: require('./package.json').version,
  environment: 'development',
  rootDir: __dirname,
  routeDir: join(__dirname, 'src/route'),
  host: '0.0.0.0',
  port: 8080,
  awsRegion: 'ap-southeast-1',
  dynamoTable: 'my_driving_api',
  googleMapApiKey: '',
  awsAccessKey: '',
  awsSecretKey: ''
};