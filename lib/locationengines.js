/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


/**
 * External Class
 * External location engine (just pass along existing position).
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
 * Anchor-and-pull location engine.
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
  }

  /**
   * Estimate the position of the given raddec.
   * @param {Raddec} raddec The raddec to be handled.
   */
  estimatePosition(raddec) {
    let self = this;

    return []; // TODO: estimate the position
  }

}


module.exports.External = External;
module.exports.AnchorAndPull = AnchorAndPull;