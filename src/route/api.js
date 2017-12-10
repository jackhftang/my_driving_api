const Joi = require('joi');
const Config = require('../../config');
const RoutingPlanManager = require('../lib/RoutingPlanManager')(Config);

module.exports = [
  {
    method: 'POST',
    path: '/route',
    handler: async function (req) {
      let routes = req.payload;
      let token = await RoutingPlanManager.makeRoutingPlan(routes);
      return {token};
    },
    options: {
      validate: {
        payload: Joi.array().max(Config.maxNumOfDropoff).items(Joi.array().length(2).items(Joi.number())),
      },
      payload: {
        parse: true,
        // limit payload size, 4kb should be well enough
        maxBytes: 4 * 1024
      }
    }
  },
  {
    method: 'GET',
    path: '/route/{token}',
    handler: async function (req) {
      let token = req.params.token;
      let plan = await new Promise(resolve => {
        RoutingPlanManager.getRoutingPlan(token)
          .then(resolve)
          .catch(err => resolve(null));
      });

      // unknown token
      if (!plan) return {
        status: 'failure',
        error: 'Unknown Token'
      };

      // error
      let error = plan.getError();
      if (error) return {
        status: 'failure',
        error
      };

      // is processing
      if (!plan.isDone()) return {status: 'in progress'};

      // success
      return {
        status: 'success',
        path: plan.getGuidedRoute(),
        total_distance: plan.getTotalDistance(),
        total_time: plan.getTotalTime()
      };
    }
  }
];