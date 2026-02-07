// GVM.ui.frozenTab - Frozen values management tab
(function(GVM) {
  'use strict';

  var valueStore = GVM.core.valueStore;
  var modifier = GVM.core.modifier;

  var frozenTab = {};
  var container = null;

  frozenTab.init = function(el) {
    container = el;
    frozenTab.refresh();
  };

  frozenTab.refresh = function() {
    if (!container) return;

    var frozen = valueStore.getFrozen();

    if (frozen.length === 0) {
      container.innerHTML = [
        '<div class="gvm-empty">',
        '  No frozen values.<br>',
        '  Use the Freeze button in Results to lock a value.',
        '</div>'
      ].join('\n');
      return;
    }

    var html = [
      '<div class="gvm-row" style="justify-content:space-between;margin-bottom:8px">',
      '  <span class="gvm-label" style="margin:0">Frozen: <span class="gvm-status-highlight">' + frozen.length + '</span></span>',
      '  <button class="gvm-btn gvm-btn-danger gvm-btn-sm" id="gvm-unfreeze-all">Unfreeze All</button>',
      '</div>'
    ];

    for (var i = 0; i < frozen.length; i++) {
      var f = frozen[i];
      var pathStr = f.pathStr;
      if (pathStr.length > 30) {
        pathStr = '...' + pathStr.substring(pathStr.length - 27);
      }

      html.push(
        '<div class="gvm-frozen-item">',
        '  <span class="gvm-frozen-badge">FROZEN</span>',
        '  <span class="gvm-frozen-path" title="' + f.pathStr + '">' + pathStr + '</span>',
        '  <span class="gvm-frozen-value">' + f.value + '</span>',
        '  <button class="gvm-btn gvm-btn-danger gvm-btn-sm gvm-unfreeze-btn" data-idx="' + i + '">Unfreeze</button>',
        '</div>'
      );
    }

    container.innerHTML = html.join('\n');

    // Unfreeze all
    var unfreezeAllBtn = container.querySelector('#gvm-unfreeze-all');
    if (unfreezeAllBtn) {
      unfreezeAllBtn.addEventListener('click', function() {
        modifier.unfreezeAll();
        frozenTab.refresh();
      });
    }

    // Individual unfreeze
    var unfreezeBtns = container.querySelectorAll('.gvm-unfreeze-btn');
    for (var ui = 0; ui < unfreezeBtns.length; ui++) {
      unfreezeBtns[ui].addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        modifier.unfreeze(idx);
        frozenTab.refresh();
      });
    }
  };

  GVM.ui = GVM.ui || {};
  GVM.ui.frozenTab = frozenTab;

})(window.GVM = window.GVM || {});
