'use strict';
// ===== 地形の描画：崖・階段・ほら穴・高台とくぼ地の陰影・洞窟の暗闇 =====
GROUND.cave = { g: ['#4a4658', '#454152', '#4e4a5c'], dark: '#2a2634', flower: [], tree: ['#2f7a3a', '#3f9647', '#5cb25a'] };

const CLIFF = {
  grass: { b: '#8a7a68', l: '#b8a88e', d: '#4a3e32' }, forest: { b: '#7a6c5c', l: '#a8987e', d: '#3e342a' }, village: { b: '#8a7a68', l: '#b8a88e', d: '#4a3e32' }, path: { b: '#8a7a68', l: '#b8a88e', d: '#4a3e32' },
  sand: { b: '#b89a6a', l: '#e0c490', d: '#6a5230' }, desert: { b: '#c28a52', l: '#e8b87c', d: '#6a4226' },
  ash: { b: '#5a4440', l: '#8a6a62', d: '#241816' }, ruin: { b: '#8a8aa0', l: '#b8b8d0', d: '#46465a' }, cave: { b: '#4a4658', l: '#6a667a', d: '#1e1a28' },
};

const _drawTile0 = FieldScene.prototype.drawTile;
const TERRAIN = 'UVNODAQ';
FieldScene.prototype.drawTile = function (ch, x, y, tx, ty) {
  if (!TERRAIN.includes(ch)) {
    _drawTile0.call(this, ch, x, y, tx, ty);
    const hv = this.W.hgt && this.W.hgt[ty] ? this.W.hgt[ty][tx] : 0;
    if (hv === 1) {      // 高台：ひとまわり明るく、ふちに影
      ctx.fillStyle = 'rgba(255,248,215,.12)'; ctx.fillRect(x, y, TILE, TILE);
      const v = (dx, dy) => this.tile(tx + dx, ty + dy) === 'V';
      ctx.fillStyle = 'rgba(0,0,0,.16)';
      if (v(0, -1)) ctx.fillRect(x, y, TILE, 5); if (v(-1, 0)) ctx.fillRect(x, y, 5, TILE); if (v(1, 0)) ctx.fillRect(x + TILE - 5, y, 5, TILE);
    } else if (hv === -1) { // くぼ地：すこし暗く、北の崖の影
      ctx.fillStyle = 'rgba(10,20,50,.18)'; ctx.fillRect(x, y, TILE, TILE);
    }
    if (this.tile(tx, ty - 1) === 'U') { const g = ctx.createLinearGradient(0, y, 0, y + 14); g.addColorStop(0, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, TILE, 14); }
    return;
  }
  const gk = this.W.ground[ty][tx], C = CLIFF[gk] || CLIFF.grass, h = hash(tx, ty), t = this.t;
  if (ch !== 'Q') _drawTile0.call(this, '.', x, y, tx, ty);
  const face = () => {
    const g = ctx.createLinearGradient(0, y, 0, y + TILE); g.addColorStop(0, C.l); g.addColorStop(.14, C.b); g.addColorStop(1, C.d);
    ctx.fillStyle = g; ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { const yy = y + 9 + i * 8 + (h >> i) % 3; ctx.beginPath(); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 14, yy - 2 + (h >> (i + 2)) % 4, x + TILE, yy + 1); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x + 6 + h % 18, y + 4); ctx.lineTo(x + 8 + h % 18, y + 14); ctx.lineTo(x + 5 + h % 18, y + 22); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x, y, TILE, 2);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, y + TILE - 3, TILE, 3);
  };
  switch (ch) {
    case 'U': face(); break;
    case 'V':
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x + 16, y + 27, 15, 5, 0, 0, 7); ctx.fill();
      [[8, 20, 11], [23, 16, 11], [15, 26, 9]].forEach((p, i) => {
        const g = ctx.createRadialGradient(x + p[0] - 3, y + p[1] - 4, 1, x + p[0], y + p[1], p[2] + 2); g.addColorStop(0, C.l); g.addColorStop(1, C.d);
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x + p[0], y + p[1], p[2], p[2] * .8, 0, 0, 7); ctx.fill();
      });
      break;
    case 'N': {   // 階段：高いほうの向きに合わせる
      const hh = (dx, dy) => (this.W.hgt[ty + dy] ? this.W.hgt[ty + dy][tx + dx] : 0) || 0, dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      let best = dirs[0], bv = -9; dirs.forEach(([dx, dy]) => { const c2 = this.tile(tx + dx, ty + dy); if (c2 === 'U' || c2 === 'V') return; const v = hh(dx, dy); if (v > bv) { bv = v; best = [dx, dy]; } });
      const vert = best[1] !== 0, sg = vert ? best[1] : best[0];
      ctx.fillStyle = C.d; ctx.fillRect(x, y, TILE, TILE);
      for (let i = 0; i < 4; i++) {
        const a = i / 4, g = (sg > 0 ? 1 - a : a);   // 高いほうが明るい
        ctx.fillStyle = `rgb(${Math.round(150 + g * 80)},${Math.round(136 + g * 70)},${Math.round(108 + g * 60)})`;
        if (vert) { const yy = y + (sg < 0 ? i * 8 : (3 - i) * 8); ctx.fillRect(x + 1, yy, TILE - 2, 7); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 1, yy + 6, TILE - 2, 1.5); }
        else { const xx = x + (sg < 0 ? i * 8 : (3 - i) * 8); ctx.fillRect(xx, y + 1, 7, TILE - 2); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(xx + 6, y + 1, 1.5, TILE - 2); }
      }
      break;
    }
    case 'O':   // ほら穴の入口
      face();
      { const g = ctx.createRadialGradient(x + 16, y + 22, 2, x + 16, y + 22, 17); g.addColorStop(0, '#000'); g.addColorStop(.7, '#120c1c'); g.addColorStop(1, '#2a2234');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 3, y + TILE); ctx.quadraticCurveTo(x + 3, y + 4, x + 16, y + 4); ctx.quadraticCurveTo(x + 29, y + 4, x + 29, y + TILE); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = C.l; ctx.lineWidth = 2.5; ctx.stroke(); }
      ctx.fillStyle = `rgba(160,140,220,${.15 + .1 * Math.sin(t * 2)})`; ctx.beginPath(); ctx.ellipse(x + 16, y + 20, 7, 10, 0, 0, 7); ctx.fill();
      if (Math.sin(t * 3 + tx) > .3) txt('…', x + 16, y - 2, { size: 12, align: 'center', color: '#cfc4ff', shadow: true });
      break;
    case 'Q': {
      const g = ctx.createLinearGradient(x, y, x + TILE, y + TILE); g.addColorStop(0, '#2c2838'); g.addColorStop(1, '#1a1622'); ctx.fillStyle = g; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.beginPath(); ctx.ellipse(x + 8 + h % 14, y + 10 + (h >> 4) % 14, 8, 5, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + h % 20, y); ctx.lineTo(x + 6 + h % 20, y + 12); ctx.lineTo(x + 2 + h % 20, y + TILE); ctx.stroke();
      if (this.tile(tx, ty + 1) !== 'Q') { ctx.fillStyle = '#5a566a'; ctx.fillRect(x, y + TILE - 4, TILE, 4); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x, y + TILE - 1, TILE, 1); }
      break;
    }
    case 'D': {
      ctx.fillStyle = '#0a0612'; ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgb(${90 - i * 18},${84 - i * 17},${110 - i * 20})`; ctx.fillRect(x + 4 + i * 2, y + 4 + i * 6, TILE - 8 - i * 4, 5); }
      glow(x + 16, y + 16, 22, 'rgba(255,220,100,.28)', 'rgba(255,220,100,0)');
      txt('▼', x + 16, y + 8 + Math.sin(t * 4) * 2, { size: 14, align: 'center', color: '#ffd96a', shadow: true });
      break;
    }
    case 'A': {
      const g = ctx.createLinearGradient(0, y, 0, y + TILE); g.addColorStop(0, '#fff6c0'); g.addColorStop(1, '#8a7a50'); ctx.fillStyle = g; ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = `rgba(0,0,0,${.1 + i * .06})`; ctx.fillRect(x + 2, y + 10 + i * 8, TILE - 4, 2); }
      glow(x + 16, y + 10, 26, 'rgba(255,250,200,.5)', 'rgba(255,250,200,0)');
      txt('▲', x + 16, y + 8 + Math.sin(t * 4) * 2, { size: 14, align: 'center', color: '#6a5a20' });
      break;
    }
  }
};

// 洞窟の暗闇：プレイヤーのまわりだけ見える。「てらす」ちからの仲間がいると広く見える
FieldScene.prototype.drawDark = function () {
  if (!this._dk) { this._dk = document.createElement('canvas'); this._dk.width = W; this._dk.height = H; }
  const c = this._dk.getContext('2d'), camX = clamp(this.px - W / 2, 0, this.W.w * TILE - W), camY = clamp(this.py - H / 2, 0, this.W.h * TILE - H);
  c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H); c.fillStyle = 'rgba(3,3,12,.93)'; c.fillRect(0, 0, W, H);
  const sx = this.px - camX, sy = this.py - camY - 8, R = (abilityHolder('light') ? 260 : 125) * (1 + Math.sin(this.t * 3.3) * .025);
  c.globalCompositeOperation = 'destination-out';
  const g = c.createRadialGradient(sx, sy, R * .12, sx, sy, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.6, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  ctx.drawImage(this._dk, 0, 0);
  glow(sx, sy, R * .55, 'rgba(255,200,120,.10)', 'rgba(255,200,120,0)');
};

// ===== 新バイオーム（雪原・沼地・鉱山・空島）の地面とタイル =====
Object.assign(GROUND, {
  snow:  { g: ['#eef6ff', '#e4f0fa', '#f4faff'], dark: '#b8cce0', flower: ['#fff'], tree: ['#cfe4f4', '#e4f2fc', '#f8fcff'] },
  swamp: { g: ['#4a5a3c', '#44543a', '#506040'], dark: '#2e3a28', flower: ['#c8e86a'], tree: ['#243020', '#34442a', '#46563a'] },
  mine:  { g: ['#7a6a58', '#725f50', '#826f5e'], dark: '#4a3e32', flower: [], tree: ['#2f7a3a', '#3f9647', '#5cb25a'] },
  sky:   { g: ['#f4faff', '#eaf4fc', '#fbfdff'], dark: '#c8dcf0', flower: [], tree: ['#2f7a3a', '#3f9647', '#5cb25a'] },
});
Object.assign(CLIFF, {
  snow: { b: '#c8d8e8', l: '#f0f8ff', d: '#7a90a8' }, swamp: { b: '#5a5a46', l: '#8a8a6a', d: '#2a2a1e' },
  mine: { b: '#7a6a58', l: '#a89478', d: '#3a3024' }, sky: { b: '#d8e8f8', l: '#ffffff', d: '#8aa8c8' },
});

const _drawTile1 = FieldScene.prototype.drawTile;
FieldScene.prototype.drawTile = function (ch, x, y, tx, ty) {
  const gk = this.W.ground[ty][tx], h = hash(tx, ty), t = this.t;
  const special = 'igYe'.includes(ch) || (ch === 'X' && gk === 'sky');
  _drawTile1.call(this, special ? '.' : ch, x, y, tx, ty);
  if (special) {
    if (ch === 'i') {   // 氷のゆか：つるつるすべる
      const g = ctx.createLinearGradient(x, y, x + TILE, y + TILE); g.addColorStop(0, '#d6f2fc'); g.addColorStop(1, '#9ad6ee'); ctx.fillStyle = g; ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4, y + 26); ctx.lineTo(x + 26, y + 4); ctx.stroke();
      ctx.strokeStyle = 'rgba(80,150,190,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + 6 + h % 14, y); ctx.lineTo(x + 12 + h % 10, y + 14); ctx.lineTo(x + 8 + h % 12, y + TILE); ctx.stroke();
      if ((h + Math.floor(t * 2)) % 9 === 0) star4(x + 8 + h % 16, y + 8 + (h >> 4) % 16, 4, '#fff', .9);
    } else if (ch === 'g') {   // ぬかるみ：ゆっくりしか すすめない
      ctx.fillStyle = '#3a4828'; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = 'rgba(120,150,60,.35)'; ctx.beginPath(); ctx.ellipse(x + 10 + h % 10, y + 12, 9, 5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 20, y + 22, 8, 4, 0, 0, 7); ctx.fill();
      const b = (t * .6 + h * .17) % 1; ctx.strokeStyle = `rgba(200,230,120,${.8 - b * .8})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x + 8 + h % 16, y + 26 - b * 18, 2 + b * 3, 0, 7); ctx.stroke();
    } else if (ch === 'Y') {   // 氷の柱
      ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x + 16, y + 28, 13, 4, 0, 0, 7); ctx.fill();
      glow(x + 16, y + 14, 22, 'rgba(180,235,255,.35)', 'rgba(160,230,255,0)');
      [[8, 28, 5, 20], [16, 28, 7, 30], [24, 28, 5, 16]].forEach(([cx, by, w, hh]) => { const g = ctx.createLinearGradient(x + cx - w, 0, x + cx + w, 0); g.addColorStop(0, '#e8fbff'); g.addColorStop(1, '#7cc8e8'); ctx.fillStyle = g; ctx.strokeStyle = '#4a98c0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + cx - w, y + by); ctx.lineTo(x + cx, y + by - hh); ctx.lineTo(x + cx + w, y + by); ctx.closePath(); ctx.fill(); ctx.stroke(); });
    } else if (ch === 'e') {   // 鉱石の岩
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x + 17, y + 27, 14, 5, 0, 0, 7); ctx.fill();
      const g = ctx.createRadialGradient(x + 11, y + 12, 2, x + 16, y + 20, 17); g.addColorStop(0, '#a89c8a'); g.addColorStop(1, '#4a4034'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x + 16, y + 20, 14, 11, 0, 0, 7); ctx.fill();
      const gem = ['#ff9a3a', '#5ac8ff', '#7aff8a', '#ff6ab8'][h % 4]; ctx.fillStyle = gem; [[10, 16], [20, 22], [16, 12]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.moveTo(x + dx, y + dy - 4); ctx.lineTo(x + dx + 3, y + dy); ctx.lineTo(x + dx, y + dy + 4); ctx.lineTo(x + dx - 3, y + dy); ctx.closePath(); ctx.fill(); });
      if (Math.sin(t * 4 + tx + ty) > .4) star4(x + 16, y + 14, 4, '#fff', .9);
    } else {   // 空島のまわり：雲の海（谷）
      const g = ctx.createLinearGradient(0, y, 0, y + TILE); g.addColorStop(0, '#7cbcf4'); g.addColorStop(1, '#4a8ee0'); ctx.fillStyle = g; ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 2; i++) { const cx = x + ((h >> i) % 28) + Math.sin(t * .6 + i + tx) * 4; ctx.beginPath(); ctx.ellipse(cx, y + 8 + i * 14, 11, 4, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      if (this.tile(tx, ty - 1) !== 'X') ctx.fillRect(x, y, TILE, 3);
      if (this.tile(tx, ty + 1) !== 'X') ctx.fillRect(x, y + TILE - 3, TILE, 3);
      if (this.tile(tx - 1, ty) !== 'X') ctx.fillRect(x, y, 3, TILE);
      if (this.tile(tx + 1, ty) !== 'X') ctx.fillRect(x + TILE - 3, y, 3, TILE);
    }
    return;
  }
  if (ch === '.') {   // ふつうの地面の かざり
    if (gk === 'snow' && h % 6 === 0) star4(x + 6 + h % 20, y + 6 + (h >> 4) % 20, 3, '#fff', .5 + .4 * Math.sin(t * 3 + h));
    else if (gk === 'swamp' && h % 5 === 0) { ctx.strokeStyle = '#6a8a3a'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; const sw = Math.sin(t * 2 + h) * 2; ctx.beginPath(); ctx.moveTo(x + 8 + h % 14, y + 24); ctx.lineTo(x + 6 + h % 14 + sw, y + 10); ctx.moveTo(x + 11 + h % 14, y + 24); ctx.lineTo(x + 13 + h % 14 + sw, y + 12); ctx.stroke(); }
    else if (gk === 'mine' && h % 7 === 0) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x + 10 + h % 14, y + 20, 3, 2, 0, 0, 7); ctx.fill(); }
    else if (gk === 'sky' && h % 8 === 0) { ctx.fillStyle = 'rgba(200,225,250,.45)'; ctx.beginPath(); ctx.ellipse(x + 14 + h % 10, y + 16, 8, 3, 0, 0, 7); ctx.fill(); }
  }
};

// ===== 門（G）：国境の山のかべの切れ目をふさぐ、大きな木の門 =====
const _drawTile2 = FieldScene.prototype.drawTile;
FieldScene.prototype.drawTile = function (ch, x, y, tx, ty) {
  _drawTile2.call(this, ch === 'G' ? '.' : ch, x, y, tx, ty);
  if (ch !== 'G') return;
  const t = this.t, g = n => this.tile(tx + n[0], ty + n[1]) === 'G';
  const L = g([-1, 0]), R = g([1, 0]), U = g([0, -1]), D = g([0, 1]);
  const gr = ctx.createLinearGradient(x, y, x + TILE, y); gr.addColorStop(0, '#8a5a30'); gr.addColorStop(.5, '#a8743c'); gr.addColorStop(1, '#6a4222');
  ctx.fillStyle = gr; ctx.fillRect(x, y, TILE, TILE);
  ctx.strokeStyle = 'rgba(40,24,10,.55)'; ctx.lineWidth = 1.5;
  for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + i * 8, y); ctx.lineTo(x + i * 8, y + TILE); ctx.stroke(); }
  ctx.fillStyle = '#4a4a56'; [8, 22].forEach(by => { ctx.fillRect(x, y + by, TILE, 4); ctx.fillStyle = '#9a9aaa'; ctx.fillRect(x, y + by, TILE, 1); ctx.fillStyle = '#4a4a56'; });
  ctx.fillStyle = '#b8b8c6'; [[5, 10], [16, 10], [27, 10], [5, 24], [16, 24], [27, 24]].forEach(([bx, by]) => { ctx.beginPath(); ctx.arc(x + bx, y + by, 1.6, 0, 7); ctx.fill(); });
  // 石の柱（門のはし）
  const pill = (px, w) => { const s = ctx.createLinearGradient(px, 0, px + w, 0); s.addColorStop(0, '#c8c4b8'); s.addColorStop(1, '#7a766c'); ctx.fillStyle = s; ctx.fillRect(px, y, w, TILE); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(px, y + TILE - 3, w, 3); };
  if (!L) pill(x, 6); if (!R) pill(x + TILE - 6, 6);
  if (!U) { ctx.fillStyle = '#d8d4c8'; ctx.fillRect(x, y, TILE, 4); }
  if (!L && !U) { ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(x + 6, y - 2); ctx.lineTo(x + 6, y - 14); ctx.lineTo(x + 20, y - 9 + Math.sin(t * 4) * 1.5); ctx.lineTo(x + 6, y - 6); ctx.fill(); ctx.fillStyle = '#6a4222'; ctx.fillRect(x + 5, y - 15, 2, 14); }   // はた
  if (L && R && !U && Math.floor(t * 2) % 2 === 0 && tx % 3 === 0) { }
  if (!D) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(x, y + TILE - 3, TILE, 3); }
};
