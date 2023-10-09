/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const LocationEngines = require('./locationengines');
const RaddecFilter = require('raddec-filter');


const DEFAULT_LOCATION_ENGINES = [
  { inputFilterParameters: {}, engine: LocationEngines.External }
];
const DEFAULT_ASSOCIATIONS = {};


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
    this.associations = options.associations || DEFAULT_ASSOCIATIONS;

    options.locationEngines.forEach((entry) => {
      entry.options = entry.options || {};
      entry.options.associations = self.associations;

      self.locationEngines.push({
        inputFilter: new RaddecFilter(entry.inputFilterParameters),
        engine: new entry.engine(entry.options)
      });
    });
  }

  /**
   * Use the provided associations for the location engines.
   * @param {Object} associations The associations by device signature.
   */
  setAssociations(associations) {
    this.associations = associations;
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
