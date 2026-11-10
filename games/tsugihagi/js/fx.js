'use strict';
// ===== 攻撃エフェクト（技のタイプごとに別のアニメーション）=====
const PPOS = { x: 150, y: 205 }, EPOS = { x: 480, y: 118 };
// [長さ, 命中の瞬間]（秒）
const FXT = { impact: [.55, .24], slash: [.62, .3], proj: [.85, .52], beam: [.9, .34], breath: [1, .55], wave: [1.05, .55], bolt: [.8, .24], rocks: [.95, .52], quake: [.9, .22], swirl: [1, .55], whip: [.72, .34], explosion: [1, .26], heal: [.95, 0] };

BattleScene.prototype.addFx = function (mv, me, foe, dmg, mult) {
  const type = mv.fx || 'impact', [dur, hit] = FXT[type];
  const A = me.side === 'p' ? PPOS : EPOS, B = foe.side === 'p' ? PPOS : EPOS;
  const f = { type, el: mv.element, a: A, b: B, t: 0, dur, hit, dmg, mult, big: !!mv.big, seed: Math.random() * 1000, target: type === 'heal' ? null : foe };
  if (type === 'impact' || type === 'slash') me.lun = { t: 0 };
  if (type !== 'heal') foe.hold = hit + .05;
  this.fx.push(f);
  Snd.fxSound(f);
};

const sr = (f, i) => { const x = Math.sin(f.seed * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); };
const cl01 = v => Math.max(0, Math.min(1, v));
const col = el => (ELEMENTS[el] || ELEMENTS.none).color;
const lerp = (a, b, t) => a + (b - a) * t;

function star4(x, y, r, c, a = 1) {
  ctx.globalAlpha = a; ctx.fillStyle = c; ctx.beginPath();
  ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  ctx.globalAlpha = 1;
}
function glow(x, y, r, c0, c1 = 'rgba(255,255,255,0)') {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}
function leaf(x, y, r, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = '#6fd05e'; ctx.strokeStyle = '#2f7a3a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.4, r * .65, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * 1.3, 0); ctx.lineTo(r * 1.3, 0); ctx.stroke(); ctx.restore();
}
function rock(x, y, r, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = '#9a7a52'; ctx.strokeStyle = '#4e3a24'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-r, -r * .3); ctx.lineTo(-r * .3, -r); ctx.lineTo(r * .8, -r * .6); ctx.lineTo(r, r * .4); ctx.lineTo(0, r); ctx.lineTo(-r * .8, r * .6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(-r * .5, -r * .4); ctx.lineTo(-r * .1, -r * .8); ctx.lineTo(r * .3, -r * .4); ctx.closePath(); ctx.fill(); ctx.restore();
}
function zigzag(x0, y0, x1, y1, seed, amp = 16, seg = 9) {
  ctx.beginPath(); ctx.moveTo(x0, y0);
  for (let i = 1; i < seg; i++) {
    const u = i / seg, jx = (Math.sin(seed * 7.1 + i * 12.9) * 43758.5453 % 1 - .5) * 2 * amp;
    ctx.lineTo(lerp(x0, x1, u) + jx, lerp(y0, y1, u));
  }
  ctx.lineTo(x1, y1);
}

// 属性ごとの「飛んでいく弾」
function orb(el, x, y, r, t) {
  switch (el) {
    case 'fire': glow(x, y, r * 2.2, '#fff6b0', 'rgba(255,60,0,0)'); glow(x, y, r * 1.2, '#fffbe0', 'rgba(255,170,40,.8)'); break;
    case 'water': glow(x, y, r * 1.6, 'rgba(150,220,255,.5)', 'rgba(60,150,230,0)'); ctx.fillStyle = '#5ab4f0'; ctx.strokeStyle = '#2a78c0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(x - r * .3, y - r * .3, r * .35, 0, 7); ctx.fill(); break;
    case 'grass': leaf(x, y, r, t * 14); break;
    case 'thunder': glow(x, y, r * 2, 'rgba(255,240,120,.9)', 'rgba(255,220,0,0)'); star4(x, y, r * 1.6, '#fff'); break;
    case 'earth': rock(x, y, r, t * 9); break;
    case 'light': glow(x, y, r * 2.4, '#fff', 'rgba(255,240,150,0)'); star4(x, y, r * 2.2, '#fffbe0'); break;
    case 'dark': glow(x, y, r * 2.2, 'rgba(160,100,230,.7)', 'rgba(60,20,110,0)'); ctx.fillStyle = '#1e0c34'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); break;
    case 'ice': ctx.fillStyle = '#bfefff'; ctx.strokeStyle = '#5ab8e0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - r * 1.5); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r * 1.5); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill(); ctx.stroke(); glow(x, y, r * 2, 'rgba(180,240,255,.4)', 'rgba(160,230,255,0)'); break;
    case 'poison': glow(x, y, r * 1.8, 'rgba(190,100,230,.6)', 'rgba(120,40,160,0)'); ctx.fillStyle = '#b060d8'; ctx.strokeStyle = '#6a2a90'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(x - r * .3, y - r * .3, r * .3, 0, 7); ctx.fill(); break;
    case 'steel': glow(x, y, r * 1.6, 'rgba(220,230,255,.6)', 'rgba(180,190,210,0)'); ctx.fillStyle = '#c8d2e0'; ctx.strokeStyle = '#6a7488'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); star4(x, y, r * 1.8, '#fff'); break;
    case 'wind': ctx.strokeStyle = 'rgba(200,255,235,.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x, y, r * (.6 + i * .5), t * 14 + i, t * 14 + i + 3.6); ctx.stroke(); } glow(x, y, r * 1.6, 'rgba(210,255,240,.35)', 'rgba(200,255,235,0)'); break;
    default: glow(x, y, r * 1.8, '#fff', 'rgba(255,255,255,0)');
  }
}

// 命中のはじけ：属性ごとに見た目が変わる。p=0..1
function burst(f, x, y, p, sc = 1) {
  const el = f.el, c = col(el), n = 12, a = 1 - p;
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${a * .8})`; ctx.lineWidth = 3 * a + .5;
  ctx.beginPath(); ctx.arc(x, y, (12 + p * 48) * sc, 0, 7); ctx.stroke();
  switch (el) {
    case 'fire':
      glow(x, y, (50 - p * 12) * sc, `rgba(255,230,140,${a * .9})`, 'rgba(255,80,0,0)');
      for (let i = 0; i < n; i++) { const an = sr(f, i) * 6.283, d = (10 + p * (30 + sr(f, i + 20) * 30)) * sc; ctx.fillStyle = i % 2 ? `rgba(255,140,30,${a})` : `rgba(255,230,90,${a})`; ctx.beginPath(); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d - p * 24, (6 - p * 4) * sc, 0, 7); ctx.fill(); }
      break;
    case 'water':
      for (let i = 0; i < n; i++) { const an = -Math.PI * (.1 + .8 * i / n), v = 40 + sr(f, i) * 30, px = x + Math.cos(an) * v * p * sc, py = y + Math.sin(an) * v * p * sc + p * p * 50 * sc; ctx.fillStyle = `rgba(110,200,255,${a})`; ctx.beginPath(); ctx.arc(px, py, (5 - p * 2) * sc, 0, 7); ctx.fill(); }
      glow(x, y, (30 + p * 20) * sc, `rgba(160,225,255,${a * .5})`);
      break;
    case 'grass':
      for (let i = 0; i < 9; i++) { const an = i * .7 + p * 5, d = (8 + p * 56) * sc; ctx.globalAlpha = a; leaf(x + Math.cos(an) * d, y + Math.sin(an) * d * .8, 5 * sc, an * 2); ctx.globalAlpha = 1; }
      break;
    case 'thunder':
      ctx.strokeStyle = `rgba(255,236,90,${a})`; ctx.lineWidth = 3;
      for (let i = 0; i < 9; i++) { const an = i * .7 + sr(f, i); zigzag(x, y, x + Math.cos(an) * 60 * sc * (.5 + p), y + Math.sin(an) * 60 * sc * (.5 + p), f.seed + i, 7, 5); ctx.stroke(); }
      glow(x, y, 36 * sc, `rgba(255,255,200,${a * .8})`);
      break;
    case 'earth':
      for (let i = 0; i < 8; i++) { const an = -Math.PI * (.15 + .7 * i / 8), v = 50 + sr(f, i) * 40; rock(x + Math.cos(an) * v * p * sc, y + Math.sin(an) * v * p * sc + p * p * 70 * sc, (6 - p * 2) * sc, i + p * 6); }
      ctx.fillStyle = `rgba(190,160,110,${a * .5})`; ctx.beginPath(); ctx.ellipse(x, y + 18, (20 + p * 40) * sc, (8 + p * 12) * sc, 0, 0, 7); ctx.fill();
      break;
    case 'light':
      glow(x, y, (46 + p * 20) * sc, `rgba(255,255,230,${a * .9})`, 'rgba(255,240,150,0)');
      for (let i = 0; i < 8; i++) { const an = i * .785 + p; star4(x + Math.cos(an) * (10 + p * 50) * sc, y + Math.sin(an) * (10 + p * 50) * sc, (8 - p * 4) * sc, '#fffbd0', a); }
      break;
    case 'dark':
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(150,90,220,${a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, (46 - p * 26 + i * 10) * sc, 0, 7); ctx.stroke(); }
      for (let i = 0; i < 9; i++) { const an = i * .7 + p * 3, d = (40 - p * 28) * sc; glow(x + Math.cos(an) * d, y + Math.sin(an) * d, 10 * sc, `rgba(110,60,170,${a * .8})`, 'rgba(40,10,70,0)'); }
      break;
    case 'ice':
      for (let i = 0; i < 10; i++) { const an = i * .628 + sr(f, i), d = (8 + p * 54) * sc; ctx.fillStyle = `rgba(190,240,255,${a})`; ctx.strokeStyle = `rgba(90,180,220,${a})`; ctx.lineWidth = 1.2; ctx.save(); ctx.translate(x + Math.cos(an) * d, y + Math.sin(an) * d); ctx.rotate(an); ctx.beginPath(); ctx.moveTo(-6 * sc, 0); ctx.lineTo(0, -3 * sc); ctx.lineTo(8 * sc, 0); ctx.lineTo(0, 3 * sc); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
      glow(x, y, (34 + p * 18) * sc, `rgba(220,248,255,${a * .7})`); break;
    case 'poison':
      for (let i = 0; i < 9; i++) { const an = sr(f, i) * 6.283, d = (6 + p * 34) * sc * (.4 + sr(f, i + 9)); ctx.fillStyle = `rgba(180,90,220,${a * .8})`; ctx.beginPath(); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d * .8 - p * 30, (7 - p * 4) * sc, 0, 7); ctx.fill(); }
      glow(x, y, (30 + p * 16) * sc, `rgba(150,60,190,${a * .6})`, 'rgba(90,20,130,0)'); break;
    case 'steel':
      ctx.strokeStyle = `rgba(240,246,255,${a})`; ctx.lineWidth = 3;
      for (let i = 0; i < 10; i++) { const an = i * .628 + sr(f, i) * .3, d0 = (10 + p * 10) * sc, d1 = (22 + p * 54) * sc; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * d0, y + Math.sin(an) * d0); ctx.lineTo(x + Math.cos(an) * d1, y + Math.sin(an) * d1); ctx.stroke(); }
      star4(x, y, (30 - p * 14) * sc, '#fff', a); break;
    case 'wind':
      ctx.strokeStyle = `rgba(200,255,235,${a})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x, y, (14 + i * 10 + p * 30) * sc, i * 1.5 + p * 6, i * 1.5 + p * 6 + 3.2); ctx.stroke(); }
      for (let i = 0; i < 6; i++) { const an = i + p * 5, d = (10 + p * 44) * sc; leaf(x + Math.cos(an) * d, y + Math.sin(an) * d * .8, 4 * sc, an * 2); } break;
    default:
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      for (let i = 0; i < 8; i++) { const an = i * .785; ctx.beginPath(); ctx.moveTo(x + Math.cos(an - .12) * 12 * sc, y + Math.sin(an - .12) * 12 * sc); ctx.lineTo(x + Math.cos(an) * (24 + p * 36) * sc, y + Math.sin(an) * (24 + p * 36) * sc); ctx.lineTo(x + Math.cos(an + .12) * 12 * sc, y + Math.sin(an + .12) * 12 * sc); ctx.fill(); }
      star4(x, y, (26 - p * 10) * sc, '#ffe9a0', a);
  }
  ctx.restore();
}

const FXDRAW = {
  impact(f) {
    const q = cl01((f.t - f.hit) / (f.dur - f.hit));
    if (f.t >= f.hit) burst(f, f.b.x, f.b.y, q, f.big ? 1.3 : 1);
  },
  slash(f) {
    const { x, y } = f.b; ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const s = f.hit - .08 + i * .07, q = cl01((f.t - s) / .15), fade = f.t > s + .3 ? cl01(1 - (f.t - s - .3) / .25) : 1;
      if (q <= 0) continue;
      const x0 = x - 36 + i * 22, y0 = y - 48, x1 = x + 26 + i * 22, y1 = y + 44;
      const ex = lerp(x0, x1, q), ey = lerp(y0, y1, q);
      ctx.globalAlpha = fade * .6; ctx.strokeStyle = col(f.el === 'none' ? 'water' : f.el); ctx.lineWidth = 11 * (1 - q * .4); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.globalAlpha = fade; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke();
    }
    ctx.restore();
    if (f.t >= f.hit) burst({ ...f, el: f.el }, x, y, cl01((f.t - f.hit) / (f.dur - f.hit)), .8);
  },
  proj(f) {
    const n = 3, midx = (f.a.x + f.b.x) / 2, midy = Math.min(f.a.y, f.b.y) - 60;
    for (let i = 0; i < n; i++) {
      const s = (f.t - .06 - i * .08) / (f.hit - .06 - i * .04 + .001);
      if (s <= 0 || s >= 1) continue;
      for (let k = 4; k >= 0; k--) {
        const u = Math.max(0, s - k * .045), a = 1 - u, px = a * a * f.a.x + 2 * a * u * midx + u * u * f.b.x, py = a * a * f.a.y + 2 * a * u * midy + u * u * f.b.y;
        ctx.globalAlpha = 1 - k * .2; orb(f.el, px, py, 9 - k * 1.2, f.t); ctx.globalAlpha = 1;
      }
    }
    if (f.t >= f.hit) burst(f, f.b.x, f.b.y, cl01((f.t - f.hit) / (f.dur - f.hit)));
  },
  beam(f) {
    const grow = cl01(f.t / .22), fade = f.t > f.hit + .2 ? cl01(1 - (f.t - f.hit - .2) / .3) : 1;
    const ax = f.a.x + (f.b.x > f.a.x ? 50 : -50), ay = f.a.y - 20, ex = lerp(ax, f.b.x, grow), ey = lerp(ay, f.b.y, grow);
    const c = col(f.el), pulse = 1 + Math.sin(f.t * 60) * .15;
    ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = fade;
    ctx.strokeStyle = c; ctx.globalAlpha = fade * .45; ctx.lineWidth = 30 * pulse * (f.big ? 1.3 : 1); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.globalAlpha = fade; ctx.strokeStyle = '#fff'; ctx.lineWidth = 12 * pulse; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.restore();
    glow(ax, ay, 26, '#fff', 'rgba(255,255,255,0)');
    if (f.t >= f.hit - .05) burst(f, f.b.x, f.b.y, cl01((f.t - f.hit) / (f.dur - f.hit)), f.big ? 1.3 : 1);
    if (f.big && f.t < f.hit + .15) { ctx.fillStyle = `rgba(255,255,240,${.28 * fade})`; ctx.fillRect(0, 0, W, 270); }
  },
  breath(f) {
    const ax = f.a.x + (f.b.x > f.a.x ? 50 : -50), ay = f.a.y - 20;
    for (let i = 0; i < 30; i++) {
      const s = (f.t - i * .014) / .5; if (s <= 0 || s >= 1) continue;
      const sp = (sr(f, i) - .5) * 40 * s, px = lerp(ax, f.b.x, s) + sp * .4, py = lerp(ay, f.b.y, s) + sp, r = 6 + s * 16;
      const bc = f.el === 'fire' || f.el === 'none' ? null : col(f.el);
      glow(px, py, r * 1.6, bc ? hexA(bc, (1 - s) * .9) : `rgba(255,${200 - s * 120},40,${(1 - s) * .9})`, bc ? hexA(bc, 0) : 'rgba(255,60,0,0)');
    }
    if (f.t >= f.hit) burst(f, f.b.x, f.b.y, cl01((f.t - f.hit) / (f.dur - f.hit)), 1.1);
  },
  wave(f) {
    const q = cl01(f.t / (f.hit + .1)), cx = lerp(f.a.x, f.b.x, q), a = f.t > f.hit + .2 ? cl01(1 - (f.t - f.hit - .2) / .5) : 1;
    ctx.save(); ctx.globalAlpha = a * .85;
    const g = ctx.createLinearGradient(0, 120, 0, 270); g.addColorStop(0, '#9be0ff'); g.addColorStop(1, '#2a78c8');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 270);
    for (let x = 0; x <= W; x += 8) { const h = 110 * Math.exp(-(((x - cx) / 110) ** 2)) * (1 + Math.sin(x * .06 + f.t * 14) * .08); ctx.lineTo(x, 262 - h); }
    ctx.lineTo(W, 270); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    if (f.t >= f.hit) burst(f, f.b.x, f.b.y, cl01((f.t - f.hit) / (f.dur - f.hit)), 1.4);
  },
  bolt(f) {
    const k = f.big ? 3 : 1, live = f.t > f.hit - .2 && f.t < f.hit + .3;
    if (live) {
      const fl = Math.floor(f.t * 40);
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < k; i++) {
        const bx = f.b.x + (i - (k - 1) / 2) * 36 + (sr(f, i) - .5) * 14;
        ctx.strokeStyle = 'rgba(255,230,60,.55)'; ctx.lineWidth = 14; zigzag(bx, -10, f.b.x + (i - (k - 1) / 2) * 12, f.b.y, f.seed + i + fl, 22, 10); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; zigzag(bx, -10, f.b.x + (i - (k - 1) / 2) * 12, f.b.y, f.seed + i + fl, 22, 10); ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = `rgba(255,255,210,${f.big ? .4 : .22})`; ctx.fillRect(0, 0, W, 270);
    }
    if (f.t >= f.hit) burst(f, f.b.x, f.b.y, cl01((f.t - f.hit) / (f.dur - f.hit)), f.big ? 1.4 : 1);
  },
  rocks(f) {
    const n = f.big ? 8 : 5;
    for (let i = 0; i < n; i++) {
      const s = (f.t - .04 - i * .055) / .36; if (s <= 0 || s >= 1) continue;
      const bx = f.b.x + (i - n / 2) * 15 + (sr(f, i) - .5) * 10;
      rock(bx, lerp(-30, f.b.y + 14, s * s), 9 + sr(f, i + 9) * 5, f.t * 8 + i);
    }
    if (f.t >= f.hit) burst(f, f.b.x, f.b.y, cl01((f.t - f.hit) / (f.dur - f.hit)), f.big ? 1.4 : 1);
  },
  quake(f) {
    const q = cl01((f.t - f.hit) / (f.dur - f.hit)); if (f.t < f.hit) return;
    const x = f.b.x, y = f.b.y + 42, a = 1 - q, sc = f.big ? 1.5 : 1;
    ctx.save();
    for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(210,180,130,${a * (1 - i * .25)})`; ctx.lineWidth = 5 - i; ctx.beginPath(); ctx.ellipse(x, y, (20 + q * 90 + i * 14) * sc, (7 + q * 26 + i * 4) * sc, 0, 0, 7); ctx.stroke(); }
    ctx.strokeStyle = `rgba(50,30,10,${a})`; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { const an = i * 1.05 + sr(f, i); zigzag(x, y, x + Math.cos(an) * 60 * sc * (.4 + q), y + Math.sin(an) * 22 * sc * (.4 + q), f.seed + i, 5, 6); ctx.stroke(); }
    for (let i = 0; i < 10; i++) { glow(x + (sr(f, i) - .5) * 100 * sc, y - q * 40 * (.5 + sr(f, i + 5)) , 14 * sc, `rgba(190,160,115,${a * .6})`, 'rgba(190,160,115,0)'); }
    ctx.restore();
    burst({ ...f, el: 'earth' }, f.b.x, f.b.y + 20, q, f.big ? 1.3 : .9);
  },
  swirl(f) {
    const q = cl01(f.t / f.hit), x = f.b.x, y = f.b.y;
    if (f.t < f.hit) {
      for (let i = 0; i < 26; i++) {
        const an = i * .24 + f.t * 9, d = (1 - q) * 70 * (.5 + sr(f, i) * .6) + 8;
        glow(x + Math.cos(an) * d, y + Math.sin(an) * d * .8, 9, f.el === 'wind' ? 'rgba(200,255,230,.85)' : f.el === 'poison' ? 'rgba(190,90,220,.85)' : 'rgba(170,110,240,.85)', 'rgba(60,20,110,0)');
      }
      glow(x, y, 10 + q * 22, 'rgba(30,10,60,.9)', 'rgba(90,40,150,0)');
    }
    if (f.t >= f.hit) burst({ ...f, el: f.el === 'wind' || f.el === 'poison' ? f.el : 'dark' }, x, y, cl01((f.t - f.hit) / (f.dur - f.hit)), f.big ? 1.3 : 1);
  },
  whip(f) {
    const ax = f.a.x + (f.b.x > f.a.x ? 40 : -40), ay = f.a.y - 20, q = cl01(f.t / f.hit), fade = f.t > f.hit + .15 ? cl01(1 - (f.t - f.hit - .15) / .25) : 1;
    const c1x = (ax + f.b.x) / 2, c1y = Math.min(ay, f.b.y) - 70 + Math.sin(f.t * 30) * 12;
    ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = fade;
    ctx.strokeStyle = f.el === 'grass' ? '#3e8a3a' : '#f2f2f2'; ctx.lineWidth = f.el === 'grass' ? 7 : 3;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) { const u = q * i / 20, a = 1 - u, px = a * a * ax + 2 * a * u * c1x + u * u * f.b.x, py = a * a * ay + 2 * a * u * c1y + u * u * f.b.y; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.restore();
    if (f.el === 'grass') for (let i = 1; i < 5; i++) { const u = q * i / 5, a = 1 - u; ctx.globalAlpha = fade; leaf(a * a * ax + 2 * a * u * c1x + u * u * f.b.x, a * a * ay + 2 * a * u * c1y + u * u * f.b.y - 6, 5, i); ctx.globalAlpha = 1; }
    if (f.t >= f.hit) burst(f, f.b.x, f.b.y, cl01((f.t - f.hit) / (f.dur - f.hit)), .9);
  },
  explosion(f) {
    if (f.t < f.hit - .05) return;
    const q = cl01((f.t - f.hit + .05) / (f.dur - f.hit)), a = 1 - q, x = f.b.x, y = f.b.y;
    if (q < .3) { ctx.fillStyle = `rgba(255,240,200,${(.3 - q) * 1.6})`; ctx.fillRect(0, 0, W, 270); }
    glow(x, y, 30 + q * 70, `rgba(255,240,150,${a})`, 'rgba(255,90,0,0)');
    for (let i = 0; i < 6; i++) { const an = i * 1.05 + sr(f, i), d = q * 60; glow(x + Math.cos(an) * d, y + Math.sin(an) * d * .8, 26 * (1 - q * .5), `rgba(255,${150 - i * 10},30,${a * .9})`, 'rgba(200,40,0,0)'); }
    ctx.strokeStyle = `rgba(255,220,150,${a})`; ctx.lineWidth = 6 * a + 1; ctx.beginPath(); ctx.arc(x, y, 20 + q * 110, 0, 7); ctx.stroke();
    for (let i = 0; i < 14; i++) { const an = sr(f, i + 30) * 6.283, d = q * (60 + sr(f, i + 50) * 70); ctx.fillStyle = `rgba(255,${200 - i * 8},60,${a})`; ctx.beginPath(); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d - q * 20, 4 * a + 1, 0, 7); ctx.fill(); }
  },
  heal(f) {
    const x = f.a.x, y = f.a.y, q = cl01(f.t / f.dur), a = q > .7 ? cl01((1 - q) / .3) : 1;
    glow(x, y + 10, 60, `rgba(190,255,190,${.4 * a})`);
    for (let i = 0; i < 16; i++) { const s = cl01((f.t - i * .03) / .7); if (s <= 0 || s >= 1) continue; star4(x + (sr(f, i) - .5) * 100, y + 40 - s * 100, 7 + sr(f, i + 9) * 4, i % 2 ? '#b8ffb0' : '#fff6a0', (1 - s) * a + .2); }
  },
};

BattleScene.prototype.drawFx = function () {
  this.fx.forEach(f => {
    const fn = FXDRAW[f.type]; if (fn && f.t < f.dur + .1) fn(f);
    const q = f.t - f.hit;
    if (f.dmg > 0 && q >= 0 && q < 1) {
      const pop = Math.min(1, q * 7), y = f.b.y - 52 - Math.min(1, q * 3) * 22, a = q > .7 ? 1 - (q - .7) / .3 : 1;
      ctx.globalAlpha = Math.max(0, a);
      txt(String(f.dmg), f.b.x, y, { size: Math.round((f.mult > 1.2 ? 34 : 26) * (.6 + .4 * pop)), align: 'center', color: f.mult > 1.2 ? '#ffd84a' : f.mult < .9 ? '#c8c8d0' : '#fff', shadow: true });
      ctx.globalAlpha = 1;
    }
  });
};
