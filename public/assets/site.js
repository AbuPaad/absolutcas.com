/* absolutcas.com: site interactivity & waitlist handling */

(function () {
  'use strict';

  /* ---------- Theme Toggle ---------- */
  var root = document.documentElement;
  var btn = document.getElementById('theme-btn');
  var saved = null;
  try { saved = localStorage.getItem('acas-theme'); } catch (e) { saved = null; }
  if (saved === 'dark' || saved === 'light') { root.setAttribute('data-theme', saved); }

  function updateThemeLabel() {
    if (!btn) return;
    btn.textContent = root.getAttribute('data-theme') === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
  if (btn) {
    updateThemeLabel();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('acas-theme', next); } catch (e) {}
      updateThemeLabel();
    });
  }

  /* ---------- Smooth Anchor Scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').substring(1);
      if (!targetId) return;
      var targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.replaceState) { history.replaceState(null, '', '#' + targetId); }
      }
    });
  });

  /* ---------- Waitlist Form Submission ---------- */
  var form = document.getElementById('waitlist-form');
  if (form) {
    var msgOk = document.getElementById('form-ok');
    var msgBad = document.getElementById('form-bad');

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var email = (input.value || '').trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      msgOk.classList.add('hidden');
      msgBad.classList.add('hidden');

      if (!valid) {
        msgBad.textContent = 'Please enter a valid email address.';
        msgBad.classList.remove('hidden');
        return;
      }

      // Real submit. The row is written to D1 and a confirmation mail goes out from the
      // Worker; nothing is stored locally any more. `hp` is the honeypot field: a real
      // browser never fills it, and the server silently accepts-and-discards if it is set.
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; }

      fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email,
          hp: (form.querySelector('input[name="hp"]') || {}).value || '',
          source: 'landing'
        })
      })
        .then(function (res) { return res.json().catch(function () { return {}; }); })
        .then(function (out) {
          form.reset();
          if (out && out.ok) {
            // Only promise an inbox delivery if one actually happened. With no mail
            // provider configured the server returns email_sent:false, and claiming
            // "check your inbox" would be a lie the visitor cannot see through.
            msgOk.textContent = (out.email_sent === false)
              ? "You're on the list."
              : "You're on the list! Check your inbox to confirm your address.";
            msgOk.classList.remove('hidden');
          } else {
            msgBad.textContent = 'Something went wrong. Try again in a minute.';
            msgBad.classList.remove('hidden');
          }
        })
        .catch(function () {
          msgBad.textContent = 'Could not reach the server. Try again in a minute.';
          msgBad.classList.remove('hidden');
        })
        .then(function () { if (btn) { btn.disabled = false; } });
    });
  }
})();
