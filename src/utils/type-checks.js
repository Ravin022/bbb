// GVM.utils.typeChecks - Type checking helpers
(function(GVM) {
  'use strict';

  var N = GVM.natives;
  var typeChecks = {};

  typeChecks.isNumber = function(val) {
    return typeof val === 'number' && isFinite(val);
  };

  typeChecks.isString = function(val) {
    return typeof val === 'string';
  };

  typeChecks.isBoolean = function(val) {
    return typeof val === 'boolean';
  };

  typeChecks.isScannable = function(val) {
    return typeChecks.isNumber(val) || typeChecks.isString(val) || typeChecks.isBoolean(val);
  };

  typeChecks.isPlainObject = function(val) {
    if (!val || typeof val !== 'object') return false;
    if (N.isArray(val)) return true;
    // Skip DOM nodes
    if (val.nodeType) return false;
    // Skip Window objects (but allow the root window scan)
    if (val.window === val && val.document) return false;
    // Skip typed arrays, ArrayBuffers, WebGL contexts, etc.
    var tag = N.toString.call(val);
    if (tag.indexOf('Array') > -1 && tag !== '[object Array]') return false;
    if (tag === '[object ArrayBuffer]') return false;
    if (tag === '[object WebGLRenderingContext]') return false;
    if (tag === '[object WebGL2RenderingContext]') return false;
    if (tag === '[object CanvasRenderingContext2D]') return false;
    return true;
  };

  GVM.utils = GVM.utils || {};
  GVM.utils.typeChecks = typeChecks;

})(window.GVM = window.GVM || {});
