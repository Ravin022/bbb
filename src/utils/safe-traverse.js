// GVM.utils.safeTraverse - Safe property access wrappers
(function(GVM) {
  'use strict';

  var safeTraverse = {};

  safeTraverse.safeGet = function(obj, key) {
    try {
      return { value: obj[key], ok: true };
    } catch (e) {
      return { value: undefined, ok: false };
    }
  };

  safeTraverse.safeSet = function(obj, key, value) {
    try {
      obj[key] = value;
      return true;
    } catch (e) {
      return false;
    }
  };

  safeTraverse.safeKeys = function(obj) {
    try {
      return Object.keys(obj);
    } catch (e) {
      return [];
    }
  };

  safeTraverse.getByPath = function(root, pathArray) {
    var current = root;
    for (var i = 0; i < pathArray.length; i++) {
      var result = safeTraverse.safeGet(current, pathArray[i]);
      if (!result.ok) return { value: undefined, ok: false };
      current = result.value;
    }
    return { value: current, ok: true };
  };

  safeTraverse.setByPath = function(root, pathArray, value) {
    if (pathArray.length === 0) return false;
    var current = root;
    for (var i = 0; i < pathArray.length - 1; i++) {
      var result = safeTraverse.safeGet(current, pathArray[i]);
      if (!result.ok || !result.value || typeof result.value !== 'object') return false;
      current = result.value;
    }
    return safeTraverse.safeSet(current, pathArray[pathArray.length - 1], value);
  };

  GVM.utils = GVM.utils || {};
  GVM.utils.safeTraverse = safeTraverse;

})(window.GVM = window.GVM || {});
