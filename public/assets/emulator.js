/* /emulator/ - keypad + screen stand-in.
   Ported from the v1 mockup's demo.html (public/mockup/, deleted). Same evaluator, same
   key map; only the frame around it changed.
   TODO when the WASM bundle exists: replace evaluate() with the module call and load
   out/wasm/numos.js instead. The screen element and the keypad contract stay as they are. */

(function () {
  'use strict';

  /* S3.7: /emulator/?app=<slug> comes from the Apps cell on the landing page. */
  var APP_NAMES = {
    'calculation': 'Calculation', 'grapher': 'Grapher', 'equations': 'Equations',
    'integral': 'Integral', 'calculus': 'Calculus', 'matrices': 'Matrices',
    'statistics': 'Statistics', 'probability': 'Probability', 'regression': 'Regression',
    'sequences': 'Sequences', 'periodic-table': 'Periodic table', 'chemistry': 'Chem',
    'notes': 'Notes', 'tutor': 'Tutor', 'ai': 'AI', 'python': 'Python',
    'neo-language': 'Neo language', 'neural-lab': 'Neural lab', 'optics-lab': 'Optics lab',
    'particle-lab': 'Particle lab', 'fluid-2d': 'Fluid 2D', 'fractal': 'Fractal',
    'circuit-core': 'Circuit', 'bridge-designer': 'Bridge designer', 'game-boy': 'Game Boy',
    'settings': 'Settings'
  };

  /* EM.9 - every string the screen can print. */
  var S = {
    idle: 'Canvas 320 x 156.',
    cleared: 'Cleared.',
    evaluated: 'Evaluated locally. On the device this goes to the CAS.',
    syntax: 'Syntax error. Check the brackets.',
    unsupported: 'That expression is not handled by the stand-in evaluator.',
    infinite: 'Result is not a finite number.',
    notBuilt: function (k) { return 'Not built in the stand-in: ' + k.toUpperCase() + '.'; }
  };

  var exprEl = document.getElementById('expr');
  var resEl = document.getElementById('res');
  var statEl = document.getElementById('status');
  var modeEl = document.getElementById('modes');

  /* the app banner: shown only when ?app= is a slug we know */
  var params = new URLSearchParams(window.location.search);
  var slug = (params.get('app') || '').toLowerCase();
  var banner = document.getElementById('app-banner');
  if (banner && slug && APP_NAMES[slug]) {
    document.getElementById('app-name').textContent = APP_NAMES[slug];
    banner.classList.remove('hidden');
    document.title = APP_NAMES[slug] + ' - Emulator / NumOS';
  }

  var tokens = [];   // [{d: display, j: javascript}]
  var ans = 0;
  var pending = '';
  var boot = true;   // the screen boots with something on it; the first key starts a fresh entry

  function add(d, j) { tokens.push({ d: d, j: (j === undefined ? d : j) }); render(); }

  var ACTIONS = {
    ac: function () { tokens = []; ans = 0; pending = S.cleared; render(); },
    del: function () { tokens.pop(); pending = ''; statEl.textContent = S.idle; render(); },
    lp: function () { add('('); },
    rp: function () { add(')'); },
    pi: function () { add('pi', 'Math.PI'); },
    e: function () { add('e', 'Math.E'); },
    dot: function () { add('.'); },
    add: function () { add('+'); },
    sub: function () { add('-'); },
    mul: function () { add('*'); },
    div: function () { add('/'); },
    pow: function () { add('^', '**'); },
    sq: function () { add('^2', '**2'); },
    sqrt: function () { add('sqrt(', 'Math.sqrt('); },
    sin: function () { add('sin(', 'Math.sin('); },
    cos: function () { add('cos(', 'Math.cos('); },
    tan: function () { add('tan(', 'Math.tan('); },
    log: function () { add('log(', 'Math.log10('); },
    ln: function () { add('ln(', 'Math.log('); },
    inv: function () { tokens = [{ d: '1/(', j: '1/(' }].concat(tokens, [{ d: ')', j: ')' }]); render(); },
    ans: function () { add('Ans', String(ans)); },
    neg: function () {
      if (tokens.length && tokens[0].d === '-') { tokens.shift(); } else { tokens.unshift({ d: '-', j: '-' }); }
      render();
    },
    eq: function () { evaluate(); },
    comma: function () { add(','); render(); }
  };

  /* EM.9: SHIFT, ALPHA, MODE, ON, nCr, x!, M+ and S-D are not implemented in the stand-in. */
  var NOT_BUILT = ['shift', 'alpha', 'mode', 'on', 'ncr', 'fact', 'mplus', 'sd'];

  function render() {
    var d = tokens.map(function (t) { return t.d; }).join('');
    exprEl.innerHTML = d ? escapeHtml(d) : '&nbsp;';
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function evaluate() {
    var js = tokens.map(function (t) { return t.j; }).join('');
    if (!js) { return; }
    var leftover = js.replace(/Math\.[A-Za-z0-9]+/g, '');
    if (!/^[0-9+\-*/().\s]*$/.test(leftover)) { statEl.textContent = S.unsupported; return; }
    var value;
    try {
      value = Function('"use strict";return (' + js + ');')();
    } catch (err) { statEl.textContent = S.syntax; return; }
    if (typeof value !== 'number' || !isFinite(value)) { statEl.textContent = S.infinite; return; }
    ans = value;
    resEl.textContent = format(value);
    statEl.textContent = S.evaluated;
    modeEl.textContent = 'READY';
  }

  function format(n) {
    var r = Math.round(n * 1e10) / 1e10;
    if (Math.abs(r) >= 1e10 || (Math.abs(r) < 1e-6 && r !== 0)) { return r.toExponential(6); }
    return String(r);
  }

  function press(key) {
    if (boot && key !== 'ac' && key !== 'del') { tokens = []; pending = ''; boot = false; }
    if (ACTIONS[key]) { ACTIONS[key](); return; }
    if (/^[0-9]$/.test(key)) { add(key); return; }
    if (NOT_BUILT.indexOf(key) !== -1) {
      pending = S.notBuilt(key);
      statEl.textContent = pending;
      modeEl.textContent = key.toUpperCase();
      return;
    }
  }

  document.getElementById('pad').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-k]');
    if (b) { press(b.getAttribute('data-k')); }
  });

  var KEYS = {
    'Enter': 'eq', '=': 'eq', 'Backspace': 'del', 'Delete': 'ac', 'Escape': 'ac',
    '*': 'mul', '/': 'div', '-': 'sub', '+': 'add', '.': 'dot', '(': 'lp', ')': 'rp', '^': 'pow'
  };
  document.addEventListener('keydown', function (ev) {
    var k = ev.key;
    if (/^[0-9]$/.test(k)) { press(k); ev.preventDefault(); return; }
    if (KEYS[k]) { press(KEYS[k]); ev.preventDefault(); }
  });

  /* EM.4 / EM.5 / EM.6: the screen boots with something on it, so a first-time visitor sees the
     canvas working. The first key press clears it (same as a fresh entry after ON). */
  tokens = [{ d: '2', j: '2' }, { d: '+', j: '+' }, { d: '2', j: '2' }, { d: '*', j: '*' }, { d: '2', j: '2' }];
  resEl.textContent = '6';
  ans = 6;
  render();
  statEl.textContent = S.idle;
})();
