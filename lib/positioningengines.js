/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');


/**
 * External Class
 * External positioning engine (just pass along existing position).
 */
class External {

  /**
   * External constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};
  }

  /**
   * Estimate the position of the given raddec.
   * @param {Raddec} raddec The raddec to be handled.
   */
  estimatePosition(raddec) {
    let self = this;

    return raddec.position;
  }

}


/**
 * AnchorAndPull Class
 * Anchor-and-pull positioning engine.
 */
class AnchorAndPull {

  /**
   * AnchorAndPull constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    this.minReceivers = options.minReceivers || 2;
    this.maxReceivers = options.maxReceivers || 5;
    this.pullFactor = options.pullFactor || 2;
  }

  /**
   * Estimate the position of the given raddec.
   * @param {Raddec} raddec The raddec to be handled.
   * @param {Map} associations The associations by device signature.
   */
  estimatePosition(raddec, associations) {
    let self = this;
    let positionedDecodings = compilePositionedDecodings(raddec, associations);

    if(positionedDecodings.length >= self.minReceivers) {
      let anchor = positionedDecodings[0];
      let estimatedPosition = [...anchor.position];
      let numberOfPulls = Math.min(positionedDecodings.length,
                                   self.maxReceivers);

      for(let cPull = 1; cPull < numberOfPulls; cPull++) {
        let pull = positionedDecodings[cPull];
        let deltaRssi = anchor.rssi - pull.rssi;
        let pullRatio = (deltaRssi === 0) ? 1 :
                                       1 / ((deltaRssi / self.pullFactor) + 2);
        let deltaPosition = [ pull.position[0] - anchor.position[0],
                              pull.position[1] - anchor.position[1] ];
        if((anchor.position.length === 3) && (pull.position.length === 3)) {
          deltaPosition.push(pull.position[2] - anchor.position[2]);
        }
        deltaPosition.forEach((delta, index) => {
          estimatedPosition[index] += (pullRatio * delta);
        });
      }

      return estimatedPosition;
    }

    return null;
  }

}


/**
 * Compile an array of positioned decodings, comprising position and rssi pairs.
 * @param {Raddec} raddec The radio decoding.
 * @param {Map} associations The associations by device signature.
 */
function compilePositionedDecodings(raddec, associations) {
  let positionedDecodings = [];

  if(Array.isArray(raddec.rssiSignature)) {
    for(let index = 0; index < raddec.rssiSignature.length; index++) {
      let entry = raddec.rssiSignature[index];
      let receiverSignature = entry.receiverId +
                              Raddec.identifiers.SIGNATURE_SEPARATOR +
                              entry.receiverIdType;

      if(!associations.has(receiverSignature)) {
        return positionedDecodings;
      }
      let position = associations.get(receiverSignature).position;
      if(!isValidPosition(position)) {
        return positionedDecodings;
      }

      positionedDecodings.push({ position: position, rssi: entry.rssi });
    }
  }

  return positionedDecodings;
}


/**
 * Determine if the given position is valid.
 * @param {Array} position The position to validate.
 */
function isValidPosition(position) {
  return Array.isArray(position) && (position.length >= 2);
}


module.exports.External = External;
module.exports.AnchorAndPull = AnchorAndPull;
