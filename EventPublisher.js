(function(context) {
  "use strict";

  context.EventPublisher = context.EventPublisher || function() {
    this.listeners = {};
  };

  context.EventPublisher.prototype.addEventListener = function(event,
    listener) {
    if (this.listeners[event] === undefined) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  };

  context.EventPublisher.prototype.notifyAll = function(event, data) {
    for (let i = 0; i < this.listeners[event].length; i++) {
      this.listeners[event][i]({
        target: this,
        data: data,
      });
    }
  };

}(window));
