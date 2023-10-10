/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const PositioningEngines = require('./positioningengines');
const Raddec = require('raddec');
const RaddecFilter = require('raddec-filter');


const DEFAULT_POSITIONING_ENGINES = [
  { inputFilterParameters: {}, engine: PositioningEngines.External },
  { inputFilterParameters: { acceptedEvents: [ Raddec.events.APPEARANCE,
                                               Raddec.events.DISPLACEMENT,
                                               Raddec.events.KEEPALIVE ] },
    engine: PositioningEngines.AnchorAndPull }
];
const DEFAULT_ASSOCIATIONS = new Map();


/**
 * PositioningEnginesManager Class
 * Handles the positioning engine(s).
 */
class PositioningEnginesManager {

  /**
   * PositioningEnginesManager constructor
   * @param {Chimps} chimps The chimps instance.
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(chimps, options) {
    let self = this;
    options = options || {};
    options.positioningEngines = options.positioningEngines ||
                              DEFAULT_POSITIONING_ENGINES;

    this.chimps = chimps;
    this.positioningEngines = [];
    this.associations = options.associations || DEFAULT_ASSOCIATIONS;

    options.positioningEngines.forEach((entry) => {
      self.positioningEngines.push({
        inputFilter: new RaddecFilter(entry.inputFilterParameters),
        engine: new entry.engine(entry.options)
      });
    });
  }

  /**
   * Use the provided associations for the positioning engines.
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

    self.positioningEngines.forEach((positioningEngine) => {
      if(positioningEngine.inputFilter.isPassing(raddec)) {
        let position = positioningEngine.engine.estimatePosition(raddec,
                                                            self.associations);

        if(position) {
          positions.push({
            positioningEngineName: positioningEngine.engine.constructor.name,
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


module.exports = PositioningEnginesManager;
