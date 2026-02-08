// GVM.natives - Cache native function references before page scripts can tamper with them
// This MUST be the first module loaded
(function(GVM) {
  'use strict';

  var natives = {};

  // Object methods
  natives.defineProperty = Object.defineProperty;
  natives.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  natives.keys = Object.keys;
  natives.freeze = Object.freeze;
  natives.isFrozen = Object.isFrozen;
  natives.isSealed = Object.isSealed;
  natives.getPrototypeOf = Object.getPrototypeOf;
  natives.hasOwnProperty = Object.prototype.hasOwnProperty;
  natives.toString = Object.prototype.toString;

  // Array methods
  natives.isArray = Array.isArray;
  natives.arraySlice = Array.prototype.slice;
  natives.arrayFilter = Array.prototype.filter;
  natives.arrayForEach = Array.prototype.forEach;

  // DOM methods - cached from prototypes so they can't be overridden per-instance
  natives.createElement = document.createElement.bind(document);
  natives.createTextNode = document.createTextNode.bind(document);
  natives.querySelector = document.querySelector.bind(document);
  natives.querySelectorAll = document.querySelectorAll.bind(document);
  natives.getElementById = document.getElementById.bind(document);
  natives.bodyAppendChild = function(el) {
    return HTMLElement.prototype.appendChild.call(document.body, el);
  };
  natives.appendChild = function(parent, child) {
    return HTMLElement.prototype.appendChild.call(parent, child);
  };
  natives.removeChild = function(parent, child) {
    return HTMLElement.prototype.removeChild.call(parent, child);
  };
  natives.remove = function(el) {
    if (el && el.parentNode) {
      HTMLElement.prototype.removeChild.call(el.parentNode, el);
    }
  };
  natives.attachShadow = function(el, opts) {
    return Element.prototype.attachShadow.call(el, opts);
  };
  natives.setAttribute = function(el, name, value) {
    return Element.prototype.setAttribute.call(el, name, value);
  };
  natives.getAttribute = function(el, name) {
    return Element.prototype.getAttribute.call(el, name);
  };
  natives.addEventListener = function(target, type, fn, opts) {
    return EventTarget.prototype.addEventListener.call(target, type, fn, opts);
  };
  natives.querySelectorOn = function(el, selector) {
    return Element.prototype.querySelectorAll.call(el, selector);
  };
  natives.querySelectorOneOn = function(el, selector) {
    return Element.prototype.querySelector.call(el, selector);
  };

  // Timer functions
  natives.setTimeout = window.setTimeout.bind(window);
  natives.setInterval = window.setInterval.bind(window);
  natives.clearTimeout = window.clearTimeout.bind(window);
  natives.clearInterval = window.clearInterval.bind(window);
  natives.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  natives.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);

  // Time functions
  natives.dateNow = Date.now;
  natives.perfNow = performance.now.bind(performance);

  // WeakSet/WeakMap
  natives.WeakSet = WeakSet;
  natives.WeakMap = WeakMap;

  // Console
  natives.consoleLog = console.log.bind(console);
  natives.consoleError = console.error.bind(console);

  // Safe innerHTML setter that handles Trusted Types
  natives._trustedPolicy = null;
  natives._trustedPolicyInit = false;

  natives.setInnerHTML = function(el, html) {
    // Try Trusted Types if available and required
    if (!natives._trustedPolicyInit) {
      natives._trustedPolicyInit = true;
      try {
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
          natives._trustedPolicy = window.trustedTypes.createPolicy('gvm-engine', {
            createHTML: function(s) { return s; }
          });
        }
      } catch (e) {
        // Trusted Types policy creation failed, fall back
      }
    }

    try {
      if (natives._trustedPolicy) {
        el.innerHTML = natives._trustedPolicy.createHTML(html);
      } else {
        el.innerHTML = html;
      }
    } catch (e) {
      // Final fallback: build via DOM parsing
      try {
        var template = natives.createElement('template');
        template.innerHTML = html;
        while (el.firstChild) el.removeChild(el.firstChild);
        natives.appendChild(el, template.content.cloneNode(true));
      } catch (e2) {
        // Last resort: textContent (loses HTML formatting)
        el.textContent = html.replace(/<[^>]*>/g, '');
      }
    }
  };

  GVM.natives = natives;

})(window.GVM = window.GVM || {});
