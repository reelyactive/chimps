/**
 * Copyright reelyActive 2020-2022
 * We believe in an open Internet of Things
 */


const MapManager = require('./mapmanager');


/**
 * StoreManager Class
 * Manages the store(s) in which the real-time device data is maintained,
 * abstracting away the implementation details.
 */
class StoreManager {

  /**
   * StoreManager constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    // TODO: in future support other stores
    this.store = new MapManager(options);
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
   * Insert the given spatem.
   * @param {Object} spatem The given spatem instance.
   * @param {function} handleEvent The function to call if event is triggered.
   */
  insertSpatem(spatem, handleEvent) {
    this.store.insertSpatem(spatem, handleEvent);
  }

}


module.exports = StoreManager;
