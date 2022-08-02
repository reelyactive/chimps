/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const PolygonLookup = require('polygon-lookup');


const DEFAULT_FEATURE_COLLECTION = {
    type: "FeatureCollection",
    features: []
};


/**
 * PositionManager Class
 * Handles the spatial processing of position data.
 */
class PositionManager {

  /**
   * PositionManager constructor
   * @param {Chimps} chimps The chimps instance.
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(chimps, options) {
    options = options || {};
    options.featureCollection = options.featureCollection ||
                                DEFAULT_FEATURE_COLLECTION;

    this.chimps = chimps;
    this.lookup = new PolygonLookup(options.featureCollection);
  }

  /**
   * Handle the packets in the given raddec.
   * @param {Raddec} raddec The raddec with packets to be handled.
   */
  handleRaddec(raddec) {
    let self = this;

    if(!Array.isArray(raddec.position) || (raddec.position.length < 2)) {
      return;
    }

    let x = raddec.position[0];
    let y = raddec.position[1];
    let featureCollection = self.lookup.search(x, y, -1);

    // TODO: emit featureCollection
  }
}


module.exports = PositionManager;
