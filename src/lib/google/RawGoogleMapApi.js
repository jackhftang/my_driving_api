const {promisify} = require('util');

module.exports = function (Config) {

  const googleMapsClient = require('@google/maps').createClient({
    key: Config.googleMapApiKey
  });

  /**
   *
   * @param option
   * @returns {*}
   */
  function distanceMatrix(option) {
    return promisify(googleMapsClient.distanceMatrix.bind(googleMapsClient, option))();
  }

  /**
   * Google Map API
   * 1. Travel time is the primary factor optimized
   *
   * https://developers.google.com/maps/documentation/directions/intro
   */
  function directions(option) {
    return promisify(googleMapsClient.directions.bind(googleMapsClient, option))();
  }

  return {
    distanceMatrix,
    directions
  };

};

