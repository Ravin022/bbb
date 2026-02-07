// GVM.ui.overlay - Main overlay panel with Shadow DOM isolation
(function(GVM) {
  'use strict';

  var overlay = {};
  var panel = null;
  var shadowRoot = null;

  overlay.init = function(cssText) {
    // Create host element
    var host = document.createElement('div');
    host.id = 'gvm-root';
    host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647;pointer-events:none;';
    document.body.appendChild(host);

    // Attach Shadow DOM
    shadowRoot = host.attachShadow({ mode: 'open' });

    // Inject styles
    var style = document.createElement('style');
    style.textContent = cssText;
    shadowRoot.appendChild(style);

    // Build panel
    panel = document.createElement('div');
    panel.className = 'gvm-panel';
    panel.style.pointerEvents = 'auto';
    panel.innerHTML = [
      '<div class="gvm-titlebar" id="gvm-titlebar">',
      '  <span class="gvm-title">GVM ENGINE</span>',
      '  <div class="gvm-title-buttons">',
      '    <button class="gvm-title-btn" id="gvm-minimize" title="Minimize">_</button>',
      '    <button class="gvm-title-btn" id="gvm-close" title="Close">X</button>',
      '  </div>',
      '</div>',
      '<div class="gvm-body">',
      '  <div class="gvm-tabs">',
      '    <button class="gvm-tab active" data-tab="scan">Scan</button>',
      '    <button class="gvm-tab" data-tab="results">Results</button>',
      '    <button class="gvm-tab" data-tab="frozen">Frozen</button>',
      '    <button class="gvm-tab" data-tab="speed">Speed</button>',
      '  </div>',
      '  <div class="gvm-tab-content active" id="gvm-tab-scan"></div>',
      '  <div class="gvm-tab-content" id="gvm-tab-results"></div>',
      '  <div class="gvm-tab-content" id="gvm-tab-frozen"></div>',
      '  <div class="gvm-tab-content" id="gvm-tab-speed"></div>',
      '</div>'
    ].join('\n');

    shadowRoot.appendChild(panel);

    // Init tabs
    setupTabs();
    setupDragging();
    setupControls();

    // Init tab contents
    GVM.ui.scanTab.init(shadowRoot.querySelector('#gvm-tab-scan'));
    GVM.ui.resultsTab.init(shadowRoot.querySelector('#gvm-tab-results'));
    GVM.ui.frozenTab.init(shadowRoot.querySelector('#gvm-tab-frozen'));
    GVM.ui.speedTab.init(shadowRoot.querySelector('#gvm-tab-speed'));

    // Start auto-refresh
    GVM.ui.resultsTab.startAutoRefresh();

    // Stop events from reaching the game
    panel.addEventListener('mousedown', function(e) { e.stopPropagation(); });
    panel.addEventListener('mouseup', function(e) { e.stopPropagation(); });
    panel.addEventListener('click', function(e) { e.stopPropagation(); });
    panel.addEventListener('keydown', function(e) { e.stopPropagation(); });
    panel.addEventListener('keyup', function(e) { e.stopPropagation(); });
    panel.addEventListener('keypress', function(e) { e.stopPropagation(); });
  };

  function setupTabs() {
    var tabs = shadowRoot.querySelectorAll('.gvm-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function() {
        var tabName = this.getAttribute('data-tab');

        // Deactivate all
        var allTabs = shadowRoot.querySelectorAll('.gvm-tab');
        for (var j = 0; j < allTabs.length; j++) {
          allTabs[j].classList.remove('active');
        }
        var allContents = shadowRoot.querySelectorAll('.gvm-tab-content');
        for (var k = 0; k < allContents.length; k++) {
          allContents[k].classList.remove('active');
        }

        // Activate selected
        this.classList.add('active');
        shadowRoot.querySelector('#gvm-tab-' + tabName).classList.add('active');

        // Refresh active tab data
        if (tabName === 'results' && GVM.ui.resultsTab.refresh) {
          GVM.ui.resultsTab.refresh();
        } else if (tabName === 'frozen' && GVM.ui.frozenTab.refresh) {
          GVM.ui.frozenTab.refresh();
        }
      });
    }
  }

  function setupDragging() {
    var titlebar = shadowRoot.querySelector('#gvm-titlebar');
    var isDragging = false;
    var startX, startY, startRight, startTop;

    titlebar.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      var rect = panel.getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startTop = rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      panel.style.right = Math.max(0, startRight - dx) + 'px';
      panel.style.top = Math.max(0, startTop + dy) + 'px';
    });

    document.addEventListener('mouseup', function() {
      isDragging = false;
    });
  }

  function setupControls() {
    shadowRoot.querySelector('#gvm-minimize').addEventListener('click', function() {
      panel.classList.toggle('minimized');
      this.textContent = panel.classList.contains('minimized') ? '+' : '_';
    });

    shadowRoot.querySelector('#gvm-close').addEventListener('click', function() {
      var host = document.querySelector('#gvm-root');
      if (host) host.remove();
      GVM.ui.resultsTab.stopAutoRefresh();
      window.__GVM_LOADED__ = false;
    });
  }

  overlay.getPanel = function() {
    return panel;
  };

  overlay.getShadowRoot = function() {
    return shadowRoot;
  };

  GVM.ui = GVM.ui || {};
  GVM.ui.overlay = overlay;

})(window.GVM = window.GVM || {});
