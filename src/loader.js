// GVM Loader - Entry point, idempotency guard, CSS embedding
(function() {
  'use strict';

  // Idempotency guard
  if (window.__GVM_LOADED__) {
    console.log('[GVM] Already loaded. Use the existing panel.');
    // Try to show if hidden
    var existing = document.querySelector('#gvm-root');
    if (existing) existing.style.display = '';
    return;
  }
  window.__GVM_LOADED__ = true;

  // CSS will be inlined by the build script - PLACEHOLDER
  var CSS_TEXT = '@@CSS_PLACEHOLDER@@';

  // Initialize
  window.GVM.init(CSS_TEXT);
})();
