// GVM.core.valueStore - Tracks scan candidates and state
(function(GVM) {
  'use strict';

  var valueStore = {};

  // State
  var state = {
    candidates: [],       // Array of { rootIndex, path, lastValue }
    frozen: [],            // Array of { rootIndex, path, value, intervalId, originalDescriptor }
    scanCount: 0,
    speedMultiplier: 1.0
  };

  valueStore.getState = function() {
    return state;
  };

  valueStore.getCandidates = function() {
    return state.candidates;
  };

  valueStore.setCandidates = function(candidates) {
    state.candidates = candidates;
  };

  valueStore.clearCandidates = function() {
    state.candidates = [];
    state.scanCount = 0;
  };

  valueStore.getScanCount = function() {
    return state.scanCount;
  };

  valueStore.incrementScanCount = function() {
    state.scanCount++;
  };

  // Frozen values management
  valueStore.getFrozen = function() {
    return state.frozen;
  };

  valueStore.addFrozen = function(entry) {
    state.frozen.push(entry);
  };

  valueStore.removeFrozen = function(index) {
    var entry = state.frozen[index];
    if (entry && entry.intervalId) {
      clearInterval(entry.intervalId);
    }
    state.frozen.splice(index, 1);
  };

  valueStore.clearFrozen = function() {
    for (var i = 0; i < state.frozen.length; i++) {
      if (state.frozen[i].intervalId) {
        clearInterval(state.frozen[i].intervalId);
      }
    }
    state.frozen = [];
  };

  // Speed
  valueStore.getSpeedMultiplier = function() {
    return state.speedMultiplier;
  };

  valueStore.setSpeedMultiplier = function(val) {
    state.speedMultiplier = val;
  };

  GVM.core = GVM.core || {};
  GVM.core.valueStore = valueStore;

})(window.GVM = window.GVM || {});
