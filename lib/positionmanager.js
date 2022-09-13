/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const PolygonLookup = require('polygon-lookup');


const DEFAULT_FEATURE_COLLECTION = {
    type: "FeatureCollection",
    features: []
};


/**
 * PositionManager Class
 * Handles the spatial processing of position data.
 */
class PositionManager {

  /**
   * PositionManager constructor
   * @param {Chimps} chimps The chimps instance.
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(chimps, options) {
    let self = this;
    options = options || {};
    options.featureCollection = options.featureCollection ||
                                DEFAULT_FEATURE_COLLECTION;

    this.chimps = chimps;
    this.lookup = new PolygonLookup(options.featureCollection);

    if(options.chickadee) {
      setTimeout(function() { // TODO: replace "delay" hack when ESMapDB allows
        options.chickadee.onFeatureCollectionChange((featureCollection) => {
          self.lookup = new PolygonLookup(featureCollection);
        });
      }, 1000);
    }
  }

  /**
   * Handle the packets in the given raddec.
   * @param {Raddec} raddec The raddec with packets to be handled.
   */
  handleRaddec(raddec) {
    let self = this;

    if(!Array.isArray(raddec.position) || (raddec.position.length < 2)) {
      return;
    }

    let spatem;
    let x = raddec.position[0];
    let y = raddec.position[1];
    let collection = self.lookup.search(x, y, -1);

    let hasLocationFeatures = (Array.isArray(collection.features) &&
                               (collection.features.length > 0));

    if(hasLocationFeatures) {
      spatem = compileLocationSpatem(raddec, collection);
    }
    else {
      spatem = compilePositionSpatem(raddec);
    }

    self.chimps.handleEvent('spatem', spatem);
  }
}


/**
 * Compile the position spatem based on the given raddec.
 * @param {Raddec} raddec The radio decoding with position data.
 */
function compilePositionSpatem(raddec) {
  return {
      deviceId: raddec.transmitterId,
      deviceIdType: raddec.transmitterIdType,
      type: "position",
      data: {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { isDevicePosition: true },
          geometry: {
            type: "Point",
            coordinates: raddec.position
          }
        }]
      }
  };
}


/**
 * Compile the location spatem based on the given raddec & features collection.
 * @param {Raddec} raddec The radio decoding with position data.
 * @param {Object} collection The GeoJSON features collection.
 */
function compileLocationSpatem(raddec, collection) {
  let spatem = {
      deviceId: raddec.transmitterId,
      deviceIdType: raddec.transmitterIdType,
      type: "location",
      data: collection
  };
  let positionFeature = {
      type: "Feature",
      properties: { isDevicePosition: true },
      geometry: {
        type: "Point",
        coordinates: raddec.position
      }
  };

  spatem.data.features.unshift(positionFeature);

  return spatem;
}


module.exports = PositionManager;
