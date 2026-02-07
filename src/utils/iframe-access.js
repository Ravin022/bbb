// GVM.utils.iframeAccess - Enumerate accessible iframe windows
(function(GVM) {
  'use strict';

  var iframeAccess = {};

  iframeAccess.getAccessibleWindows = function() {
    var windows = [{ win: window, label: 'Main Window' }];
    var iframes = document.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
      try {
        var iframeWin = iframes[i].contentWindow;
        // Test if we can actually access it (same-origin check)
        var _test = iframeWin.document;
        windows.push({
          win: iframeWin,
          label: 'iframe[' + i + '] ' + (iframes[i].src || '').substring(0, 50)
        });
      } catch (e) {
        // Cross-origin, skip
      }
    }
    return windows;
  };

  GVM.utils = GVM.utils || {};
  GVM.utils.iframeAccess = iframeAccess;

})(window.GVM = window.GVM || {});
