'use strict';
// ===== 新しい種族10種の描画（draw.js の drawCreature から呼ばれる）=====
// H = { ell, poly, eye, blush, paw, col, dk, lt, mid, t }  右むき・100x100ざひょう
const EXTRA_DRAW = {
  fox(H) {
    const { ell, poly, eye, blush, paw, col, dk, lt, mid, t } = H;
    ctx.save(); ctx.translate(-44, -6); ctx.rotate(.5 + Math.sin(t * 2.4) * .05); ell(0, 0, 14, 28, col); ell(-3, -22, 8, 10, '#fff', 0, false); ctx.restore();
    paw(-30, 10, 13, 26); paw(-10, 14, 12, 22);
    ell(0, 0, 38, 25, col); ell(4, 10, 24, 12, lt, 0, false);
    paw(12, 12, 13, 26); paw(26, 8, 12, 28);
    poly([[24, -22], [28, -54], [40, -26]], col); poly([[28, -28], [30, -46], [36, -29]], '#2a1a1a', false);
    poly([[40, -26], [52, -54], [56, -18]], col); poly([[44, -28], [52, -45], [52, -24]], '#2a1a1a', false);
    ell(38, -10, 20, 18, col); poly([[44, -16], [74, -4], [46, 6]], col); ell(52, -2, 12, 8, '#fff', 0, false);
    ctx.fillStyle = '#2a1a1a'; ctx.beginPath(); ctx.ellipse(72, -4, 3.4, 2.6, 0, 0, 7); ctx.fill();
    eye(40, -16, 4.6); blush(34, -2);
  },
  crab(H) {
    const { ell, poly, eye, col, dk, lt, mid, t } = H;
    ctx.strokeStyle = dk; ctx.lineWidth = 3.5;
    for (let i = 0; i < 3; i++) { [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 20, 14); ctx.lineTo(s * (36 + i * 5), 28 + i * 3); ctx.lineTo(s * (40 + i * 6), 42); ctx.stroke(); }); }
    ctx.lineWidth = 2.6;
    [-1, 1].forEach(s => {
      const w = Math.sin(t * 3 + s) * 3;
      ctx.beginPath(); ctx.moveTo(s * 34, 0); ctx.lineTo(s * 50, -16 + w); ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2.6;
      ell(s * 56, -26 + w, 15, 12, mid, s * .5); poly([[s * 62, -34 + w], [s * 70, -42 + w], [s * 64, -24 + w]], dk);
    });
    ell(0, 6, 40, 25, col); ell(0, 14, 28, 10, lt, 0, false);
    ctx.beginPath(); ctx.moveTo(-10, -18); ctx.lineTo(-10, -32); ctx.moveTo(12, -18); ctx.lineTo(12, -32); ctx.stroke();
    eye(-10, -34, 5.6); eye(12, -34, 5.6);
    ctx.beginPath(); ctx.arc(1, 6, 9, .2, Math.PI - .2); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 2.6;
  },
  spider(H) {
    const { ell, eye, col, dk, lt, mid, t } = H;
    ctx.strokeStyle = dk; ctx.lineWidth = 3.2;
    for (let j = 0; j < 4; j++) { const ex = -54 + j * 34 + Math.sin(t * 3 + j) * 2, sx = -22 + j * 12; ctx.beginPath(); ctx.moveTo(sx, 8); ctx.lineTo((sx + ex) / 2 + (j < 2 ? -4 : 6), -30); ctx.lineTo(ex, 44); ctx.stroke(); }
    ctx.lineWidth = 2.6;
    ell(-18, 6, 28, 24, col);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, -14); ctx.lineTo(-18, 26); ctx.stroke(); ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    ell(16, 2, 18, 16, mid);
    eye(20, -3, 4.2); eye(10, -4, 3); ctx.fillStyle = '#c0242a'; ctx.beginPath(); ctx.arc(26, -10, 2, 0, 7); ctx.arc(14, -12, 2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(30, 8); ctx.lineTo(34, 18); ctx.moveTo(24, 10); ctx.lineTo(24, 20); ctx.stroke();
  },
  jelly(H) {
    const { eye, blush, col, dk, lt, mid, t } = H;
    ctx.translate(0, Math.sin(t * 2.2) * 4);
    ctx.strokeStyle = mid; ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) { const x = -28 + i * 14; ctx.beginPath(); ctx.moveTo(x, 12); for (let k = 1; k <= 4; k++) ctx.lineTo(x + Math.sin(t * 3 + i + k) * 5, 12 + k * 10); ctx.stroke(); }
    ctx.lineWidth = 2.6; ctx.strokeStyle = dk;
    ctx.save(); ctx.globalAlpha *= .9;
    ctx.beginPath(); ctx.moveTo(-42, 14); ctx.bezierCurveTo(-48, -50, 48, -50, 42, 14); ctx.quadraticCurveTo(28, 22, 14, 12); ctx.quadraticCurveTo(0, 22, -14, 12); ctx.quadraticCurveTo(-28, 22, -42, 14);
    const g = ctx.createRadialGradient(-12, -26, 4, 0, -8, 56); g.addColorStop(0, lt); g.addColorStop(.6, col); g.addColorStop(1, mid); ctx.fillStyle = g; ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(-18, -28, 9, 5, -.5, 0, 7); ctx.fill();
    eye(-12, -6, 5.6); eye(14, -6, 5.6); blush(-22, 4); blush(24, 4);
  },
  cactus(H) {
    const { ell, eye, blush, col, dk, lt, mid, t } = H;
    ell(0, 36, 26, 8, '#9a7a50', 0, false);
    ctx.beginPath(); ctx.roundRect(-16, -44, 32, 84, 16); const g = ctx.createLinearGradient(-16, 0, 16, 0); g.addColorStop(0, lt); g.addColorStop(.5, col); g.addColorStop(1, dk); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    [[-1, -6], [1, 8]].forEach(([s, y]) => { ctx.beginPath(); ctx.roundRect(s * 14 + (s < 0 ? -22 : 0), y - 8, 22, 12, 6); ctx.fillStyle = col; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.roundRect(s * 30 - 6 + (s < 0 ? -6 : 0) - 0, y - 28, 12, 28, 6); ctx.fill(); ctx.stroke(); });
    ctx.strokeStyle = lt; ctx.lineWidth = 1.4; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-14 + (i % 2) * 28, -30 + i * 12); ctx.lineTo(-18 + (i % 2) * 36, -32 + i * 12); ctx.stroke(); } ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    ctx.fillStyle = '#ff7aa8'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(Math.cos(i * 1.256) * 7, -52 + Math.sin(i * 1.256) * 7, 5, 4, i, 0, 7); ctx.fill(); } ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(0, -52, 4, 0, 7); ctx.fill();
    eye(-6, -12, 4.6); eye(8, -12, 4.6); blush(-12, -2); blush(14, -2);
  },
  owl(H) {
    const { ell, poly, eye, blush, col, dk, lt, mid, t } = H;
    ctx.strokeStyle = '#b8803c'; ctx.lineWidth = 4; [-10, 12].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 36); ctx.lineTo(x, 44); ctx.moveTo(x - 6, 46); ctx.lineTo(x, 42); ctx.lineTo(x + 6, 46); ctx.stroke(); }); ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    ell(0, 4, 34, 38, col); ell(2, 14, 21, 22, lt, 0, false);
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1.6; for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) { ctx.beginPath(); ctx.arc(-8 + q * 9, 6 + r * 9, 4, 0, Math.PI); ctx.stroke(); } ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    ell(-26, 8, 12, 28, mid, .15);
    poly([[-18, -32], [-26, -56], [-6, -38]], mid); poly([[10, -38], [24, -58], [26, -30]], mid);
    ell(-8, -22, 15, 15, '#f8f4e8'); ell(14, -22, 15, 15, '#f8f4e8');
    eye(-8, -22, 8); eye(14, -22, 8); poly([[0, -14], [6, -14], [3, -4]], '#f4b83a');
    blush(-22, -8); blush(30, -8);
  },
  whale(H) {
    const { ell, poly, eye, blush, col, dk, lt, mid, t } = H;
    const fl = Math.sin(t * 2.4) * 5;
    poly([[-44, 0], [-70, -22 + fl], [-60, -4 + fl], [-72, 14 + fl], [-44, 14]], mid);
    ell(0, 4, 52, 30, col); ell(6, 16, 40, 14, lt, 0, false);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 4, 51, 29, 0, 0, 7); ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 1.5; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(14 + i * 6, 16); ctx.lineTo(10 + i * 6, 30); ctx.stroke(); } ctx.restore(); ctx.strokeStyle = dk;
    poly([[-6, 24], [14, 24], [2, 42]], mid);
    ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(20, -26); ctx.lineTo(20, -40); ctx.moveTo(20, -40); ctx.quadraticCurveTo(10, -50, 6, -42); ctx.moveTo(20, -40); ctx.quadraticCurveTo(30, -50, 34, -42); ctx.stroke(); ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    eye(30, -4, 5.4); blush(26, 8); ctx.beginPath(); ctx.arc(34, 8, 14, .3, 1.2); ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 2.6;
  },
  knight(H) {
    const { ell, poly, eye, col, dk, lt, mid, t } = H;
    const metal = (x, y, w, h, r, c1 = '#d8e2ee', c2 = '#9aa8bc', c3 = '#5a6a80') => { const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, c1); g.addColorStop(.5, c2); g.addColorStop(1, c3); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#2a3444'; ctx.stroke(); };
    ctx.lineWidth = 2.6; ctx.strokeStyle = '#2a3444';
    metal(-18, 22, 14, 24, 4); metal(4, 22, 14, 24, 4);
    poly([[40, -10], [58, -4], [56, 24], [40, 30]], col); poly([[44, -4], [54, 0], [52, 18], [44, 22]], lt, false);
    ctx.save(); ctx.translate(-40, -2); ctx.rotate(-.5 + Math.sin(t * 2) * .05); metal(-3, -40, 6, 46, 2, '#ffffff', '#d8e2f4', '#8a9ab8'); metal(-8, 2, 16, 5, 2); ctx.restore();
    metal(-26, -26, 52, 50, 9); metal(-34, -20, 14, 36, 6); metal(24, -20, 14, 36, 6);
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-8, -26, 16, 50, 4); ctx.fill(); ctx.stroke();
    metal(-18, -58, 36, 34, 12);
    ctx.fillStyle = '#10182a'; ctx.beginPath(); ctx.roundRect(-12, -46, 30, 9, 3); ctx.fill();
    const gl = .6 + .4 * Math.sin(t * 3); ctx.fillStyle = `rgba(255,${(200 * gl) | 0},80,1)`; ctx.fillRect(-6, -44, 6, 5); ctx.fillRect(6, -44, 6, 5);
    ctx.strokeStyle = '#2a3444'; poly([[-4, -58], [0, -76], [12, -70], [6, -58]], col);
    ctx.strokeStyle = dk;
  },
  fairy(H) {
    const { ell, poly, eye, blush, col, dk, lt, mid, t } = H;
    const f = Math.sin(t * 9) * .18;
    ctx.save(); ctx.globalAlpha *= .75;
    ctx.save(); ctx.translate(-4, -8); ctx.rotate(-.7 + f); ell(-26, -10, 26, 12, '#f4faff', 0); ell(-18, 8, 16, 8, '#e6f4ff', .3); ctx.restore();
    ctx.save(); ctx.translate(4, -8); ctx.rotate(.7 - f); ell(26, -10, 26, 12, '#f4faff', 0); ell(18, 8, 16, 8, '#e6f4ff', -.3); ctx.restore();
    ctx.restore();
    poly([[-16, 0], [16, 0], [26, 40], [-26, 40]], col); poly([[-10, 2], [10, 2], [14, 24], [-14, 24]], lt, false);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, 40); ctx.lineTo(-8, 52); ctx.moveTo(8, 40); ctx.lineTo(8, 52); ctx.stroke(); ctx.lineWidth = 2.6;
    ell(0, -22, 16, 16, '#fbe0c8'); ell(0, -34, 18, 10, mid, 0, false);
    eye(-6, -22, 4); eye(7, -22, 4); blush(-12, -14); blush(13, -14);
    ctx.strokeStyle = '#b8803c'; ctx.beginPath(); ctx.moveTo(18, 6); ctx.lineTo(34, -22); ctx.stroke(); ctx.strokeStyle = dk;
    glow(34, -26, 12, 'rgba(255,248,160,.9)', 'rgba(255,248,160,0)'); ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.arc(34, -26, 4, 0, 7); ctx.fill();
  },
  phoenix(H) {
    const { ell, poly, eye, blush, col, dk, lt, mid, t } = H;
    for (let i = 0; i < 5; i++) { const a = -.5 + i * .35, f = Math.sin(t * 6 + i) * 4; ctx.save(); ctx.translate(-34, 2); ctx.rotate(Math.PI + a - .2); poly([[0, -5], [40 + f, 0], [0, 5]], i % 2 ? '#ff7a2a' : '#ffc23a'); ctx.restore(); }
    ctx.strokeStyle = '#b8643c'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(-6, 26); ctx.lineTo(-8, 42); ctx.moveTo(10, 26); ctx.lineTo(12, 42); ctx.stroke(); ctx.strokeStyle = dk; ctx.lineWidth = 2.6;
    ell(0, 0, 38, 30, col); ell(6, 9, 24, 18, lt, 0, false);
    ctx.save(); ctx.translate(-8, -6); ctx.rotate(-.5 + Math.sin(t * 5) * .1); poly([[0, 0], [-34, -22], [-20, 4], [-38, 10], [-12, 20]], '#ff9a2e'); ctx.restore();
    const f = Math.sin(t * 8) * 3; poly([[22, -40], [24, -62 - f], [32, -48], [40, -64 + f], [42, -40]], '#ffc23a');
    ell(30, -24, 18, 17, col); poly([[44, -28], [62, -22], [44, -14]], '#f4b83a');
    eye(36, -28, 4.4); blush(28, -16);
  },
};
Object.assign(ANCH, {
  fox:     { body: [0, 0, 38, 25], head: [38, -10], hr: 20, top: [38, -30], back: [-4, -24], tail: [-48, -10], face: [40, -16] },
  crab:    { body: [0, 6, 40, 25], head: [0, -20], hr: 18, top: [0, -34], back: [0, -18], tail: [-40, 14], face: [0, 4] },
  spider:  { body: [-18, 6, 28, 24], head: [16, 2], hr: 17, top: [16, -14], back: [-18, -18], tail: [-44, 10], face: [20, -3] },
  jelly:   { body: [0, -14, 42, 32], head: [0, -14], hr: 32, top: [0, -46], back: [0, -40], tail: [0, 36], face: [0, -6] },
  cactus:  { body: [0, 0, 16, 42], head: [0, -14], hr: 18, top: [0, -50], back: [-10, -20], tail: [0, 40], face: [0, -12] },
  owl:     { body: [0, 4, 34, 38], head: [3, -22], hr: 22, top: [3, -48], back: [-10, -28], tail: [-8, 40], face: [3, -22] },
  whale:   { body: [0, 4, 52, 30], head: [30, -2], hr: 24, top: [20, -28], back: [0, -26], tail: [-64, -6], face: [30, -4] },
  knight:  { body: [0, -2, 26, 26], head: [0, -42], hr: 18, top: [4, -66], back: [-10, -26], tail: [-30, 20], face: [4, -44] },
  fairy:   { body: [0, 18, 20, 22], head: [0, -22], hr: 16, top: [0, -40], back: [0, -4], tail: [0, 46], face: [0, -22] },
  phoenix: { body: [0, 0, 38, 30], head: [30, -24], hr: 18, top: [32, -50], back: [-8, -28], tail: [-58, 2], face: [36, -28] },
});
