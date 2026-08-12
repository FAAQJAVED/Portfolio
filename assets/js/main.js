/* Afaq Javed — portfolio. No dependencies. */
(function () {
  'use strict';

  /* ---------- theme toggle ---------- */
  var root = document.documentElement;
  var tt = document.getElementById('tt');
  var meta = document.querySelector('meta[name="theme-color"]');

  // persist=false is used on load, so we don't overwrite "no choice yet"
  function applyTheme(t, persist) {
    root.setAttribute('data-theme', t);
    if (meta) meta.setAttribute('content', t === 'dark' ? '#16181E' : '#FBF8F3');
    if (tt) tt.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (persist) { try { localStorage.setItem('theme', t); } catch (e) {} }
  }

  if (tt) {
    tt.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
    // sync the label with whatever the inline head script already picked
    applyTheme(root.getAttribute('data-theme') || 'light', false);
  }

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navlinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- case study accordions ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.case'), function (card) {
    var btn = card.querySelector('.case-toggle');
    var head = card.querySelector('.case-head');
    var lbl = btn ? btn.querySelector('span') : null;

    function toggle() {
      var open = card.classList.toggle('open');
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (lbl) lbl.textContent = open ? 'Close' : 'Read the teardown';
    }
    if (btn) btn.addEventListener('click', toggle);
    if (head) head.addEventListener('click', toggle);
  });

  /* ---------- ticker: duplicate content for a seamless loop ---------- */
  var tick = document.getElementById('tick');
  if (tick) tick.innerHTML += tick.innerHTML;

  /* ---------- scroll reveal ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(rv, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(rv, function (el) { el.classList.add('in'); });
  }

  /* ---------- lightbox for proof screenshots ---------- */
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<button class="lb-x" aria-label="Close image"></button>';
  var lbImgEl = document.createElement('img');
  lbImgEl.alt = '';
  lb.appendChild(lbImgEl);
  lb.querySelector('.lb-x').textContent = '\u00d7';
  document.body.appendChild(lb);
  var lbImg = lbImgEl;
  var lastFocus = null;

  function closeLb() {
    lb.classList.remove('on');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.shot[data-full]'), function (s) {
    s.addEventListener('click', function () {
      lastFocus = s;
      var inner = s.querySelector('img');
      lbImg.src = s.getAttribute('data-full');
      lbImg.alt = inner ? inner.alt : '';
      lb.classList.add('on');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-x').focus();
    });
  });

  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lb-x')) closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb.classList.contains('on')) closeLb();
  });

  /* ---------- contact form → Web3Forms (AJAX, no page redirect) ---------- */
  var form = document.getElementById('form');
  var msg = document.getElementById('fmsg');
  var sub = document.getElementById('sub');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'f-msg';
      sub.disabled = true;
      sub.textContent = 'Sending…';

      var fd = new FormData(form);

      // collect the checkbox group into one readable line
      var needs = fd.getAll('needs[]');
      fd.delete('needs[]');
      fd.append('Needs', needs.length ? needs.join(', ') : 'Not specified');

      var obj = {};
      fd.forEach(function (v, k) { obj[k] = v; });

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(obj)
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.success) {
            msg.className = 'f-msg ok';
            msg.textContent = '✓ Sent. I reply within 24 hours — usually sooner.';
            form.reset();
          } else {
            throw new Error(d.message || 'failed');
          }
        })
        .catch(function () {
          msg.className = 'f-msg err';
          msg.innerHTML = 'Something went wrong. Email me directly: ' +
            '<a href="mailto:faaqjaved@gmail.com" style="color:inherit;text-decoration:underline">faaqjaved@gmail.com</a>';
        })
        .then(function () {
          sub.disabled = false;
          sub.textContent = 'Send message';
        });
    });
  }
})();
