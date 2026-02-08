// GVM.core.objectWalker - Deep recursive object traversal
(function(GVM) {
  'use strict';

  var N = GVM.natives;
  var typeChecks = GVM.utils.typeChecks;
  var safeTraverse = GVM.utils.safeTraverse;

  var objectWalker = {};

  // Skip list - property names/objects known to cause issues
  var SKIP_KEYS = {
    '__GVM_LOADED__': true,
    '__GVM__': true,
    'GVM': true,
    'chrome': true,
    'caches': true,
    'cookieStore': true,
    'serviceWorker': true,
    'localStorage': true,
    'sessionStorage': true,
    'indexedDB': true
  };

  /**
   * Walk an object tree, collecting all scannable values.
   * @param {Object} root - The root object to walk
   * @param {Function} callback - Called with (path, value, parent, key) for each scannable value
   * @param {Object} [options]
   * @param {number} [options.maxDepth=7] - Max recursion depth
   * @param {number} [options.maxResults=50000] - Stop after this many results
   */
  objectWalker.walk = function(root, callback, options) {
    options = options || {};
    var maxDepth = options.maxDepth || 7;
    var maxResults = options.maxResults || 50000;
    var visited = new N.WeakSet();
    var resultCount = 0;

    var queue = [{ obj: root, path: [], depth: 0 }];

    while (queue.length > 0 && resultCount < maxResults) {
      var item = queue.shift();
      var obj = item.obj;
      var path = item.path;
      var depth = item.depth;

      if (depth > maxDepth) continue;
      if (!obj || typeof obj !== 'object') continue;

      try {
        if (visited.has(obj)) continue;
        visited.add(obj);
      } catch (e) {
        continue;
      }

      var keys = safeTraverse.safeKeys(obj);
      // For arrays, also check indexed access
      if (N.isArray(obj)) {
        for (var ai = 0; ai < Math.min(obj.length, 1000); ai++) {
          keys.push(String(ai));
        }
        // Deduplicate
        var seen = {};
        keys = N.arrayFilter.call(keys, function(k) {
          if (seen[k]) return false;
          seen[k] = true;
          return true;
        });
      }

      for (var ki = 0; ki < keys.length && resultCount < maxResults; ki++) {
        var key = keys[ki];
        if (SKIP_KEYS[key]) continue;

        var result = safeTraverse.safeGet(obj, key);
        if (!result.ok) continue;
        var val = result.value;

        if (val === null || val === undefined) continue;

        var childPath = path.concat([key]);

        if (typeChecks.isScannable(val)) {
          callback(childPath, val, obj, key);
          resultCount++;
        } else if (typeChecks.isPlainObject(val) && depth + 1 <= maxDepth) {
          queue.push({ obj: val, path: childPath, depth: depth + 1 });
        }
      }
    }

    return resultCount;
  };

  GVM.core = GVM.core || {};
  GVM.core.objectWalker = objectWalker;

})(window.GVM = window.GVM || {});
