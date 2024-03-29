/**
 * Copyright reelyActive 2022-2023
 * We believe in an open Internet of Things
 */


const EventEmitter = require('events').EventEmitter;
const PositioningEnginesManager = require('./positioningenginesmanager');
const PositionManager = require('./positionmanager');
const RaddecManager = require('./raddecmanager');
const StoreManager = require('./storemanager');


/**
 * Chimps Class
 * Processes the spatial dynamics within context-aware physical spaces.
 */
class Chimps extends EventEmitter {

  /**
   * Chimps constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    super();
    options = options || {};

    this.interfaces = [];
    this.store = new StoreManager(options);
    this.raddecManager = new RaddecManager(this, options);
    this.positioningEnginesManager = new PositioningEnginesManager(this,
                                                                   options);
    this.positionManager = new PositionManager(this, this.store, options);

    if(options.barnowl) {
      this.barnowl = options.barnowl;
      handleBarnowlEvents(this);
    }
    if(options.barnacles) {
      this.barnacles = options.barnacles;
      handleBarnaclesEvents(this);
    }
  }

  /**
   * Add the given interface, instantiating it if required.
   * @param {Class} interfaceClass The (uninstantiated) barnacles-x interface.
   * @param {Object} interfaceOptions The interface options as a JSON object.
   */
  addInterface(interfaceClass, interfaceOptions) {
    let interfaceInstance = new interfaceClass(interfaceOptions);
    this.interfaces.push(interfaceInstance);
  }

  /**
   * Retrieve the most recent data regarding all active/specified devices.
   * @param {String} deviceId The device identifier.
   * @param {Number} deviceIdType The device identifier type.
   * @param {Array} properties The optional properties to include.
   * @param {callback} callback Function to call on completion.
   */
  retrieveDevices(deviceId, deviceIdType, properties, callback) {
    this.store.retrieveDevices(deviceId, deviceIdType, properties, callback);
  }

  /**
   * Retrieve the current context of all active/specified devices.
   * @param {Array} signatures The deviceId signatures to query.
   * @param {callback} callback Function to call on completion.
   */
  retrieveContext(signatures, callback) {
    this.store.retrieveContext(signatures, callback);
  }

  /**
   * Use the provided FeatureCollection for location.
   * @param {Object} featureCollection The GeoJSON FeatureCollection to use.
   */
  setFeatureCollection(featureCollection) {
    this.positionManager.setFeatureCollection(featureCollection);
  }

  /**
   * Use the provided associations for the positioning engines.
   * @param {Object} associations The associations by device signature.
   */
  setAssociations(associations) {
    this.positioningEnginesManager.setAssociations(associations);
  }

  /**
   * Handle an inbound raddec.
   * @param {Raddec} raddec The inbound raddec.
   */
  handleRaddec(raddec) {
    this.raddecManager.handleRaddec(raddec);
  }

  /**
   * Handle an outbound event.
   * @param {String} name The name of the event.
   * @param {Object} data The outbound event data.
   */
  handleEvent(name, data) {
    let self = this;

    switch(name) {
      case 'spatem':
        outputEvent(self, name, data);
        break;
    }
  }

}


/**
 * Handle events from barnowl.
 * @param {Barnowl} instance The Barnowl instance.
 */
function handleBarnowlEvents(instance) {
  instance.barnowl.on('raddec', (raddec) => {
    instance.raddecManager.handleRaddec(raddec);
  });
  instance.barnowl.on('infrastructureMessage', (message) => {
    // TODO: handle infrastructureMessage
  });
}


/**
 * Handle events from barnacles.
 * @param {Barnacles} instance The Barnacles instance.
 */
function handleBarnaclesEvents(instance) {
  instance.barnacles.on('raddec', (raddec) => {
    instance.raddecManager.handleRaddec(raddec);
  });
}


/**
 * Output the given event on all interfaces.
 * @param {Barnacles} instance The Barnacles instance.
 * @param {String} name The name of the event.
 * @param {Object} data The event data.
 */
function outputEvent(instance, name, data) {
  instance.emit(name, data);
  instance.interfaces.forEach((interfaceInstance) => {
    if(typeof interfaceInstance.handleEvent === 'function') {
      interfaceInstance.handleEvent(name, data);
    }
  });
}


module.exports = Chimps;
module.exports.positioningEngines = require('./positioningengines');
