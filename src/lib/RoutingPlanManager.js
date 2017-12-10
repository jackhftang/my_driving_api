module.exports = function (Config) {
  const RoutingPlan = require("../type/RoutingPlan")(Config);

  class RoutingPlanManager {

    constructor(db) {
      this.db = db;
    }

    async getRoutingPlan(token) {
      let json = await this.db.read(token, true);
      return RoutingPlan.fromJson(json);
    }

    /**
     *
     * @param {[[number]]} routes
     * @returns {string}
     */
    async makeRoutingPlan(routes) {
      let plan = RoutingPlan.make().setRoutes(routes);

      // run in micro task
      Promise.resolve()
        .then(async _ => {
          // save at start
          await this.db.write(plan.toJson());
          // find shortest route
          await plan.findShortestRoute();
          await this.db.write(plan.toJson());
          // find guided route, total distance and total time
          await plan.findGuidedRoute();
          await this.db.write(plan.toJson());
        })
        .catch(err => {
          plan.setError(err.toString());
          this.db.write(plan.toJson()).catch(err => {
            console.error('Cannot write to database:' + err + '\n' + err.stack);
          });
        });

      // immediately return id
      return plan.id;
    }

  }

  RoutingPlanManager.getInstance = function (Config) {
    let m = this.instance;
    if (m) return m;
    const db = require('./DynamoDBApi')(Config);
    return this.instance = new this(db);
  };

  return RoutingPlanManager.getInstance(Config);
};
