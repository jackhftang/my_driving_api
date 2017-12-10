const uuid = require('uuid/v4');
const _ = require('underscore');
const Joi = require('joi');
const {shortestRoute} = require('../lib/algorithm/ShortestRoute');

const latlogSchema = Joi.array().length(2).items(Joi.number());

const RoutingPlanSchema = Joi.object({
  id: Joi.string().required(),
  createdAt: Joi.number().required(),
  updatedAt: Joi.number().required(),
  error: Joi.string().allow(null).required(),
  routes: Joi.array().allow(null).required().items(latlogSchema),
  optimalRoutes: Joi.array().allow(null).required().items(latlogSchema),
  preliminaryTotalDistance: Joi.number().allow(null).required(),
  guidedRoutes: Joi.array().allow(null).required().items(latlogSchema),
  totalDistance: Joi.number().allow(null).required(),
  totalTime: Joi.number().allow(null).required()
});

module.exports = function (Config) {

  const {distanceMatrix, directions} = require('../lib/GoogleMapApi')(Config);

  class RoutingPlan {

    constructor() {
      this.id = null;

      this.createdAt = null;
      this.updatedAt = null;

      this.error = null;

      // init
      // routes[0] = starting point
      this.routes = null;

      // after distance matrix
      this.optimalRoutes = null;
      this.preliminaryTotalDistance = null;

      // after directions
      this.guidedRoutes = null;
      this.totalDistance = null;
      this.totalTime = null;
    }

    isDone() {
      return this.guidedRoutes &&
        typeof this.totalDistance === 'number' &&
        typeof this.totalTime === 'number';
    }

    getError() {
      return this.error || '';
    }

    getGuidedRoute() {
      return this.guidedRoutes;
    }

    getTotalDistance() {
      return this.totalDistance;
    }

    getTotalTime() {
      return this.totalTime;
    }

    setError(errStr) {
      this.error = errStr;
      return this;
    }

    setRoutes(routes) {
      this.routes = routes;
      return this;
    }

    async findGuidedRoute(routes = this.optimalRoutes) {
      let origin = routes[0];
      let destination = routes[routes.length - 1];
      let waypoints = routes.slice(1, -1);
      let {path, total_distance, total_time} = await directions(origin, destination, waypoints);

      this.guidedRoutes = path;
      this.totalDistance = total_distance;
      this.totalTime = total_time;

      this.updatedAt = Date.now();
      // assert( this.totalDistance === this.preliminaryTotalDistance );
    }

    async findShortestRoute(routes = this.routes) {
      let mat = await distanceMatrix(routes);

      // todo: long running process
      let {distance, path} = shortestRoute(mat, 0);

      this.preliminaryTotalDistance = distance;
      this.optimalRoutes = path.map(i => routes[i]);

      this.updatedAt = Date.now();
    }

    toJson() {
      // deep clone, all attributes are basic json type, all are cloneable
      return JSON.parse(JSON.stringify(this));
    }
  }

  RoutingPlan.make = function () {
    let plan = new this();
    plan.id = uuid();
    plan.createdAt = plan.updatedAt = Date.now();
    return plan;
  };

  RoutingPlan.fromJson = function (json) {
    let {error, value} = Joi.validate(json, RoutingPlanSchema);
    if (error) throw error;

    let plan = new RoutingPlan();
    for (let key in value) {
      if (json.hasOwnProperty(key)) {
        plan[key] = value[key];
      }
    }
    return plan;
  };

  return RoutingPlan;
};