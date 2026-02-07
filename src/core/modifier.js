// GVM.core.modifier - Value modification and freezing
(function(GVM) {
  'use strict';

  var valueStore = GVM.core.valueStore;
  var safeTraverse = GVM.utils.safeTraverse;
  var iframeAccess = GVM.utils.iframeAccess;

  var modifier = {};

  /**
   * Freeze a value - keeps it constant by polling
   */
  modifier.freeze = function(candidate, value) {
    var roots = iframeAccess.getAccessibleWindows();
    var root = roots[candidate.rootIndex];
    if (!root) return false;

    // Try Object.defineProperty first
    var parentPath = candidate.path.slice(0, -1);
    var key = candidate.path[candidate.path.length - 1];
    var parentResult = safeTraverse.getByPath(root.win, parentPath);
    var frozen = false;
    var originalDescriptor = null;
    var intervalId = null;

    if (parentResult.ok && parentResult.value) {
      var parent = parentResult.value;
      try {
        originalDescriptor = Object.getOwnPropertyDescriptor(parent, key);
        Object.defineProperty(parent, key, {
          get: function() { return value; },
          set: function() { /* blocked */ },
          configurable: true,
          enumerable: originalDescriptor ? originalDescriptor.enumerable : true
        });
        frozen = true;
      } catch (e) {
        // defineProperty failed, fall back to polling
      }
    }

    if (!frozen) {
      // Polling fallback - write value every 50ms
      intervalId = setInterval(function() {
        safeTraverse.setByPath(root.win, candidate.path, value);
      }, 50);
    }

    var entry = {
      rootIndex: candidate.rootIndex,
      path: candidate.path.slice(),
      pathStr: candidate.path.join('.'),
      value: value,
      frozen: true,
      useDefineProperty: frozen,
      originalDescriptor: originalDescriptor,
      intervalId: intervalId
    };

    valueStore.addFrozen(entry);
    return true;
  };

  /**
   * Unfreeze a value by index
   */
  modifier.unfreeze = function(index) {
    var frozenList = valueStore.getFrozen();
    var entry = frozenList[index];
    if (!entry) return false;

    if (entry.useDefineProperty && entry.originalDescriptor) {
      var roots = iframeAccess.getAccessibleWindows();
      var root = roots[entry.rootIndex];
      if (root) {
        var parentPath = entry.path.slice(0, -1);
        var key = entry.path[entry.path.length - 1];
        var parentResult = safeTraverse.getByPath(root.win, parentPath);
        if (parentResult.ok && parentResult.value) {
          try {
            Object.defineProperty(parentResult.value, key, entry.originalDescriptor);
          } catch (e) {
            // Best effort
          }
        }
      }
    }

    valueStore.removeFrozen(index);
    return true;
  };

  /**
   * Unfreeze all
   */
  modifier.unfreezeAll = function() {
    var frozenList = valueStore.getFrozen();
    // Unfreeze in reverse to keep indices valid
    for (var i = frozenList.length - 1; i >= 0; i--) {
      modifier.unfreeze(i);
    }
  };

  GVM.core = GVM.core || {};
  GVM.core.modifier = modifier;

})(window.GVM = window.GVM || {});
