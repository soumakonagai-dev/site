'use strict';
// ===== 広いワールドの生成（毎回おなじ地形になるよう、固定シードで作る）=====
// バイオームは「ゆがんだボロノイ図」で自然な形に分ける。境い目は山(M)のかべで、
// 道をふさぐ「門」(G)の前には「門番」が立っていて、たおさないと通れない。
// タイル：. 地面  T 木  P ヤシ  K サボテン  I 柱  r 岩  M 山  w 深い海  F 柵  H 家  B ショップ  C キャンプ/工房  c 宝箱  o 開けた宝箱  S 看板
//        ~ あさい水(ゆっくり)  X 深い谷(通れない)  L 溶岩(通れない)  i 氷(すべる)  g ぬかるみ(ゆっくり)  Y 氷の柱  e 鉱石  G 門(門番をたおすと開く)
const WW = 400, WH = 280;
const SOLID_CH = 'TPKIrMwFHBCcoSUVQYeGXL';

// バイオームの中心（x, y, 大きさ）。ここから ゆがめて 国境を決める
const REGION_SEEDS = {
  meadow: [85, 218, 1], forest: [180, 232, 1], seaside: [50, 130, 1], desert: [285, 205, 1], volcano: [195, 135, 1.05],
  ruins: [310, 85, 1], snow: [120, 45, 1], swamp: [350, 228, 1], mine: [372, 150, .9], sky: [225, 38, .85],
};
// すすむ順（かんたん → むずかしい）。門番はこの順で つよくなる
const RANK = ['meadow', 'forest', 'seaside', 'desert', 'volcano', 'ruins', 'swamp', 'snow', 'mine', 'sky'];
const BOSS_REGION = { morinushi: 'forest', magmadon: 'volcano', gaiarex: 'ruins' };
const REGION_ELEM = { meadow: 'grass', forest: 'grass', seaside: 'water', desert: 'earth', volcano: 'fire', ruins: 'thunder', snow: 'ice', swamp: 'poison', mine: 'steel', sky: 'wind' };
const GUARD_NAMES = {
  forest: ['森の門番ウッド', 2], seaside: ['海の門番マリン', 4], desert: ['砂の門番サンド', 3], volcano: ['火の門番ブレイズ', 1], ruins: ['遺跡の門番ルーン', 5],
  swamp: ['沼の門番ボグ', 0], snow: ['雪の門番フロスト', 4], mine: ['鉱山の門番ガンテツ', 5], sky: ['空の門番スカイ', 0],
};

function mulberry32(a) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// 門番のチーム：そのバイオームに すむ モンスターで、土地の敵より すこし つよい
function makeGuardTrainer(dest) {
  const cfg = REGION_SPAWN[dest], r = mulberry32(dest.length * 97 + RANK.indexOf(dest) * 13 + 5), keys = cfg.table.map(x => x[0]).sort((a, b) => ENEMIES[a].level - ENEMIES[b].level);
  const pool = keys.slice(), team = [];
  while (team.length < 3 && pool.length) team.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  team.sort((a, b) => ENEMIES[a].level - ENEMIES[b].level);
  const lastKey = cfg.elite ? cfg.elite[0] : keys[keys.length - 1];
  const list = team.map(k => [k, ENEMIES[k].level + 3]); list.push([lastKey, ENEMIES[lastKey].level + (cfg.elite ? 2 : 4)]);
  const avg = Math.round(list.reduce((a, b) => a + b[1], 0) / list.length), name = GUARD_NAMES[dest][0];
  return {
    name, reward: 220 * RANK.indexOf(dest), team: list, lv: avg,
    before: ['ここから さきは ' + REGIONS[dest].name + '。つよい モンスターが ひしめく ばしょだ。', 'いまの きみでは まだ はやい。とおりたければ わたしを たおして ちからを しめせ！（めやす Lv' + avg + '）'],
    win: ['…みごとだ。きみなら この先でも やっていけるだろう。', 'もんを あけよう。きをつけて いくのだぞ！'],
    after: ['もんは あいている。すすむがよい。'],
  };
}

function buildWorld() {
  const rnd = mulberry32(20261103), N = REGION_KEYS.length;
  const t = [], g = [], reg = [], res = [], hgt = [];
  for (let y = 0; y < WH; y++) { t.push(Array(WW).fill('.')); g.push(Array(WW).fill('grass')); reg.push(new Array(WW).fill(0)); res.push(Array(WW).fill(false)); hgt.push(Array(WW).fill(0)); }
  const inb = (x, y) => x >= 0 && y >= 0 && x < WW && y < WH;
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  // ---- 1. バイオームの場所：ゆがませた ボロノイ図 ----
  const seeds = REGION_KEYS.map(k => REGION_SEEDS[k]);
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
    const wx = x + 16 * Math.sin(y * .045 + 1) + 8 * Math.sin(y * .11 + 2), wy = y + 16 * Math.sin(x * .04 + .5) + 8 * Math.sin(x * .1 + 1.7);
    let bi = 0, bd = 1e9; seeds.forEach(([sx, sy, w], i) => { const d = Math.hypot(wx - sx, wy - sy) / w; if (d < bd) { bd = d; bi = i; } });
    reg[y][x] = bi;
  }
  { // 切れはし（飛び地）は、まわりのバイオームにくっつける
    const seen = Array.from({ length: WH }, () => new Uint8Array(WW)), comps = [];
    for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
      if (seen[y][x]) continue; const r = reg[y][x], cells = [], st = [[x, y]]; seen[y][x] = 1;
      while (st.length) { const [cx, cy] = st.pop(); cells.push([cx, cy]); for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (inb(nx, ny) && !seen[ny][nx] && reg[ny][nx] === r) { seen[ny][nx] = 1; st.push([nx, ny]); } } }
      comps.push({ r, cells });
    }
    const big = {}; comps.forEach((c, i) => { if (big[c.r] === undefined || c.cells.length > comps[big[c.r]].cells.length) big[c.r] = i; });
    comps.forEach((c, i) => {
      if (big[c.r] === i) return; const cnt = {};
      c.cells.forEach(([x, y]) => DIRS.forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && reg[ny][nx] !== c.r) cnt[reg[ny][nx]] = (cnt[reg[ny][nx]] || 0) + 1; }));
      const best = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0]; if (best !== undefined) c.cells.forEach(([x, y]) => { reg[y][x] = +best; });
    });
  }
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) g[y][x] = REGIONS[REGION_KEYS[reg[y][x]]].ground;
  const regionOf = (x, y) => REGION_KEYS[reg[clamp(y, 0, WH - 1)][clamp(x, 0, WW - 1)]];

  // ---- 2. 国境＝山のかべ。となりあう境い目を記録（門を作る場所の候補）----
  const pairs = {};
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
    const nx = x + dx, ny = y + dy; if (!inb(nx, ny) || reg[y][x] === reg[ny][nx]) continue;
    const a = reg[y][x], b = reg[ny][nx], key = a < b ? a + '|' + b : b + '|' + a; (pairs[key] = pairs[key] || []).push([x, y, nx, ny]);
  }
  for (const key in pairs) pairs[key].forEach(([x1, y1, x2, y2]) => { t[y1][x1] = 'M'; t[y2][x2] = 'M'; });
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (x < 2 || y < 2 || x >= WW - 2 || y >= WH - 2) t[y][x] = 'M';
  // かべからの距離
  const edge = Array.from({ length: WH }, () => new Int16Array(WW).fill(-1)), eq = [];
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (t[y][x] === 'M') { edge[y][x] = 0; eq.push(y * WW + x); }
  for (let h = 0; h < eq.length; h++) { const c = eq[h], cx = c % WW, cy = (c / WW) | 0; for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (inb(nx, ny) && edge[ny][nx] < 0) { edge[ny][nx] = edge[cy][cx] + 1; eq.push(ny * WW + nx); } } }

  // ---- 3. バイオームの広さ・中心(hub) ----
  const bbox = REGION_KEYS.map(() => [1e9, 1e9, -1, -1]), area = new Array(N).fill(0);
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) if (t[y][x] !== 'M') { const i = reg[y][x], b = bbox[i]; area[i]++; if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; }
  REGION_KEYS.forEach((k, i) => {
    REGIONS[k].rect = bbox[i]; REGIONS[k].area = area[i]; const [sx, sy] = seeds[i]; let best = null, bd = 1e9;
    for (const m of [14, 11, 9]) { for (let y = bbox[i][1]; y <= bbox[i][3]; y++) for (let x = bbox[i][0]; x <= bbox[i][2]; x++) if (reg[y][x] === i && edge[y][x] >= m) { const d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; best = [x, y]; } } if (best) break; }
    REGIONS[k].hub = best;
  });
  const hub = k => REGIONS[k].hub;

  // ---- 4. どのバイオーム同士を門でつなぐか（すすむ順に、となりの 手前のバイオームへ）----
  const adj = {}; REGION_KEYS.forEach(k => { adj[k] = []; });
  for (const key in pairs) { if (pairs[key].length < 10) continue; const [i, j] = key.split('|').map(Number); adj[REGION_KEYS[i]].push(REGION_KEYS[j]); adj[REGION_KEYS[j]].push(REGION_KEYS[i]); }
  const connected = new Set(['meadow']), edgeList = [], rk = k => RANK.indexOf(k);
  for (let pass = 0; pass < 12 && connected.size < N; pass++) {
    let progress = false;
    RANK.forEach(b => { if (connected.has(b)) return; const c = adj[b].filter(n => connected.has(n)).sort((p, q) => rk(q) - rk(p)); if (c.length) { edgeList.push([c[0], b]); connected.add(b); progress = true; } });
    if (!progress) { const b = RANK.find(x => !connected.has(x)); const n = adj[b].sort((p, q) => rk(p) - rk(q))[0]; if (n) { edgeList.push([n, b]); connected.add(b); connected.add(n); } else break; }
  }
  RANK.forEach(a => adj[a].forEach(b => { if (rk(a) < rk(b) && rk(b) - rk(a) <= 3 && !edgeList.some(e => (e[0] === a && e[1] === b)) && rnd() < .55) edgeList.push([a, b]); }));

  function gateSite(ka, kb) {
    const i = REGION_KEYS.indexOf(ka), j = REGION_KEYS.indexOf(kb), key = i < j ? i + '|' + j : j + '|' + i, list = pairs[key] || [];
    const [ax, ay] = hub(ka), [bx, by] = hub(kb), mx = (ax + bx) / 2, my = (ay + by) / 2; let best = null, bd = 1e9;
    for (const [x1, y1, x2, y2] of list) {
      let a = [x1, y1], b = [x2, y2]; if (reg[y1][x1] !== i) { a = [x2, y2]; b = [x1, y1]; }
      const d = [b[0] - a[0], b[1] - a[1]], p = [Math.abs(d[1]), Math.abs(d[0])]; let ok = true;
      for (let off = -1; off <= 1 && ok; off++) for (let k = -4; k <= 4 && ok; k++) {
        const x = a[0] + d[0] * k + p[0] * off, y = a[1] + d[1] * k + p[1] * off;
        if (!inb(x, y)) { ok = false; break; }
        if (k <= -1 && (reg[y][x] !== i || t[y][x] === 'M')) ok = false;
        if (k >= 2 && (reg[y][x] !== j || t[y][x] === 'M')) ok = false;
      }
      if (!ok) continue;
      const dd = Math.hypot(a[0] - mx, a[1] - my); if (dd < bd) { bd = dd; best = { a, b, d, p }; }
    }
    return best;
  }
  const gates = [], npcs = [], approaches = [];
  edgeList.forEach(([src, dst]) => {
    const s = gateSite(src, dst); if (!s) return; const { a, b, d, p } = s, cells = [];
    for (let off = -1; off <= 1; off++) for (const k of [0, 1]) { const x = a[0] + d[0] * k + p[0] * off, y = a[1] + d[1] * k + p[1] * off; t[y][x] = 'G'; cells.push([x, y]); }
    for (let off = -1; off <= 1; off++) for (const k of [-1, -2, -3, 2, 3, 4]) { const x = a[0] + d[0] * k + p[0] * off, y = a[1] + d[1] * k + p[1] * off; if (t[y][x] !== 'G') t[y][x] = '.'; }
    const gp = [a[0] - d[0] * 2, a[1] - d[1] * 2];
    gates.push({ id: src + '>' + dst, src, dst, cells, d, p, a, guard: gp });
    approaches.push([src, [a[0] - d[0] * 4, a[1] - d[1] * 4]], [dst, [b[0] + d[0] * 3, b[1] + d[1] * 3]]);
    const tr = TRAINERS['gate_' + dst] || (TRAINERS['gate_' + dst] = makeGuardTrainer(dst));
    npcs.push({ id: 'gate_' + src + '_' + dst, type: 'guard', name: tr.name, look: LOOKS[GUARD_NAMES[dst][1]], x: (gp[0] + .5) * TILE, y: (gp[1] + .5) * TILE, dest: dst, trainer: 'gate_' + dst, face: { x: d[0], y: d[1] }, home: gp });
  });

  // ---- 5. バイオームごとの地形の形（湖・川・渓谷・島…）----
  const targets = shapeBiomes({ t, g, reg, edge }) || [];

  // ---- 6. 道（地形をつらぬいて、橋や渡り場になる）----
  const reserve = (x, y, r = 1) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (inb(x + dx, y + dy)) res[y + dy][x + dx] = true; };
  // 門の前後は、地形にじゃまされないよう あらためて あける（空島や渓谷の谷でふさがれないように）
  gates.forEach(gt => { for (let off = -1; off <= 1; off++) for (let k = -4; k <= 5; k++) { if (k === 0 || k === 1) continue; const x = gt.a[0] + gt.d[0] * k + gt.p[0] * off, y = gt.a[1] + gt.d[1] * k + gt.p[1] * off; if (inb(x, y) && t[y][x] !== 'G' && t[y][x] !== 'M') { t[y][x] = '.'; res[y][x] = true; } } });
  const SHAPE = '~gLXiY';
  const cell = (x, y) => {
    reserve(x, y, 1);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const c = t[y + dy] && t[y + dy][x + dx]; if (c && SHAPE.includes(c) && reg[y + dy][x + dx] === reg[y][x]) t[y + dy][x + dx] = '.'; }
    if (g[y][x] !== 'village' && t[y][x] === '.') g[y][x] = 'path';
  };
  const seenArr = new Int32Array(WW * WH), par = new Int32Array(WW * WH); let stamp = 0;
  function route(k, from, to) {
    const i = REGION_KEYS.indexOf(k); if (!inb(from[0], from[1]) || !inb(to[0], to[1])) return false;
    stamp++; const q = [from[1] * WW + from[0]]; seenArr[q[0]] = stamp; par[q[0]] = -1; let found = false;
    for (let h = 0; h < q.length; h++) {
      const c = q[h], cx = c % WW, cy = (c / WW) | 0; if (cx === to[0] && cy === to[1]) { found = true; break; }
      const order = DIRS.slice(); for (let k2 = 3; k2 > 0; k2--) { const j = Math.floor(rnd() * (k2 + 1)); const tmp = order[k2]; order[k2] = order[j]; order[j] = tmp; }
      for (const [dx, dy] of order) { const nx = cx + dx, ny = cy + dy; if (!inb(nx, ny)) continue; const ni = ny * WW + nx; if (seenArr[ni] === stamp || reg[ny][nx] !== i || t[ny][nx] === 'M' || t[ny][nx] === 'G') continue; seenArr[ni] = stamp; par[ni] = c; q.push(ni); }
    }
    if (!found) return false;
    let c = to[1] * WW + to[0]; while (c !== -1) { cell(c % WW, (c / WW) | 0); c = par[c]; }
    return true;
  }
  const exits = k => { const [hx, hy] = hub(k), i = REGION_KEYS.indexOf(k); return [[hx, hy - 7], [hx, hy + 7], [hx - 10, hy], [hx + 10, hy]].filter(([x, y]) => inb(x, y) && reg[y][x] === i && t[y][x] !== 'M'); };
  const routeFromHub = (k, to) => { const ex = exits(k).sort((p, q) => Math.abs(p[0] - to[0]) + Math.abs(p[1] - to[1]) - Math.abs(q[0] - to[0]) - Math.abs(q[1] - to[1])); for (const e of ex) { if (route(k, e, to)) return true; } return false; };
  VILLAGES.forEach(v => { const [hx, hy] = hub(v.region); for (let y = hy - 7; y <= hy + 7; y++) for (let x = hx - 10; x <= hx + 10; x++) if (inb(x, y)) res[y][x] = true; });
  approaches.forEach(([k, pt]) => routeFromHub(k, pt));
  targets.forEach(([k, x, y]) => routeFromHub(k, [x, y]));

  // ---- 7. 村 ----
  const signs = {}, shopAt = {}, villages = [];
  VILLAGES.forEach(v => {
    const [cx, cy] = hub(v.region);
    villages.push({ id: v.id, name: v.name, cx, cy, region: v.region });
    for (let y = cy - 5; y <= cy + 5; y++) for (let x = cx - 8; x <= cx + 8; x++) {
      g[y][x] = 'village'; t[y][x] = '.';
      const edgeT = y === cy - 5 || y === cy + 5 || x === cx - 8 || x === cx + 8; if (!edgeT) continue;
      const gapV = (y === cy - 5 || y === cy + 5) && Math.abs(x - cx) <= 1, gapH = (x === cx - 8 || x === cx + 8) && Math.abs(y - cy) <= 1;
      if (!gapV && !gapH) t[y][x] = 'F';
    }
    [[-6, -3], [-4, -3], [4, -3], [6, -3], [-6, 3], [-4, 3], [6, 3]].forEach(([dx, dy]) => { t[cy + dy][cx + dx] = 'H'; });
    t[cy - 3][cx + 2] = 'B'; shopAt[(cx + 2) + ',' + (cy - 3)] = v.shop;
    t[cy - 3][cx - 2] = 'C';
    t[cy + 4][cx + 2] = 'S'; signs[(cx + 2) + ',' + (cy + 4)] = ['【' + v.name + '】', 'ようこそ。きゃくじんは しょうぶも かいものも かんげいだ。', 'Wポイントで ショップが つかえるよ。'];
    v.npcs.forEach((n, i) => { npcs.push({ id: v.id + '_' + i, type: n.type, name: n.name, look: LOOKS[n.look], x: (cx + n.dx + .5) * TILE, y: (cy + n.dy + .5) * TILE, lines: n.lines, trainer: n.trainer, ch: n.ch, shop: v.shop, face: { x: 0, y: 1 } }); });
  });

  // ---- 8. 宝箱（バイオームごとに たくさん）----
  const chests = {}; let cid = 0;
  const pickList = f => Object.keys(ITEMS).filter(f);
  const P1 = pickList(i => (ITEMS[i].kind === 'part' || ITEMS[i].kind === 'essence') && ITEMS[i].rarity === 1), P2 = pickList(i => ITEMS[i].kind === 'part' && ITEMS[i].rarity === 2), P3 = pickList(i => ITEMS[i].kind === 'part' && ITEMS[i].rarity === 3 && !ITEMS[i].exclusive), CORES = pickList(i => ITEMS[i].kind === 'core' && ITEMS[i].rarity < 3);
  const pk = a => a[Math.floor(rnd() * a.length)];
  const lootFor = k => {
    const rank = rk(k), out = [];
    if (rnd() < .6 || rank === 0) out.push([pk(CORES), 1]);
    out.push([pk(P1), rank < 3 ? 2 : 1]); out.push([pk(rank >= 2 && rnd() < .22 ? P2 : P1), 1]);
    const el = 'ess_' + REGION_ELEM[k]; if (ITEMS[el] && rnd() < .7) out.push([el, 1]);
    if (rank >= 6 && rnd() < .06) out.push([pk(P3), 1]);
    out.push([rank >= 4 ? 'hipotion' : 'potion', 2]); return out;
  };
  function placeFree(i, minEdge, minHub, tries = 900) {
    const k = REGION_KEYS[i], [x0, y0, x1, y1] = REGIONS[k].rect, [hx, hy] = hub(k);
    for (let tr = 0; tr < tries; tr++) {
      const x = Math.floor(x0 + rnd() * (x1 - x0 + 1)), y = Math.floor(y0 + rnd() * (y1 - y0 + 1));
      if (!inb(x, y) || reg[y][x] !== i || edge[y][x] < minEdge || Math.hypot(x - hx, y - hy) < minHub) continue;
      let ok = true; for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) if (res[y + dy][x + dx] || t[y + dy][x + dx] === 'M' || t[y + dy][x + dx] === 'G') { ok = false; break; }
      if (ok) return [x, y];
    }
    return null;
  }
  REGION_KEYS.forEach((k, i) => {
    const n = k === 'meadow' ? 9 : 8;
    for (let c = 0; c < n; c++) {
      const p = placeFree(i, 5, 12); if (!p) continue; const [x, y] = p;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) t[y + dy][x + dx] = '.';
      reserve(x, y, 2); t[y][x] = 'c'; chests[x + ',' + y] = { id: 'c' + (cid++), items: lootFor(k) };
      routeFromHub(k, [x, y + 1]);
    }
  });

  // ---- 9. ボスの広場とキャンプ ----
  const bosses = [], bossSpots = {};
  for (const key in BOSS_REGION) {
    const k = BOSS_REGION[key], i = REGION_KEYS.indexOf(k), p = placeFree(i, 9, 30) || placeFree(i, 7, 18); if (!p) continue; const [bx, by] = p;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (dx * dx + dy * dy <= 20 && t[by + dy][bx + dx] !== 'M') t[by + dy][bx + dx] = '.';
    reserve(bx, by, 5);
    t[by + 1][bx - 6] = 'C'; for (let dy = 0; dy <= 2; dy++) for (let dx = -7; dx <= -5; dx++) if (!(dy === 1 && dx === -6)) t[by + dy][bx + dx] = '.';
    routeFromHub(k, [bx, by + 4]); bosses.push({ e: key, x: bx, y: by }); bossSpots[key] = [bx, by];
  }

  // ---- 10. 高台・くぼ地・ほら穴の入口 ----
  const feat = carveFeatures({ t, res, hgt, reg, edge }); Object.assign(chests, feat.chests);

  // ---- 11. 飾り（木・岩・サボテン…。道・村・宝箱まわりには置かない）----
  const scatter = (k, list) => {
    const i = REGION_KEYS.indexOf(k), [x0, y0, x1, y1] = REGIONS[k].rect;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (reg[y][x] !== i || t[y][x] !== '.' || res[y][x]) continue;
      let r = rnd(); for (const [ch, pr] of list) { if (r < pr) { t[y][x] = ch; break; } r -= pr; }
    }
  };
  scatter('meadow', [['T', .05], ['r', .008]]); scatter('forest', [['T', .15], ['r', .01]]); scatter('seaside', [['P', .035], ['r', .01]]);
  scatter('desert', [['K', .035], ['r', .02]]); scatter('volcano', [['r', .05]]); scatter('ruins', [['I', .035], ['r', .015]]);
  scatter('snow', [['T', .05], ['r', .02]]); scatter('swamp', [['T', .09], ['r', .01]]); scatter('mine', [['e', .05], ['r', .04]]); scatter('sky', [['r', .02]]);

  // ---- 12. 野生モンスター（広さに おうじて）----
  const spawns = [], start = { x: hub('meadow')[0], y: hub('meadow')[1] + 2 };
  const far = (x, y) => spawns.every(s => Math.hypot(s.x - x, s.y - y) >= 5);
  const nearVillage = (x, y) => villages.some(v => Math.abs(x - v.cx) < 13 && Math.abs(y - v.cy) < 9);
  REGION_KEYS.forEach((k, i) => {
    const cfg = REGION_SPAWN[k], [x0, y0, x1, y1] = REGIONS[k].rect, total = cfg.table.reduce((a, b) => a + b[1], 0), want = [];
    const sc = Math.sqrt(REGIONS[k].area / 2650), count = Math.round(REGIONS[k].area / (k === 'sky' ? 110 : 125));
    if (cfg.elite) for (let e = 0; e < Math.round(cfg.elite[1] * sc); e++) want.push(cfg.elite[0]);
    for (let e = want.length; e < count; e++) { let r = rnd() * total; for (const [en, w] of cfg.table) { if ((r -= w) < 0) { want.push(en); break; } } }
    want.forEach(en => {
      for (let tries = 0; tries < 300; tries++) {
        const x = Math.floor(x0 + rnd() * (x1 - x0 + 1)), y = Math.floor(y0 + rnd() * (y1 - y0 + 1));
        if (!inb(x, y) || reg[y][x] !== i || edge[y][x] < 3 || t[y][x] !== '.' || nearVillage(x, y) || !far(x, y) || (res[y][x] && rnd() < .7)) continue;
        if (Math.hypot(x - start.x, y - start.y) < 14) continue;
        spawns.push({ e: en, x, y }); break;
      }
    });
  });
  bosses.forEach(b => spawns.push(b));

  // ---- 13. とどかない場所のものは取りのぞく（スタートから、門をぜんぶ開けたとして歩ける範囲）----
  const reach = new Uint8Array(WW * WH), st = [start.y * WW + start.x]; reach[st[0]] = 1;
  while (st.length) { const c = st.pop(), cx = c % WW, cy = (c / WW) | 0; for (const [dx, dy] of DIRS) { const nx = cx + dx, ny = cy + dy; if (!inb(nx, ny) || reach[ny * WW + nx]) continue; const ch = t[ny][nx]; if (SOLID_CH.includes(ch) && ch !== 'G') continue; reach[ny * WW + nx] = 1; st.push(ny * WW + nx); } }
  const near = (x, y) => [[0, 0], ...DIRS].some(([dx, dy]) => inb(x + dx, y + dy) && reach[(y + dy) * WW + x + dx]);
  for (const key in chests) { const [x, y] = key.split(',').map(Number); if (!near(x, y)) { delete chests[key]; t[y][x] = '.'; } }
  const goodSpawns = spawns.filter(s => reach[s.y * WW + s.x]);
  const caveSites = feat.caveSites.filter(s => { if (near(s.x, s.y)) return true; t[s.y][s.x] = 'U'; return false; });

  return { id: 'world', name: 'ワールド', theme: null, w: WW, h: WH, hgt, warps: {}, caveSites, tiles: t, ground: g, reg, spawns: goodSpawns, npcs, chests, signs, shopAt, villages, start, gates, bossSpots, edge, regionOf };
}
