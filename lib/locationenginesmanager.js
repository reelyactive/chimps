/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const LocationEngines = require('./locationengines');
const RaddecFilter = require('raddec-filter');


const DEFAULT_LOCATION_ENGINES = [
  { inputFilterParameters: {}, engine: LocationEngines.External }
];


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
    this.locationEngines = [];

    options.locationEngines.forEach((entry) => {
      let locationEngine = {
        inputFilter: new RaddecFilter(entry.inputFilterParameters),
        engine: new entry.engine(entry.options)
      };
      self.locationEngines.push(locationEngine);
    });

  }

  /**
   * Handle the the given raddec.
   * @param {Raddec} raddec The raddec to be handled.
   */
  handleRaddec(raddec) {
    let self = this;
    let positions = {};
    let isPositioned = false;

    self.locationEngines.forEach((locationEngine) => {
      if(locationEngine.inputFilter.isPassing(raddec)) {
        let position = locationEngine.engine.estimatePosition(raddec);
        let locationEngineName = locationEngine.engine.constructor.name;

        if(position) {
          positions[locationEngineName] = position;
          isPositioned = true;
        }
      }
    });

    if(isPositioned) {
      self.chimps.positionManager.handleRaddec(raddec, positions);
    }
  }
}


module.exports = LocationEnginesManager;
