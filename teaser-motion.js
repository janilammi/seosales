/* SEO Sales — näkyvyysanalyysin teaser: kuusi osa-aluetta kulkee piirilevyratoja pitkin
   analyysirenkaaseen, josta jatkuu kasvun rata. Sama kieli kuin työkalun raportissa.
   Pelkkä kuvitus, ei dataa. Pysähtyy, kun osio ei näy, ja vähennetyn liikkeen asetuksella. */
(function () {
  'use strict';
  var canvas = document.getElementById('teaserMotion');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var btn = canvas.parentNode.querySelector('.video-toggle');
  var TURQ = [37, 217, 198], VIOLET = [160, 140, 255], WHITE = [241, 238, 255];
  var LABELS = ['HAKUKONEET', 'TEKNIIKKA', 'SISÄLTÖ', 'SOMEJAOT', 'TEKOÄLYHAUT', 'AVAINSANAT'];
  var SPEED = 90; // pikseliä sekunnissa
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var W = 0, H = 0, M = { x: 0, y: 0 }, R = 0, lanes = [], out = null, showLabels = false;

  // Suorakulmainen rata pyöristetyin kulmin; pisteillä kertynyt pituus, jotta nopeus on tasainen.
  function trace(corners, r) {
    var pts = [corners[0]], i, k;
    for (i = 1; i < corners.length - 1; i++) {
      var p = corners[i - 1], c = corners[i], n = corners[i + 1];
      var d1 = Math.hypot(p.x - c.x, p.y - c.y), d2 = Math.hypot(n.x - c.x, n.y - c.y);
      var rr = Math.min(r, d1 / 2, d2 / 2);
      var a = { x: c.x + (p.x - c.x) * rr / d1, y: c.y + (p.y - c.y) * rr / d1 };
      var b = { x: c.x + (n.x - c.x) * rr / d2, y: c.y + (n.y - c.y) * rr / d2 };
      for (k = 0; k <= 6; k++) {
        var t = k / 6, u = 1 - t;
        pts.push({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y });
      }
    }
    pts.push(corners[corners.length - 1]);
    var L = 0; pts[0].l = 0;
    for (i = 1; i < pts.length; i++) { L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); pts[i].l = L; }
    return { pts: pts, L: L };
  }
  function at(tr, u) {
    var target = clamp(u, 0, 1) * tr.L, p = tr.pts, lo = 0, hi = p.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (p[mid].l < target) lo = mid; else hi = mid; }
    var seg = p[hi].l - p[lo].l || 1, k = (target - p[lo].l) / seg;
    return { x: p[lo].x + (p[hi].x - p[lo].x) * k, y: p[lo].y + (p[hi].y - p[lo].y) * k };
  }
  function strokeTrace(tr) {
    ctx.beginPath(); ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
    for (var i = 1; i < tr.pts.length; i++) ctx.lineTo(tr.pts[i].x, tr.pts[i].y);
    ctx.stroke();
  }

  function layout() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    if (!W || !H) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(H * 0.3, 56);
    M = { x: W - R - Math.max(48, W * 0.15), y: H / 2 };
    showLabels = W >= 380;
    var startX = showLabels ? 2 : -8, endX = M.x - R - 14, top = H * 0.14, span = H * 0.72;
    lanes = [];
    for (var i = 0; i < 6; i++) {
      var y0 = Math.round(top + span * (i / 5)) + 0.5;
      var yEnd = Math.round(M.y + (i - 2.5) * 6) + 0.5;
      var d = Math.abs(i - 2.5) - 0.5;
      var xt = Math.round(startX + (endX - startX) * (0.46 + 0.14 * d)) + 0.5;
      lanes.push({ tr: trace([{ x: startX, y: y0 }, { x: xt, y: y0 }, { x: xt, y: yEnd }, { x: endX, y: yEnd }], 8), label: LABELS[i], phase: (i * 0.37) % 1 });
    }
    out = trace([{ x: M.x + R + 14, y: Math.round(M.y) + 0.5 }, { x: W + 8, y: Math.round(M.y) + 0.5 }], 0);
  }

  // Paketti: kirkas kärki ja lyhyt häivyttyvä häntä.
  function packet(tr, u, color, a, tail) {
    if (a <= 0.01) return;
    var steps = 6, du = tail / tr.L / steps;
    ctx.lineWidth = 1.2;
    for (var k = 0; k < steps; k++) {
      var u1 = u - k * du, u0 = u - (k + 1) * du;
      if (u0 < 0) break;
      var p1 = at(tr, u1), p0 = at(tr, u0);
      ctx.strokeStyle = rgba(color, a * (1 - k / steps) * 0.75);
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
    var h = at(tr, u);
    ctx.fillStyle = rgba(color, a);
    ctx.fillRect(h.x - 1.1, h.y - 1.1, 2.2, 2.2);
  }

  function render(t) {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    var TAU = Math.PI * 2, i;

    // Radat, liitinpisteet ja osa-alueiden nimet
    ctx.lineWidth = 1;
    ctx.font = '500 10.5px "IBM Plex Mono", ui-monospace, monospace';
    lanes.forEach(function (ln) {
      ctx.strokeStyle = rgba(TURQ, 0.2); strokeTrace(ln.tr);
      var p0 = ln.tr.pts[0];
      ctx.fillStyle = rgba(TURQ, 0.6); ctx.fillRect(p0.x - 2, p0.y - 2, 4, 4);
      if (showLabels) { ctx.fillStyle = rgba(WHITE, 0.38); ctx.fillText(ln.label, p0.x, p0.y - 8); }
    });
    ctx.strokeStyle = rgba(VIOLET, 0.3); strokeTrace(out);

    // Analyysirengas: pohja, kiertävä skannaus ja asteikko, joka kirkastuu skannauksen jäljessä
    var a1 = -Math.PI / 2 + t * 0.9, a0 = a1 - 0.9;
    ctx.lineWidth = 4;
    ctx.strokeStyle = rgba(WHITE, 0.12);
    ctx.beginPath(); ctx.arc(M.x, M.y, R - 6, 0, TAU); ctx.stroke();
    ctx.strokeStyle = rgba(TURQ, 0.85); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(M.x, M.y, R - 6, a0, a1); ctx.stroke();
    ctx.lineCap = 'butt'; ctx.lineWidth = 1;
    for (i = 0; i < 48; i++) {
      var ang = -Math.PI / 2 + i / 48 * TAU, major = i % 4 === 0;
      var behind = ((a1 - ang) % TAU + TAU) % TAU, glow = behind < 1.8 ? 1 - behind / 1.8 : 0;
      ctx.strokeStyle = rgba(WHITE, 0.08 + 0.4 * glow);
      ctx.beginPath();
      ctx.moveTo(M.x + Math.cos(ang) * (R + 4), M.y + Math.sin(ang) * (R + 4));
      ctx.lineTo(M.x + Math.cos(ang) * (R + (major ? 10 : 7)), M.y + Math.sin(ang) * (R + (major ? 10 : 7)));
      ctx.stroke();
    }
    var pulse = 0.5 + 0.5 * Math.sin(t * 2);
    ctx.fillStyle = rgba(TURQ, 0.5 + 0.4 * pulse);
    ctx.beginPath(); ctx.arc(M.x, M.y, 3 + pulse, 0, TAU); ctx.fill();

    // Paketit radoilla ja kasvun rata renkaasta eteenpäin
    lanes.forEach(function (ln) {
      for (var k = 0; k < 3; k++) {
        var u = (t * SPEED / ln.tr.L + k / 3 + ln.phase) % 1;
        packet(ln.tr, u, TURQ, 0.9 * clamp(u / 0.05, 0, 1) * clamp((1 - u) / 0.04, 0, 1), 18);
      }
    });
    for (i = 0; i < 3; i++) {
      var v = (t * SPEED * 1.2 / out.L + i / 3) % 1;
      packet(out, v, VIOLET, 0.9 * clamp(v / 0.06, 0, 1) * clamp((1 - v) / 0.15, 0, 1), 30);
    }
  }

  var running = false, paused = false, visible = true, clock = 2.4, last = 0, raf = 0;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(now) {
    if (!running) return;
    if (visible && !document.hidden) { clock += Math.min((now - last) / 1000, 0.05); render(clock); }
    last = now; raf = requestAnimationFrame(tick);
  }
  function play() { if (running || reduced || paused) return; running = true; last = performance.now(); raf = requestAnimationFrame(tick); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  layout(); render(clock);
  if ('ResizeObserver' in window) new ResizeObserver(function () { layout(); render(clock); }).observe(canvas);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.05 }).observe(canvas);
  if (document.fonts) document.fonts.ready.then(function () { render(clock); });

  // Liikkuvan kuvituksen voi pysäyttää (WCAG 2.2.2), sama painike kuin etusivun videossa.
  if (btn) {
    if (reduced) btn.hidden = true;
    btn.addEventListener('click', function () {
      paused = !paused;
      if (paused) stop(); else play();
      btn.classList.toggle('is-paused', paused);
      btn.setAttribute('aria-label', paused ? 'Toista animaatio' : 'Pysäytä animaatio');
    });
  }
  play();
})();

/* Teaserin painike otsikon alla: siirtää kursorin osoitekenttään */
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('.at-jump');
  if (!a) return;
  var input = document.getElementById('at-url');
  if (!input) return;
  e.preventDefault();
  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  input.focus({ preventScroll: true });
});
