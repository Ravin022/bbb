// GVM.core.speedHack - Time manipulation for game speed control
(function(GVM) {
  'use strict';

  var valueStore = GVM.core.valueStore;
  var speedHack = {};

  var originals = {
    setTimeout: null,
    setInterval: null,
    clearTimeout: null,
    clearInterval: null,
    requestAnimationFrame: null,
    cancelAnimationFrame: null,
    dateNow: null,
    perfNow: null
  };

  var active = false;
  var baseRealTime = 0;
  var baseFakeTime = 0;

  speedHack.isActive = function() {
    return active;
  };

  speedHack.getMultiplier = function() {
    return valueStore.getSpeedMultiplier();
  };

  function getFakeTime() {
    var realNow = originals.perfNow ? originals.perfNow.call(performance) : Date.now();
    var elapsed = realNow - baseRealTime;
    return baseFakeTime + elapsed * valueStore.getSpeedMultiplier();
  }

  speedHack.activate = function(multiplier) {
    if (active) {
      // Update multiplier without resetting time base
      baseFakeTime = getFakeTime();
      baseRealTime = originals.perfNow ? originals.perfNow.call(performance) : Date.now();
      valueStore.setSpeedMultiplier(multiplier);
      return;
    }

    // Store originals
    originals.setTimeout = window.setTimeout.bind(window);
    originals.setInterval = window.setInterval.bind(window);
    originals.clearTimeout = window.clearTimeout.bind(window);
    originals.clearInterval = window.clearInterval.bind(window);
    originals.requestAnimationFrame = window.requestAnimationFrame.bind(window);
    originals.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
    originals.dateNow = Date.now;
    originals.perfNow = performance.now.bind(performance);

    baseRealTime = originals.perfNow();
    baseFakeTime = baseRealTime;
    valueStore.setSpeedMultiplier(multiplier);
    active = true;

    // Override setTimeout
    window.setTimeout = function(fn, delay) {
      var args = Array.prototype.slice.call(arguments, 2);
      var scaledDelay = Math.max(1, Math.round((delay || 0) / valueStore.getSpeedMultiplier()));
      return originals.setTimeout(function() {
        if (typeof fn === 'function') fn.apply(null, args);
        else if (typeof fn === 'string') eval(fn);
      }, scaledDelay);
    };

    // Override setInterval
    window.setInterval = function(fn, delay) {
      var args = Array.prototype.slice.call(arguments, 2);
      var scaledDelay = Math.max(1, Math.round((delay || 0) / valueStore.getSpeedMultiplier()));
      return originals.setInterval(function() {
        if (typeof fn === 'function') fn.apply(null, args);
        else if (typeof fn === 'string') eval(fn);
      }, scaledDelay);
    };

    // Preserve clear functions
    window.clearTimeout = originals.clearTimeout;
    window.clearInterval = originals.clearInterval;

    // Override requestAnimationFrame
    window.requestAnimationFrame = function(callback) {
      return originals.requestAnimationFrame(function(realTimestamp) {
        var fakeTimestamp = baseFakeTime + (realTimestamp - baseRealTime) * valueStore.getSpeedMultiplier();
        callback(fakeTimestamp);
      });
    };
    window.cancelAnimationFrame = originals.cancelAnimationFrame;

    // Override Date.now
    Date.now = function() {
      var realNow = originals.dateNow();
      return Math.round(baseFakeTime + (realNow - baseRealTime) * valueStore.getSpeedMultiplier());
    };

    // Override performance.now
    performance.now = function() {
      var realNow = originals.perfNow();
      return baseFakeTime + (realNow - baseRealTime) * valueStore.getSpeedMultiplier();
    };
  };

  speedHack.deactivate = function() {
    if (!active) return;

    window.setTimeout = originals.setTimeout;
    window.setInterval = originals.setInterval;
    window.clearTimeout = originals.clearTimeout;
    window.clearInterval = originals.clearInterval;
    window.requestAnimationFrame = originals.requestAnimationFrame;
    window.cancelAnimationFrame = originals.cancelAnimationFrame;
    Date.now = originals.dateNow;
    performance.now = originals.perfNow;

    valueStore.setSpeedMultiplier(1.0);
    active = false;
  };

  GVM.core = GVM.core || {};
  GVM.core.speedHack = speedHack;

})(window.GVM = window.GVM || {});
