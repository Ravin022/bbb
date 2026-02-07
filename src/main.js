// GVM Main - Initializes all modules and mounts UI
(function(GVM) {
  'use strict';

  GVM.init = function(cssText) {
    GVM.ui.overlay.init(cssText);
    console.log('[GVM] Game Value Modifier loaded successfully.');
    console.log('[GVM] Use the overlay panel to scan and modify game values.');
  };

})(window.GVM = window.GVM || {});
