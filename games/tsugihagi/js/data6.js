'use strict';
// ===== データ追加その6：ほら穴のぬし（その地域だけのレア素材）／いろいろな組み合わせの野生モンスター =====

// ---- ほら穴のぬしだけが落とす、地域ごとのレア素材 ----
Object.assign(ITEMS, {
  kingfur:   { name: 'けものおうのたてがみ', kind: 'part', color: '#e8b860', rarity: 3, stats: { atk: 9, hp: 10 }, moves: ['kamikudaki'], desc: '草原のほらあなの ぬしの たてがみ。' },
  elderbark: { name: 'ぬしのこだいじゅ',     kind: 'part', color: '#6ab84a', rarity: 3, element: 'grass', stats: { hp: 20, def: 8 }, moves: ['tsurumuchi', 'iyashi'], desc: '森のほらあなの ぬしが やどす 古木。' },
  kraken:    { name: 'クラーケンのしょくしゅ', kind: 'part', color: '#4a8ad8', rarity: 3, element: 'water', stats: { atk: 10, hp: 12 }, moves: ['nami', 'mizudeppou'], desc: '海辺のほらあなの ぬしの 触手。' },
  sphinxeye: { name: 'スフィンクスのひとみ', kind: 'part', color: '#f0d070', rarity: 3, element: 'earth', stats: { def: 9, atk: 8 }, moves: ['jishin'], desc: '砂漠のほらあなの ぬしの 瞳。' },
  sealedfire:{ name: 'ふうじられたほのお',   kind: 'part', color: '#ff7a3a', rarity: 3, element: 'fire', stats: { atk: 12, spd: 4 }, moves: ['bakuen'], desc: '火山のほらあなの ぬしが まもる ほのお。' },
  ancientcrown: { name: 'いにしえのかんむり', kind: 'part', color: '#ffe86a', rarity: 3, element: 'thunder', stats: { atk: 8, def: 6, spd: 5 }, moves: ['kaminari'], desc: '遺跡のほらあなの ぬしの かんむり。' },
  snowheart: { name: 'ゆきおんなのこおり',   kind: 'part', color: '#c8f0ff', rarity: 3, element: 'ice', stats: { def: 8, spd: 6, atk: 7 }, moves: ['fubuki'], desc: '雪原のほらあなの ぬしの こおり。' },
  hydrafang: { name: 'ヒドラのどくがま',     kind: 'part', color: '#b060e8', rarity: 3, element: 'poison', stats: { atk: 11, hp: 8 }, moves: ['hedoro'], desc: '沼地のほらあなの ぬしの 毒の牙。' },
  ironheart: { name: 'てつのしんぞう',       kind: 'part', color: '#b8c8e8', rarity: 3, element: 'steel', stats: { def: 12, hp: 14, spd: -3 }, moves: ['cannon'], desc: '鉱山のほらあなの ぬしの しんぞう。' },
  stormeye:  { name: 'あらしのめ',           kind: 'part', color: '#a8f0d0', rarity: 3, element: 'wind', stats: { spd: 12, atk: 6 }, moves: ['tatsumaki'], desc: '空島のほらあなの ぬしの 目。' },
});

// ---- ほら穴のぬし：[地域, 敵ID, 名前, 種族, 属性, 属性2, 落とすレア素材] ----
const CAVE_BOSS = [
  ['meadow', 'nushi_meadow', 'ケモノおう', 'beast', 'none', 'grass', 'kingfur'],
  ['forest', 'nushi_forest', 'ミドリのぬし', 'plant', 'grass', 'earth', 'elderbark'],
  ['seaside', 'nushi_seaside', 'ふかうみのぬし', 'octopus', 'water', 'dark', 'kraken'],
  ['desert', 'nushi_desert', 'スナのぬし', 'golem', 'earth', 'light', 'sphinxeye'],
  ['volcano', 'nushi_volcano', 'ほのおのぬし', 'dragon', 'fire', 'earth', 'sealedfire'],
  ['ruins', 'nushi_ruins', 'ふるきぬし', 'ghost', 'thunder', 'light', 'ancientcrown'],
  ['snow', 'nushi_snow', 'こおりのぬし', 'beast', 'ice', 'steel', 'snowheart'],
  ['swamp', 'nushi_swamp', 'どくぬまのぬし', 'dino', 'poison', 'water', 'hydrafang'],
  ['mine', 'nushi_mine', 'てつのぬし', 'robot', 'steel', 'earth', 'ironheart'],
  ['sky', 'nushi_sky', 'あらしのぬし', 'dragon', 'wind', 'thunder', 'stormeye'],
];
const CAVE_BOSS_OF = {};   // 地域 → 敵ID

// ---- 属性ごとの技（敵が使う用：回復・組み合わせ技はのぞく）----
const elementMoves = el => Object.keys(MOVES).filter(m => MOVES[m].element === el && MOVES[m].power > 0 && !MOVES[m].hits && !MOVES[m].drain);
const coreOfShape = sh => Object.keys(ITEMS).find(i => ITEMS[i].kind === 'core' && ITEMS[i].species === sh);
const regionTopLevel = k => Math.max(...REGION_SPAWN[k].table.map(([e]) => ENEMIES[e].level));
const regionAvgLevel = k => Math.round(REGION_SPAWN[k].table.reduce((a, [e]) => a + ENEMIES[e].level, 0) / REGION_SPAWN[k].table.length);

CAVE_BOSS.forEach(([k, id, name, shape, el, el2, rare]) => {
  const byPower = e => elementMoves(e).sort((a, b) => MOVES[b].power - MOVES[a].power);
  const mv = [SPECIES[shape].basic, ...byPower(el).slice(0, 2), ...byPower(el2).slice(0, 1)];
  ENEMIES[id] = {
    name: 'ぬし ' + name, shape, element: el, element2: el2, level: regionTopLevel(k) + 7, base: bs(shape, 1.7), moves: [...new Set(mv)], parts: [rare], ai: 'boss', speed: 0,
    drops: [[rare, 1], [coreOfShape(shape), 1], ['hipotion', 2]], cave: true,
  };
  CAVE_BOSS_OF[k] = id; ITEMS[rare].exclusive = true;
});

// ---- いろいろな組み合わせの野生モンスター ----
// 地域のふんいきの属性に、ほかの属性がまざった ふくごうタイプ。種族もさまざま
{
  let seed = 4242; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }, pk = a => a[Math.floor(rnd() * a.length)];
  const shapes = Object.keys(SPECIES).filter(s => !SPECIES[s].towerOnly), elems = Object.keys(ELEMENTS).filter(e => e !== 'none');
  const commonParts = Object.keys(ITEMS).filter(i => ITEMS[i].kind === 'part' && ITEMS[i].rarity === 1 && !i.startsWith('dye_'));
  const regionElems = { meadow: ['grass', 'none', 'light'], forest: ['grass', 'water', 'dark'], seaside: ['water', 'wind', 'ice'], desert: ['earth', 'fire', 'poison'], volcano: ['fire', 'earth', 'steel'], ruins: ['thunder', 'light', 'dark'], snow: ['ice', 'wind', 'water'], swamp: ['poison', 'water', 'dark'], mine: ['steel', 'earth', 'thunder'], sky: ['wind', 'thunder', 'light'] };
  const used = new Set(Object.values(ENEMIES).map(e => e.name));
  REGION_KEYS.forEach(k => {
    const base = regionAvgLevel(k), top = regionTopLevel(k), list = [];
    for (let n = 0, tries = 0; n < 7 && tries < 80; tries++) {
      const shape = pk(REGION_KEYS.indexOf(k) < 3 ? shapes.filter(x => !['dragon', 'dino', 'robot'].includes(x)) : shapes), e1 = n < 5 ? pk(regionElems[k]) : pk(elems), e2 = rnd() < .75 ? pk(elems.filter(e => e !== e1)) : null;
      let name = (ELEM_PREFIX[e1] || '') + SPECIES[shape].short;
      if (used.has(name) && e2) name = (ELEM_PREFIX[e2] || '') + name;
      if (used.has(name)) continue; used.add(name);
      const m1 = elementMoves(e1), m2 = e2 ? elementMoves(e2) : [];
      if (!m1.length) continue;
      m1.sort((a, b) => MOVES[a].power - MOVES[b].power);
      const level = base + Math.floor(rnd() * (top - base + 1));
      const moves = [SPECIES[shape].basic, m1[0], m1[Math.min(m1.length - 1, level > 14 ? 2 : 1)]];
      if (m2.length) moves.push(pk(m2));
      const core = coreOfShape(shape), part = pk(commonParts), ess = ITEMS['ess_' + e1] ? 'ess_' + e1 : null;
      const rarePool = Object.keys(ITEMS).filter(i => ITEMS[i].kind === 'part' && ITEMS[i].rarity === 2 && ITEMS[i].element === e1);
      const id = `v_${k}_${n}`, ai = pk(['wander', 'wander', 'chase', 'chase', 'sleep']);
      ENEMIES[id] = {
        name, shape, element: e1, element2: e2, level, base: bs(shape, 1.3 + rnd() * .3), moves: [...new Set(moves)], parts: [part], ai, speed: ai === 'sleep' ? 0 : 34 + Math.floor(rnd() * 18),
        drops: [[core, .2], [part, .3], ...(ess ? [[ess, .15]] : []), ['potion', .06]].filter(d => d[0]), ...(rarePool.length ? { rare: [pk(rarePool), .04] } : {}),
      };
      list.push([id, 2]); n++;
    }
    REGION_SPAWN[k].table.push(...list);
  });
}
