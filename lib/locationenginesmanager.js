/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const LocationEngines = require('./locationengines');
const Raddec = require('raddec');
const RaddecFilter = require('raddec-filter');


const DEFAULT_LOCATION_ENGINES = [
  { inputFilterParameters: {}, engine: LocationEngines.External },
  { inputFilterParameters: { acceptedEvents: [ Raddec.events.APPEARANCE,
                                               Raddec.events.DISPLACEMENT ] },
    engine: LocationEngines.AnchorAndPull }
];
const DEFAULT_ASSOCIATIONS = new Map();


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
      self.locationEngines.push({
        inputFilter: new RaddecFilter(entry.inputFilterParameters),
        engine: new entry.engine(entry.options)
      });
    });
  }

  /**
   * Use the provided associations for the location engines.
   * @param {Map} associations The associations by device signature.
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
    let positions = [];

    self.locationEngines.forEach((locationEngine) => {
      if(locationEngine.inputFilter.isPassing(raddec)) {
        let position = locationEngine.engine.estimatePosition(raddec,
                                                            self.associations);

        if(position) {
          positions.push({
            locationEngineName: locationEngine.engine.constructor.name,
            position: position
          });
        }
      }
    });

    if(positions.length > 0) {
      self.chimps.positionManager.handleRaddec(raddec, positions);
    }
  }
}


module.exports = LocationEnginesManager;
