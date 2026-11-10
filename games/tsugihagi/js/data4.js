'use strict';
// ===== データ追加その4：素材31種（見た目は js/look2.js の LOOK2）=====
Object.assign(ITEMS, {
  // 角・牙・耳・触角
  unihorn:   { name: 'ユニコーンの角', kind: 'part', color: '#f8f0ff', price: 70, rarity: 2, element: 'light', stats: { atk: 4, def: 2 }, moves: ['hikari', 'tsuno'], desc: 'ひたいに ひかる ながい 角。ひかり属性。' },
  twinhorn:  { name: 'ふたつの角', kind: 'part', color: '#e8dcc0', price: 40, stats: { atk: 4 }, moves: ['tsuno'], desc: 'あたまに 2ほんの 角。' },
  ramhorn:   { name: 'うずまきの角', kind: 'part', color: '#c8b890', price: 35, stats: { atk: 3, def: 2 }, moves: ['tsuno', 'dosun'], desc: 'くるんと まいた 角。' },
  tusks:     { name: 'おおきなきば', kind: 'part', color: '#f4ecd8', price: 40, stats: { atk: 5 }, moves: ['bite'], desc: 'くちから のびる 2ほんの きば。' },
  catears:   { name: 'ねこみみ', kind: 'part', color: '#e8c8a0', price: 30, stats: { spd: 3, atk: 1 }, moves: ['hayabusa'], desc: 'ぴんと たった ねこの みみ。' },
  antenna:   { name: 'アンテナ', kind: 'part', color: '#8a8a96', price: 30, element: 'thunder', stats: { spd: 2 }, moves: ['biribiri'], desc: 'あたまの アンテナが ぴりぴり。かみなり属性。' },
  // しっぽ・ひれ
  scorptail: { name: 'さそりのしっぽ', kind: 'part', color: '#a04a30', price: 60, rarity: 2, element: 'poison', stats: { atk: 4 }, moves: ['dokubari'], desc: 'どくばりの ついた しっぽ。どく属性。' },
  peacock:   { name: 'くじゃくの羽', kind: 'part', color: '#3aa8a0', price: 60, rarity: 2, stats: { hp: 6, spd: 2 }, moves: ['hikari'], desc: 'おうぎのように ひろがる うつくしい 羽。' },
  fluffytail:{ name: 'ふわふわしっぽ', kind: 'part', color: '#f8f4f0', price: 30, stats: { hp: 8 }, moves: ['iyashi'], desc: 'まるくて ふわふわの しっぽ。' },
  spadetail: { name: 'りゅうのしっぽ', kind: 'part', color: '#c05a3a', price: 65, rarity: 2, stats: { atk: 4, def: 2 }, moves: ['dosun'], desc: 'とげの ある ふとい しっぽ。' },
  dorsalfin: { name: 'せびれ', kind: 'part', color: '#58b0d8', price: 35, element: 'water', stats: { spd: 2, atk: 1 }, ability: 'swim', moves: ['mizudeppou'], desc: 'せなかの おおきな ひれ。みず属性。「およぐ」ちから。' },
  // 翼・えり
  angelwing: { name: 'てんしのつばさ', kind: 'part', color: '#fff8e0', rarity: 3, element: 'light', stats: { hp: 10, spd: 5 }, ability: 'fly', moves: ['kagayaki', 'iyashi'], desc: 'まっしろな 大きな つばさ。「とぶ」ちから。' },
  mechawing: { name: 'メカのつばさ', kind: 'part', color: '#8a98b0', price: 80, rarity: 2, element: 'steel', stats: { spd: 4, def: 2 }, ability: 'fly', moves: ['tekken'], desc: 'ジェットつきの 金属の つばさ。「とぶ」ちから。' },
  cloudwrap: { name: 'くものえり', kind: 'part', color: '#e8f4ff', price: 40, element: 'wind', stats: { spd: 2, hp: 4 }, moves: ['kamaitachi'], desc: 'くびに ふわふわの 雲。かぜ属性。' },
  lantern:   { name: 'ちょうちん', kind: 'part', color: '#ffb84a', price: 35, stats: { hp: 4 }, ability: 'light', moves: ['pikapika'], desc: 'ぶらさげた あかり。くらい洞窟で「てらす」。' },
  // よろい・から・つる
  turtleshell:{ name: 'かめのこうら', kind: 'part', color: '#6a8a5a', price: 45, stats: { def: 6, spd: -2 }, moves: ['dosun'], desc: 'せなかの おおきな こうら。' },
  thornvine: { name: 'ばらのつる', kind: 'part', color: '#4a8a3a', price: 40, element: 'grass', stats: { atk: 2, def: 2 }, moves: ['tsurumuchi'], desc: 'からだに まきつく とげの つる。くさ属性。' },
  spiral:    { name: 'うずまきのから', kind: 'part', color: '#c8a070', price: 40, element: 'earth', stats: { def: 4 }, moves: ['suna'], desc: 'せなかに うずまきの から。つち属性。' },
  crystalspike:{ name: 'すいしょうのとげ', kind: 'part', color: '#9fe8ff', price: 70, rarity: 2, element: 'ice', stats: { atk: 4, def: 2 }, moves: ['tsurara'], desc: 'せなかに ならぶ すきとおる 結晶。こおり属性。' },
  // もよう
  rainbow:   { name: 'にじのうろこ', kind: 'part', color: '#f0a0ff', rarity: 3, stats: { hp: 8, atk: 4, def: 4, spd: 4 }, moves: ['kagayaki'], desc: '見る角度で いろが かわる ふしぎな うろこ。' },
  camo:      { name: 'まだらもよう', kind: 'part', color: '#6a8a4a', price: 25, stats: { spd: 2, def: 1 }, moves: ['kage'], desc: 'みどりと ちゃいろの まだらもよう。' },
  checker:   { name: 'チェックもよう', kind: 'part', color: '#e8e8f0', price: 25, stats: { atk: 2, hp: 3 }, moves: ['hayabusa'], desc: 'しろと くろの チェックもよう。' },
  lavacrack: { name: 'マグマのひび', kind: 'part', color: '#ff6a2a', price: 65, rarity: 2, element: 'fire', stats: { atk: 4, def: 2 }, moves: ['honoo'], desc: 'からだの ひびから マグマが もれる。ほのお属性。' },
  boltmark:  { name: 'いなずまもよう', kind: 'part', color: '#ffe84a', price: 65, rarity: 2, element: 'thunder', stats: { atk: 4, spd: 2 }, moves: ['biribiri'], desc: 'からだに いなずまの もよう。かみなり属性。' },
  // あたま・かお・まわり
  flowercrown:{ name: 'はなかんむり', kind: 'part', color: '#ff9ac0', price: 40, element: 'grass', stats: { hp: 8 }, moves: ['iyashi', 'happa'], desc: 'あたまに はなの かんむり。くさ属性。' },
  snowcap:   { name: 'ゆきのぼうし', kind: 'part', color: '#f0f8ff', price: 35, element: 'ice', stats: { hp: 4, def: 2 }, moves: ['kori'], desc: 'ぽんぽんつきの ゆきの ぼうし。こおり属性。' },
  mask:      { name: 'ふしぎなおめん', kind: 'part', color: '#b08a58', price: 70, rarity: 2, element: 'dark', stats: { def: 3, atk: 3 }, moves: ['kage'], desc: 'かおを おおう ふしぎな おめん。やみ属性。' },
  visor:     { name: 'ロボのバイザー', kind: 'part', color: '#4aa8d8', price: 70, rarity: 2, element: 'steel', stats: { atk: 3, spd: 3 }, ability: 'light', moves: ['pikapika'], desc: 'ひかる ラインの バイザー。はがね属性。' },
  bubble:    { name: 'シャボンのバリア', kind: 'part', color: '#bfe8ff', price: 65, rarity: 2, element: 'water', stats: { def: 4, hp: 6 }, moves: ['mizudeppou'], desc: 'からだを つつむ しゃぼんだま。みず属性。' },
  fireorbs:  { name: 'ひのたま', kind: 'part', color: '#ff8a3a', price: 55, element: 'fire', stats: { atk: 3 }, moves: ['hinoko'], desc: 'まわりを まわる ひの たま。ほのお属性。' },
  iceorbs:   { name: 'こおりのたま', kind: 'part', color: '#9fe0ff', price: 55, element: 'ice', stats: { atk: 3 }, moves: ['kori'], desc: 'まわりを まわる こおりの たま。こおり属性。' },
});
for (const id in ITEMS) ITEMS[id].rarity = ITEMS[id].rarity || 1;

// ---- ドロップ ----
{
  const D = (e, id, p) => ENEMIES[e].drops.push([id, p]);
  const Rr = (e, id, p) => { const d = ENEMIES[e]; d.rares = (d.rares || (d.rare ? [d.rare] : [])).concat([[id, p]]); };
  D('nonezumi', 'catears', .15); D('nonezumi', 'fluffytail', .15); D('usagi', 'fluffytail', .2); D('usagi', 'camo', .15); D('yukiusagi', 'fluffytail', .2); D('yukiusagi', 'snowcap', .15);
  D('honokitsune', 'catears', .1); D('honokitsune', 'tusks', .12); D('frostwolf', 'tusks', .15); D('frostwolf', 'snowcap', .12); D('raiju', 'tusks', .1);
  D('mushikabuto', 'twinhorn', .15); D('mushikabuto', 'camo', .15); D('drillmole', 'twinhorn', .15); D('iwakoro', 'ramhorn', .12); D('tetsugolem', 'ramhorn', .1);
  D('hotarumoth', 'antenna', .15); D('hotarumoth', 'lantern', .2); D('haganemushi', 'antenna', .2); D('kazanmushi', 'antenna', .15); D('kurage', 'lantern', .15); D('kageobake', 'lantern', .1);
  D('sasori', 'scorptail', .12); D('numahebi', 'scorptail', .1); D('hebi', 'camo', .2);
  D('kusabane', 'peacock', .08); D('fuuchou', 'peacock', .1);
  D('sunazaurus', 'spadetail', .15); D('swampcroc', 'spadetail', .12); D('hiryuu', 'spadetail', .12);
  D('sakanaman', 'dorsalfin', .2); D('kawanezumi', 'dorsalfin', .15); D('penguin', 'dorsalfin', .15); D('penguin', 'checker', .15);
  D('robosoldier', 'mechawing', .12); D('guardian', 'mechawing', .12); D('metallizard', 'mechawing', .1); D('robosoldier', 'visor', .15); D('haganemushi', 'visor', .1); D('tetsugolem', 'visor', .1);
  D('cloudslime', 'cloudwrap', .25); D('fuuchou', 'cloudwrap', .15);
  D('kame', 'turtleshell', .25); D('kanigolem', 'turtleshell', .15); D('kame', 'spiral', .1); D('iwakoro', 'spiral', .15); D('sabotenman', 'spiral', .1);
  D('hanamushi', 'thornvine', .2); D('kinoko', 'thornvine', .15); D('slimey', 'thornvine', .15); D('slimey', 'checker', .15);
  D('hanamushi', 'flowercrown', .15); D('kinoko', 'flowercrown', .1); D('slimey', 'flowercrown', .1);
  D('hikarigolem', 'crystalspike', .1); D('yukidaruma', 'crystalspike', .1); D('guardian', 'crystalspike', .08); D('yukidaruma', 'snowcap', .15);
  D('magmagolem', 'lavacrack', .12); D('magmaslime', 'lavacrack', .12); D('kazanmushi', 'lavacrack', .1);
  D('raiju', 'boltmark', .12); D('kaminaritori', 'boltmark', .12); D('kodaisaurus', 'boltmark', .1);
  D('bogghost', 'mask', .12); D('koumori', 'mask', .1); D('kageobake', 'mask', .1);
  D('tako', 'bubble', .12); D('sakanaman', 'bubble', .1); D('kurage', 'bubble', .12);
  D('hinotori', 'fireorbs', .15); D('honokitsune', 'fireorbs', .1); D('magmaslime', 'fireorbs', .15);
  D('yukiusagi', 'iceorbs', .1); D('frostwolf', 'iceorbs', .12); D('penguin', 'iceorbs', .12);
  Rr('yukiusagi', 'unihorn', .05); Rr('usagi', 'unihorn', .04); Rr('hikarigolem', 'angelwing', .03); Rr('cloudslime', 'angelwing', .04); Rr('fuuchou', 'angelwing', .03);
  Rr('kageobake', 'rainbow', .02); Rr('fuuchou', 'rainbow', .03); Rr('cloudslime', 'rainbow', .03);
  Rr('kodaisaurus', 'goldscale', .03);
  // 村のショップ（ふつう・めずらしいものだけ。レアは売らない）
  const S = (v, list) => VILLAGES.find(x => x.id === v).shop.push(...list);
  S('v1', ['catears', 'fluffytail', 'camo', 'checker']);
  S('v2', ['lantern', 'thornvine', 'flowercrown', 'antenna', 'twinhorn']);
  S('v3', ['dorsalfin', 'turtleshell', 'bubble']);
  S('v4', ['spiral', 'scorptail', 'camo', 'tusks']);
  S('v5', ['lavacrack', 'fireorbs', 'ramhorn', 'spadetail']);
  S('v6', ['boltmark', 'mask', 'antenna', 'visor']);
  S('v7', ['snowcap', 'iceorbs', 'crystalspike', 'fluffytail']);
  S('v8', ['thornvine', 'mask', 'scorptail', 'lantern']);
  S('v9', ['visor', 'mechawing', 'ramhorn', 'tusks']);
  S('v10', ['cloudwrap', 'peacock', 'unihorn']);
}
