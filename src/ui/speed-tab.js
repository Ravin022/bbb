// GVM.ui.speedTab - Speed hack controls tab
(function(GVM) {
  'use strict';

  var speedHack = GVM.core.speedHack;
  var valueStore = GVM.core.valueStore;

  var speedTab = {};
  var container = null;
  var elements = {};

  speedTab.init = function(el) {
    container = el;

    container.innerHTML = [
      '<div>',
      '  <div class="gvm-speed-display" id="gvm-speed-value">1.0x</div>',
      '  <input type="range" class="gvm-speed-slider" id="gvm-speed-slider"',
      '    min="0.1" max="10" step="0.1" value="1" />',
      '  <div class="gvm-row" style="justify-content:space-between;font-size:11px;color:#6a6a8a">',
      '    <span>0.1x</span>',
      '    <span>1.0x</span>',
      '    <span>10x</span>',
      '  </div>',
      '  <div class="gvm-speed-presets">',
      '    <button class="gvm-btn gvm-btn-secondary gvm-btn-sm gvm-speed-preset" data-speed="0.25">0.25x</button>',
      '    <button class="gvm-btn gvm-btn-secondary gvm-btn-sm gvm-speed-preset" data-speed="0.5">0.5x</button>',
      '    <button class="gvm-btn gvm-btn-secondary gvm-btn-sm gvm-speed-preset" data-speed="1">1x</button>',
      '    <button class="gvm-btn gvm-btn-secondary gvm-btn-sm gvm-speed-preset" data-speed="2">2x</button>',
      '    <button class="gvm-btn gvm-btn-secondary gvm-btn-sm gvm-speed-preset" data-speed="3">3x</button>',
      '    <button class="gvm-btn gvm-btn-secondary gvm-btn-sm gvm-speed-preset" data-speed="5">5x</button>',
      '    <button class="gvm-btn gvm-btn-secondary gvm-btn-sm gvm-speed-preset" data-speed="10">10x</button>',
      '  </div>',
      '  <div class="gvm-row" style="margin-top:12px;justify-content:center;gap:8px">',
      '    <button class="gvm-btn gvm-btn-primary" id="gvm-speed-apply">Apply Speed</button>',
      '    <button class="gvm-btn gvm-btn-danger" id="gvm-speed-reset">Reset (1x)</button>',
      '  </div>',
      '  <div class="gvm-status" id="gvm-speed-status" style="margin-top:8px">Speed: Normal</div>',
      '  <div class="gvm-info" style="margin-top:8px">',
      '    Modifies setTimeout, setInterval, requestAnimationFrame,<br>',
      '    Date.now, and performance.now to scale game speed.',
      '  </div>',
      '</div>'
    ].join('\n');

    elements.slider = container.querySelector('#gvm-speed-slider');
    elements.display = container.querySelector('#gvm-speed-value');
    elements.applyBtn = container.querySelector('#gvm-speed-apply');
    elements.resetBtn = container.querySelector('#gvm-speed-reset');
    elements.status = container.querySelector('#gvm-speed-status');

    elements.slider.addEventListener('input', function() {
      var val = parseFloat(this.value);
      elements.display.textContent = val.toFixed(1) + 'x';
    });

    elements.applyBtn.addEventListener('click', function() {
      var multiplier = parseFloat(elements.slider.value);
      speedHack.activate(multiplier);
      elements.status.innerHTML = 'Speed: <span class="gvm-status-highlight">' + multiplier.toFixed(1) + 'x</span> (Active)';
    });

    elements.resetBtn.addEventListener('click', function() {
      speedHack.deactivate();
      elements.slider.value = 1;
      elements.display.textContent = '1.0x';
      elements.status.textContent = 'Speed: Normal';
    });

    // Presets
    var presets = container.querySelectorAll('.gvm-speed-preset');
    for (var i = 0; i < presets.length; i++) {
      presets[i].addEventListener('click', function() {
        var speed = parseFloat(this.getAttribute('data-speed'));
        elements.slider.value = speed;
        elements.display.textContent = speed.toFixed(1) + 'x';
      });
    }
  };

  GVM.ui = GVM.ui || {};
  GVM.ui.speedTab = speedTab;

})(window.GVM = window.GVM || {});
