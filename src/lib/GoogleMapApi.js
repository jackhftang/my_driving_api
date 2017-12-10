const Joi = require('joi');

const distanceMatrixResponseSchema = Joi.object({
  json: Joi.object({
    status: Joi.string().required(),
    rows: Joi.array().items(
      Joi.object({
        elements: Joi.array().items(
          Joi.object({
            distance: Joi.object({
              value: Joi.number()
            }).required().unknown(true),
            duration: Joi.object({
              value: Joi.number()
            }).required().unknown(true)
          }).unknown(true)
        )
      }).unknown(true)
    ).required(),
    destination_addresses: Joi.array(),
    origin_addresses: Joi.array()
  }).unknown(true).required()
}).unknown(true);


const directionsResponseSchema = Joi.object({
  json: Joi.object({
    status: Joi.string().required(),
    routes: Joi.array().min(1).items(
      Joi.object({
        legs: Joi.array().min(1).items(
          Joi.object({
            distance: Joi.object({
              value: Joi.number()
            }).required().unknown(true),
            duration: Joi.object({
              value: Joi.number()
            }).required().unknown(true),
            steps: Joi.array().required()
          }).unknown(true)
        )
      }).unknown(true)
    ).required()
  }).unknown(true).required()
}).unknown(true);


module.exports = function (Config) {
  const map = require('./google/RawGoogleMapApi')(Config);

  // https://www.google.com.hk/maps/place/22%C2%B022'19.5%22N+114%C2%B006'28.4%22E/@22.3717238,114.1026181,14.26z/data=!4m5!3m4!1s0x0:0x0!8m2!3d22.372081!4d114.107877?hl=zh-TW
  // https://www.google.com.hk/maps/place/22%C2%B017'03.9%22N+114%C2%B009'34.2%22E/@22.284419,114.1573213,17z/data=!3m1!4b1!4m5!3m4!1s0x0:0x0!8m2!3d22.284419!4d114.15951?hl=zh-TW
  // https://www.google.com.hk/maps/place/22%C2%B019'35.2%22N+114%C2%B010'04.1%22E/@22.326442,114.1656223,17z/data=!3m1!4b1!4m5!3m4!1s0x0:0x0!8m2!3d22.326442!4d114.167811?hl=zh-TW


  async function distanceMatrix(locations) {

    let res = await map.distanceMatrix({
      mode: 'driving',
      departure_time: 'now',
      traffic_model: 'best_guess',
      origins: locations,
      destinations: locations,
      units: 'imperial'
    });

    // todo: add validator
    let {error, value} = Joi.validate(res, distanceMatrixResponseSchema);
    if (error) throw error;

    let json = value.json;

    if (json.status !== 'OK') {
      throw new Error('Invalid Status: ' + json.status);
    }

    // extract matrix
    let mat = [];
    for (let row of json.rows) {
      let lis = [];
      for (let elem of row.elements) {
        lis.push(elem.distance.value);
        // lis.push({
        //   distance: elem.distance.value,
        //   duration: elem.duration.value
        // })
      }
      mat.push(lis);
    }
    return mat;
  }


  // example:
  //
  // direction(
  //  ["22.372081", "114.107877"],
  //  ["22.326442", "114.167811"],
  //  [
  //    ["22.284419", "114.159510"]
  //  ])
  async function directions(origin, destination, waypoints) {
    let res = await map.directions({
      mode: 'driving',
      departure_time: 'now',
      traffic_model: 'best_guess',
      alternatives: false,
      optimize: false,
      origin,
      destination,
      waypoints
    });

    let {error, value} = Joi.validate(res, directionsResponseSchema);
    if (error) throw error;

    let json = value.json;

    if (json.status !== 'OK') {
      throw new Error('Invalid Status: ' + json.status);
    }

    if (!('routes' in json) || json.routes.length === 0) {
      throw new Error('invalid format: missing routes');
    }

    // extract interested information
    let legs = json.routes[0].legs;
    let total_distance = legs.map(leg => leg.distance.value).reduce((a, b) => a + b);
    let total_time = legs.map(leg => leg.duration.value).reduce((a, b) => a + b);
    let path = [];
    let {lat, lng} = legs[0].start_location;
    path.push([lat, lng]);
    for (let leg of legs) {
      for (let step of leg.steps) {
        let {lat, lng} = step.end_location;
        path.push([lat, lng]);
      }
    }

    return {path, total_distance, total_time};
  }

  return {
    distanceMatrix,
    directions
  };
};