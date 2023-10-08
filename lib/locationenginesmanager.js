/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const DEFAULT_LOCATION_ENGINES = [];


/**
 * LocationEnginesManager Class
 * Handles the location engine(s).
 */
class LocationEnginesManager {

  /**
   * LocationEnginesManager constructor
   * @param {Chimps} chimps The chimps instance.
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(chimps, options) {
    let self = this;
    options = options || {};
    options.locationEngines = options.locationEngines ||
                              DEFAULT_LOCATION_ENGINES;

    this.chimps = chimps;
  }

  /**
   * Handle the the given raddec.
   * @param {Raddec} raddec The raddec to be handled.
   */
  handleRaddec(raddec) {
    let self = this;

    if(Array.isArray(raddec.position)) {
      self.chimps.positionManager.handleRaddec(raddec);
    }
  }
}


module.exports = LocationEnginesManager;
