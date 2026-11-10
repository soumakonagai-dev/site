'use strict';
// ===== バイオームごとの地形の「かたち」=====
// 地域の中に、その土地らしい地形を作る（道は あとから ここを通りぬけるので、橋や渡り場になる）
//   草原=ため池  森=曲がりくねった川  海辺=でこぼこの海岸線  砂漠=大渓谷とオアシス  火山=溶岩の湖
//   遺跡=くずれた中庭  雪原=凍った湖と氷の柱  沼地=ぬかるみ  鉱山=段々の台地(world2)  空島=雲にうかぶ島々
// 戻り値：道でつなぐべき場所 [[地域, x, y], …]（空島の島）
function shapeBiomes(S) {
  const { t, reg, edge } = S, rnd = mulberry32(31337), targets = [];
  const H = (x, y) => { const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return v - Math.floor(v); };
  const idxOf = k => REGION_KEYS.indexOf(k);
  const inReg = (k, x, y, m = 3) => x >= 0 && y >= 0 && x < WW && y < WH && reg[y][x] === idxOf(k) && edge[y][x] >= m;
  const nearHub = (k, x, y, rx = 13, ry = 10) => { const [hx, hy] = REGIONS[k].hub; return Math.abs(x - hx) < rx && Math.abs(y - hy) < ry; };
  const sc = k => Math.max(1, Math.round(Math.sqrt(REGIONS[k].area / 2650)));
  // ゆがんだ楕円をぬる。o.over=上書きしてよいタイル  o.hub=村の近くにも ぬる
  const blob = (k, cx, cy, rx, ry, ch, o = {}) => {
    for (let y = cy - ry - 1; y <= cy + ry + 1; y++) for (let x = cx - rx - 1; x <= cx + rx + 1; x++) {
      if (!inReg(k, x, y)) continue;
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (d > 1 + .35 * (H(x, y) - .5)) continue;
      if (!o.hub && nearHub(k, x, y)) continue;
      if (t[y][x] === '.' || (o.over && o.over.includes(t[y][x]))) t[y][x] = ch;
    }
  };
  const pickPos = (k, m = 8) => {
    const [x0, y0, x1, y1] = REGIONS[k].rect;
    for (let i = 0; i < 200; i++) { const x = Math.floor(x0 + rnd() * (x1 - x0 + 1)), y = Math.floor(y0 + rnd() * (y1 - y0 + 1)); if (inReg(k, x, y, m) && !nearHub(k, x, y, 17, 13)) return [x, y]; }
    return null;
  };
  const many = (k, n, f) => { for (let i = 0; i < n; i++) { const p = pickPos(k); if (p) f(p[0], p[1]); } };
  const R = (a, b) => Math.floor(a + rnd() * (b - a + 1));
  const rect = k => REGIONS[k].rect;

  // 草原：ため池
  many('meadow', 5 * sc('meadow'), (x, y) => blob('meadow', x, y, R(3, 5), R(2, 4), '~'));
  // 森：北から南へ、曲がりくねった川
  { const [x0, y0, x1, y1] = rect('forest'), mx = Math.round((x0 + x1) / 2) - 22;
    for (let y = y0; y <= y1; y++) { const cx = mx + Math.round(5 * Math.sin(y * .1) + 3 * Math.sin(y * .31)); for (let dx = 0; dx < 3; dx++) if (inReg('forest', cx + dx, y, 2) && t[y][cx + dx] === '.' && !nearHub('forest', cx + dx, y, 12, 9)) t[y][cx + dx] = '~'; } }
  // 海辺：でこぼこの海岸線（西が海）
  { const [x0, y0, x1, y1] = rect('seaside');
    for (let y = y0; y <= y1; y++) { const shore = x0 + 15 + Math.round(4 * Math.sin(y * .13) + 3 * Math.sin(y * .37)); for (let x = x0; x <= shore; x++) if (reg[y][x] === idxOf('seaside') && t[y][x] === '.') t[y][x] = x <= shore - 3 ? 'w' : '~'; } }
  // 砂漠：大渓谷（東西にのびる。道が橋になる）とオアシス
  { const [x0, y0, x1, y1] = rect('desert'), my = Math.round((y0 + y1) / 2) - 26;
    for (let x = x0; x <= x1; x++) { const cy = my + Math.round(6 * Math.sin(x * .07) + 3 * Math.sin(x * .23)); for (let dy = 0; dy < 4; dy++) if (inReg('desert', x, cy + dy, 2) && t[cy + dy][x] === '.' && !nearHub('desert', x, cy + dy, 14, 10)) t[cy + dy][x] = 'X'; } }
  many('desert', 5 * sc('desert'), (x, y) => blob('desert', x, y, 4, 3, '~'));
  // 火山：溶岩の湖
  many('volcano', 4 * sc('volcano'), (x, y) => blob('volcano', x, y, R(7, 11), R(5, 8), 'L'));
  // 遺跡：くずれた中庭（柱のかべ。あちこちに すきま）
  many('ruins', 5 * sc('ruins'), (x, y) => {
    const w = 14, h = 9, x0 = x - 7, y0 = y - 4;
    for (let i = 0; i <= w; i++) for (const yy of [y0, y0 + h]) if (i % 7 !== 3 && inReg('ruins', x0 + i, yy) && t[yy][x0 + i] === '.') t[yy][x0 + i] = 'I';
    for (let j = 1; j < h; j++) for (const xx of [x0, x0 + w]) if (j % 4 !== 2 && inReg('ruins', xx, y0 + j) && t[y0 + j][xx] === '.') t[y0 + j][xx] = 'I';
  });
  // 雪原：凍った湖（すべる）とまわりの氷の柱
  many('snow', 5 * sc('snow'), (x, y) => blob('snow', x, y, R(7, 10), R(5, 7), 'i'));
  { const [x0, y0, x1, y1] = rect('snow');
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!inReg('snow', x, y) || t[y][x] !== '.') continue; if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => t[y + dy][x + dx] === 'i') && H(x, y) < .18) t[y][x] = 'Y'; } }
  // 沼地：ぬかるみ
  many('swamp', 30 * sc('swamp'), (x, y) => blob('swamp', x, y, R(3, 6), R(2, 4), 'g'));
  // 空島：ぜんぶ深い谷にして、雲にうかぶ島をならべる（島どうしは 道が橋になる）
  { const [x0, y0, x1, y1] = rect('sky');
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inReg('sky', x, y, 1) && t[y][x] === '.') t[y][x] = 'X';
    const [hx, hy] = REGIONS.sky.hub; blob('sky', hx, hy, 16, 11, '.', { over: 'X', hub: true });
    many('sky', 16, (x, y) => { blob('sky', x, y, R(5, 9), R(4, 6), '.', { over: 'X', hub: true }); targets.push(['sky', x, y]); }); }
  return targets;
}
