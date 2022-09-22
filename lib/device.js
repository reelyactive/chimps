/**
 * Copyright reelyActive 2020-2022
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');


/**
 * Device Class
 * Represents a radio-identifiable device.
 */
class Device {

  /**
   * Device constructor
   * @param {String} deviceId The identifier of the device.
   * @param {Number} deviceIdType The identifier type of the device.
   * @param {Object} parameters The parameters as a JSON object.
   * @constructor
   */
  constructor(deviceId, deviceIdType, parameters) {
    parameters = parameters || {};

    this.deviceId = deviceId;
    this.deviceIdType = deviceIdType;
    this.spatems = [];
  }

  /**
   * Get the unique device signature based on the ID and type.
   */
  get signature() {
    return this.deviceId + Raddec.identifiers.SIGNATURE_SEPARATOR +
           this.deviceIdType;
  }

  /**
   * Assemble a standard device representation limited to the given properties,
   * if included.
   * @param {Array} properties The optional subset of properties.
   */
  assemble(properties) {
    let self = this;
    let isPropertySubset = properties && Array.isArray(properties);

    if(device.spatems.length > 0) {
      return device.spatems[0];
    }

    return null;  // TODO: empty spatem instead?
  }

  /**
   * Handle an inbound spatem.
   * @param {Object} spatem The inbound spatem.
   * @param {Object} parameters The parameters as a JSON object.
   * @param {function} handleEvent The function to call if event is triggered.
   */
  handleSpatem(spatem, parameters, handleEvent) {
    let self = this;
    parameters = parameters || {};

    let event = insertSpatem(self, spatem, parameters);

    if(event) {
      return handleEvent(event);
    }
  }

}


/**
 * Insert the given spatem, sorting if necessary to maintain ordering of the
 * spatems array by decreasing timestamp.
 * @param {Device} device The given device instance.
 * @param {Object} spatem The inbound spatem.
 * @param {Object} parameters The parameters as a JSON object.
 * @returns The spatem event, if applicable, else null
 */
function insertSpatem(device, spatem, parameters) {
  let numberOfSpatems = device.spatems.unshift(spatem);

  let isCorrectOrder = (numberOfSpatems === 1) ||
                       (device.spatems[1].timestamp <= spatem.timestamp);

  if(!isCorrectOrder) {
    device.spatems.sort((a, b) => b.timestamp - a.timestamp);
  }
  else if(numberOfSpatems === 1) {
    return spatem;
  }
  else {
    let isEvent = determineEvent(device.spatems[0], device.spatems[1],
                                 parameters);

    if(numberOfSpatems > parameters.maxStoredSpatems) {
      device.spatems.pop();
    }

    if(isEvent) {
      return spatem;
    }
  }

  return null;
}



/**
 * Determine if an event has occurred given the pair of spatems.
 * @param {Object} spatem1 The first spatem.
 * @param {Object} spatem2 The second spatem.
 * @param {Object} parameters The parameters as a JSON object.
 * @returns True if the location has changed, false otherwise.
 */
function determineEvent(spatem1, spatem2, parameters) {
  if(parameters.observedEvents.includes('position')) {
    return true; // TODO: check if position has actually changed
  }

  if(parameters.observedEvents.includes('location')) {
    let isDifferentType = (spatem1.type !== spatem2.type);
    let isDifferentCollectionSize = (spatem1.data.features.length !==
                                     spatem2.data.features.length);

    if(isDifferentType || isDifferentCollectionSize) {
      return true;
    }

    for(let index = 0; index < spatem1.data.features.length; index++) {
      let feature1 = spatem1.data.features[index];
      let feature2 = spatem2.data.features[index];
;
      if(feature1.id !== feature2.id) {
        return true;
      }
    }
  }

  return false;
}


/**
 * Remove stale data from the device.
 * @param {Device} device The given device instance.
 * @param {Object} parameters The parameters as a JSON object.
 */
function removeStaleData(device, parameters) {
  let currentTime = new Date().getTime();
  let staleTime = currentTime - parameters.historyMilliseconds;
  let isRemovalComplete = (device.spatems.length === 0);

  while(!isRemovalComplete) {
    let oldestSpatem = device.spatems[device.raddecs.length - 1];
    let isStale = (oldestSpatem.timestamp < staleTime);
    if(isStale) {
      device.spatems.pop();
    }
    isRemovalComplete = (!isStale || (device.spatems.length === 0));
  }
}


module.exports = Device;
