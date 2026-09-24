/* ===== 鼠标与背景特效 ===== */
'use strict';

const Effects = (() => {
  let canvas, ctx, W, H;
  let stars = [];
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let glow = { x: -9999, y: -9999 };
  let ring = { x: -9999, y: -9999 };
  let running = false;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    const count = Math.min(240, Math.floor((W * H) / 8500));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.25,
        base: Math.random() * 0.5 + 0.35,
        tw: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.0006 + 0.0002,
      });
    }
  }

  function spawnParticles(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.4 + 0.3;
      particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed + 0.25,
        life: 0,
        max: Math.random() * 42 + 26,
        r: Math.random() * 2.2 + 0.8,
        gold: Math.random() < 0.75,
      });
    }
  }

  function burst(x, y, n = 30) {
    spawnParticles(x, y, n);
  }

  function tick(now) {
    // 背景星
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.tw += s.sp;
      s.y -= s.sp * 60;
      if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
      const alpha = s.base * (0.5 + 0.5 * Math.sin(s.tw));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 220, 190, ${alpha.toFixed(3)})`;
      ctx.fill();
    }

    // 鼠标粒子
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy = p.vy * 0.96 - 0.01;
      const t = 1 - p.life / p.max;
      if (t <= 0) { particles.splice(i, 1); continue; }
      const col = p.gold ? '217, 185, 106' : '185, 143, 255';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col}, ${(t * 0.9).toFixed(3)})`;
      ctx.fill();
    }

    // 光晕与光环缓动跟随
    glow.x += (mouse.x - glow.x) * 0.09;
    glow.y += (mouse.y - glow.y) * 0.09;
    ring.x += (mouse.x - ring.x) * 0.22;
    ring.y += (mouse.y - ring.y) * 0.22;

    const glowEl = document.getElementById('cursor-glow');
    const ringEl = document.getElementById('cursor-ring');
    if (glowEl) glowEl.style.transform = `translate(${glow.x}px, ${glow.y}px)`;
    if (ringEl) ringEl.style.transform = `translate(${ring.x}px, ${ring.y}px)`;

    running = requestAnimationFrame(tick);
  }

  function onMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (Math.random() < 0.55) spawnParticles(e.clientX, e.clientY, 1);

    // 视差背景
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    document.querySelectorAll('.nebula').forEach((el) => {
      const d = Number(el.dataset.depth) || 30;
      el.style.transform = `translate(${(-nx * d).toFixed(1)}px, ${(-ny * d).toFixed(1)}px)`;
    });
  }

  function onLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  // 卡牌 3D 倾斜
  function tiltCard(card, x, y) {
    const rect = card.getBoundingClientRect();
    const px = (x - rect.left) / rect.width;
    const py = (y - rect.top) / rect.height;
    const ry = (px - 0.5) * 18;
    const rx = (0.5 - py) * 18;
    card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  }

  function attachTilt(root) {
    root.addEventListener('mousemove', (e) => {
      const card = e.target.closest ? e.target.closest('.card') : null;
      if (card) tiltCard(card, e.clientX, e.clientY);
    });
    root.addEventListener('mouseout', (e) => {
      const card = e.target.closest ? e.target.closest('.card') : null;
      if (card && !card.contains(e.relatedTarget)) {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      }
    });
  }

  function init() {
    canvas = document.getElementById('starfield');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    attachTilt(document.body);
    running = requestAnimationFrame(tick);
  }

  return { init, burst };
})();