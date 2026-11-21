/* PALEZZA NETWORK V2 — animations (JavaScript léger, sans bibliothèque).
   Réseau animé, apparition au défilement, halo des cartes, profondeur 3D, progression, menu actif.
   Rien ne s'anime si le visiteur a demandé moins d'animations ; la page reste entièrement utilisable. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* ---- 1. Apparition au défilement : en-têtes de rubrique + décalage des cartes ---- */
  function revealSetup() {
    $$('section .max-w-2xl').forEach(function (b) { b.classList.add('pn-rv'); });
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pn-in'); io.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }) : null;
    $$('.pn-rv').forEach(function (b) { io ? io.observe(b) : b.classList.add('pn-in'); });
    $$('.grid, ol, ul').forEach(function (g) {
      var kids = [].slice.call(g.children).filter(function (k) { return k.classList && k.classList.contains('reveal'); });
      kids.forEach(function (k, i) {
        k.style.setProperty('--d', (i % 6) * 90 + 'ms');
        k.addEventListener('transitionend', function (e) { if (e.target === k && e.propertyName === 'opacity') k.style.setProperty('--d', '0s'); });
      });
    });
    /* sécurité : si l'observateur ne répond pas, tout devient visible après 4 s */
    setTimeout(function () { $$('.pn-rv').forEach(function (b) { b.classList.add('pn-in'); }); }, 4000);
  }

  /* ---- 2. Progression de lecture ---- */
  function progress() {
    var bar = document.createElement('div'); bar.id = 'pn-prog'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    var t = false;
    function upd() { t = false; var h = root.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; }
    addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---- 3. Rubrique active dans le menu ---- */
  function spy() {
    /* seuls les vrais liens du menu sont surlignés (pas les boutons « Demander un devis »), en version bureau comme en version mobile */
    var links = $$('#site-header nav a[href^="#"]').filter(function (a) { return !a.classList.contains('btn') && !a.matches('[class*="bg-brand"]'); });
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {}; links.forEach(function (a) { var id = a.getAttribute('href').slice(1); (map[id] = map[id] || []).push(a); });
    var cur = null;
    function set(id) {
      if (cur && map[cur]) map[cur].forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
      cur = id; if (map[cur]) map[cur].forEach(function (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && map[e.target.id] && cur !== e.target.id) set(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---- 4. Halo des cartes qui suit le doigt / la souris + profondeur 3D (souris seulement) ---- */
  var CARD = '.card,.ucard,.app-card,.sec-card';
  function cards() {
    var tilted = null, raf = 0;
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest(CARD); if (!c) return;
      var r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (fine && !reduce && e.pointerType === 'mouse') {
        var rx = ((y / r.height) - .5) * -6, ry = ((x / r.width) - .5) * 6;
        cancelAnimationFrame(raf); raf = requestAnimationFrame(function () {
          c.style.transition = 'transform .12s ease-out,border-color .25s,box-shadow .25s';
          c.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
        });
        tilted = c;
      }
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var c = e.target.closest && e.target.closest(CARD); if (!c || (e.relatedTarget && c.contains(e.relatedTarget))) return;
      c.style.setProperty('--mx', '-60%'); c.style.setProperty('--my', '-60%');
      if (c === tilted) { cancelAnimationFrame(raf); c.style.transition = ''; c.style.transform = ''; tilted = null; }
    }, { passive: true });
  }

  /* ---- 5. Onde au toucher sur les boutons ---- */
  function ripple() {
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest('.btn'); if (!b) return;
      var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement('span');
      s.className = 'pn-ripple'; s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
      b.appendChild(s); setTimeout(function () { s.remove(); }, 650);
    }, { passive: true });
  }

  /* ---- 6. En-tête de page : aurore + réseau animé + liseré du panneau ---- */
  function hero() {
    var h = $('section.isolate'); if (!h) return;
    var au = document.createElement('div'); au.className = 'pn-aurora'; au.setAttribute('aria-hidden', 'true'); au.innerHTML = '<i></i><i></i>'; h.insertBefore(au, h.firstChild);
    var bd = $('.board', h); if (bd) { var g = document.createElement('div'); g.className = 'pn-glow'; g.setAttribute('aria-hidden', 'true'); bd.appendChild(g); }
    var cv = document.createElement('canvas'); cv.className = 'pn-net'; cv.setAttribute('aria-hidden', 'true'); h.insertBefore(cv, h.firstChild);
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var W = 0, H = 0, dpr = 1, N = [], mouse = { x: -999, y: -999 }, run = false, vis = true, last = 0;
    var low = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
    var step = low ? 33 : 16;
    function size() {
      var r = h.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 520 ? 34 : W < 900 ? 58 : 88; if (low) n = Math.round(n * .7);
      N = []; for (var i = 0; i < n; i++) N.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1.4 + Math.random() * 2, p: Math.random() * 6.28 });
    }
    function draw(t, still) {
      var dark = root.classList.contains('dark'), L = W < 520 ? 105 : 150;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < N.length; i++) {
        var a = N[i];
        if (!still) {
          a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1;
          var dx = a.x - mouse.x, dy = a.y - mouse.y, dd = dx * dx + dy * dy; if (dd < 14000) { var f = (1 - dd / 14000) * .6; a.x += dx * f * .02; a.y += dy * f * .02; }
        }
        for (var j = i + 1; j < N.length; j++) {
          var b = N[j], x = a.x - b.x, y = a.y - b.y, d2 = x * x + y * y;
          if (d2 < L * L) { var al = (1 - Math.sqrt(d2) / L) * (dark ? .75 : .45); ctx.strokeStyle = dark ? 'rgba(54,217,255,' + al + ')' : 'rgba(22,119,255,' + al + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        var pulse = still ? 1 : .6 + .4 * Math.sin(t / 700 + a.p);
        ctx.fillStyle = dark ? 'rgba(54,217,255,' + (.85 * pulse) + ')' : 'rgba(22,119,255,' + (.7 * pulse) + ')';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r * (still ? 1 : .85 + .3 * pulse), 0, 6.283); ctx.fill();
      }
    }
    function loop(t) {
      if (!run) return;
      if (t - last >= step) { last = t; draw(t, false); }
      requestAnimationFrame(loop);
    }
    function go() { var want = vis && !document.hidden && !reduce; if (want && !run) { run = true; requestAnimationFrame(loop); } else if (!want) run = false; }
    size(); draw(0, true);
    if (reduce) return;
    h.addEventListener('pointermove', function (e) { var r = h.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    h.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; }, { passive: true });
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (!run) draw(0, true); }, 200); }, { passive: true });
    document.addEventListener('visibilitychange', go);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; go(); }).observe(h); else go();
    cv.dataset.ready = '1';
  }

  /* ---- 7. Profondeur : le panneau s'incline légèrement avec la souris (ordinateur) ---- */
  function boardTilt() {
    var bd = $('section.isolate .board'); if (!bd || !fine || reduce) return;
    var t = 0;
    bd.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return; var r = bd.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(t); t = requestAnimationFrame(function () { bd.style.transform = 'perspective(1200px) rotateX(' + (y * -3).toFixed(2) + 'deg) rotateY(' + (x * 4).toFixed(2) + 'deg)'; });
    }, { passive: true });
    bd.addEventListener('pointerleave', function () { cancelAnimationFrame(t); bd.style.transform = ''; }, { passive: true });
  }

  function init() {
    if (!reduce) root.classList.add('mo');
    revealSetup(); progress(); spy(); cards(); ripple(); hero(); boardTilt();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
