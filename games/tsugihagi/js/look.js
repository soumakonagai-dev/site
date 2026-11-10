'use strict';
// ===== 素材による「見た目の変化」=====
// 素材ごとに、羽・角・しっぽ・よろい・とげ・もよう・染料…を種族の体に重ねて描く。
// 体の各部の位置は、種族ごとの ANCH（あたま・せなか・しっぽ…）にあわせる。

// 種族ごとの目印（100x100ざひょう、右むき）。body=[中心x,中心y,半径x,半径y]
const ANCH = {
  beast:    { body: [0, 0, 43, 29], head: [38, -14], hr: 22, top: [38, -34], back: [-4, -28], tail: [-54, -14], face: [43, -20] },
  bird:     { body: [0, 0, 39, 31], head: [30, -26], hr: 18, top: [30, -44], back: [-8, -26], tail: [-60, -6], face: [35, -30] },
  fish:     { body: [0, 0, 45, 28], head: [30, -4], hr: 20, top: [4, -30], back: [-4, -26], tail: [-60, 0], face: [31, -7] },
  bug:      { body: [-22, 4, 31, 25], head: [40, -4], hr: 17, top: [40, -20], back: [-14, -24], tail: [-50, 4], face: [44, -8] },
  golem:    { body: [0, -3, 34, 29], head: [5, -44], hr: 16, top: [5, -60], back: [0, -32], tail: [-36, 10], face: [6, -46] },
  ghost:    { body: [0, -10, 38, 40], head: [0, -26], hr: 22, top: [0, -52], back: [0, -40], tail: [0, 30], face: [0, -22] },
  dino:     { body: [0, 0, 44, 31], head: [52, -26], hr: 22, top: [52, -46], back: [-6, -30], tail: [-60, 0], face: [58, -34] },
  slime:    { body: [0, 8, 46, 34], head: [8, -2], hr: 24, top: [8, -24], back: [-8, -22], tail: [-44, 16], face: [24, -2] },
  rabbit:   { body: [0, 6, 34, 26], head: [34, -14], hr: 20, top: [38, -32], back: [-6, -18], tail: [-36, 4], face: [40, -18] },
  plant:    { body: [0, 10, 32, 30], head: [4, -34], hr: 24, top: [4, -58], back: [-10, -14], tail: [-30, 24], face: [4, -34] },
  mushroom: { body: [0, 14, 24, 30], head: [0, -18], hr: 30, top: [0, -42], back: [-18, -10], tail: [-22, 30], face: [0, 6] },
  snake:    { body: [-10, 6, 44, 16], head: [46, -14], hr: 17, top: [46, -32], back: [-10, -8], tail: [-62, 22], face: [52, -18] },
  turtle:   { body: [0, -4, 46, 32], head: [50, 6], hr: 15, top: [50, -8], back: [0, -34], tail: [-46, 10], face: [54, 2] },
  octopus:  { body: [0, -14, 36, 34], head: [0, -14], hr: 30, top: [0, -48], back: [0, -40], tail: [0, 40], face: [4, -6] },
  bat:      { body: [0, 4, 22, 26], head: [6, -10], hr: 16, top: [4, -28], back: [-4, -18], tail: [-6, 30], face: [8, -4] },
  dragon:   { body: [0, 6, 38, 26], head: [46, -34], hr: 18, top: [46, -48], back: [-4, -20], tail: [-62, 16], face: [52, -38] },
  robot:    { body: [0, -2, 26, 24], head: [4, -40], hr: 18, top: [4, -54], back: [-10, -26], tail: [-26, 20], face: [10, -40] },
};

// 素材ID → 見た目。tint=からだの色(tw=こさ) wings/horn/tail/mane/armor/spikes/pattern/ears/eyes3/gem/cap/petals/crown/halo/tentacles/aura/scale
const LOOK = {
  dye_red:    { tint: '#d84a3a', tw: .7 }, dye_blue: { tint: '#3a78d8', tw: .7 }, dye_green: { tint: '#4ab85a', tw: .7 },
  dye_purple: { tint: '#8a58c8', tw: .7 }, dye_gold: { tint: '#e8c040', tw: .75 },
  horn_small: { horn: 'single' }, antler: { horn: 'antler' }, bigear: { ears: 1 }, mane: { mane: 'lion' },
  batwing: { wings: 'bat' }, fairywing: { wings: 'fairy' }, flametail: { tail: 'flame' }, fishtail: { tail: 'fish' }, tentacle: { tentacles: 1 },
  armor: { armor: 'plate' }, rockarmor: { armor: 'rock' }, spikes: { spikes: 1 }, stripes: { pattern: 'stripe' }, spots: { pattern: 'spot' },
  eyes3: { eyes3: 1 }, gem: { gem: 1 }, mushcap: { cap: 1 }, petal: { petals: 1 },
  giant: { scale: 1.3 }, tiny: { scale: .78 },
  flamemane: { mane: 'fire', aura: '#ff8a3a' }, thunderwing: { wings: 'thunder', aura: '#ffe84a' }, dragonwing: { wings: 'dragon' },
  crown: { crown: 1 }, halo: { halo: 1, aura: '#fff3a0' }, shadowaura: { aura: '#8a5ad8', dark: 1 },
  goldscale: { tint: '#e8c040', tw: .5, pattern: 'scale', aura: '#ffe27a' },
  icicle: { horn: 'single', tint: '#bfefff', tw: .25 }, snowfur: { tint: '#eaf6ff', tw: .5 }, venomsac: { pattern: 'spot', tint: '#a070c8', tw: .4 },
  ironplate: { armor: 'plate', tint: '#aab4c4', tw: .25 }, windwing: { wings: 'feather', aura: '#bff0e0' }, gale: { aura: '#d8fff0' },
  glacier: { spikes: 1, aura: '#9fe0ff', tint: '#bfe8ff', tw: .35 }, basilisk: { pattern: 'scale', aura: '#b050e0', tint: '#9a60c0', tw: .4 },
  adamant: { armor: 'plate', aura: '#c0d0ff', tint: '#8aa0d0', tw: .35 }, tempest: { wings: 'feather', aura: '#a0ffd8', scale: 1.1 },
};

function mixHex(a, b, w) {
  const p = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const A = p(a), B = p(b), r = A.map((v, i) => Math.round(v + (B[i] - v) * w));
  return '#' + r.map(v => v.toString(16).padStart(2, '0')).join('');
}
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

// ハイブリッド（2つめの核）：その種族らしい特徴を重ねる
const SIGLOOK = { beast: { ears: 1 }, bird: { wings: 'feather' }, fish: { tail: 'fish', pattern: 'scale' }, bug: { wings: 'bug' }, golem: { armor: 'rock' }, ghost: { aura: '#b090ff' }, dino: { spikes: 1, horn: 'single' }, slime: { aura: '#80ffb0' }, rabbit: { ears: 1 }, plant: { petals: 1 }, mushroom: { cap: 1 }, snake: { pattern: 'scale' }, turtle: { armor: 'shell' }, octopus: { tentacles: 1 }, bat: { wings: 'bat' }, dragon: { wings: 'dragon', horn: 'single' }, robot: { armor: 'plate', eyes3: 1 } };
function lookOf(parts, sp2, custom) {
  const L = { scale: 1, tints: [], f: {} };
  if (sp2 && SIGLOOK[sp2]) Object.assign(L.f, SIGLOOK[sp2]);
  for (const id of parts) {
    const l = LOOK[id]; if (!l) continue;
    if (l.tint) L.tints.push([l.tint, l.tw || .6]);
    if (l.scale) L.scale *= l.scale;
    for (const k in l) if (k !== 'tint' && k !== 'tw' && k !== 'scale') L.f[k] = l[k];
  }
  if (custom) {   // つくったときに えらんだ見た目
    if (custom.tint) L.tints.push([custom.tint, .65]);
    if (custom.size) L.scale *= custom.size;
    if (custom.pattern) L.f.pattern = custom.pattern;
    if (custom.acc) L.f.acc = custom.acc;
  }
  return L;
}
function lookColor(base, L) { let c = base; for (const [t, w] of L.tints) c = mixHex(c, t, w); return c; }

// 体のうしろがわに描くもの：オーラ・翼・しっぽ・触手・たてがみ・花びら
function lookBehind(L, A, H) {
  const F = L.f, t = H.t, [bx, by, brx, bry] = A.body;
  if (F.aura) { glow(bx, by, 78, hexA(F.aura, .55 + .15 * Math.sin(t * 3)), hexA(F.aura, 0)); }
  const poly = (pts, fill, stroke) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke !== false) ctx.stroke(); };
  if (F.wings) {
    const fl = Math.sin(t * 7) * .1;
    ctx.save(); ctx.translate(A.back[0], A.back[1]); ctx.rotate(-.1 + fl);
    if (F.wings === 'bat') {
      poly([[0, 0], [-14, -52], [-26, -34], [-40, -54], [-48, -24], [-62, -34], [-52, 4], [-20, 10]], '#51396e');
      ctx.lineWidth = 1.5; ctx.beginPath(); [[-14, -52], [-40, -54], [-62, -34]].forEach(p => { ctx.moveTo(0, 0); ctx.lineTo(p[0], p[1]); }); ctx.stroke(); ctx.lineWidth = 2.6;
    } else if (F.wings === 'fairy') {
      ctx.fillStyle = 'rgba(215,242,255,.72)'; ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.ellipse(-22, -34, 15, 36, -.6, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-12, -10, 10, 22, -1.2, 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2.6; star4(-26, -46, 5, '#fff', .6 + .4 * Math.sin(t * 6));
    } else if (F.wings === 'feather') {
      poly([[0, 0], [-8, -42], [-26, -54], [-46, -46], [-60, -26], [-52, -6], [-24, 6]], '#f4f1e6');
      ctx.lineWidth = 1.4; ctx.beginPath(); [[-26, -54], [-46, -46], [-60, -26]].forEach(p => { ctx.moveTo(0, 0); ctx.lineTo(p[0], p[1]); }); ctx.stroke(); ctx.lineWidth = 2.6;
    } else if (F.wings === 'bug') {
      ctx.fillStyle = 'rgba(210,235,215,.68)'; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(-26, -30, 10, 32, -.7, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-14, -10, 8, 20, -1.15, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineWidth = 2.6;
    } else if (F.wings === 'thunder') {
      glow(-30, -26, 46, 'rgba(255,240,100,.5)', 'rgba(255,220,0,0)');
      poly([[0, 0], [-6, -46], [-14, -30], [-24, -62], [-30, -30], [-46, -54], [-40, -16], [-60, -20], [-30, 4]], '#ffe84a');
    } else if (F.wings === 'dragon') {
      poly([[0, 0], [-6, -78], [-30, -58], [-44, -72], [-56, -44], [-76, -54], [-62, -12], [-28, 6]], H.mid);
      ctx.lineWidth = 3; ctx.beginPath(); [[-6, -78], [-44, -72], [-76, -54]].forEach(p => { ctx.moveTo(0, 0); ctx.lineTo(p[0], p[1]); }); ctx.stroke(); ctx.lineWidth = 2.6;
    }
    ctx.restore();
  }
  if (F.tail) {
    ctx.save(); ctx.translate(A.tail[0], A.tail[1]);
    if (F.tail === 'flame') {
      const s = Math.sin(t * 9) * 4;
      ctx.beginPath(); ctx.moveTo(4, -10); ctx.quadraticCurveTo(-30, -12 + s, -50, -40 - s); ctx.quadraticCurveTo(-26, -2, -2, 12); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, -50, -40); g.addColorStop(0, '#ffd84a'); g.addColorStop(1, '#ff5a1a'); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -4); ctx.quadraticCurveTo(-22, -6, -34, -26 - s * .6); ctx.quadraticCurveTo(-18, 0, 0, 6); ctx.fillStyle = '#fff3a0'; ctx.fill();
    } else {
      poly([[4, 0], [-30, -36], [-48, -26], [-42, 0], [-48, 26], [-30, 36]], 'rgba(88,184,232,.92)');
      ctx.lineWidth = 1.5; ctx.beginPath(); [[-30, -36], [-42, 0], [-30, 36]].forEach(p => { ctx.moveTo(4, 0); ctx.lineTo(p[0], p[1]); }); ctx.stroke(); ctx.lineWidth = 2.6;
    }
    ctx.restore();
  }
  if (F.tentacles) {
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const x0 = bx - 26 + i * 13, y0 = by + bry - 8, w = Math.sin(t * 3 + i) * 7;
      for (const [lw, c] of [[9, H.dk], [6, H.col]]) {
        ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0);
        ctx.bezierCurveTo(x0 + w, y0 + 14, x0 - w, y0 + 26, x0 + w * .8, y0 + 40); ctx.stroke();
      }
    }
    ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6;
  }
  if (F.mane) {
    const [hx, hy] = A.head, r = A.hr, n = 11;
    if (F.mane === 'lion') { ctx.fillStyle = '#7a4a22'; ctx.beginPath(); ctx.arc(hx - 2, hy, r + 7, 0, 7); ctx.fill(); }
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.283 + .3, tip = r + (F.mane === 'fire' ? 24 + Math.sin(t * 8 + i) * 5 : 15), b0 = r - 2;
      const p = [[hx + Math.cos(a - .26) * b0, hy + Math.sin(a - .26) * b0], [hx + Math.cos(a) * tip, hy + Math.sin(a) * tip], [hx + Math.cos(a + .26) * b0, hy + Math.sin(a + .26) * b0]];
      poly(p, F.mane === 'fire' ? (i % 2 ? '#ff9a2e' : '#ffd84a') : (i % 2 ? '#8a5a2c' : '#a8743a'));
    }
  }
  if (F.petals) {
    const [hx, hy] = A.head, r = A.hr;
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; ctx.save(); ctx.translate(hx + Math.cos(a) * (r + 2), hy + Math.sin(a) * (r + 2)); ctx.rotate(a); ctx.fillStyle = i % 2 ? '#ff9ac0' : '#ffc0d8'; ctx.beginPath(); ctx.ellipse(8, 0, 14, 8, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
  }
}

// 体のまえがわに描くもの：よろい・とげ・もよう・角・耳・目・宝石・かさ・王冠・わ
function lookFront(L, A, H) {
  const F = L.f, t = H.t, [bx, by, brx, bry] = A.body, [tx, ty] = A.top;
  const poly = (pts, fill, stroke) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke !== false) ctx.stroke(); };
  if (F.pattern) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(bx, by, brx - 1, bry - 1, 0, 0, 7); ctx.clip();
    if (F.pattern === 'stripe') {
      ctx.fillStyle = 'rgba(30,20,10,.38)';
      for (let i = -5; i <= 5; i++) { const x = bx + i * 15; ctx.beginPath(); ctx.moveTo(x - 4, by - bry - 4); ctx.lineTo(x + 5, by - bry - 4); ctx.lineTo(x + 14, by + bry + 4); ctx.lineTo(x + 4, by + bry + 4); ctx.closePath(); ctx.fill(); }
    } else if (F.pattern === 'spot') {
      [[-24, -10, 8], [-6, -16, 6], [10, -6, 9], [-14, 10, 7], [24, 8, 6], [0, 14, 5], [30, -14, 5]].forEach(p => { ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.beginPath(); ctx.arc(bx + p[0], by + p[1], p[2], 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.arc(bx + p[0] + 1, by + p[1] + 1, p[2] * .6, 0, 7); ctx.fill(); });
    } else if (F.pattern === 'scale') {
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.6;
      for (let r = 0; r < 5; r++) for (let q = -6; q <= 6; q++) { ctx.beginPath(); ctx.arc(bx + q * 10 + (r % 2) * 5, by - 24 + r * 11, 6, 0, Math.PI); ctx.stroke(); }
    }
    ctx.restore(); ctx.lineWidth = 2.6; ctx.strokeStyle = H.dk;
  }
  if (F.armor === 'plate') {
    for (let i = 0; i < 5; i++) {
      const x = bx - brx * .62 + i * (brx * 1.24 / 4), y = by - bry * .5 + Math.pow(i - 2, 2) * 2.5;
      ctx.save(); ctx.translate(x, y); ctx.rotate((i - 2) * .22);
      const g = ctx.createLinearGradient(-10, -14, 10, 14); g.addColorStop(0, '#c4ccdc'); g.addColorStop(1, '#6a7488'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 11, 16, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-3, -11, 3, 12); ctx.restore();
    }
  } else if (F.armor === 'shell') {
    ctx.beginPath(); ctx.ellipse(A.back[0] + 2, by - bry + 14, 32, 22, 0, Math.PI, 0); ctx.closePath(); const sg = ctx.createLinearGradient(0, by - bry - 8, 0, by - bry + 14); sg.addColorStop(0, '#9a8a5a'); sg.addColorStop(1, '#5a4a2a'); ctx.fillStyle = sg; ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(A.back[0] - 20, by - bry + 14); ctx.lineTo(A.back[0] - 8, by - bry - 4); ctx.moveTo(A.back[0] + 2, by - bry + 14); ctx.lineTo(A.back[0] + 2, by - bry - 8); ctx.moveTo(A.back[0] + 24, by - bry + 14); ctx.lineTo(A.back[0] + 12, by - bry - 4); ctx.stroke(); ctx.lineWidth = 2.6;
  } else if (F.armor === 'rock') {
    [[-26, -16, 13], [-6, -22, 15], [16, -16, 13], [-14, -2, 11], [8, -4, 11]].forEach((p, i) => {
      ctx.save(); ctx.translate(bx + p[0], by + p[1]); ctx.rotate(i);
      poly([[-p[2], -p[2] * .3], [-p[2] * .3, -p[2]], [p[2] * .8, -p[2] * .6], [p[2], p[2] * .4], [0, p[2]], [-p[2] * .8, p[2] * .6]], i % 2 ? '#8a7a68' : '#a89a84');
      ctx.restore();
    });
  }
  if (F.spikes) for (let i = 0; i < 7; i++) { const x = A.back[0] + 20 - i * 9, y = by - bry + 8 + Math.abs(i - 3) * 1.6; poly([[x - 5, y + 2], [x, y - 17], [x + 5, y + 2]], '#ece8d4'); }
  if (F.ears) {
    [[-8, -.35, 24], [8, .25, 26]].forEach(([dx, rot, h]) => { ctx.beginPath(); ctx.ellipse(tx + dx, ty - h * .6, 6.5, h, rot, 0, 7); ctx.fillStyle = H.col; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(tx + dx, ty - h * .6, 3, h * .7, rot, 0, 7); ctx.fillStyle = '#f6b6c0'; ctx.fill(); });
  }
  if (F.horn === 'single') { poly([[tx - 6, ty + 5], [tx + 3, ty - 28], [tx + 9, ty + 5]], '#f4ecd0'); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx - 4, ty - 4); ctx.lineTo(tx + 7, ty - 4); ctx.moveTo(tx - 2, ty - 12); ctx.lineTo(tx + 6, ty - 12); ctx.stroke(); ctx.lineWidth = 2.6; }
  if (F.horn === 'antler') {
    ctx.strokeStyle = '#6a4220'; ctx.lineCap = 'round';
    [[-6, -1], [8, 1]].forEach(([dx, s]) => {
      const x = tx + dx; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, ty + 4); ctx.lineTo(x + s * 8, ty - 22); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + s * 3, ty - 8); ctx.lineTo(x + s * 17, ty - 18); ctx.moveTo(x + s * 6, ty - 18); ctx.lineTo(x + s * 18, ty - 32); ctx.moveTo(x + s * 8, ty - 22); ctx.lineTo(x + s * 4, ty - 38); ctx.stroke();
    });
    ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6;
  }
  if (F.cap) {
    ctx.fillStyle = '#d84a4a'; ctx.beginPath(); ctx.ellipse(tx, ty - 4, 30, 18, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f6e8e0'; [[-14, -12, 5], [4, -18, 6], [16, -10, 4]].forEach(p => { ctx.beginPath(); ctx.arc(tx + p[0], ty + p[1], p[2], 0, 7); ctx.fill(); });
  }
  if (F.eyes3) {
    const ex = A.face[0] - 7, ey = A.face[1] - 14; glow(ex, ey, 11, 'rgba(190,120,255,.8)', 'rgba(160,80,255,0)');
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex, ey, 5, 5.6, 0, 0, 7); ctx.fill(); ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = '#8a3ad8'; ctx.beginPath(); ctx.arc(ex + 1, ey, 3, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + 2, ey - 1.4, 1.1, 0, 7); ctx.fill(); ctx.lineWidth = 2.6;
  }
  if (F.gem) {
    const gx = tx + 2, gy = ty + 6; glow(gx, gy, 16, 'rgba(120,240,255,.7)', 'rgba(60,200,255,0)');
    poly([[gx, gy - 9], [gx + 7, gy], [gx, gy + 9], [gx - 7, gy]], '#60d8e8'); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(gx - 1, gy - 7); ctx.lineTo(gx + 3, gy - 1); ctx.lineTo(gx - 1, gy - 1); ctx.fill();
  }
  if (F.crown) {
    const cx = tx, cy = ty + 2, g = ctx.createLinearGradient(0, cy - 20, 0, cy + 2); g.addColorStop(0, '#fff0a0'); g.addColorStop(1, '#d8a820');
    poly([[cx - 14, cy + 2], [cx - 16, cy - 18], [cx - 7, cy - 8], [cx, cy - 22], [cx + 7, cy - 8], [cx + 16, cy - 18], [cx + 14, cy + 2]], g);
    [[-12, '#e83a3a'], [0, '#3a8ae8'], [12, '#3ae85a']].forEach(([dx, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx + dx, cy - 2, 2.6, 0, 7); ctx.fill(); });
  }
  if (F.halo) {
    const hx = tx, hy = ty - 14; glow(hx, hy, 24, 'rgba(255,245,160,.55)', 'rgba(255,240,120,0)');
    ctx.strokeStyle = '#ffe66a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(hx, hy, 18, 6, 0, 0, 7); ctx.stroke(); ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6;
  }
  if (F.acc === 'ribbon') { const rx = tx - 2, ry = ty + 2; ctx.fillStyle = '#ff6a9a'; [-1, 1].forEach(sg => { ctx.beginPath(); ctx.ellipse(rx + sg * 9, ry - 3, 9, 6, sg * .5, 0, 7); ctx.fill(); ctx.stroke(); }); ctx.beginPath(); ctx.arc(rx, ry - 2, 4, 0, 7); ctx.fillStyle = '#ff3a7a'; ctx.fill(); ctx.stroke(); }
  if (F.acc === 'glasses') { const [fx, fy] = A.face; ctx.strokeStyle = '#222'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(fx + 1, fy, 8, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(fx - 7, fy); ctx.lineTo(fx - 22, fy - 2); ctx.stroke(); ctx.fillStyle = 'rgba(160,220,255,.25)'; ctx.beginPath(); ctx.arc(fx + 1, fy, 7.5, 0, 7); ctx.fill(); ctx.strokeStyle = H.dk; ctx.lineWidth = 2.6; }
  if (F.acc === 'scarf') { const [hx, hy] = A.head, r = A.hr; ctx.fillStyle = '#e04a4a'; ctx.beginPath(); ctx.ellipse(hx - 4, hy + r - 3, r * .9, 6, .2, 0, 7); ctx.fill(); ctx.stroke(); poly([[hx - 12, hy + r], [hx - 30, hy + r + 14 + Math.sin(t * 4) * 2], [hx - 22, hy + r + 18], [hx - 6, hy + r + 4]], '#c83a3a'); }
  if (F.acc === 'hat') { poly([[tx - 14, ty + 3], [tx + 2, ty - 28], [tx + 14, ty + 3]], '#6a4ab8'); ctx.fillStyle = '#4a2a98'; ctx.beginPath(); ctx.ellipse(tx, ty + 3, 20, 5, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffd84a'; ctx.fillRect(tx - 11, ty - 5, 22, 4); star4(tx + 2, ty - 20, 4, '#ffe66a'); }
}
