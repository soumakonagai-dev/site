'use strict';
// ===== フィールド／バトルの背景・演出 =====
const GROUND = {
  grass:   { g: ['#86c96e', '#7cc067', '#8ed074'], dark: '#5da34f', flower: ['#fff', '#ffd1e0', '#ffe27a', '#c9b6ff'], tree: ['#2f7a3a', '#3f9647', '#5cb25a'] },
  forest:  { g: ['#456f4a', '#3e6644', '#4b7850'], dark: '#2d4e34', flower: ['#d8f0b0', '#a8e0ff', '#ffb0c8'], tree: ['#173f27', '#245c36', '#37804a'] },
  sand:    { g: ['#ecdcA4', '#e6d49c', '#f0e0ae'], dark: '#c8b070', flower: ['#ff9ab0', '#fff'], tree: ['#2f7a3a', '#3f9647', '#5cb25a'] },
  desert:  { g: ['#e2ba7a', '#dab070', '#e8c284'], dark: '#bf9250', flower: ['#f6e0a0'], tree: ['#2f7a3a', '#3f9647', '#5cb25a'] },
  ash:     { g: ['#5c4c4a', '#544442', '#645452'], dark: '#3a2c2a', flower: ['#ff7a30'], tree: ['#2a2a2a', '#3a3a3a', '#4a4a4a'] },
  ruin:    { g: ['#9c9caa', '#9292a2', '#a6a6b4'], dark: '#707084', flower: ['#c8e8ff'], tree: ['#2f7a3a', '#3f9647', '#5cb25a'] },
  village: { g: ['#dccca4', '#d4c49c', '#e0d0aa'], dark: '#b8a478', flower: [], tree: ['#2f7a3a', '#3f9647', '#5cb25a'] },
  path:    { g: ['#cdae74', '#c6a66c', '#d4b47c'], dark: '#a88850', flower: [], tree: ['#2f7a3a', '#3f9647', '#5cb25a'] },
};

FieldScene.prototype.drawTile = function (ch, x, y, tx, ty) {
  const gk = this.W.ground[ty][tx], P = GROUND[gk], h = hash(tx, ty), t = this.t;
  // ---- 地面 ----
  ctx.fillStyle = P.g[h % 3]; ctx.fillRect(x, y, TILE, TILE);
  const open = ch === '.' || ch === 'T' || ch === 'P' || ch === 'K' || ch === 'S';
  if (gk === 'village' || gk === 'ruin') {
    ctx.strokeStyle = 'rgba(0,0,0,.1)'; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
    if (h % 3 === 0) { ctx.beginPath(); ctx.moveTo(x + 4, y + 16); ctx.lineTo(x + 28, y + 16); ctx.stroke(); }
  } else if (ch !== '~' && ch !== 'w') {
    ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x, y, TILE, 3);
    if ((h >> 3) % 3 === 0) { ctx.fillStyle = P.dark; ctx.globalAlpha = .2; ctx.beginPath(); ctx.ellipse(x + 8 + (h % 14), y + 10 + ((h >> 4) % 14), 9, 5, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  }
  if (open && ch === '.') {
    if (gk === 'grass' || gk === 'forest') {
      ctx.strokeStyle = shade(P.g[0], -.25); ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const gx = x + 4 + ((h >> (i * 3)) % 24), gy = y + 8 + ((h >> (i * 2 + 1)) % 20), sw = Math.sin(t * 2 + gx * .1) * 1.5;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 2 + sw, gy - 6); ctx.moveTo(gx + 2, gy); ctx.lineTo(gx + 3 + sw, gy - 5); ctx.stroke();
      }
      if (h % 9 === 0 && P.flower.length) {
        const fx = x + 6 + (h >> 5) % 20, fy = y + 6 + (h >> 7) % 20, fc = P.flower[(h >> 2) % P.flower.length];
        ctx.fillStyle = fc; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(fx + Math.cos(i * 1.257) * 2.6, fy + Math.sin(i * 1.257) * 2.6, 1.8, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#ffd04a'; ctx.beginPath(); ctx.arc(fx, fy, 1.4, 0, 7); ctx.fill();
      }
      if (gk === 'forest' && h % 11 === 0) { ctx.fillStyle = '#c8873c'; ctx.save(); ctx.translate(x + 10 + h % 12, y + 18); ctx.rotate(h % 6); ctx.beginPath(); ctx.ellipse(0, 0, 4, 2, 0, 0, 7); ctx.fill(); ctx.restore(); }
    } else if (gk === 'sand') {
      ctx.strokeStyle = 'rgba(160,130,70,.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 4, y + 12 + h % 8); ctx.quadraticCurveTo(x + 14, y + 8 + h % 8, x + 26, y + 13 + h % 8); ctx.stroke();
      if (h % 13 === 0) { ctx.fillStyle = '#ffb0c0'; ctx.beginPath(); ctx.arc(x + 12, y + 22, 3, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 12, y + 22, 1.2, 0, 7); ctx.fill(); }
    } else if (gk === 'desert') {
      ctx.strokeStyle = 'rgba(150,100,40,.28)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 14 + h % 10); ctx.quadraticCurveTo(x + 16, y + 6 + h % 10, x + 32, y + 14 + h % 10); ctx.stroke();
      if (h % 15 === 0) { ctx.fillStyle = '#f2f0e0'; ctx.beginPath(); ctx.ellipse(x + 14, y + 20, 6, 2.4, .3, 0, 7); ctx.fill(); ctx.fillStyle = '#d8d4c0'; ctx.fillRect(x + 8, y + 19, 12, 2); }
    } else if (gk === 'ash') {
      if (h % 6 === 0) { ctx.fillStyle = `rgba(255,${100 + h % 80},30,${.5 + .3 * Math.sin(t * 4 + h)})`; ctx.beginPath(); ctx.arc(x + 6 + h % 20, y + 8 + (h >> 3) % 20, 1.8, 0, 7); ctx.fill(); }
      ctx.strokeStyle = 'rgba(255,90,30,.18)'; ctx.lineWidth = 1.5; if (h % 7 === 0) { ctx.beginPath(); ctx.moveTo(x + 4, y + 8); ctx.lineTo(x + 14, y + 16); ctx.lineTo(x + 12, y + 28); ctx.stroke(); }
    } else if (gk === 'ruin' && h % 8 === 0) {
      ctx.strokeStyle = 'rgba(90,200,255,.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 10, y + 10, 12, 12); ctx.beginPath(); ctx.moveTo(x + 16, y + 10); ctx.lineTo(x + 16, y + 22); ctx.stroke();
    }
    if (h % 23 === 0 && gk !== 'village') { ctx.fillStyle = '#a8a8b0'; ctx.beginPath(); ctx.ellipse(x + 20, y + 24, 3, 2, 0, 0, 7); ctx.fill(); }
  }
  const shadow = (cx, cy, rx, ry, a = .22) => { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fill(); };
  const sparkleHint = () => {
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.5; ctx.beginPath();
    const sp = (Math.sin(t * 4 + tx) + 1) / 2; ctx.moveTo(x + 6, y + 6 - sp * 2); ctx.lineTo(x + 6, y + 12 + sp * 2); ctx.moveTo(x + 2, y + 9); ctx.lineTo(x + 10, y + 9); ctx.stroke();
  };
  switch (ch) {
    case 'T':
      shadow(x + 17, y + 28, 15, 6);
      { const g = ctx.createLinearGradient(x + 12, 0, x + 22, 0); g.addColorStop(0, '#7a5230'); g.addColorStop(1, '#4a3018'); ctx.fillStyle = g; ctx.fillRect(x + 12, y + 14, 9, 17); }
      break;
    case 'P':
      shadow(x + 17, y + 29, 10, 4);
      ctx.strokeStyle = '#8a6a3c'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 15, y + 30); ctx.quadraticCurveTo(x + 20, y + 14, x + 16, y - 2); ctx.stroke();
      ctx.strokeStyle = '#5a4020'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + 12, y + 26 - i * 7); ctx.lineTo(x + 20, y + 24 - i * 7); ctx.stroke(); }
      break;
    case 'K':
      shadow(x + 16, y + 29, 11, 4);
      { const g = ctx.createLinearGradient(x + 10, 0, x + 22, 0); g.addColorStop(0, '#6fb858'); g.addColorStop(1, '#2f7a3a'); ctx.fillStyle = g; ctx.strokeStyle = '#1e5a2a'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.roundRect(x + 12, y + 4, 9, 26, 4); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.roundRect(x + 3, y + 12, 6, 12, 3); ctx.fill(); ctx.stroke(); ctx.fillRect(x + 6, y + 20, 8, 5);
        ctx.beginPath(); ctx.roundRect(x + 24, y + 8, 6, 14, 3); ctx.fill(); ctx.stroke(); ctx.fillRect(x + 20, y + 18, 6, 5); }
      ctx.fillStyle = '#ff7a9a'; ctx.beginPath(); ctx.arc(x + 16, y + 4, 3, 0, 7); ctx.fill();
      break;
    case 'I':
      shadow(x + 16, y + 29, 12, 4);
      { const g = ctx.createLinearGradient(x + 6, 0, x + 26, 0); g.addColorStop(0, '#cfcfdc'); g.addColorStop(.5, '#a8a8ba'); g.addColorStop(1, '#6a6a80'); ctx.fillStyle = g; ctx.fillRect(x + 8, y + 2, 16, 27); ctx.fillStyle = '#d8d8e6'; ctx.fillRect(x + 5, y, 22, 5); ctx.fillRect(x + 5, y + 27, 22, 4); }
      ctx.strokeStyle = `rgba(90,210,255,${.5 + .3 * Math.sin(t * 2 + tx)})`; ctx.lineWidth = 1.6; ctx.strokeRect(x + 12, y + 10, 8, 8); ctx.beginPath(); ctx.moveTo(x + 16, y + 10); ctx.lineTo(x + 16, y + 18); ctx.stroke();
      break;
    case 'r':
      shadow(x + 17, y + 27, 14, 5);
      { const g = ctx.createRadialGradient(x + 12, y + 14, 2, x + 16, y + 20, 16);
        if (gk === 'ash') { g.addColorStop(0, '#5a4a48'); g.addColorStop(1, '#241a18'); } else { g.addColorStop(0, '#cfd0d8'); g.addColorStop(1, '#6e6e7a'); }
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x + 16, y + 20, 14, 10.5, 0, 0, 7); ctx.fill(); }
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 18, y + 14); ctx.lineTo(x + 22, y + 22); ctx.stroke();
      break;
    case 'M': { // 山
      const base = gk === 'desert' ? '#a8845a' : gk === 'ash' ? '#4a3836' : gk === 'sand' ? '#9a8a78' : gk === 'ruin' ? '#6a6a84' : '#6e7468';
      const hh = 14 + (h % 10);
      ctx.fillStyle = shade(base, -.25); ctx.fillRect(x, y, TILE, TILE);
      [[-6, 20], [10, 26], [26, 18]].forEach((p, i) => {
        const g = ctx.createLinearGradient(x + p[0], y + 6, x + p[0] + 20, y + 6); g.addColorStop(0, shade(base, .25)); g.addColorStop(1, shade(base, -.35));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + p[0] - 6, y + 32); ctx.lineTo(x + p[0] + 8, y + (32 - p[1] - hh * (i === 1 ? .8 : .4))); ctx.lineTo(x + p[0] + 22, y + 32); ctx.closePath(); ctx.fill();
      });
      if (gk !== 'ash' && gk !== 'desert') { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(x + 5, y + 4 + h % 4); ctx.lineTo(x + 10, y - 2); ctx.lineTo(x + 15, y + 4 + h % 4); ctx.closePath(); ctx.fill(); }
      break;
    }
    case 'w': {
      const g = ctx.createLinearGradient(x, y, x, y + TILE); g.addColorStop(0, '#2a68b0'); g.addColorStop(1, '#1c4488'); ctx.fillStyle = g; ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
      const yy = y + 12 + Math.sin(t * 1.6 + tx * .7 + ty) * 3; ctx.beginPath(); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 10, yy - 4, x + 20, yy); ctx.quadraticCurveTo(x + 28, yy + 4, x + 34, yy); ctx.stroke();
      break;
    }
    case 'b': {
      shadow(x + 16, y + 28, 15, 5);
      const sway = Math.sin(t * 2 + tx) * 1;
      [[8, 21, 10, '#2c8a3c'], [24, 21, 10, '#2c8a3c'], [16, 14, 12, '#3aa04a'], [16, 22, 10, '#46b556']].forEach(p => {
        const g = ctx.createRadialGradient(x + p[0] - 3 + sway, y + p[1] - 4, 1, x + p[0], y + p[1], p[2]); g.addColorStop(0, shade(p[3], .35)); g.addColorStop(1, shade(p[3], -.25));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + p[0] + sway * .5, y + p[1], p[2], 0, 7); ctx.fill();
      });
      ctx.fillStyle = '#ee5f7a'; [[10, 19], [22, 24], [17, 12], [26, 18]].forEach(p => { ctx.beginPath(); ctx.arc(x + p[0], y + p[1], 2.2, 0, 7); ctx.fill(); });
      sparkleHint();
      break;
    }
    case 'R': {
      shadow(x + 16, y + 28, 15, 5);
      const g = ctx.createRadialGradient(x + 11, y + 12, 2, x + 16, y + 18, 18); g.addColorStop(0, '#d8d8e2'); g.addColorStop(1, '#6a6a78');
      ctx.fillStyle = g; ctx.strokeStyle = '#3a3a46'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 15, 13, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(30,30,40,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 14, y + 8); ctx.lineTo(x + 18, y + 16); ctx.lineTo(x + 13, y + 22); ctx.stroke();
      sparkleHint();
      break;
    }
    case '~': {
      const g = ctx.createLinearGradient(x, y, x + TILE, y + TILE); g.addColorStop(0, '#58b4ee'); g.addColorStop(1, '#2f78c0');
      ctx.fillStyle = g; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      const isW = c2 => c2 === '~' || c2 === 'w' || c2 === 'X';
      if (!isW(this.tile(tx - 1, ty))) ctx.fillRect(x, y, 3, TILE);
      if (!isW(this.tile(tx + 1, ty))) ctx.fillRect(x + TILE - 3, y, 3, TILE);
      if (!isW(this.tile(tx, ty - 1))) ctx.fillRect(x, y, TILE, 3);
      if (!isW(this.tile(tx, ty + 1))) ctx.fillRect(x, y + TILE - 3, TILE, 3);
      ctx.strokeStyle = 'rgba(255,255,255,.38)'; ctx.lineWidth = 2;
      for (let i = 0; i < 2; i++) {
        const yy = y + 8 + i * 14 + Math.sin(t * 2 + tx + i * 2 + ty) * 2;
        ctx.beginPath(); ctx.moveTo(x + 3, yy); ctx.quadraticCurveTo(x + 10, yy - 4, x + 17, yy); ctx.quadraticCurveTo(x + 24, yy + 4, x + 30, yy); ctx.stroke();
      }
      if ((h + Math.floor(t * 2)) % 7 === 0) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(x + 8 + h % 16, y + 6 + (h >> 4) % 18, 2, 2); }
      break;
    }
    case 'X': { // 谷
      const g = ctx.createLinearGradient(x, y, x, y + TILE); g.addColorStop(0, '#1a1428'); g.addColorStop(1, '#05030a'); ctx.fillStyle = g; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = 'rgba(160,140,200,.14)';
      for (let i = 0; i < 3; i++) { const mx = x + ((h >> i) % 24) + Math.sin(t + i + tx) * 4, my = y + 6 + i * 10 + Math.sin(t * .8 + i) * 2; ctx.beginPath(); ctx.ellipse(mx, my, 9, 3, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#4a3a5a'; if (this.tile(tx, ty - 1) !== 'X') { ctx.fillRect(x, y, TILE, 4); ctx.fillStyle = '#6a5a7a'; ctx.fillRect(x, y, TILE, 1.5); }
      sparkleHint();
      break;
    }
    case 'L': { // 溶岩
      const g = ctx.createLinearGradient(x, y, x + TILE, y + TILE); g.addColorStop(0, '#ff9a2a'); g.addColorStop(.5, '#e8481a'); g.addColorStop(1, '#a8200c'); ctx.fillStyle = g; ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = `rgba(255,240,150,${.55 + .25 * Math.sin(t * 3 + tx + ty)})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 3, y + 10 + (h % 8)); ctx.quadraticCurveTo(x + 14, y + 4 + (h % 6), x + 29, y + 14 + (h % 6)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 6, y + 24); ctx.quadraticCurveTo(x + 18, y + 20, x + 28, y + 28); ctx.stroke();
      const b = (t * .8 + h * .13) % 1; ctx.fillStyle = `rgba(255,230,120,${1 - b})`; ctx.beginPath(); ctx.arc(x + 8 + h % 16, y + 28 - b * 22, 2 + b * 3, 0, 7); ctx.fill();
      glow(x + 16, y + 16, 34, 'rgba(255,120,30,.16)', 'rgba(255,60,0,0)');
      sparkleHint();
      break;
    }
    case 'F': {
      shadow(x + 16, y + 28, 14, 3, .18);
      const f = (dx, dy) => this.tile(tx + dx, ty + dy) === 'F';
      ctx.fillStyle = '#9a6a38';
      if (f(-1, 0) || f(1, 0)) { ctx.fillRect(x, y + 12, TILE, 4); ctx.fillRect(x, y + 20, TILE, 4); }
      if (f(0, -1) || f(0, 1)) { ctx.fillRect(x + 12, y, 4, TILE); ctx.fillRect(x + 20, y, 4, TILE); }
      ctx.fillStyle = '#7a4a22'; ctx.fillRect(x + 13, y + 6, 6, 24); ctx.fillStyle = '#b88850'; ctx.fillRect(x + 13, y + 6, 6, 3);
      break;
    }
    case 'H': case 'B': {
      shadow(x + 17, y + 30, 16, 4);
      const roofs = ['#c8503c', '#4a78c8', '#58a860', '#c89a3c', '#8a58b8'], rc = ch === 'B' ? '#d8a030' : roofs[h % 5];
      ctx.fillStyle = '#efe2c4'; ctx.fillRect(x + 3, y + 12, 26, 18);
      ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x + 3, y + 24, 26, 6);
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(x + 13, y + 19, 7, 11);
      ctx.fillStyle = '#9fd4f0'; ctx.fillRect(x + 5, y + 16, 6, 6); ctx.fillRect(x + 22, y + 16, 5, 6);
      { const g = ctx.createLinearGradient(0, y - 6, 0, y + 14); g.addColorStop(0, shade(rc, .25)); g.addColorStop(1, shade(rc, -.2)); ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x - 2, y + 14); ctx.lineTo(x + 16, y - 7); ctx.lineTo(x + 34, y + 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = shade(rc, -.4); ctx.lineWidth = 1.5; ctx.stroke(); }
      if (ch === 'B') { ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) if (i % 2) ctx.fillRect(x + 3 + i * 6.5, y + 14, 6.5, 4); txt('W', x + 16, y + 1, { size: 12, align: 'center', color: '#fff', shadow: true }); }
      break;
    }
    case 'C': {
      shadow(x + 16, y + 29, 17, 5, .25);
      let g = ctx.createLinearGradient(x, y, x + 32, y); g.addColorStop(0, '#f4e6c0'); g.addColorStop(.5, '#fff6dc'); g.addColorStop(1, '#d8c496');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 16, y - 4); ctx.lineTo(x + 32, y + 29); ctx.lineTo(x, y + 29); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#d0503c'; ctx.beginPath(); ctx.moveTo(x + 16, y - 4); ctx.lineTo(x + 24, y + 12); ctx.lineTo(x + 8, y + 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2c2030'; ctx.beginPath(); ctx.moveTo(x + 16, y + 11); ctx.lineTo(x + 23, y + 29); ctx.lineTo(x + 9, y + 29); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8c04a'; ctx.beginPath(); ctx.moveTo(x + 16, y - 4); ctx.lineTo(x + 16, y - 12); ctx.lineTo(x + 24, y - 9); ctx.lineTo(x + 16, y - 7); ctx.fill();
      const fl = Math.sin(t * 9) * 1.5;
      glow(x + 16, y + 20, 26, `rgba(255,200,90,${.2 + Math.sin(t * 5) * .05})`, 'rgba(255,200,90,0)');
      ctx.fillStyle = '#ff9a2e'; ctx.beginPath(); ctx.moveTo(x + 16, y + 20 - fl); ctx.quadraticCurveTo(x + 21, y + 26, x + 16, y + 29); ctx.quadraticCurveTo(x + 11, y + 26, x + 16, y + 20 - fl); ctx.fill();
      txt('✦', x + 24, y - 14 + Math.sin(t * 3) * 2, { size: 11, color: '#fff2a0' });
      break;
    }
    case 'c': case 'o': {
      shadow(x + 16, y + 28, 14, 4, .25);
      const g = ctx.createLinearGradient(0, y + 12, 0, y + 28); g.addColorStop(0, '#a86a30'); g.addColorStop(1, '#5e3818');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x + 4, y + 12, 24, 16, 3); ctx.fill();
      ctx.fillStyle = ch === 'c' ? '#c98a40' : '#3e2410'; ctx.beginPath(); ctx.roundRect(x + 3, y + (ch === 'c' ? 6 : 8), 26, ch === 'c' ? 9 : 5, 4); ctx.fill();
      ctx.fillStyle = '#8c8c98'; ctx.fillRect(x + 8, y + 12, 3, 16); ctx.fillRect(x + 21, y + 12, 3, 16);
      if (ch === 'c') {
        ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.roundRect(x + 14, y + 12, 5, 7, 1.5); ctx.fill();
        if (Math.sin(t * 4 + tx) > .2) txt('✦', x + 20, y - 2 + Math.sin(t * 3) * 2, { size: 10, color: '#fff2a0' });
      }
      break;
    }
    case 'S':
      shadow(x + 16, y + 29, 9, 3);
      ctx.fillStyle = '#6a4a28'; ctx.fillRect(x + 14, y + 14, 4, 16);
      { const g = ctx.createLinearGradient(0, y + 3, 0, y + 19); g.addColorStop(0, '#e0b676'); g.addColorStop(1, '#b88a4c'); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x + 3, y + 3, 26, 16, 3); ctx.fill(); }
      ctx.strokeStyle = '#6a4a28'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#6a4a28'; ctx.fillRect(x + 8, y + 8, 16, 2); ctx.fillRect(x + 8, y + 12, 11, 2);
      break;
  }
};

// こずえ・ヤシの葉（キャラより手前に重ねる）
FieldScene.prototype.drawCanopy = function (x, y, tx, ty) {
  const ch = this.tile(tx, ty), h = hash(tx, ty), sw = Math.sin(this.t * 1.2 + tx * .7 + ty) * 1.2;
  if (ch === 'P') {
    ctx.save(); ctx.translate(x + 16 + sw, y - 2);
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate(i * 1.05 + Math.sin(this.t + i) * .05);
      const g = ctx.createLinearGradient(0, 0, 22, 0); g.addColorStop(0, '#2f8a3c'); g.addColorStop(1, '#58b852');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(12, -9, 26, 3); ctx.quadraticCurveTo(12, 0, 0, 3); ctx.fill(); ctx.restore();
    }
    ctx.fillStyle = '#7a5230'; ctx.beginPath(); ctx.arc(-3, 3, 3, 0, 7); ctx.arc(3, 4, 3, 0, 7); ctx.fill();
    ctx.restore(); return;
  }
  const P = (GROUND[this.W.ground[ty][tx]] || GROUND.grass).tree;
  [[16, 8, 15], [7, 14, 11], [25, 14, 11], [16, 16, 11]].forEach(p => {
    const g = ctx.createRadialGradient(x + p[0] - 4 + sw, y + p[1] - 5, 1, x + p[0], y + p[1], p[2] + 3);
    g.addColorStop(0, P[2]); g.addColorStop(.55, P[1]); g.addColorStop(1, P[0]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + p[0] + sw * .5, y + p[1], p[2], 0, 7); ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.arc(x + 11 + sw, y + 3, 5, 0, 7); ctx.fill();
  if (h % 4 === 0) { ctx.fillStyle = '#ee5a4a'; [[12, 12], [21, 6], [24, 16]].forEach(p => { ctx.beginPath(); ctx.arc(x + p[0], y + p[1], 2, 0, 7); ctx.fill(); }); }
};

// 画面全体の空気感（地域ごと）
let _vig = null;
FieldScene.prototype.drawAmbient = function () {
  const th = this.theme, t = this.t;
  const tint = { snow: 'rgba(200,230,255,.1)', swamp: 'rgba(40,70,30,.2)', mine: 'rgba(70,45,20,.12)', sky: 'rgba(190,225,255,.08)', cave: 'rgba(20,10,40,.08)', forest: 'rgba(8,28,24,.22)', volcano: 'rgba(120,20,0,.16)', desert: 'rgba(255,200,100,.1)', ruins: 'rgba(40,30,90,.18)', sea: 'rgba(120,200,255,.06)', meadow: 'rgba(255,240,180,.05)' }[th];
  ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H);
  if (th === 'forest') {
    ctx.fillStyle = 'rgba(255,250,190,.07)';
    for (let i = 0; i < 4; i++) { const x = 60 + i * 170 + Math.sin(t * .4 + i) * 12; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 50, 0); ctx.lineTo(x - 90, H); ctx.lineTo(x - 150, H); ctx.fill(); }
  }
  if (th === 'desert') { ctx.fillStyle = 'rgba(240,200,140,.12)'; for (let i = 0; i < 3; i++) ctx.fillRect(0, 60 + i * 110 + Math.sin(t + i) * 10, W, 28); }
  for (let i = 0; i < 24; i++) {
    const sp = th === 'volcano' ? -22 : th === 'desert' ? 70 : 8 + i % 5 * 3;
    const x = ((i * 83 + t * sp) % (W + 20) + W + 20) % (W + 20) - 10, y = th === 'volcano' ? (H - ((t * (18 + i % 4 * 6) + i * 47) % H)) : (i * 47 + Math.sin(t * .8 + i) * 18 + 400) % H;
    const a = .35 + .35 * Math.sin(t * 2 + i * 1.7);
    ctx.fillStyle = th === 'forest' ? `rgba(190,255,150,${a})` : th === 'volcano' ? `rgba(255,${120 + i * 4},40,${a})` : th === 'desert' ? `rgba(240,210,150,${a * .6})` : th === 'ruins' ? `rgba(160,220,255,${a * .8})` : `rgba(255,248,200,${a * .7})`;
    ctx.beginPath(); ctx.arc(x, y, th === 'forest' || th === 'volcano' ? 1.8 : 1.3, 0, 7); ctx.fill();
  }
  if (!_vig) {
    _vig = document.createElement('canvas'); _vig.width = W; _vig.height = H;
    const c = _vig.getContext('2d'), g = c.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, H * .95);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.42)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  ctx.drawImage(_vig, 0, 0);
};

// ----- バトル背景（地域ごと） -----
const BTHEME = {
  meadow:  { sky: ['#6cb8f0', '#d8f0d0'], far: '#9ad58c', near: '#7cc070', gr: ['#8fd070', '#5ea648'], pad: ['#b8e690', '#6cb450'] },
  forest:  { sky: ['#16302a', '#4a8a62'], far: '#1f4a35', near: '#163a2a', gr: ['#3a6a40', '#264a2c'], pad: ['#5c9060', '#34603c'] },
  sea:     { sky: ['#58b8f0', '#d8f4ff'], far: '#3a88d0', near: '#2a70b8', gr: ['#efdba0', '#cdb272'], pad: ['#f6e8b8', '#d8c080'] },
  desert:  { sky: ['#f0a858', '#fbe6b8'], far: '#d8a860', near: '#c89448', gr: ['#e8c07a', '#c89850'], pad: ['#f0cf90', '#d0a460'] },
  volcano: { sky: ['#2a1010', '#b0502a'], far: '#3a2220', near: '#2a1816', gr: ['#4a3a38', '#2a1e1c'], pad: ['#6a5250', '#3a2a28'] },
  snow:    { sky: ['#9fc8e8', '#eef8ff'], far: '#dfeaf4', near: '#c4d6e6', gr: ['#f0f8ff', '#c8dcec'], pad: ['#ffffff', '#bcd0e4'] },
  swamp:   { sky: ['#2a3a2a', '#6a7a50'], far: '#2f3f2a', near: '#223020', gr: ['#4a5a3a', '#2e3a24'], pad: ['#6a7a4a', '#3a4a2c'] },
  mine:    { sky: ['#1c1812', '#4a3e30'], far: '#3a3024', near: '#2a2218', gr: ['#6a5a48', '#3a3024'], pad: ['#8a7860', '#4a3e30'] },
  sky:     { sky: ['#4aa8f8', '#e8f6ff'], far: '#bfe0ff', near: '#9fc8f0', gr: ['#f4faff', '#cfe4f8'], pad: ['#ffffff', '#c8e0f4'] },
  cave:    { sky: ['#0a0a14', '#2a2638'], far: '#1a1624', near: '#120e1a', gr: ['#4a4658', '#2a2634'], pad: ['#6a667a', '#3a3648'] },
  ruins:   { sky: ['#20203e', '#7a7aa8'], far: '#4a4a6c', near: '#34344e', gr: ['#8a8a9c', '#5a5a6e'], pad: ['#a8a8ba', '#6a6a80'] },
};
BattleScene.prototype.drawBackdrop = function () {
  const key = this.opt.theme || 'meadow', B = BTHEME[key], t = this.t;
  let g = ctx.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, B.sky[0]); g.addColorStop(1, B.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 270);
  // 空の飾り
  if (key === 'meadow' || key === 'sea' || key === 'desert' || key === 'sky') {
    ctx.fillStyle = key === 'desert' ? 'rgba(255,240,190,.95)' : 'rgba(255,248,200,.9)'; ctx.beginPath(); ctx.arc(540, 44, key === 'desert' ? 34 : 24, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,248,200,.25)'; ctx.beginPath(); ctx.arc(540, 44, key === 'desert' ? 58 : 40, 0, 7); ctx.fill();
  }
  if (key === 'meadow' || key === 'sea' || key === 'sky' || key === 'snow') {
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    [[90, 50, 1], [260, 30, .8], [420, 70, 1.1]].forEach(([cx, cy, s], i) => {
      const x = (cx + t * (4 + i * 2)) % (W + 120) - 60;
      [[0, 0, 22], [20, -6, 18], [-20, 2, 15], [38, 3, 13]].forEach(p => { ctx.beginPath(); ctx.arc(x + p[0] * s, cy + p[1], p[2] * s, 0, 7); ctx.fill(); });
    });
  }
  if (key === 'forest') {
    ctx.fillStyle = 'rgba(255,250,190,.08)';
    for (let i = 0; i < 5; i++) { const x = 40 + i * 140 + Math.sin(t * .5 + i) * 10; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x - 70, 200); ctx.lineTo(x - 110, 200); ctx.fill(); }
  }
  if (key === 'ruins') {
    ctx.fillStyle = 'rgba(30,30,60,.5)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(80 + i * 170, 40 + (i % 2) * 20, 50, 0, 7); ctx.fill(); }
    if (Math.sin(t * 1.7) > .96) { ctx.fillStyle = 'rgba(220,230,255,.35)'; ctx.fillRect(0, 0, W, 200); }
  }
  // 遠景
  ctx.fillStyle = B.far; ctx.beginPath(); ctx.moveTo(0, 150);
  if (key === 'sea') { ctx.lineTo(0, 130); ctx.lineTo(W, 130); ctx.lineTo(W, 150); }
  else if (key === 'desert') { for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 120 + Math.sin(x * .011) * 20 + Math.sin(x * .03) * 5); }
  else if (key === 'volcano') { ctx.lineTo(0, 140); ctx.lineTo(100, 90); ctx.lineTo(150, 110); ctx.lineTo(260, 40); ctx.lineTo(400, 125); ctx.lineTo(480, 80); ctx.lineTo(560, 120); ctx.lineTo(W, 100); ctx.lineTo(W, 150); }
  else { for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 118 + Math.sin(x * .014) * 14 + Math.sin(x * .04) * 4); }
  ctx.lineTo(W, 200); ctx.lineTo(0, 200); ctx.fill();
  if (key === 'volcano') { glow(260, 44, 50, `rgba(255,120,30,${.6 + Math.sin(t * 3) * .15})`, 'rgba(255,60,0,0)'); ctx.fillStyle = 'rgba(255,100,20,.55)'; ctx.fillRect(250, 40, 20, 4); }
  if (key === 'sea') { ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { const x = (i * 130 + t * 12) % W; ctx.beginPath(); ctx.moveTo(x, 138); ctx.quadraticCurveTo(x + 20, 134, x + 40, 138); ctx.stroke(); } }
  ctx.fillStyle = B.near;
  if (key === 'ruins') { for (let x = 10; x < W; x += 70) { const hh = 40 + (hash(x, 5) % 40); ctx.fillRect(x, 150 - hh, 18, hh); ctx.fillRect(x - 4, 150 - hh, 26, 6); } }
  else if (key === 'desert') { for (let x = 0; x < W; x += 140) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x + 70, 115); ctx.lineTo(x + 140, 150); ctx.fill(); } }
  else if (key === 'sea') { /* なし */ }
  else if (key === 'cave') { for (let x = 0; x < W; x += 38) { const hh = 20 + (hash(x, 9) % 40); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 19, hh); ctx.lineTo(x + 38, 0); ctx.fill(); } }
  else if (key === 'volcano') { for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x + 24, 130 - (hash(x, 2) % 14)); ctx.lineTo(x + 50, 150); ctx.fill(); } }
  else { for (let x = 0; x < W; x += 34) { const hh = 26 + (hash(x, 3) % 18); ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x + 14, 150 - hh); ctx.lineTo(x + 28, 150); ctx.fill(); } }
  // 地面
  g = ctx.createLinearGradient(0, 145, 0, 270); g.addColorStop(0, B.gr[0]); g.addColorStop(1, B.gr[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 148, W, 122);
  if (key === 'volcano') { glow(W / 2, 160, 220, 'rgba(255,90,20,.18)', 'rgba(255,60,0,0)'); for (let i = 0; i < 14; i++) { const x = (i * 71) % W, y = 270 - ((t * (14 + i % 5 * 6) + i * 37) % 200); ctx.fillStyle = `rgba(255,${120 + i * 5},40,.7)`; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 7); ctx.fill(); } }
  ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, 160 + i * 20); ctx.lineTo(W, 156 + i * 21); ctx.stroke(); }
  // 台座
  const pad = (cx, cy, rx, ry) => {
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx, cy + 4, rx, ry, 0, 0, 7); ctx.fill();
    const q = ctx.createRadialGradient(cx - rx * .3, cy - ry * .4, 4, cx, cy, rx); q.addColorStop(0, B.pad[0]); q.addColorStop(1, B.pad[1]);
    ctx.fillStyle = q; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1.5; ctx.stroke();
  };
  pad(480, 166, 100, 18); pad(150, 250, 108, 20);
};
