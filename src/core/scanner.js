// GVM.core.scanner - Value scanning engine
(function(GVM) {
  'use strict';

  var objectWalker = GVM.core.objectWalker;
  var valueStore = GVM.core.valueStore;
  var safeTraverse = GVM.utils.safeTraverse;
  var iframeAccess = GVM.utils.iframeAccess;
  var typeChecks = GVM.utils.typeChecks;

  var scanner = {};

  // Scan types
  scanner.SCAN_EXACT = 'exact';
  scanner.SCAN_RANGE = 'range';
  scanner.SCAN_UNKNOWN = 'unknown';
  scanner.SCAN_INCREASED = 'increased';
  scanner.SCAN_DECREASED = 'decreased';
  scanner.SCAN_CHANGED = 'changed';
  scanner.SCAN_UNCHANGED = 'unchanged';
  scanner.SCAN_GREATER_THAN = 'greater_than';
  scanner.SCAN_LESS_THAN = 'less_than';
  scanner.SCAN_TEXT = 'text';

  // Value types to scan for
  scanner.TYPE_NUMBER = 'number';
  scanner.TYPE_STRING = 'string';
  scanner.TYPE_ALL = 'all';

  // Get all root windows to scan
  scanner.getRoots = function() {
    return iframeAccess.getAccessibleWindows();
  };

  /**
   * First scan - searches all accessible objects for matching values
   */
  scanner.firstScan = function(scanType, value, options) {
    options = options || {};
    var valueType = options.valueType || scanner.TYPE_NUMBER;
    var candidates = [];
    var roots = scanner.getRoots();

    var matchFn = scanner._buildMatchFn(scanType, value, options);

    for (var ri = 0; ri < roots.length; ri++) {
      var rootWin = roots[ri].win;
      objectWalker.walk(rootWin, function(path, val, parent, key) {
        // Type filter
        if (valueType === scanner.TYPE_NUMBER && !typeChecks.isNumber(val)) return;
        if (valueType === scanner.TYPE_STRING && !typeChecks.isString(val)) return;

        if (matchFn(val)) {
          candidates.push({
            rootIndex: ri,
            rootLabel: roots[ri].label,
            path: path,
            lastValue: val
          });
        }
      }, { maxDepth: options.maxDepth || 7 });
    }

    valueStore.setCandidates(candidates);
    valueStore.incrementScanCount();
    return candidates.length;
  };

  /**
   * Next scan - filters existing candidates
   */
  scanner.nextScan = function(scanType, value, options) {
    options = options || {};
    var candidates = valueStore.getCandidates();
    var roots = scanner.getRoots();
    var matchFn = scanner._buildMatchFn(scanType, value, options);
    var surviving = [];

    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      var root = roots[c.rootIndex];
      if (!root) continue;

      var result = safeTraverse.getByPath(root.win, c.path);
      if (!result.ok) continue;

      var currentVal = result.value;
      var matched = false;

      switch (scanType) {
        case scanner.SCAN_INCREASED:
          matched = typeChecks.isNumber(currentVal) && currentVal > c.lastValue;
          break;
        case scanner.SCAN_DECREASED:
          matched = typeChecks.isNumber(currentVal) && currentVal < c.lastValue;
          break;
        case scanner.SCAN_CHANGED:
          matched = currentVal !== c.lastValue;
          break;
        case scanner.SCAN_UNCHANGED:
          matched = currentVal === c.lastValue;
          break;
        default:
          matched = matchFn(currentVal);
          break;
      }

      if (matched) {
        c.lastValue = currentVal;
        surviving.push(c);
      }
    }

    valueStore.setCandidates(surviving);
    valueStore.incrementScanCount();
    return surviving.length;
  };

  /**
   * Modify a candidate's value
   */
  scanner.modifyValue = function(candidateIndex, newValue) {
    var candidates = valueStore.getCandidates();
    var c = candidates[candidateIndex];
    if (!c) return false;

    var roots = scanner.getRoots();
    var root = roots[c.rootIndex];
    if (!root) return false;

    // Convert to appropriate type
    var typedValue = newValue;
    if (typeChecks.isNumber(c.lastValue)) {
      typedValue = Number(newValue);
      if (isNaN(typedValue)) return false;
    } else if (typeChecks.isBoolean(c.lastValue)) {
      typedValue = newValue === 'true' || newValue === true;
    }

    var success = safeTraverse.setByPath(root.win, c.path, typedValue);
    if (success) {
      c.lastValue = typedValue;
    }
    return success;
  };

  /**
   * Refresh current values of all candidates
   */
  scanner.refreshValues = function() {
    var candidates = valueStore.getCandidates();
    var roots = scanner.getRoots();

    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      var root = roots[c.rootIndex];
      if (!root) continue;
      var result = safeTraverse.getByPath(root.win, c.path);
      if (result.ok) {
        c.lastValue = result.value;
      }
    }
  };

  // Build a match function for the given scan type
  scanner._buildMatchFn = function(scanType, value, options) {
    switch (scanType) {
      case scanner.SCAN_EXACT:
        var numVal = Number(value);
        return function(v) {
          if (typeChecks.isNumber(v)) return v === numVal;
          if (typeChecks.isString(v)) return v === String(value);
          if (typeChecks.isBoolean(v)) return v === (value === 'true' || value === true);
          return false;
        };
      case scanner.SCAN_RANGE:
        var min = Number(options.min || 0);
        var max = Number(options.max || 0);
        return function(v) {
          return typeChecks.isNumber(v) && v >= min && v <= max;
        };
      case scanner.SCAN_GREATER_THAN:
        var gt = Number(value);
        return function(v) {
          return typeChecks.isNumber(v) && v > gt;
        };
      case scanner.SCAN_LESS_THAN:
        var lt = Number(value);
        return function(v) {
          return typeChecks.isNumber(v) && v < lt;
        };
      case scanner.SCAN_TEXT:
        var searchStr = String(value).toLowerCase();
        return function(v) {
          return typeChecks.isString(v) && v.toLowerCase().indexOf(searchStr) > -1;
        };
      case scanner.SCAN_UNKNOWN:
      default:
        return function() { return true; };
    }
  };

  GVM.core = GVM.core || {};
  GVM.core.scanner = scanner;

})(window.GVM = window.GVM || {});
