// GVM.ui.scanTab - Scan controls tab
(function(GVM) {
  'use strict';

  var scanner = GVM.core.scanner;
  var valueStore = GVM.core.valueStore;

  var scanTab = {};
  var elements = {};

  scanTab.init = function(container) {
    container.innerHTML = [
      '<div>',
      '  <div class="gvm-label">Value Type</div>',
      '  <div class="gvm-row">',
      '    <select class="gvm-select" id="gvm-value-type" style="flex:1">',
      '      <option value="number">Number</option>',
      '      <option value="string">String</option>',
      '      <option value="all">All Types</option>',
      '    </select>',
      '  </div>',
      '  <div class="gvm-label">Scan Type</div>',
      '  <div class="gvm-row">',
      '    <select class="gvm-select" id="gvm-scan-type" style="flex:1">',
      '      <option value="exact">Exact Value</option>',
      '      <option value="range">Value Range</option>',
      '      <option value="greater_than">Greater Than</option>',
      '      <option value="less_than">Less Than</option>',
      '      <option value="text">Text Search</option>',
      '      <option value="unknown">Unknown Initial Value</option>',
      '    </select>',
      '  </div>',
      '  <div id="gvm-value-row" class="gvm-row">',
      '    <input class="gvm-input" id="gvm-scan-value" placeholder="Enter value..." />',
      '  </div>',
      '  <div id="gvm-range-row" class="gvm-row" style="display:none">',
      '    <input class="gvm-input" id="gvm-range-min" placeholder="Min" style="width:50%" />',
      '    <input class="gvm-input" id="gvm-range-max" placeholder="Max" style="width:50%" />',
      '  </div>',
      '  <div id="gvm-next-scan-type-row" style="display:none">',
      '    <div class="gvm-label">Filter By</div>',
      '    <div class="gvm-row">',
      '      <select class="gvm-select" id="gvm-next-scan-type" style="flex:1">',
      '        <option value="exact">Exact Value</option>',
      '        <option value="increased">Increased</option>',
      '        <option value="decreased">Decreased</option>',
      '        <option value="changed">Changed</option>',
      '        <option value="unchanged">Unchanged</option>',
      '        <option value="greater_than">Greater Than</option>',
      '        <option value="less_than">Less Than</option>',
      '      </select>',
      '    </div>',
      '    <div id="gvm-next-value-row" class="gvm-row">',
      '      <input class="gvm-input" id="gvm-next-scan-value" placeholder="Enter value..." />',
      '    </div>',
      '  </div>',
      '  <div class="gvm-row">',
      '    <button class="gvm-btn gvm-btn-primary" id="gvm-first-scan" style="flex:1">First Scan</button>',
      '    <button class="gvm-btn gvm-btn-secondary" id="gvm-next-scan" style="flex:1" disabled>Next Scan</button>',
      '    <button class="gvm-btn gvm-btn-danger gvm-btn-sm" id="gvm-reset-scan">Reset</button>',
      '  </div>',
      '  <div class="gvm-status" id="gvm-scan-status">Ready to scan</div>',
      '</div>'
    ].join('\n');

    elements.valueType = container.querySelector('#gvm-value-type');
    elements.scanType = container.querySelector('#gvm-scan-type');
    elements.valueRow = container.querySelector('#gvm-value-row');
    elements.scanValue = container.querySelector('#gvm-scan-value');
    elements.rangeRow = container.querySelector('#gvm-range-row');
    elements.rangeMin = container.querySelector('#gvm-range-min');
    elements.rangeMax = container.querySelector('#gvm-range-max');
    elements.nextScanTypeRow = container.querySelector('#gvm-next-scan-type-row');
    elements.nextScanType = container.querySelector('#gvm-next-scan-type');
    elements.nextValueRow = container.querySelector('#gvm-next-value-row');
    elements.nextScanValue = container.querySelector('#gvm-next-scan-value');
    elements.firstScanBtn = container.querySelector('#gvm-first-scan');
    elements.nextScanBtn = container.querySelector('#gvm-next-scan');
    elements.resetBtn = container.querySelector('#gvm-reset-scan');
    elements.status = container.querySelector('#gvm-scan-status');

    // Event listeners
    elements.scanType.addEventListener('change', updateScanTypeUI);
    elements.nextScanType.addEventListener('change', updateNextScanUI);
    elements.firstScanBtn.addEventListener('click', doFirstScan);
    elements.nextScanBtn.addEventListener('click', doNextScan);
    elements.resetBtn.addEventListener('click', doReset);
  };

  function updateScanTypeUI() {
    var type = elements.scanType.value;
    elements.valueRow.style.display = (type === 'range' || type === 'unknown') ? 'none' : 'flex';
    elements.rangeRow.style.display = type === 'range' ? 'flex' : 'none';
  }

  function updateNextScanUI() {
    var type = elements.nextScanType.value;
    var needsValue = (type === 'exact' || type === 'greater_than' || type === 'less_than');
    elements.nextValueRow.style.display = needsValue ? 'flex' : 'none';
  }

  function doFirstScan() {
    var scanType = elements.scanType.value;
    var value = elements.scanValue.value;
    var options = {
      valueType: elements.valueType.value
    };

    if (scanType === 'range') {
      options.min = elements.rangeMin.value;
      options.max = elements.rangeMax.value;
    }

    elements.status.innerHTML = 'Scanning...';
    elements.firstScanBtn.disabled = true;

    // Use setTimeout to allow UI to update
    setTimeout(function() {
      try {
        var count = scanner.firstScan(scanType, value, options);
        elements.status.innerHTML = 'Found <span class="gvm-status-highlight">' + count + '</span> results';
        elements.nextScanBtn.disabled = false;
        elements.firstScanBtn.textContent = 'New Scan';
        elements.nextScanTypeRow.style.display = 'block';

        // Notify results tab
        if (GVM.ui.resultsTab && GVM.ui.resultsTab.refresh) {
          GVM.ui.resultsTab.refresh();
        }
      } catch (e) {
        elements.status.textContent = 'Error: ' + e.message;
      }
      elements.firstScanBtn.disabled = false;
    }, 50);
  }

  function doNextScan() {
    var scanType = elements.nextScanType.value;
    var value = elements.nextScanValue.value;

    elements.status.innerHTML = 'Filtering...';
    elements.nextScanBtn.disabled = true;

    setTimeout(function() {
      try {
        var count = scanner.nextScan(scanType, value, {});
        elements.status.innerHTML = 'Narrowed to <span class="gvm-status-highlight">' + count + '</span> results';

        if (GVM.ui.resultsTab && GVM.ui.resultsTab.refresh) {
          GVM.ui.resultsTab.refresh();
        }
      } catch (e) {
        elements.status.textContent = 'Error: ' + e.message;
      }
      elements.nextScanBtn.disabled = false;
    }, 50);
  }

  function doReset() {
    valueStore.clearCandidates();
    elements.firstScanBtn.textContent = 'First Scan';
    elements.nextScanBtn.disabled = true;
    elements.nextScanTypeRow.style.display = 'none';
    elements.status.textContent = 'Ready to scan';

    if (GVM.ui.resultsTab && GVM.ui.resultsTab.refresh) {
      GVM.ui.resultsTab.refresh();
    }
  }

  GVM.ui = GVM.ui || {};
  GVM.ui.scanTab = scanTab;

})(window.GVM = window.GVM || {});
