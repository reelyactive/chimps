/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const EventEmitter = require('events').EventEmitter;


/**
 * Chimps Class
 * Processes the spatial dynamics within context-aware physical spaces.
 */
class Chimps extends EventEmitter {

  /**
   * Chipms constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    super();
    options = options || {};

    this.interfaces = [];

    if(options.barnowl) {
      this.barnowl = options.barnowl;
      handleBarnowlEvents(this);
    }

    if(options.chickadee) {
      this.chickadee = options.chickadee;
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
   * Handle an inbound raddec.
   * @param {Raddec} raddec The inbound raddec.
   */
  handleRaddec(raddec) {
    // TODO: handle raddec
  }

}


/**
 * Handle events from barnowl.
 * @param {Barnacles} instance The Barnacles instance.
 */
function handleBarnowlEvents(instance) {
  instance.barnowl.on('raddec', function(raddec) {
    // TODO: handle raddec
  });
  instance.barnowl.on('infrastructureMessage', function(message) {
    // TODO: handle infrastructureMessage
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
  instance.interfaces.forEach(function(interfaceInstance) {
    if(typeof interfaceInstance.handleEvent === 'function') {
      interfaceInstance.handleEvent(name, data);
    }
  });
}


module.exports = Chimps;