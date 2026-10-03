/* absolutcas.com — v2 landing behaviour. No framework, no build step.
   Slot ids from SITE-COPY-v2.md are kept in the markup and in the comments here so a copy
   change can be traced to the exact element. */

(function () {
  'use strict';

  /* ---------- theme toggle (NAV.4). Light is the default; the choice sticks. ---------- */
  var root = document.documentElement;
  var btn = document.getElementById('theme-btn');
  var saved = null;
  try { saved = localStorage.getItem('acas-theme'); } catch (e) { saved = null; }
  if (saved === 'dark' || saved === 'light') { root.setAttribute('data-theme', saved); }

  function label() {
    btn.textContent = root.getAttribute('data-theme') === 'dark' ? 'Light' : 'Dark';
  }
  if (btn) {
    label();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('acas-theme', next); } catch (e) {}
      label();
    });
  }

  /* ---------- copy slot ids: on by default, the `ids` button flips them ---------- */
  var slotBtn = document.getElementById('slot-btn');
  if (slotBtn) {
    function slotState() { return root.getAttribute('data-slot-labels') || 'on'; }
    function slotLabel() {
      var on = slotState() === 'on';
      slotBtn.textContent = 'ids';
      slotBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    slotLabel();
    slotBtn.addEventListener('click', function () {
      var next = slotState() === 'on' ? 'off' : 'on';
      root.setAttribute('data-slot-labels', next);
      try { localStorage.setItem('acas-slots', next); } catch (e) {}
      slotLabel();
    });
  }

  /* ---------- block cursor ---------- */
  var cursor = document.getElementById('cursor-default');
  if (cursor && window.matchMedia('(min-width: 769px)').matches) {
    document.addEventListener('mousemove', function (e) {
      cursor.style.transform = 'translate(' + (e.clientX - 2) + 'px,' + (e.clientY - 2) + 'px)';
    });
  }

  /* ---------- nav links scroll the RIGHT panel only (PART 0 behaviour) ---------- */
  var right = document.getElementById('panel-right');
  document.querySelectorAll('[data-scroll]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var target = document.getElementById(a.getAttribute('data-scroll'));
      if (!target) { return; }
      ev.preventDefault();
      if (right && window.matchMedia('(min-width: 769px)').matches) {
        right.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (history.replaceState) { history.replaceState(null, '', '#' + target.id); }
    });
  });

  /* ---------- ticker: duplicate the track so the -50% loop is seamless ---------- */
  var track = document.querySelector('.ticker-track');
  if (track) { track.innerHTML += track.innerHTML; }

  /* ---------- reveal on scroll, root = the right panel ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); }
      });
    }, { root: window.matchMedia('(min-width: 769px)').matches ? right : null, threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('on'); });
  }

  /* ---------- CAP.10: the form target is still not chosen. ----------
     Right now nothing is sent and the page says so. When a backend is picked, either set
     data-endpoint on the form to a POST URL (Buttondown / Formspree / a Worker route) or
     delete the "not wired" branch below. Do not let this form pretend it worked. */
  var form = document.getElementById('waitlist-form');
  if (form) {
    var msgOk = document.getElementById('form-ok');    // CAP.11
    var msgBad = document.getElementById('form-bad');  // CAP.12
    var endpoint = form.getAttribute('data-endpoint');

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = (form.querySelector('input[type="email"]').value || '').trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      msgOk.classList.add('hidden');
      msgBad.classList.add('hidden');
      if (!valid) {
        msgBad.textContent = 'That email address does not look complete.';
        msgBad.classList.remove('hidden');
        return;
      }
      if (!endpoint) {
        // honest state: no list exists yet, so nothing is claimed
        msgBad.textContent = 'Not wired to a list yet, so nothing was sent. ' +
          'The waitlist opens with the campaign.';
        msgBad.classList.remove('hidden');
        return;
      }
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email })
      }).then(function (r) {
        if (!r.ok) { throw new Error('bad status'); }
        form.reset();
        msgOk.classList.remove('hidden');
      }).catch(function () {
        msgBad.textContent = msgBad.getAttribute('data-fail') || msgBad.textContent;
        msgBad.classList.remove('hidden');
      });
    });
  }

  /* ---------- S4.5 devlog: live commit + pull-request feed ----------
     Pulls the public GitHub API from the browser. It is a live read, not a webhook:
     nothing is pushed to the page, the page asks on load. */
  var log = document.getElementById('devlog');
  if (log) {
    var repo = log.getAttribute('data-repo');
    var commitsEl = log.querySelector('[data-devlog-commits]');
    var prsEl = log.querySelector('[data-devlog-prs]');

    function say(el, text) {
      var d = document.createElement('p');
      d.className = 'devlog-empty';
      d.textContent = text;
      el.appendChild(d);
    }
    function row(title, meta) {
      var li = document.createElement('li');
      var b = document.createElement('b');
      b.textContent = title;
      var s = document.createElement('span');
      s.textContent = meta;
      li.appendChild(b);
      li.appendChild(s);
      return li;
    }
    function when(iso) {
      try {
        var d = new Date(iso);
        return d.toISOString().slice(0, 10);
      } catch (e) { return ''; }
    }

    Promise.all([
      fetch('https://api.github.com/repos/' + repo + '/commits?per_page=6').then(function (r) { return r.json(); }),
      fetch('https://api.github.com/repos/' + repo + '/pulls?state=all&per_page=6&sort=updated&direction=desc')
        .then(function (r) { return r.json(); })
    ]).then(function (res) {
      var commits = res[0], prs = res[1];

      if (Array.isArray(commits) && commits.length) {
        commits.forEach(function (c) {
          var msg = (c.commit && c.commit.message ? c.commit.message.split('\n')[0] : '(no message)');
          var sha = (c.sha || '').slice(0, 7);
          var date = when(c.commit && c.commit.author ? c.commit.author.date : '');
          commitsEl.appendChild(row(msg, sha + '  ' + date));
        });
      } else {
        say(commitsEl, 'No commit feed right now.');
      }

      if (Array.isArray(prs) && prs.length) {
        prs.forEach(function (p) {
          prsEl.appendChild(row('#' + p.number + ' ' + p.title, (p.state || '') + '  ' + when(p.updated_at)));
        });
      } else {
        say(prsEl, 'Nothing open or merged in the feed yet.');
      }
    }).catch(function () {
      say(commitsEl, 'Feed unavailable. The repo is github.com/' + repo + '.');
      say(prsEl, 'Feed unavailable.');
    });
  }
})();
