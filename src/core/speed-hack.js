// GVM.core.speedHack - Time manipulation for game speed control
(function(GVM) {
  'use strict';

  var N = GVM.natives;
  var valueStore = GVM.core.valueStore;
  var speedHack = {};

  // Use cached native references as originals so we always have clean copies
  var originals = {
    setTimeout: N.setTimeout,
    setInterval: N.setInterval,
    clearTimeout: N.clearTimeout,
    clearInterval: N.clearInterval,
    requestAnimationFrame: N.requestAnimationFrame,
    cancelAnimationFrame: N.cancelAnimationFrame,
    dateNow: N.dateNow,
    perfNow: N.perfNow
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
    var realNow = originals.perfNow();
    var elapsed = realNow - baseRealTime;
    return baseFakeTime + elapsed * valueStore.getSpeedMultiplier();
  }

  speedHack.activate = function(multiplier) {
    if (active) {
      // Update multiplier without resetting time base
      baseFakeTime = getFakeTime();
      baseRealTime = originals.perfNow();
      valueStore.setSpeedMultiplier(multiplier);
      return;
    }

    baseRealTime = originals.perfNow();
    baseFakeTime = baseRealTime;
    valueStore.setSpeedMultiplier(multiplier);
    active = true;

    // Override setTimeout - NO eval, string callbacks pass through to original
    window.setTimeout = function(fn, delay) {
      if (typeof fn !== 'function') {
        // Pass string callbacks to the original unmodified (avoids eval/CSP issues)
        return originals.setTimeout.apply(null, arguments);
      }
      var args = N.arraySlice.call(arguments, 2);
      var scaledDelay = Math.max(1, Math.round((delay || 0) / valueStore.getSpeedMultiplier()));
      return originals.setTimeout(function() {
        fn.apply(null, args);
      }, scaledDelay);
    };

    // Override setInterval - NO eval, string callbacks pass through to original
    window.setInterval = function(fn, delay) {
      if (typeof fn !== 'function') {
        return originals.setInterval.apply(null, arguments);
      }
      var args = N.arraySlice.call(arguments, 2);
      var scaledDelay = Math.max(1, Math.round((delay || 0) / valueStore.getSpeedMultiplier()));
      return originals.setInterval(function() {
        fn.apply(null, args);
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
