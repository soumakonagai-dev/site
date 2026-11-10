'use strict';
// ===== 地形（高台・くぼ地・ほら穴の入口）と、ほら穴のマップ =====
// タイル：U=崖の正面(通れない) V=崖のふち(通れない) N=階段(通れる) O=ほら穴の入口(通れる)
//        Q=洞窟の岩かべ D=下への階段 A=上への階段/出口
// hgt：1=高台のゆか  -1=くぼ地のゆか  0=ふつう

// ワールドに、地域ごとの高台2つ・くぼ地1つ・ほら穴の入口1つをならべる
function carveFeatures(S) {
  const { t, res, hgt, reg, edge } = S, frng = mulberry32(777);
  const FR = (a, b) => a + Math.floor(frng() * (b - a + 1));
  const pickR = a => a[Math.floor(frng() * a.length)];
  const ids = f => Object.keys(ITEMS).filter(f);
  const rare2 = ids(i => ITEMS[i].kind === 'part' && ITEMS[i].rarity === 2);
  const com = ids(i => (ITEMS[i].kind === 'part' || ITEMS[i].kind === 'essence') && ITEMS[i].rarity === 1);
  const cores = ids(i => ITEMS[i].kind === 'core' && ITEMS[i].rarity < 3);
  const chests = {}, caveSites = []; let n = 0;

  // ほかと重ならない空き地（まわりに1マスの余白つき）をさがす。w,h は輪郭をふくむ大きさ
  function place(k, w, h) {
    const [x0, y0, x1, y1] = REGIONS[k].rect, ri = REGION_KEYS.indexOf(k);
    for (let tr = 0; tr < 3000; tr++) {
      const x = FR(x0 + 4, x1 - w - 4), y = FR(y0 + 4, y1 - h - 4); let ok = true;
      for (let dy = -1; dy <= h && ok; dy++) for (let dx = 0; dx < w; dx++) { const xx = x + dx, yy = y + dy; if (t[yy][xx] !== '.' || res[yy][xx] || reg[yy][xx] !== ri || edge[yy][xx] < 3) { ok = false; break; } }
      if (ok) { for (let dy = -2; dy <= h + 1; dy++) for (let dx = -1; dx <= w; dx++) res[y + dy][x + dx] = true; return [x, y]; }
    }
    return null;
  }
  const addChest = (x, y, items) => { t[y][x] = 'c'; chests[x + ',' + y] = { id: 't' + (n++), items: items.map(i => [i, 1]) }; };

  // 高台：まわりは崖。南がわが「崖の正面」で、階段でのぼる
  function plateau(k, iw, ih) {
    let p = null; for (const [a, b] of [[iw, ih], [7, 4], [5, 3], [4, 3]]) { p = place(k, a + 2, b + 2); if (p) { iw = a; ih = b; break; } } if (!p) return; const [x, y] = p;
    for (let yy = 0; yy <= ih + 1; yy++) for (let xx = 0; xx <= iw + 1; xx++) {
      const ring = yy === 0 || yy === ih + 1 || xx === 0 || xx === iw + 1;
      if (ring) t[y + yy][x + xx] = yy === ih + 1 ? 'U' : 'V'; else { t[y + yy][x + xx] = '.'; hgt[y + yy][x + xx] = 1; }
    }
    const xs = x + 1 + Math.floor(iw / 2); t[y + ih + 1][xs] = 'N'; t[y + ih + 1][xs + 1] = 'N';
    if (frng() < .5) { const ym = y + 1 + Math.floor(ih / 2), xe = frng() < .5 ? x : x + iw + 1; t[ym][xe] = 'N'; t[ym + 1][xe] = 'N'; }
    t[y + 1][x + 1] = 'r'; t[y + 1][x + iw] = 'r';
    addChest(x + 1 + Math.floor(iw / 2), y + 1 + Math.floor(ih / 2), [frng() < .3 ? pickR(rare2) : pickR(com), pickR(com), pickR(com), 'hipotion']);
  }
  // くぼ地：下におりられる。北がわの崖に階段がある
  function basin(k, iw, ih) {
    let p = null; for (const [a, b] of [[iw, ih], [6, 4], [5, 3], [4, 3]]) { p = place(k, a + 2, b + 2); if (p) { iw = a; ih = b; break; } } if (!p) return; const [x, y] = p;
    for (let yy = 0; yy <= ih + 1; yy++) for (let xx = 0; xx <= iw + 1; xx++) {
      const ring = yy === 0 || yy === ih + 1 || xx === 0 || xx === iw + 1;
      if (ring) t[y + yy][x + xx] = yy === 0 ? 'U' : 'V'; else { t[y + yy][x + xx] = '.'; hgt[y + yy][x + xx] = -1; }
    }
    const xs = x + 1 + Math.floor(iw / 2); t[y][xs] = 'N'; t[y][xs + 1] = 'N';
    t[y + ih][x + 1] = 'r'; t[y + ih][x + iw] = 'r';
    addChest(x + 1 + Math.floor(iw / 2), y + 1 + Math.floor(ih / 2), [pickR(cores), frng() < .4 ? pickR(rare2) : pickR(com), pickR(com)]);
  }
  // ほら穴の入口：岩のかたまりの正面に、まっくらな穴
  function outcrop(k) {
    const p = place(k, 7, 2); if (!p) return; const [x, y] = p;
    for (let xx = 0; xx < 7; xx++) { t[y][x + xx] = 'V'; t[y + 1][x + xx] = 'U'; }
    t[y + 1][x + 3] = 'O'; caveSites.push({ region: k, x: x + 3, y: y + 1 });
  }
  REGION_KEYS.forEach(k => {
    const sc = Math.max(1, Math.round(Math.sqrt(REGIONS[k].area / 2650)));
    outcrop(k);
    for (let i = 0; i < sc; i++) { plateau(k, 9, 5); basin(k, 8, 5); plateau(k, 7, 4); }
    if (k === 'mine') { for (let i = 0; i < sc; i++) { plateau(k, 16, 6); plateau(k, 13, 5); plateau(k, 12, 4); } }   // 鉱山は 段々の台地
  });
  return { chests, caveSites };
}

// ほら穴の1フロア：ランダムウォークで掘った1本につながった洞窟
function buildCave(k, floor, id) {
  const w = 44, h = 30, rnd = mulberry32(5000 + REGION_KEYS.indexOf(k) * 31 + floor * 7);
  const t = [], g = [], hg = [], reg = [];
  for (let y = 0; y < h; y++) { t.push(Array(w).fill('Q')); g.push(Array(w).fill('cave')); hg.push(Array(w).fill(0)); reg.push(Array(w).fill(0)); }
  const sx = Math.floor(w / 2), sy = h - 4, cells = [];
  const carve = (x, y) => { if (x < 2 || y < 2 || x > w - 3 || y > h - 3) return; if (t[y][x] === 'Q') { t[y][x] = '.'; cells.push([x, y]); } };
  const plus = (x, y) => { carve(x, y); carve(x + 1, y); carve(x - 1, y); carve(x, y + 1); carve(x, y - 1); };
  for (let dy = -2; dy <= 0; dy++) for (let dx = -1; dx <= 1; dx++) carve(sx + dx, sy + dy);
  const walkers = [[sx, sy - 2, 0, -1]], target = Math.floor(w * h * .33);
  let guard = 0;
  while (cells.length < target && guard++ < 60000) {
    const wk = walkers[Math.floor(rnd() * walkers.length)];
    if (rnd() < .25) { const d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rnd() * 4)]; wk[2] = d[0]; wk[3] = d[1]; }
    wk[0] = clamp(wk[0] + wk[2], 3, w - 4); wk[1] = clamp(wk[1] + wk[3], 3, h - 4); plus(wk[0], wk[1]);
    if (rnd() < .02 && walkers.length < 8) walkers.push([wk[0], wk[1], -wk[3], wk[2]]);
  }
  t[sy][sx] = 'A';
  // 入口からのきょり
  const dist = Array.from({ length: h }, () => Array(w).fill(-1)); dist[sy - 1][sx] = 0;
  const q = [[sx, sy - 1]]; let far = [sx, sy - 1];
  for (let i = 0; i < q.length; i++) {
    const [x, y] = q[i]; if (dist[y][x] > dist[far[1]][far[0]]) far = [x, y];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h || t[ny][nx] !== '.' || dist[ny][nx] >= 0) continue; dist[ny][nx] = dist[y][x] + 1; q.push([nx, ny]); }
  }
  const flo = cells.filter(([x, y]) => t[y][x] === '.' && dist[y][x] >= 0);
  const nb = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => t[y + dy][x + dx] === '.').length;
  const ids = f => Object.keys(ITEMS).filter(f), pick = a => a[Math.floor(rnd() * a.length)];
  const com = ids(i => (ITEMS[i].kind === 'part' || ITEMS[i].kind === 'essence') && ITEMS[i].rarity === 1);
  const rare2 = ids(i => ITEMS[i].kind === 'part' && ITEMS[i].rarity === 2), rare3 = ids(i => ITEMS[i].kind === 'part' && ITEMS[i].rarity === 3 && !ITEMS[i].exclusive), cores = ids(i => ITEMS[i].kind === 'core' && ITEMS[i].rarity < 3);
  let down = null;
  if (floor === 1) { t[far[1]][far[0]] = 'D'; down = { x: far[0], y: far[1] }; const nbr = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [far[0] + dx, far[1] + dy]).find(([x, y]) => t[y][x] === '.'); down.arrive = { x: nbr[0], y: nbr[1] }; }
  // 宝箱：行きどまりをえらぶ
  const chests = {}, used = [[sx, sy], far];
  const spots = flo.filter(([x, y]) => t[y][x] === '.' && nb(x, y) <= 1).sort((a, b) => dist[b[1]][b[0]] - dist[a[1]][a[0]]);
  const want = floor === 1 ? 2 : 3;
  for (const [x, y] of spots.concat(flo.slice().sort((a, b) => dist[b[1]][b[0]] - dist[a[1]][a[0]]))) {
    if (Object.keys(chests).length >= want) break;
    if (used.some(([ux, uy]) => Math.hypot(ux - x, uy - y) < 8)) continue;
    used.push([x, y]); t[y][x] = 'c';
    chests[x + ',' + y] = { id: `${id}_c${Object.keys(chests).length}`, items: (floor === 1 ? [pick(com), pick(com), rnd() < .25 ? pick(rare2) : pick(com), 'hipotion'] : [rnd() < .1 ? pick(rare3) : pick(rare2), rnd() < .4 ? pick(rare2) : pick(com), pick(cores), 'hipotion', 'hipotion']).map(i => [i, 1]) };
  }
  // モンスター
  const cfg = REGION_SPAWN[k], total = cfg.table.reduce((a, b) => a + b[1], 0), spawns = [];
  const free = flo.filter(([x, y]) => t[y][x] === '.' && dist[y][x] >= 7);
  const spot = () => { for (let i = 0; i < 200; i++) { const [x, y] = free[Math.floor(rnd() * free.length)]; if (spawns.every(s => Math.hypot(s.x - x, s.y - y) >= 4)) return [x, y]; } return null; };
  const wantN = floor === 1 ? 12 : 15;
  for (let i = 0; i < wantN; i++) { let r = rnd() * total, e = cfg.table[0][0]; for (const [en, wt] of cfg.table) { if ((r -= wt) < 0) { e = en; break; } } const p = spot(); if (p) spawns.push({ e, x: p[0], y: p[1] }); }
  // 手ごわい敵：B1Fに2体、B2Fに4体。B2Fの奥には「ぬし」（たおすと その地域だけのレア素材）
  { const el = cfg.elite ? cfg.elite[0] : cfg.table.slice().sort((a, b) => ENEMIES[b[0]].level - ENEMIES[a[0]].level)[0][0]; for (let i = 0; i < (floor === 2 ? 4 : 2); i++) { const p = spot(); if (p) spawns.push({ e: el, x: p[0], y: p[1] }); } }
  if (floor === 2 && CAVE_BOSS_OF[k]) {
    const cand = free.slice().sort((a, b) => dist[b[1]][b[0]] - dist[a[1]][a[0]]).find(([x, y]) => used.every(([ux, uy]) => Math.hypot(ux - x, uy - y) >= 6) && spawns.every(s => Math.hypot(s.x - x, s.y - y) >= 4)) || far;
    spawns.push({ e: CAVE_BOSS_OF[k], x: cand[0], y: cand[1] });
  }
  const name = `${REGIONS[k].name}のほらあな B${floor}F`;
  return { id, name, w, h, tiles: t, ground: g, hgt: hg, reg, spawns, npcs: [], chests, signs: {}, shopAt: {}, villages: [], warps: {}, start: { x: sx, y: sy - 1 }, exit: { x: sx, y: sy }, down, dark: true, theme: 'cave', cave: true, region: k, floor, regionOf: () => 'cave' };
}

// ワールド＋ほら穴をぜんぶ作る
function buildMaps() {
  const world = buildWorld(), maps = { world };
  world.caveSites.forEach(site => {
    const id1 = `cave_${site.region}_1`, id2 = `cave_${site.region}_2`, c1 = buildCave(site.region, 1, id1), c2 = buildCave(site.region, 2, id2);
    c1.warps[c1.exit.x + ',' + c1.exit.y] = { map: 'world', x: site.x, y: site.y + 1 };
    c1.warps[c1.down.x + ',' + c1.down.y] = { map: id2, x: c2.start.x, y: c2.start.y };
    c2.warps[c2.exit.x + ',' + c2.exit.y] = { map: id1, x: c1.down.arrive.x, y: c1.down.arrive.y };
    world.warps[site.x + ',' + site.y] = { map: id1, x: c1.start.x, y: c1.start.y };
    maps[id1] = c1; maps[id2] = c2;
  });
  return maps;
}
