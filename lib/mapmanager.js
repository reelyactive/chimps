/**
 * Copyright reelyActive 2020-2022
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');
const Device = require('./device');


const DEFAULT_MAX_STORED_SPATEMS = 1;
const DEFAULT_OBSERVED_EVENTS = [ 'position', 'location' ];
const DEFAULT_HISTORY_MILLISECONDS = 5000;
const DEFAULT_PURGE_MILLISECONDS = 1000;


/**
 * MapManager Class
 * Manages a JavaScript Map instance.
 */
class MapManager {

  /**
   * MapManager constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    this.parameters = createParameters(options);
    this.store = new Map();

    removeStaleDevices(self);
  }

  /**
   * Retrieve the most recent data regarding all active/specified devices.
   * @param {String} deviceId The device identifier.
   * @param {Number} deviceIdType The device identifier type.
   * @param {Array} properties The optional properties to include.
   * @param {callback} callback Function to call on completion.
   */
  retrieveDevices(deviceId, deviceIdType, properties, callback) {
    let self = this;
    let devices = {};
    let isSpecificDevice = (deviceId && deviceIdType);
    let isSpecificProperties = Array.isArray(properties) &&
                               (properties.length > 0);

    if(isSpecificDevice) {
      let signature = deviceId + Raddec.identifiers.SIGNATURE_SEPARATOR +
                      deviceIdType;
      let isDevicePresent = self.store.has(signature);

      if(isDevicePresent) {
        let device = self.store.get(signature);

        devices[signature] = device.assemble(properties);

        return callback(devices);
      }
    }
    else {
      for(const signature of self.store.keys()) {
        if(isSpecificProperties) {
          let device = self.store.get(signature);
          devices[signature] = device.assemble(properties);
        }
        else {
          devices[signature] = {};
        }
      }

      return callback(devices);
    }

    return callback(null);
  }

  /**
   * Retrieve the most recent context regarding all active/specified devices.
   * @param {Array} signatures The deviceId signatures to query.
   * @param {callback} callback Function to call on completion.
   */
  retrieveContext(signatures, callback) {
    let self = this;
    let devices = {};
    let isAllDevices = !signatures ||
                       (Array.isArray(signatures) && (signatures.length === 0));

    if(isAllDevices) {
      self.store.forEach((device, signature) => {
        devices[signature] = device.assembleContext();
      });
    }
    else {
      signatures.forEach((signature) => {
        if(self.store.has(signature)) {
          devices[signature] = self.store.get(signature).assembleContext();
        }
      });
    }

    return callback(devices);
  }

  /**
   * Insert the given spatem.
   * @param {spatem} spatem The given spatem instance.
   * @param {function} handleEvent The function to call if event is triggered.
   */
  insertSpatem(spatem, handleEvent) {
    let self = this;
    let device;
    let signature = spatem.deviceId + Raddec.identifiers.SIGNATURE_SEPARATOR +
                    spatem.deviceIdType;
    let isDevicePresent = self.store.has(signature);

    if(isDevicePresent) {
      device = self.store.get(signature);
    }
    else {
      device = new Device(spatem.deviceId, spatem.deviceIdType,
                          self.parameters);
      self.store.set(signature, device);
    }

    device.handleSpatem(spatem, self.parameters, handleEvent);
  }

}


/**
 * Remove devices with a stale spatem timestamp.
 * @param {MapManager} instance The MapManager instance.
 */
function removeStaleDevices(instance) {
   let staleTimestamp = Date.now() - instance.parameters.historyMilliseconds;

   instance.store.forEach((device, signature) => {
     let spatem = device.assemble().spatem;
     let isStale = (!spatem || (spatem.timestamp < staleTimestamp));

     if(isStale) {
       instance.store.delete(signature);
     }
   });

   setTimeout(removeStaleDevices, DEFAULT_PURGE_MILLISECONDS, instance);
}


/**
 * Create from the given options the parameters for determining and preparing
 * events.
 * @param {Object} options The options as a JSON object.
 */
function createParameters(options) {
  let maxStoredSpatems = options.maxStoredSpatems || DEFAULT_MAX_STORED_SPATEMS;
  let observedEvents = options.observedEvents || DEFAULT_OBSERVED_EVENTS;
  let historyMilliseconds = options.historyMilliseconds ||
                            DEFAULT_HISTORY_MILLISECONDS;

  return {
      maxStoredSpatems: maxStoredSpatems,
      observedEvents: observedEvents,
      historyMilliseconds: historyMilliseconds
  };
}


module.exports = MapManager;
