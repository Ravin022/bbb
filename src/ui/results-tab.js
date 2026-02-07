// GVM.ui.resultsTab - Results display and editing tab
(function(GVM) {
  'use strict';

  var scanner = GVM.core.scanner;
  var valueStore = GVM.core.valueStore;
  var modifier = GVM.core.modifier;

  var resultsTab = {};
  var container = null;
  var refreshTimer = null;
  var inputFocused = false;

  resultsTab.init = function(el) {
    container = el;
    resultsTab.refresh();
  };

  resultsTab.refresh = function() {
    if (!container) return;

    var candidates = valueStore.getCandidates();

    if (candidates.length === 0) {
      container.innerHTML = '<div class="gvm-empty">No results yet. Run a scan first.</div>';
      return;
    }

    // Refresh current values
    scanner.refreshValues();

    var maxShow = 100;
    var showing = Math.min(candidates.length, maxShow);

    var html = [
      '<div class="gvm-row" style="justify-content:space-between;margin-bottom:8px">',
      '  <span class="gvm-label" style="margin:0">Results: <span class="gvm-status-highlight">' + candidates.length + '</span>' +
        (candidates.length > maxShow ? ' (showing ' + maxShow + ')' : '') + '</span>',
      '  <div>',
      '    <button class="gvm-btn gvm-btn-secondary gvm-btn-sm" id="gvm-refresh-results">Refresh</button>',
      '    <button class="gvm-btn gvm-btn-success gvm-btn-sm" id="gvm-modify-all">Set All</button>',
      '  </div>',
      '</div>',
      '<div id="gvm-modify-all-row" class="gvm-row" style="display:none;margin-bottom:8px">',
      '  <input class="gvm-input" id="gvm-modify-all-value" placeholder="New value for all..." />',
      '  <button class="gvm-btn gvm-btn-primary gvm-btn-sm" id="gvm-modify-all-apply">Apply</button>',
      '  <button class="gvm-btn gvm-btn-secondary gvm-btn-sm" id="gvm-modify-all-cancel">Cancel</button>',
      '</div>',
      '<div class="gvm-results" id="gvm-results-list">'
    ];

    for (var i = 0; i < showing; i++) {
      var c = candidates[i];
      var pathStr = c.path.join('.');
      if (pathStr.length > 35) {
        pathStr = '...' + pathStr.substring(pathStr.length - 32);
      }
      var valStr = String(c.lastValue);
      if (valStr.length > 15) valStr = valStr.substring(0, 12) + '...';

      html.push(
        '<div class="gvm-result-item" data-index="' + i + '">',
        '  <span class="gvm-result-path" title="' + c.path.join('.') + '">' + pathStr + '</span>',
        '  <span class="gvm-result-value">' + valStr + '</span>',
        '  <input class="gvm-result-input" data-idx="' + i + '" value="' + c.lastValue + '" />',
        '  <div class="gvm-result-actions">',
        '    <button class="gvm-btn gvm-btn-primary gvm-btn-sm gvm-set-btn" data-idx="' + i + '">Set</button>',
        '    <button class="gvm-btn gvm-btn-success gvm-btn-sm gvm-freeze-btn" data-idx="' + i + '">Freeze</button>',
        '  </div>',
        '</div>'
      );
    }

    html.push('</div>');
    container.innerHTML = html.join('\n');

    // Event listeners
    container.querySelector('#gvm-refresh-results').addEventListener('click', function() {
      resultsTab.refresh();
    });

    var modifyAllBtn = container.querySelector('#gvm-modify-all');
    var modifyAllRow = container.querySelector('#gvm-modify-all-row');
    modifyAllBtn.addEventListener('click', function() {
      modifyAllRow.style.display = modifyAllRow.style.display === 'none' ? 'flex' : 'none';
    });

    var modifyAllCancel = container.querySelector('#gvm-modify-all-cancel');
    modifyAllCancel.addEventListener('click', function() {
      modifyAllRow.style.display = 'none';
    });

    var modifyAllApply = container.querySelector('#gvm-modify-all-apply');
    modifyAllApply.addEventListener('click', function() {
      var newVal = container.querySelector('#gvm-modify-all-value').value;
      for (var i = 0; i < candidates.length; i++) {
        scanner.modifyValue(i, newVal);
      }
      modifyAllRow.style.display = 'none';
      resultsTab.refresh();
    });

    // Set buttons
    var setBtns = container.querySelectorAll('.gvm-set-btn');
    for (var si = 0; si < setBtns.length; si++) {
      setBtns[si].addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        var input = container.querySelector('.gvm-result-input[data-idx="' + idx + '"]');
        if (input) {
          scanner.modifyValue(idx, input.value);
          resultsTab.refresh();
        }
      });
    }

    // Freeze buttons
    var freezeBtns = container.querySelectorAll('.gvm-freeze-btn');
    for (var fi = 0; fi < freezeBtns.length; fi++) {
      freezeBtns[fi].addEventListener('click', function() {
        var idx = parseInt(this.getAttribute('data-idx'));
        var input = container.querySelector('.gvm-result-input[data-idx="' + idx + '"]');
        var c = candidates[idx];
        if (c && input) {
          var val = input.value;
          // Convert to proper type
          if (typeof c.lastValue === 'number') val = Number(val);
          else if (typeof c.lastValue === 'boolean') val = (val === 'true');
          modifier.freeze(c, val);
          if (GVM.ui.frozenTab && GVM.ui.frozenTab.refresh) {
            GVM.ui.frozenTab.refresh();
          }
        }
      });
    }

    // Enter key on inputs triggers set, focus tracking prevents auto-refresh
    var inputs = container.querySelectorAll('.gvm-result-input');
    for (var ii = 0; ii < inputs.length; ii++) {
      inputs[ii].addEventListener('focus', function() { inputFocused = true; });
      inputs[ii].addEventListener('blur', function() { inputFocused = false; });
      inputs[ii].addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var idx = parseInt(this.getAttribute('data-idx'));
          scanner.modifyValue(idx, this.value);
          inputFocused = false;
          resultsTab.refresh();
        }
      });
    }
  };

  // Start auto-refresh timer
  resultsTab.startAutoRefresh = function() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(function() {
      if (inputFocused) return;
      if (container && valueStore.getCandidates().length > 0 &&
          valueStore.getCandidates().length <= 20) {
        resultsTab.refresh();
      }
    }, 2000);
  };

  resultsTab.stopAutoRefresh = function() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  GVM.ui = GVM.ui || {};
  GVM.ui.resultsTab = resultsTab;

})(window.GVM = window.GVM || {});
