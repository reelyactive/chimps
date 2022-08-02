/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');
const RaddecFilter = require('raddec-filter');


const DEFAULT_FILTER_PARAMETERS = {};


/**
 * RaddecManager Class
 * Manages a stream of raddecs.
 */
class RaddecManager {

  /**
   * RaddecManager constructor
   * @param {Chimps} chimps The chimps instance.
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(chimps, options) {
    options = options || {};

    this.inputFilter = new RaddecFilter(options.inputFilterParameters ||
                                        DEFAULT_FILTER_PARAMETERS);

    this.chimps = chimps;
  }

  /**
   * Handle the given raddec, provided it includes a position property.
   * @param {Raddec} raddec The given Raddec instance.
   */
  handleRaddec(raddec) {
    let self = this;

    if(self.inputFilter.isPassing(raddec)) {
      if(Array.isArray(raddec.position)) {
        self.chimps.positionManager.handleRaddec(raddec);
      }
    }
  }
}


module.exports = RaddecManager;
