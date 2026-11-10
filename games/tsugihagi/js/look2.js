'use strict';
// ===== 素材の見た目（その2）：角・牙・耳・しっぽ・翼・もよう・オーブなど =====
Object.assign(LOOK, {
  unihorn: { horn: 'unicorn' }, twinhorn: { horn: 'twin' }, ramhorn: { horn: 'ram' }, tusks: { tusks: 1 }, catears: { ears2: 'cat' }, antenna: { antenna: 1 },
  scorptail: { tail2: 'scorpion' }, peacock: { tail2: 'peacock' }, fluffytail: { tail2: 'fluffy' }, spadetail: { tail2: 'spade' }, dorsalfin: { fin: 1 },
  angelwing: { wings: 'angel', aura: '#fff3c0' }, mechawing: { wings: 'mecha' }, cloudwrap: { collar: 1 }, lantern: { lantern: 1 },
  turtleshell: { armor: 'shell' }, thornvine: { vines: 1 }, spiral: { spiral: 1 }, crystalspike: { spikes2: 1 },
  rainbow: { pattern2: 'rainbow', aura: '#f0c0ff' }, camo: { pattern2: 'camo' }, checker: { pattern2: 'check' }, lavacrack: { pattern2: 'lava', aura: '#ff6a2a' }, boltmark: { pattern2: 'bolt' },
  flowercrown: { crown2: 1 }, snowcap: { cap2: 1 }, mask: { mask: 1 }, visor: { visor: 1 }, bubble: { bubble: 1 }, fireorbs: { orbs: '#ff8a3a' }, iceorbs: { orbs: '#9fe0ff' },
});

function lookBehind2(L, A, H) {
  const F = L.f, t = H.t, P = (pts, fill, stroke) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke !== false) ctx.stroke(); };
  if (F.wings === 'angel') {
    ctx.save(); ctx.translate(A.back[0], A.back[1]); ctx.rotate(-.12 + Math.sin(t * 5) * .06);
    [[1, '#ffffff'], [.68, '#f6efd2']].forEach(([s, c]) => { ctx.save(); ctx.scale(s, s); P([[0, 0], [-6, -40], [-22, -64], [-46, -60], [-64, -42], [-72, -16], [-52, -2], [-24, 6]], c); ctx.restore(); });
    ctx.lineWidth = 1.3; ctx.beginPath(); [[-22, -64], [-46, -60], [-64, -42], [-72, -16]].forEach(p => { ctx.moveTo(0, 0); ctx.lineTo(p[0], p[1]); }); ctx.stroke(); ctx.lineWidth = 2.6; ctx.restore();
  }
  if (F.wings === 'mecha') {
    ctx.save(); ctx.translate(A.back[0], A.back[1]); ctx.rotate(-.05 + Math.sin(t * 6) * .03);
    P([[0, 0], [-8, -26], [-58, -50], [-72, -38], [-48, -16], [-30, 6]], '#8a98b0');
    ctx.strokeStyle = 'rgba(30,40,60,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(-56, -42); ctx.moveTo(-14, -10); ctx.lineTo(-52, -28); ctx.stroke(); ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6;
    glow(-70, -38, 12 + Math.sin(t * 20) * 2, 'rgba(140,210,255,.9)', 'rgba(80,160,255,0)'); ctx.restore();
  }
  if (F.tail2) {
    ctx.save(); ctx.translate(A.tail[0], A.tail[1]);
    if (F.tail2 === 'scorpion') {
      const pts = [[0, 0], [-14, -8], [-22, -22], [-20, -38], [-8, -50], [6, -46]];
      pts.forEach(([x, y], i) => { ctx.beginPath(); ctx.arc(x, y, 7 - i * .5, 0, 7); ctx.fillStyle = i % 2 ? H.col : H.mid; ctx.fill(); ctx.stroke(); });
      P([[4, -50], [16, -44], [8, -36]], '#c83a3a');
    } else if (F.tail2 === 'peacock') {
      for (let i = -3; i <= 3; i++) {
        ctx.save(); ctx.rotate(Math.PI + i * .3 + Math.sin(t * 2 + i) * .03);
        ctx.fillStyle = i % 2 ? '#2a9a8a' : '#3ab8a0'; ctx.beginPath(); ctx.ellipse(34, 0, 32, 8, 0, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(54, 0, 5.5, 0, 7); ctx.fill(); ctx.fillStyle = '#2a58c8'; ctx.beginPath(); ctx.arc(54, 0, 3, 0, 7); ctx.fill(); ctx.restore();
      }
    } else if (F.tail2 === 'fluffy') {
      [[-14, -4, 17], [-26, -10, 11], [-24, 8, 10], [-8, -18, 10]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#f8f4f0'; ctx.fill(); ctx.stroke(); });
    } else if (F.tail2 === 'spade') {
      ctx.beginPath(); ctx.moveTo(6, -10); ctx.quadraticCurveTo(-30, -14, -54, 6); ctx.quadraticCurveTo(-30, 8, 6, 12); ctx.closePath(); ctx.fillStyle = H.col; ctx.fill(); ctx.stroke();
      P([[-52, 6], [-68, -8], [-74, 10], [-60, 20]], H.mid);
      for (let i = 0; i < 4; i++) P([[-4 - i * 12, -10 + i * 1.5], [-8 - i * 12, -20 + i * 2], [-12 - i * 12, -8 + i * 2]], H.dk);
    }
    ctx.restore();
  }
}

function lookFront2(L, A, H) {
  const F = L.f, t = H.t, [bx, by, brx, bry] = A.body, [tx, ty] = A.top, [fx, fy] = A.face, [hx, hy] = A.head;
  const P = (pts, fill, stroke) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke !== false) ctx.stroke(); };
  // もよう（体の中だけ）
  if (F.pattern2) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(bx, by, brx - 1, bry - 1, 0, 0, 7); ctx.clip();
    if (F.pattern2 === 'rainbow') {
      ['#ff5a5a', '#ffb04a', '#ffe84a', '#6adf6a', '#5ab8ff', '#a07aff'].forEach((c, i) => { ctx.fillStyle = c; ctx.globalAlpha = .42; ctx.beginPath(); const x = bx - brx + i * (brx / 3); ctx.moveTo(x, by - bry); ctx.lineTo(x + brx / 3, by - bry); ctx.lineTo(x + brx / 3 + 14, by + bry); ctx.lineTo(x + 14, by + bry); ctx.closePath(); ctx.fill(); });
    } else if (F.pattern2 === 'camo') {
      [[-24, -8, 11, 'rgba(30,50,20,.42)'], [-4, -16, 9, 'rgba(80,60,30,.38)'], [14, -4, 12, 'rgba(30,50,20,.42)'], [-14, 10, 9, 'rgba(80,60,30,.38)'], [28, 10, 8, 'rgba(30,50,20,.42)'], [4, 14, 7, 'rgba(80,60,30,.38)']].forEach(([x, y, r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(bx + x, by + y, r, r * .7, x, 0, 7); ctx.fill(); });
    } else if (F.pattern2 === 'check') {
      ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let r = -4; r < 5; r++) for (let q = -6; q < 7; q++) if ((r + q) & 1) ctx.fillRect(bx + q * 9, by + r * 9, 9, 9);
    } else if (F.pattern2 === 'lava') {
      ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 3; zigzag(bx - 26, by - bry, bx - 14, by + bry, 4.4, 6, 6); ctx.stroke(); zigzag(bx + 4, by - bry, bx + 16, by + bry, 8.8, 6, 6); ctx.stroke(); zigzag(bx - 36, by + 4, bx + 30, by + 8, 2.2, 5, 8); ctx.stroke();
      ctx.strokeStyle = '#ffe27a'; ctx.lineWidth = 1.2; zigzag(bx - 26, by - bry, bx - 14, by + bry, 4.4, 6, 6); ctx.stroke();
    } else if (F.pattern2 === 'bolt') {
      ctx.strokeStyle = '#ffe84a'; ctx.lineWidth = 3.5; ctx.lineJoin = 'miter';
      [[-24, -bry, -10, bry], [6, -bry, 22, bry]].forEach(([a, b, c, d], i) => { ctx.beginPath(); ctx.moveTo(bx + a, by + b); ctx.lineTo(bx + a + 10, by - 6); ctx.lineTo(bx + a - 2, by + 2); ctx.lineTo(bx + c, by + d); ctx.stroke(); });
    }
    ctx.restore(); ctx.globalAlpha = 1; ctx.lineWidth = 2.6; ctx.strokeStyle = H.dk; ctx.lineJoin = 'round';
  }
  if (F.vines) {
    ctx.strokeStyle = '#3e8a3a'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    [[-30, -8, 8, -20, 30, 6], [-26, 10, 0, 18, 28, -10]].forEach(([x0, y0, cx, cy, x1, y1]) => { ctx.beginPath(); ctx.moveTo(bx + x0, by + y0); ctx.quadraticCurveTo(bx + cx, by + cy, bx + x1, by + y1); ctx.stroke(); });
    ctx.fillStyle = '#58b852'; [[-16, -14], [2, -16], [18, -6], [-12, 14], [10, 16]].forEach(([x, y], i) => { ctx.beginPath(); ctx.ellipse(bx + x, by + y, 6, 3, i, 0, 7); ctx.fill(); });
    ctx.fillStyle = '#ff6a8a'; ctx.beginPath(); ctx.arc(bx + 22, by - 4, 3, 0, 7); ctx.fill(); ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6;
  }
  if (F.spiral) {
    const sx = A.back[0], sy = A.back[1] - 4; ctx.beginPath(); ctx.arc(sx, sy, 17, 0, 7); const g = ctx.createRadialGradient(sx - 5, sy - 6, 2, sx, sy, 18); g.addColorStop(0, '#e8c898'); g.addColorStop(1, '#a07848'); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); for (let a = 0; a < 12; a += .25) { const r = 1.3 * a; ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } ctx.stroke(); ctx.lineWidth = 2.6;
  }
  if (F.fin) { const x = A.back[0] + 2, y = by - bry + 6; P([[x - 14, y + 2], [x - 2, y - 30], [x + 22, y + 4]], 'rgba(70,170,220,.95)'); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x - 4, y + 2); ctx.lineTo(x - 1, y - 24); ctx.moveTo(x + 6, y + 2); ctx.lineTo(x + 6, y - 14); ctx.stroke(); ctx.lineWidth = 2.6; }
  if (F.spikes2) for (let i = 0; i < 7; i++) { const x = A.back[0] + 22 - i * 9, y = by - bry + 8 + Math.abs(i - 3) * 1.6; P([[x - 6, y + 2], [x, y - 22 - (i % 2) * 6], [x + 6, y + 2]], 'rgba(150,235,255,.92)'); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.moveTo(x - 1, y - 2); ctx.lineTo(x + 1, y - 14); ctx.lineTo(x + 2, y - 2); ctx.fill(); }
  if (F.collar) [[-12, 0, 9], [-3, 4, 10], [8, 1, 9], [-18, 5, 8], [14, 5, 8]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(hx + dx, hy + A.hr - 2 + dy, r, 0, 7); ctx.fillStyle = '#f4faff'; ctx.fill(); ctx.stroke(); });
  if (F.ears2 === 'cat') [[-10, -1], [8, 1]].forEach(([dx, s]) => { P([[tx + dx - 7, ty + 3], [tx + dx + s * 2, ty - 20], [tx + dx + 8, ty + 1]], H.col); P([[tx + dx - 3, ty], [tx + dx + s * 2, ty - 12], [tx + dx + 4, ty - 1]], '#f6b6c0', false); });
  if (F.antenna) { ctx.lineWidth = 2.2; [[-5, -10, -22], [8, 8, -24]].forEach(([dx, ex, ey]) => { ctx.beginPath(); ctx.moveTo(tx + dx, ty + 2); ctx.quadraticCurveTo(tx + dx + ex * .5, ty + ey * .6, tx + dx + ex, ty + ey); ctx.stroke(); glow(tx + dx + ex, ty + ey, 8 + Math.sin(t * 8) * 2, 'rgba(255,240,120,.9)', 'rgba(255,220,0,0)'); ctx.fillStyle = '#ffe66a'; ctx.beginPath(); ctx.arc(tx + dx + ex, ty + ey, 3, 0, 7); ctx.fill(); }); ctx.lineWidth = 2.6; }
  if (F.horn === 'unicorn') { glow(tx + 2, ty - 16, 22, 'rgba(255,240,255,.45)', 'rgba(255,230,255,0)'); P([[tx - 5, ty + 5], [tx + 3, ty - 40], [tx + 9, ty + 5]], '#f8f0ff'); ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i < 5; i++) { ctx.moveTo(tx - 4 + i * .2, ty + 2 - i * 8); ctx.lineTo(tx + 8 - i * 1.4, ty - 3 - i * 8); } ctx.stroke(); ctx.lineWidth = 2.6; }
  if (F.horn === 'twin') [-9, 9].forEach(dx => P([[tx + dx - 4, ty + 5], [tx + dx + 1, ty - 20], [tx + dx + 6, ty + 5]], '#e8dcc0'));
  if (F.horn === 'ram') { ctx.strokeStyle = '#c8b890'; ctx.lineWidth = 6; ctx.lineCap = 'round'; [[-9, 1], [11, -1]].forEach(([dx, s]) => { ctx.beginPath(); ctx.arc(tx + dx + s * 6, ty - 2, 9, s > 0 ? Math.PI * 1.1 : Math.PI * 1.9, s > 0 ? Math.PI * 2.7 : Math.PI * .3, s < 0); ctx.stroke(); }); ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6; }
  if (F.tusks) [[0, 0], [10, 2]].forEach(([dx]) => { ctx.beginPath(); ctx.moveTo(fx + 2 + dx, fy + 12); ctx.quadraticCurveTo(fx + 12 + dx, fy + 22, fx + 16 + dx, fy + 8); ctx.quadraticCurveTo(fx + 8 + dx, fy + 18, fx + 2 + dx, fy + 12); ctx.fillStyle = '#f4ecd8'; ctx.fill(); ctx.stroke(); });
  if (F.lantern) { const lx = tx + 22, ly = ty + 22; ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx + 6, ty + 2); ctx.quadraticCurveTo(tx + 16, ty + 2, lx, ly - 8); ctx.stroke(); ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6;
    glow(lx, ly, 26 + Math.sin(t * 6) * 3, 'rgba(255,200,100,.65)', 'rgba(255,180,60,0)'); ctx.fillStyle = '#ffb84a'; ctx.beginPath(); ctx.roundRect(lx - 6, ly - 8, 12, 16, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff3a0'; ctx.fillRect(lx - 3, ly - 4, 6, 8); }
  if (F.crown2) for (let i = -2; i <= 2; i++) { const x = tx + i * 8, y = ty + 3 - Math.abs(i) * 1.2; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + Math.cos(k * 1.257) * 3.4, y + Math.sin(k * 1.257) * 3.4, 2.6, 0, 7); ctx.fillStyle = i % 2 ? '#ff9ac0' : '#fff'; ctx.fill(); } ctx.fillStyle = '#ffd04a'; ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); }
  if (F.cap2) { ctx.fillStyle = '#f4faff'; ctx.beginPath(); ctx.ellipse(tx, ty + 2, 18, 12, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e04a4a'; ctx.fillRect(tx - 18, ty + 1, 36, 5); ctx.beginPath(); ctx.arc(tx, ty - 12, 5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); }
  if (F.mask) { ctx.beginPath(); ctx.ellipse(fx - 4, fy + 4, 14, 17, 0, 0, 7); ctx.fillStyle = '#b08a58'; ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1a1020'; [[-9, -3], [3, -3]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.ellipse(fx + dx - 1, fy + dy + 2, 3.4, 4.6, 0, 0, 7); ctx.fill(); }); ctx.strokeStyle = '#c83a3a'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(fx - 12, fy + 12); ctx.lineTo(fx - 8, fy + 8); ctx.lineTo(fx - 4, fy + 12); ctx.lineTo(fx, fy + 8); ctx.lineTo(fx + 4, fy + 12); ctx.stroke(); ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6; }
  if (F.visor) { ctx.fillStyle = '#10182a'; ctx.beginPath(); ctx.roundRect(fx - 15, fy - 6, 32, 12, 5); ctx.fill(); ctx.stroke(); const sx = fx - 11 + (Math.sin(t * 3) + 1) * 8; glow(sx + 4, fy, 12, 'rgba(120,230,255,.7)', 'rgba(80,200,255,0)'); ctx.fillStyle = '#7ae8ff'; ctx.fillRect(sx, fy - 2, 8, 4); }
  if (F.bubble) { const g = ctx.createRadialGradient(bx - 14, by - 22, 4, bx, by, brx + 22); g.addColorStop(0, 'rgba(230,248,255,.35)'); g.addColorStop(1, 'rgba(160,215,255,.08)'); ctx.beginPath(); ctx.ellipse(bx, by - 2, brx + 16, bry + 24, 0, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(210,240,255,.85)'; ctx.lineWidth = 2.4; ctx.stroke(); ctx.beginPath(); ctx.arc(bx - 14, by - 26, 14, Math.PI * 1.1, Math.PI * 1.55); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6; }
  if (F.orbs) for (let i = 0; i < 3; i++) { const a = t * 2.2 + i * 2.094, x = bx + Math.cos(a) * (brx + 14), y = by - 6 + Math.sin(a) * (bry + 12) * .8; glow(x, y, 14, hexA(F.orbs, .8), hexA(F.orbs, 0)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fill(); ctx.fillStyle = F.orbs; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill(); }
}

// 既存の描画に重ねる
const _lookBehind0 = lookBehind, _lookFront0 = lookFront;
lookBehind = function (L, A, H) { _lookBehind0(L, A, H); lookBehind2(L, A, H); };
lookFront = function (L, A, H) { _lookFront0(L, A, H); lookFront2(L, A, H); };
