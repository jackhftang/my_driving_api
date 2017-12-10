const Config = require('../config.test');
const {distanceMatrix, directions} = require('../src/lib/GoogleMapApi')(Config);
const expect = require('expect');

describe('High level Map API', function () {

  describe('distanceMatrix', function () {

    it('should return a distanceMatrix', async function () {
      let locations = [
        ["22.372081", "114.107877"],
        ["22.284419", "114.159510"],
        ["22.326442", "114.167811"]
      ];
      let mat = await distanceMatrix(locations);
      expect(mat).toHaveLength(locations.length);
      console.log(mat);
    })

  });

  describe('directions', function () {

    it('should return a list of route', async function () {
      let origin = ["22.372081", "114.107877"];
      let destination = ["22.326442", "114.167811"];
      let waypoints = [["22.284419", "114.159510"]];

      let res = await directions(origin, destination, waypoints);
      expect(res).toHaveProperty('path');
      expect(res).toHaveProperty('total_distance');
      expect(res).toHaveProperty('total_time');
    })

  });

});