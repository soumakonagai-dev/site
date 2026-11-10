'use strict';
// ===== 描画ヘルパー =====
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const FONT = '"Hiragino Sans","Yu Gothic UI","Meiryo",sans-serif';

function txt(s, x, y, o = {}) {
  ctx.font = `bold ${o.size || 13}px ${FONT}`;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = 'top';
  if (o.shadow) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillText(s, x + 1, y + 1); }
  ctx.fillStyle = o.color || '#fff';
  ctx.fillText(s, x, y);
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function box(x, y, w, h, o = {}) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, o.bg || 'rgba(38,46,82,.95)'); g.addColorStop(1, o.bg2 || 'rgba(14,18,38,.96)');
  rr(x, y, w, h, 9); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = o.border || '#d8cfa8'; ctx.stroke();
  rr(x + 3.5, y + 3.5, w - 7, h - 7, 6); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.stroke();
}
function bar(x, y, w, h, r, col) {
  ctx.fillStyle = 'rgba(0,0,0,.6)'; rr(x, y, w, h, h / 2); ctx.fill();
  r = clamp(r, 0, 1);
  if (r <= 0) return;
  const c = col || (r > .5 ? '#5fd35f' : r > .2 ? '#e8c53c' : '#e8503c');
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, shade(c, .35)); g.addColorStop(1, shade(c, -.15));
  rr(x + 1, y + 1, Math.max(h - 2, (w - 2) * r), h - 2, (h - 2) / 2); ctx.fillStyle = g; ctx.fill();
}
function chip(el, x, y) {
  const e = ELEMENTS[el] || ELEMENTS.none;
  rr(x, y, 52, 15, 7.5);
  const g = ctx.createLinearGradient(0, y, 0, y + 15); g.addColorStop(0, shade(e.color, .3)); g.addColorStop(1, e.color);
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.stroke();
  txt(e.name, x + 26, y + 1, { size: 10, align: 'center', color: '#1a1a1a' });
}
// 複合タイプなら ふたつならべる
function chips(c, x, y) { chip(c.element, x, y); if (c.element2) chip(c.element2, x + 55, y); }
function wrap(s, maxW, size = 13) {
  ctx.font = `bold ${size}px ${FONT}`;
  const out = []; let line = '';
  for (const ch of s) {
    if (ch === '\n') { out.push(line); line = ''; continue; }
    if (ctx.measureText(line + ch).width > maxW) { out.push(line); line = ch; } else line += ch;
  }
  if (line) out.push(line);
  return out;
}
// 色を明るく(+)/暗く(-)する。#rrggbb でも rgb(r,g,b) でもよい
const _shadeCache = {};
function shade(c, amt) {
  const key = c + amt; if (_shadeCache[key]) return _shadeCache[key];
  let r, g, b;
  if (c[0] === '#') { const n = parseInt(c.slice(1), 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; }
  else { [r, g, b] = c.match(/\d+/g).map(Number); }
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return (_shadeCache[key] = `rgb(${r},${g},${b})`);
}
const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

// ===== ツギハギ獣の描画 =====
// c: {species, element, parts[]}  x,y: 中心  s: 大きさ(px)  dir: 1=右向き -1=左向き
const SLOTS = [[-22, -4, -0.2], [6, 8, 0.15], [-4, -20, 0.3]];
function drawCreature(c, x, y, s, dir = 1, t = 0, alpha = 1) {
  const L = lookOf(c.parts || [], c.species2, c.custom);
  const k = s / 100 * L.scale;
  ctx.save();
  ctx.translate(x, y); ctx.scale(dir * k, k * (1 + Math.sin(t * 3) * .015)); ctx.globalAlpha = alpha;
  const e1 = (ELEMENTS[c.element] || ELEMENTS.none).color, col = lookColor(c.element2 && ELEMENTS[c.element2] ? mixHex(e1, ELEMENTS[c.element2].color, .38) : e1, L);
  const dk = shade(col, -.45), lt = shade(col, .5), mid = shade(col, -.15);
  ctx.lineWidth = 2.6; ctx.strokeStyle = dk; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const parts = c.parts || [];
  const has = id => parts.includes(id);
  const sh = c.species;
  const blink = (t % 3.4) < .12;

  // 立体感のある楕円（左上から光が当たる）
  const ell = (cx, cy, rx, ry, base, rot = 0, stroke = true) => {
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot, 0, 7);
    const r = Math.max(rx, ry), g = ctx.createRadialGradient(cx - rx * .35, cy - ry * .5, r * .08, cx, cy, r * 1.1);
    g.addColorStop(0, shade(base, .45)); g.addColorStop(.5, base); g.addColorStop(1, shade(base, -.32));
    ctx.fillStyle = g; ctx.fill(); if (stroke) ctx.stroke();
  };
  const poly = (pts, c1, stroke = true) => {
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
    ctx.fillStyle = c1; ctx.fill(); if (stroke) ctx.stroke();
  };
  const eye = (ex, ey, r) => {
    if (blink) { ctx.beginPath(); ctx.moveTo(ex - r, ey); ctx.lineTo(ex + r, ey); ctx.lineWidth = 2.4; ctx.stroke(); ctx.lineWidth = 2.6; return; }
    ctx.beginPath(); ctx.ellipse(ex, ey, r, r * 1.2, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 1.8; ctx.stroke();
    ctx.fillStyle = '#1b1b2c'; ctx.beginPath(); ctx.ellipse(ex + r * .25, ey + r * .1, r * .66, r * .86, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + r * .5, ey - r * .3, r * .28, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(ex - r * .05, ey + r * .45, r * .14, 0, 7); ctx.fill(); ctx.lineWidth = 2.6;
  };
  const blush = (bx, by) => { ctx.fillStyle = 'rgba(255,120,140,.45)'; ctx.beginPath(); ctx.ellipse(bx, by, 6, 4, 0, 0, 7); ctx.fill(); };
  const paw = (px, py, w, h) => {
    ctx.beginPath(); ctx.roundRect(px, py, w, h, 6);
    const g = ctx.createLinearGradient(px, py, px + w, py); g.addColorStop(0, mid); g.addColorStop(1, dk);
    ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    ctx.fillStyle = lt; ctx.beginPath(); ctx.ellipse(px + w / 2 + 2, py + h - 3, w / 2 + 2, 5, 0, 0, 7); ctx.fill(); ctx.stroke();
  };

  const A = ANCH[sh] || ANCH.beast, H = { col, dk, lt, mid, t };
  lookBehind(L, A, H);
  if (sh === 'beast') {
    ell(-54, -14, 11, 19, col, .6); ell(-60, -26, 6, 8, lt, .6, false);          // しっぽ
    paw(-34, 12, 15, 26); paw(-12, 16, 14, 22);                                  // うしろ脚
    ell(0, 0, 43, 29, col);
    ell(5, 11, 29, 14, lt, 0, false);
    paw(14, 14, 15, 26); paw(30, 10, 14, 28);                                    // まえ脚
    poly([[22, -28], [28, -52], [40, -32]], col); poly([[26, -32], [29, -45], [35, -33]], '#f6b6c0', false);
    poly([[40, -32], [50, -52], [56, -24]], col); poly([[45, -33], [50, -45], [52, -28]], '#f6b6c0', false);
    ell(38, -14, 23, 21, col);
    ell(49, -3, 12, 9, lt, 0, false);
    ctx.fillStyle = '#2a1a1a'; ctx.beginPath(); ctx.ellipse(59, -8, 3.6, 2.6, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(56, -4); ctx.quadraticCurveTo(52, 2, 46, -1); ctx.lineWidth = 1.8; ctx.stroke(); ctx.lineWidth = 2.6;
    eye(43, -20, 5.2); blush(35, -6);
  } else if (sh === 'bird') {
    poly([[-34, -4], [-66, -22], [-60, -6]], dk); poly([[-34, 2], [-70, 0], [-62, 12]], mid); poly([[-32, 6], [-62, 22], [-52, 16]], dk);
    ctx.strokeStyle = '#b8643c'; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(-6, 26); ctx.lineTo(-8, 42); ctx.moveTo(10, 26); ctx.lineTo(12, 42); ctx.stroke();
    ctx.lineWidth = 3; [[-8, 42], [12, 42]].forEach(p => { ctx.beginPath(); ctx.moveTo(p[0] - 8, p[1] + 3); ctx.lineTo(p[0], p[1]); ctx.lineTo(p[0] + 8, p[1] + 3); ctx.stroke(); });
    ctx.lineWidth = 2.6; ctx.strokeStyle = dk;
    ell(0, 0, 39, 31, col);
    ell(7, 9, 25, 19, lt, 0, false);
    poly([[26, -40], [18, -58], [32, -46]], mid); poly([[32, -42], [32, -62], [40, -44]], col);     // とさか
    ell(30, -26, 19, 18, col);
    poly([[44, -30], [64, -23], [44, -15]], '#f4b83a'); poly([[44, -23], [64, -23], [44, -15]], '#d98a1c');
    eye(35, -30, 4.6); blush(28, -18);
    ell(-8, 2, 24, 15, mid, -.3);
    ctx.strokeStyle = dk; ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-26 + i * 10, 2 + i * 2); ctx.quadraticCurveTo(-18 + i * 10, 8, -12 + i * 10, 4); ctx.stroke(); }
    ctx.lineWidth = 2.6;
  } else if (sh === 'fish') {
    poly([[-36, 0], [-68, -26], [-62, 0], [-68, 26]], mid);
    poly([[-12, -25], [4, -48], [28, -24]], mid);
    poly([[-6, 22], [-16, 40], [10, 26]], mid);
    ell(0, 0, 45, 28, col);
    ell(5, 12, 33, 12, lt, 0, false);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 44, 27, 0, 0, 7); ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 1.5;
    for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) { ctx.beginPath(); ctx.arc(-30 + q * 14 + (r % 2) * 7, -12 + r * 12, 7, 0, Math.PI); ctx.stroke(); }
    ctx.restore(); ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(14, 0, 15, -1, 1); ctx.stroke();
    eye(31, -7, 6.4);
    ctx.beginPath(); ctx.moveTo(44, 6); ctx.quadraticCurveTo(38, 10, 34, 7); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 2.6;
    blush(24, 6);
  } else if (sh === 'bug') {
    ctx.strokeStyle = dk; ctx.lineWidth = 3.5;
    for (let i = 0; i < 3; i++) { const lx = -26 + i * 18; ctx.beginPath(); ctx.moveTo(lx, 18); ctx.lineTo(lx - 8 + i * 3, 34); ctx.lineTo(lx - 12 + i * 5, 44); ctx.stroke(); }
    ctx.lineWidth = 2.6;
    ctx.save(); ctx.globalAlpha *= .6; ell(-12, -26, 32, 11, '#f4faff', -.25); ctx.restore();
    ell(-22, 4, 31, 25, col);
    ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-28 + i * 9, 4, 24 - i * 3, -1.2, 1.2); ctx.stroke(); }
    ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    ell(12, 2, 20, 18, mid);
    ell(40, -4, 18, 17, col);
    ctx.beginPath(); ctx.moveTo(46, -18); ctx.quadraticCurveTo(52, -42, 66, -46); ctx.moveTo(38, -18); ctx.quadraticCurveTo(38, -42, 50, -52); ctx.stroke();
    ctx.fillStyle = dk; ctx.beginPath(); ctx.arc(66, -46, 3.5, 0, 7); ctx.arc(50, -52, 3.5, 0, 7); ctx.fill();
    poly([[54, 4], [64, 10], [54, 12]], dk);
    eye(44, -8, 6.4); blush(36, 4);
  } else if (sh === 'golem') {
    const stone = '#8e8e9a', stoneD = '#5a5a68', stoneL = '#bcbcc8';
    const slab = (x, y, w, h, r) => {
      const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, stoneL); g.addColorStop(.5, stone); g.addColorStop(1, stoneD);
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#34343e'; ctx.stroke();
    };
    slab(-28, 20, 24, 24, 6); slab(6, 20, 24, 24, 6);
    slab(-52, -16, 20, 42, 9); slab(32, -16, 20, 42, 9); slab(-55, 20, 26, 18, 8); slab(29, 20, 26, 18, 8);
    slab(-34, -32, 68, 58, 13);
    poly([[-28, -26], [-6, -28], [-14, -8], [-30, -10]], 'rgba(255,255,255,.12)', false); poly([[8, -4], [28, -8], [26, 16], [10, 14]], 'rgba(0,0,0,.12)', false);
    ctx.strokeStyle = col; ctx.lineWidth = 3; zigzag(-20, -30, -10, 20, 3.3, 5, 6); ctx.stroke(); zigzag(14, -28, 22, 10, 7.7, 4, 5); ctx.stroke();
    ctx.strokeStyle = '#34343e'; ctx.lineWidth = 2.6;
    slab(-16, -60, 42, 32, 11);
    const gl = .7 + .3 * Math.sin(t * 3);
    [[-2, -46], [14, -46]].forEach(p => {
      const gg = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 9); gg.addColorStop(0, '#fff'); gg.addColorStop(.4, col); gg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = alpha * gl; ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 7); ctx.fill(); ctx.globalAlpha = alpha;
    });
    ctx.strokeStyle = '#34343e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-2, -35); ctx.lineTo(14, -35); ctx.stroke(); ctx.lineWidth = 2.6;
  } else if (sh === 'ghost') {
    ctx.translate(0, Math.sin(t * 2.5) * 5);
    ctx.save(); ctx.globalAlpha *= .88;
    ctx.beginPath(); ctx.moveTo(-38, 26); ctx.quadraticCurveTo(-48, -52, 0, -52); ctx.quadraticCurveTo(48, -52, 38, 26);
    for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(30 - i * 19, 44 + (i % 2) * -12, 19 - i * 19, 28 + (i % 2) * 6);
    ctx.closePath();
    const g = ctx.createRadialGradient(-10, -24, 4, 0, 0, 56); g.addColorStop(0, shade(col, .65)); g.addColorStop(.6, col); g.addColorStop(1, shade(col, -.35));
    ctx.fillStyle = g; ctx.fill(); ctx.stroke(); ctx.restore();
    ell(-42, 2, 10, 6, col, .6); ell(42, 2, 10, 6, col, -.6);
    [[-14, -22], [14, -22]].forEach(p => {
      ctx.fillStyle = '#1c0c30'; ctx.beginPath(); ctx.ellipse(p[0], p[1], 8, 11, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0] + 2, p[1] - 3, 2.6, 0, 7); ctx.fill();
    });
    ctx.fillStyle = '#1c0c30'; ctx.beginPath(); ctx.ellipse(0, -2, 6, 8, 0, 0, 7); ctx.fill();
    blush(-24, -8); blush(24, -8);
  } else if (sh === 'dino') {
    ctx.beginPath(); ctx.moveTo(-28, -16); ctx.quadraticCurveTo(-64, -22, -84, 8); ctx.quadraticCurveTo(-60, 10, -26, 24); ctx.closePath();
    const g = ctx.createLinearGradient(-84, 0, -26, 0); g.addColorStop(0, dk); g.addColorStop(1, col); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    for (let i = 0; i < 6; i++) { const sx = -34 + i * 12, sy = -28 - (i < 3 ? i * 1.5 : (5 - i) * 2); poly([[sx - 6, sy + 4], [sx, sy - 12], [sx + 6, sy + 4]], mid); }
    ell(-16, 22, 18, 20, mid);
    paw(-30, 32, 24, 12); [-28, -20, -12].forEach(cx => poly([[cx - 2, 44], [cx + 1, 52], [cx + 4, 44]], '#f2f0e6'));
    ell(0, 0, 44, 31, col);
    ell(10, 14, 31, 16, lt, 0, false);
    ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-26 + (i % 5) * 12, -14 + Math.floor(i / 5) * 14, 2.6, 0, 7); ctx.fill(); }
    ell(8, 24, 14, 18, col); paw(2, 36, 22, 10); [4, 11, 18].forEach(cx => poly([[cx - 2, 46], [cx + 1, 54], [cx + 4, 46]], '#f2f0e6'));
    ell(32, 10, 5, 9, col, -.2); poly([[34, 18], [37, 26], [40, 18]], '#f2f0e6');
    ell(52, -26, 26, 21, col, -.1);
    ell(60, -9, 22, 9, mid, .12);
    for (let i = 0; i < 5; i++) poly([[44 + i * 7, -14], [47 + i * 7, -5], [50 + i * 7, -14]], '#fff');
    ctx.fillStyle = '#2a1a1a'; ctx.beginPath(); ctx.ellipse(76, -28, 2.6, 2, 0, 0, 7); ctx.fill();
    if (blink) { ctx.beginPath(); ctx.moveTo(52, -34); ctx.lineTo(64, -34); ctx.stroke(); } else {
      ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.ellipse(58, -34, 6.4, 6, 0, 0, 7); ctx.fill(); ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = '#1b1b2c'; ctx.beginPath(); ctx.ellipse(59, -34, 1.8, 5.2, 0, 0, 7); ctx.fill();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(50, -42); ctx.lineTo(66, -37); ctx.stroke(); ctx.lineWidth = 2.6;
    }
  } else if (sh === 'slime') {
    ctx.save(); ctx.globalAlpha *= .93;
    ctx.beginPath(); ctx.moveTo(-46, 40); ctx.bezierCurveTo(-58, -6, -22, -34, 6, -30); ctx.bezierCurveTo(36, -28, 58, 4, 46, 40); ctx.closePath();
    const sg = ctx.createRadialGradient(-12, -8, 4, 0, 10, 58); sg.addColorStop(0, shade(col, .55)); sg.addColorStop(.6, col); sg.addColorStop(1, shade(col, -.3));
    ctx.fillStyle = sg; ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-18, -10, 12, 6, -.5, 0, 7); ctx.fill();
    eye(10, 0, 6.5); eye(30, 0, 6.5);
    ctx.beginPath(); ctx.arc(20, 12, 6, .1, Math.PI - .1); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 2.6;
    blush(0, 12); blush(40, 12);
  } else if (sh === 'rabbit') {
    ell(-36, 4, 11, 11, '#f8f4f0');
    paw(-22, 18, 16, 20); paw(16, 18, 16, 20);
    ell(0, 6, 34, 26, col); ell(6, 14, 22, 14, lt, 0, false);
    ell(30, -42, 7, 24, col, -.2); ell(30, -42, 3.5, 18, '#f6b6c0', -.2, false);
    ell(46, -40, 7, 24, col, .25); ell(46, -40, 3.5, 18, '#f6b6c0', .25, false);
    ell(34, -14, 20, 18, col);
    ctx.fillStyle = '#f08aa0'; ctx.beginPath(); ctx.ellipse(52, -10, 3.4, 2.6, 0, 0, 7); ctx.fill();
    ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(50, -8); ctx.lineTo(62, -10); ctx.moveTo(50, -6); ctx.lineTo(62, -4); ctx.stroke(); ctx.lineWidth = 2.6;
    eye(41, -18, 5); blush(32, -6);
  } else if (sh === 'plant') {
    ctx.strokeStyle = '#2f7a3a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(4, -14); ctx.lineTo(2, -2); ctx.stroke(); ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    ell(-12, 42, 10, 6, mid); ell(14, 42, 10, 6, mid);
    ell(-32, 6, 17, 8, '#4a9a4a', .5); ell(32, 6, 17, 8, '#4a9a4a', -.5);
    ell(0, 10, 32, 30, col); ell(4, 18, 20, 14, lt, 0, false);
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + Math.sin(t * 2) * .05; ctx.save(); ctx.translate(4 + Math.cos(a) * 20, -34 + Math.sin(a) * 20); ctx.rotate(a); ctx.fillStyle = i % 2 ? '#ff9ac0' : '#ffc0d8'; ctx.beginPath(); ctx.ellipse(8, 0, 15, 9, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
    ell(4, -34, 20, 18, '#ffe27a'); eye(-2, -36, 4.5); eye(12, -36, 4.5);
    ctx.beginPath(); ctx.arc(5, -28, 4, .2, Math.PI - .2); ctx.lineWidth = 1.8; ctx.stroke(); ctx.lineWidth = 2.6; blush(-8, -28); blush(18, -28);
  } else if (sh === 'mushroom') {
    ell(-10, 42, 10, 6, '#e8dcc4'); ell(10, 42, 10, 6, '#e8dcc4');
    ell(0, 14, 24, 30, '#f4ead8');
    eye(-8, 8, 5); eye(10, 8, 5);
    ctx.beginPath(); ctx.arc(1, 18, 4, .2, Math.PI - .2); ctx.lineWidth = 1.8; ctx.stroke(); ctx.lineWidth = 2.6; blush(-16, 16); blush(18, 16);
    ell(0, -2, 40, 9, mid);
    ell(0, -16, 44, 28, col);
    ctx.fillStyle = '#f6efe4'; [[-22, -22, 7], [0, -34, 8], [22, -22, 6], [-6, -14, 5], [14, -10, 4]].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, 7); ctx.fill(); });
  } else if (sh === 'snake') {
    for (let i = 0; i < 15; i++) { const u = i / 14, x = -62 + u * 100, y = 22 - u * 30 + Math.sin(u * 7 + t * 3) * 8 * (1 - u * .3), r = 5 + u * 11; ell(x, y, r, r, i % 2 ? col : mid); }
    ell(46, -14, 17, 13, col, .15);
    ctx.strokeStyle = '#d83a4a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(61, -10); ctx.lineTo(70, -10); ctx.lineTo(75, -14); ctx.moveTo(70, -10); ctx.lineTo(75, -6); ctx.stroke(); ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    eye(52, -18, 4.6); blush(44, -8);
  } else if (sh === 'turtle') {
    paw(-34, 16, 17, 22); paw(14, 16, 17, 22);
    poly([[-46, 6], [-62, 12], [-46, 16]], col);
    ell(0, 18, 42, 13, lt);
    ell(42, 8, 12, 10, col, 0, false); ell(50, 6, 15, 13, col); eye(55, 2, 4.4);
    ell(0, -4, 46, 32, mid);
    const hex = (cx, cy, r) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * 1.047 + .52; i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fill(); ctx.stroke(); };
    hex(0, -12, 13); hex(-24, -2, 11); hex(24, -2, 11); hex(-12, 12, 9); hex(12, 12, 9);
  } else if (sh === 'octopus') {
    for (let i = 0; i < 6; i++) {
      const x0 = -27 + i * 10.8, w = Math.sin(t * 3 + i) * 7;
      for (const [lw, cc] of [[11, dk], [8, col]]) { ctx.strokeStyle = cc; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, 10); ctx.bezierCurveTo(x0 + w * 1.4, 26, x0 - w, 38, x0 + w * .7 + (i % 2 ? 8 : -8), 48); ctx.stroke(); }
      ctx.fillStyle = lt; ctx.beginPath(); ctx.arc(x0 + w * .5, 30, 2, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    ell(0, -14, 36, 34, col);
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-12, -30, 12, 6, -.4, 0, 7); ctx.fill();
    eye(-10, -6, 6.2); eye(14, -6, 6.2);
    ctx.beginPath(); ctx.arc(2, 4, 4, .2, Math.PI - .2); ctx.lineWidth = 1.8; ctx.stroke(); ctx.lineWidth = 2.6; blush(-24, 4); blush(28, 4);
  } else if (sh === 'bat') {
    const bw = (sx, ox, oy, rot) => { ctx.save(); ctx.translate(ox, oy); ctx.rotate(rot + Math.sin(t * 7) * .1); ctx.scale(sx, Math.abs(sx)); poly([[0, 0], [-20, -48], [-34, -30], [-48, -52], [-56, -20], [-72, -30], [-60, 8], [-24, 12]], shade(col, -.35)); ctx.restore(); };
    bw(1, -6, -2, -.1); bw(-.7, 8, -2, .1);
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, 28); ctx.lineTo(-6, 40); ctx.moveTo(6, 28); ctx.lineTo(8, 40); ctx.stroke(); ctx.lineWidth = 2.6;
    ell(0, 4, 22, 26, col); ell(2, 12, 14, 14, lt, 0, false);
    poly([[-8, -22], [-15, -46], [2, -28]], col); poly([[8, -26], [17, -46], [18, -22]], col);
    ell(6, -10, 16, 15, col);
    poly([[10, -2], [12, 6], [15, -2]], '#fff'); poly([[17, -2], [19, 5], [21, -2]], '#fff');
    eye(8, -13, 4.6); eye(19, -13, 4); blush(2, -4);
  } else if (sh === 'dragon') {
    ctx.save(); ctx.translate(-4, -20); ctx.rotate(-.15 + Math.sin(t * 5) * .08);
    poly([[0, 0], [-4, -62], [-26, -44], [-40, -56], [-50, -32], [-66, -38], [-52, -6], [-22, 6]], mid); ctx.restore();
    for (const [lw, cc] of [[15, dk], [11, col]]) { ctx.strokeStyle = cc; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, 4); ctx.quadraticCurveTo(-70, 8, -66, 34); ctx.stroke(); }
    ctx.strokeStyle = dk; ctx.lineWidth = 2.6; poly([[-66, 34], [-78, 24], [-78, 44]], mid);
    paw(-24, 16, 15, 26); paw(14, 16, 15, 26);
    ell(0, 6, 38, 26, col); ell(6, 14, 26, 14, lt, 0, false);
    for (const [lw, cc] of [[18, dk], [14, col]]) { ctx.strokeStyle = cc; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(24, -4); ctx.quadraticCurveTo(44, -10, 44, -32); ctx.stroke(); }
    ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    for (let i = 0; i < 6; i++) poly([[-26 + i * 9 - 4, -18 - Math.abs(i - 2) * .6], [-26 + i * 9, -30], [-26 + i * 9 + 4, -18]], mid);
    ell(48, -36, 19, 14, col, -.15); ell(60, -32, 10, 7, mid);
    poly([[40, -46], [34, -64], [48, -48]], '#f4ecd0'); poly([[50, -48], [48, -68], [58, -48]], '#f4ecd0');
    for (let i = 0; i < 3; i++) poly([[56 + i * 5, -27], [58 + i * 5, -21], [60 + i * 5, -27]], '#fff');
    ctx.fillStyle = '#2a1a1a'; ctx.beginPath(); ctx.ellipse(68, -34, 2, 1.6, 0, 0, 7); ctx.fill();
    eye(51, -40, 4.6);
  } else if (sh === 'robot') {
    const metal = (x, y, w, h, r) => { const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#d8e2ee'); g.addColorStop(.5, '#9aa8bc'); g.addColorStop(1, '#5a6a80'); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#2a3444'; ctx.stroke(); };
    ctx.lineWidth = 2.6; ctx.strokeStyle = '#2a3444';
    metal(-18, 20, 14, 24, 3); metal(6, 20, 14, 24, 3); metal(-44, -20, 13, 38, 5); metal(31, -20, 13, 38, 5); metal(-46, 16, 17, 14, 5); metal(29, 16, 17, 14, 5);
    metal(-26, -26, 52, 48, 7);
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-26, 4); ctx.lineTo(26, 4); ctx.moveTo(-10, 4); ctx.lineTo(-10, 22); ctx.moveTo(10, 4); ctx.lineTo(10, 22); ctx.stroke();
    glow(0, -6, 18, hexA(col, .9), hexA(col, 0)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -6, 5, 0, 7); ctx.fill(); ctx.lineWidth = 2.6; ctx.strokeStyle = '#2a3444';
    metal(-14, -54, 36, 26, 7);
    ctx.fillStyle = '#10182a'; ctx.beginPath(); ctx.roundRect(-8, -47, 28, 11, 4); ctx.fill();
    const sx = -4 + (Math.sin(t * 2.5) + 1) * 11; ctx.fillStyle = hexA(col, 1); ctx.fillRect(sx, -44, 6, 5); glow(sx + 3, -41.5, 10, hexA(col, .6), hexA(col, 0));
    ctx.strokeStyle = '#2a3444'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(4, -54); ctx.lineTo(4, -68); ctx.stroke(); ctx.fillStyle = '#e83a3a'; ctx.beginPath(); ctx.arc(4, -70, 3.4, 0, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = dk;
  } else if (EXTRA_DRAW[sh]) {
    EXTRA_DRAW[sh]({ ell, poly, eye, blush, paw, col, dk, lt, mid, t });
    ctx.strokeStyle = dk;
  }
  lookFront(L, A, H);

  // ツギハギ：パーツごとに縫い目つきのパッチを貼る
  let slot = 0;
  parts.forEach(id => {
    const it = ITEMS[id];
    if (!it || it.kind !== 'part' || LOOK[id]) return;
    const p = SLOTS[slot++ % 3];
    ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(p[2]);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-7, -6, 16, 16);
    ctx.fillStyle = it.color; ctx.fillRect(-8, -8, 16, 16);
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(-8, -8, 16, 5);
    ctx.setLineDash([3, 2]); ctx.strokeStyle = '#fffbe8'; ctx.lineWidth = 1.5; ctx.strokeRect(-6, -6, 12, 12);
    ctx.setLineDash([]); ctx.restore();
  });
  ctx.setLineDash([]); ctx.lineWidth = 2.6; ctx.strokeStyle = dk;

  if (has('wing')) {
    ctx.save(); ctx.translate(-10, -10); ctx.rotate(-.5 + Math.sin(t * 5) * .06);
    ell(0, -4, 36, 13, '#f4f1e6');
    ctx.lineWidth = 1.4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-26 + i * 14, -2); ctx.lineTo(-30 + i * 14, -12); ctx.stroke(); }
    ctx.restore(); ctx.lineWidth = 2.6;
  }
  if (has('mizukaki')) { poly([[-8, 22], [-32, 46], [-18, 50], [-4, 42], [4, 48], [12, 28]], 'rgba(74,166,230,.9)'); ctx.lineWidth = 1.4; [[-8, 24, -26, 46], [-6, 26, -8, 44], [0, 26, 4, 46]].forEach(l => { ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke(); }); ctx.lineWidth = 2.6; }
  if (has('shell')) { [[-22, -24], [0, -29], [22, -24]].forEach(p => ell(p[0], p[1], 11, 8, '#9a7650')); }
  if (has('fur')) { [[-22, 18], [-8, 25], [8, 25], [22, 18]].forEach(p => ell(p[0], p[1], 9, 8, '#f6efe4')); }
  if (has('fang')) { poly([[46, -2], [50, 10], [54, -2]], '#fff'); poly([[54, -2], [58, 9], [62, -2]], '#fff'); }
  if (has('claw')) { [16, 26, 36].forEach(cx => poly([[cx, 36], [cx + 3, 47], [cx + 6, 36]], '#eef0f8')); }
  if (has('vine')) {
    ctx.strokeStyle = '#3e8a3a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(24, -34); ctx.bezierCurveTo(10, -62, 42, -68, 30, -48); ctx.stroke();
    ell(36, -58, 9, 5, '#58b852', -.5);
    ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
  }
  if (has('hotaru')) {
    const g = .55 + .35 * Math.sin(t * 4);
    const rg = ctx.createRadialGradient(-34, -12, 2, -34, -12, 20); rg.addColorStop(0, `rgba(255,248,160,${g})`); rg.addColorStop(1, 'rgba(255,240,120,0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(-34, -12, 20, 0, 7); ctx.fill();
    ctx.fillStyle = '#fffbd0'; ctx.beginPath(); ctx.arc(-34, -12, 6, 0, 7); ctx.fill();
  }
  // エッセンス：頭の上に属性のしるし
  if (has('ess_fire')) { const f = Math.sin(t * 9) * 3; poly([[26, -42], [32, -64 - f], [38, -52], [44, -70 + f], [48, -42]], '#ff9a2e'); poly([[32, -42], [37, -56], [42, -42]], '#ffe27a', false); }
  if (has('ess_water')) { ctx.beginPath(); ctx.moveTo(34, -68); ctx.quadraticCurveTo(50, -46, 34, -40); ctx.quadraticCurveTo(18, -46, 34, -68); ctx.fillStyle = '#6fc3ff'; ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(30, -52, 3, 0, 7); ctx.fill(); }
  if (has('ess_grass')) { ell(28, -52, 11, 5.5, '#6fd05e', -.7); ell(43, -54, 11, 5.5, '#6fd05e', .7); }
  ctx.restore();
}

// 主人公（旅の工房見習い）。face = {x,y}
function drawHero(x, y, face, walk, swim, look, mode) {
  const L = look || { skin: '#f6d0a8', hair: '#5a3524', top: '#e0604a', pants: '#3c3350' };
  ctx.save(); ctx.translate(x, y);
  if (mode === 'fly') { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, 10, 8, 3, 0, 0, 7); ctx.fill(); ctx.translate(0, -10 + Math.sin(walk * 6 + 1) * 2); }
  if (mode === 'heat') glow(0, -6, 22, 'rgba(255,150,50,.55)', 'rgba(255,60,0,0)');
  const sw = Math.sin(walk * 11), bob = walk ? Math.abs(Math.sin(walk * 11)) * -1.6 : 0;
  if (swim) {
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 6, 13 + Math.sin(walk * 6) * 1.5, 5, 0, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.rect(-16, -30, 32, 36); ctx.clip();
  } else { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 8, 9, 3.4, 0, 0, 7); ctx.fill(); }
  const back = face.y < 0, side = face.x !== 0;
  ctx.translate(0, bob);
  // 脚
  ctx.fillStyle = L.pants;
  ctx.fillRect(-5, 1, 4, 7 + (walk ? sw * 2 : 0)); ctx.fillRect(1, 1, 4, 7 - (walk ? sw * 2 : 0));
  ctx.fillStyle = '#6a4a2c'; ctx.fillRect(-6, 7 + (walk ? sw * 2 : 0), 5, 2); ctx.fillRect(1, 7 - (walk ? sw * 2 : 0), 5, 2);
  // 荷物（背中）
  if (!back || side) { ctx.fillStyle = '#8a5a2c'; ctx.beginPath(); ctx.roundRect(side ? -face.x * 7 - 3 : -6, -6, 6, 9, 2); ctx.fill(); }
  // 胴
  const g = ctx.createLinearGradient(0, -8, 0, 3); g.addColorStop(0, shade(L.top, .2)); g.addColorStop(1, shade(L.top, -.2));
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-6.5, -8, 13, 12, 4); ctx.fill();
  ctx.fillStyle = '#6a3a22'; ctx.fillRect(-6.5, -1, 13, 2);
  // 腕
  ctx.fillStyle = L.top; ctx.fillRect(-9, -7 + (walk ? -sw * 1.5 : 0), 3, 8); ctx.fillRect(6, -7 + (walk ? sw * 1.5 : 0), 3, 8);
  // スカーフ
  ctx.fillStyle = '#f6d24a'; ctx.fillRect(-5, -10, 10, 3);
  if (side) { ctx.beginPath(); ctx.moveTo(-face.x * 5, -9); ctx.lineTo(-face.x * 11, -6 + sw); ctx.lineTo(-face.x * 5, -6); ctx.fill(); }
  // 頭
  ctx.fillStyle = L.skin; ctx.beginPath(); ctx.arc(0, -15, 7.2, 0, 7); ctx.fill();
  ctx.fillStyle = L.hair;
  ctx.beginPath(); ctx.arc(0, -16, 7.6, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
  if (back) { ctx.beginPath(); ctx.arc(0, -15, 7.4, 0, 7); ctx.fill(); }
  else { ctx.fillRect(-7, -17, 4, 4); if (!side) ctx.fillRect(3, -17, 4, 3); }
  // 目
  if (!back) {
    ctx.fillStyle = '#1b1b2c';
    if (side) ctx.fillRect(face.x * 3 - 1, -14, 2, 3);
    else { ctx.fillRect(-4, -14, 2, 3); ctx.fillRect(2, -14, 2, 3); }
  }
  ctx.restore();
}

function sparkle(cx, cy, t, n = 8, r = 60) {
  for (let i = 0; i < n; i++) {
    const a = t * 2 + i * 6.283 / n, d = r * (.6 + .4 * Math.sin(t * 3 + i));
    ctx.fillStyle = `rgba(255,240,150,${.5 + .5 * Math.sin(t * 5 + i)})`;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .7, 3, 0, 7); ctx.fill();
  }
}
