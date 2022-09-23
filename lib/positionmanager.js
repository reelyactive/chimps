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
   * @param {StoreManager} store The data store interface.
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(chimps, store, options) {
    let self = this;
    options = options || {};
    options.featureCollection = options.featureCollection ||
                                DEFAULT_FEATURE_COLLECTION;

    this.chimps = chimps;
    this.store = store;
    this.lookup = new PolygonLookup(options.featureCollection);
  }

  /**
   * Use the provided FeatureCollection for location.
   * @param {Object} featureCollection The GeoJSON FeatureCollection to use.
   */
  setFeatureCollection(featureCollection) {
    // TODO: instead use this.lookup.loadFeatureCollection()?
    this.lookup = new PolygonLookup(featureCollection);
  }

  /**
   * Handle the position in the given raddec.
   * @param {Raddec} raddec The raddec with position to be handled.
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

    self.store.insertSpatem(spatem, (spatem) => {
      self.chimps.handleEvent('spatem', spatem);
    });
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
      },
      timestamp: raddec.initialTime
  };
}


/**
 * Compile the location spatem based on the given raddec & features collection.
 * @param {Raddec} raddec The radio decoding with position data.
 * @param {Object} collection The GeoJSON features collection.
 */
function compileLocationSpatem(raddec, collection) {
  let is3DPosition = (raddec.position.length === 3);
  let trimmedCollection;

  if(is3DPosition) {
    let z = raddec.position[2];
    trimmedCollection = { type: "FeatureCollection", features: [] };

    collection.features.forEach(feature => {
      if(feature.properties.elevation && feature.properties.height) {
        if((z >= feature.properties.elevation) &&
           (z <= feature.properties.elevation + feature.properties.height)) {
          trimmedCollection.features.push(feature); // Within elevation & height
        }
      }
      else if(feature.properties.elevation) {
        if(z >= feature.properties.elevation) {
          trimmedCollection.features.push(feature); // At or above elevation
        }
      }
      else {
        trimmedCollection.features.push(feature);   // No elevation specified
      }
    });

    // TODO: sort based on proximity of z and elevation?
  }
  else {
    trimmedCollection = collection;
  }

  let spatem = {
      deviceId: raddec.transmitterId,
      deviceIdType: raddec.transmitterIdType,
      type: "location",
      data: trimmedCollection,
      timestamp: raddec.initialTime
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
