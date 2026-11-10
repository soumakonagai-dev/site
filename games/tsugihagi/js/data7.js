'use strict';
// ===== データ追加その7：新しい核10種・素材20種 =====
// towerOnly の核（種族）は、塔・ボスチャレンジの高難度でしか手に入らない（野生には出ない）
Object.assign(SPECIES, {
  fox:     { name: 'きつね型',     short: 'キツネ',   hp: 34, atk: 11, def: 7,  spd: 13, basic: 'kamitsuki', element: 'fire' },
  crab:    { name: 'かに型',       short: 'カニ',     hp: 40, atk: 10, def: 14, spd: 6,  basic: 'gotsun',    element: 'water' },
  spider:  { name: 'くも型',       short: 'クモ',     hp: 30, atk: 12, def: 7,  spd: 12, basic: 'ito',       element: 'poison' },
  jelly:   { name: 'くらげ型',     short: 'クラゲ',   hp: 44, atk: 9,  def: 6,  spd: 10, basic: 'ito',       element: 'water' },
  cactus:  { name: 'サボテン型',   short: 'サボテン', hp: 42, atk: 10, def: 10, spd: 6,  basic: 'tackle',    element: 'grass' },
  owl:     { name: 'ふくろう型',   short: 'フクロウ', hp: 34, atk: 11, def: 8,  spd: 14, basic: 'peck',      element: 'dark',    towerOnly: true },
  whale:   { name: 'くじら型',     short: 'クジラ',   hp: 70, atk: 13, def: 12, spd: 6,  basic: 'tackle',    element: 'water',   towerOnly: true },
  knight:  { name: 'ナイト型',     short: 'ナイト',   hp: 46, atk: 14, def: 16, spd: 9,  basic: 'gotsun',    element: 'steel',   towerOnly: true },
  fairy:   { name: 'ようせい型',   short: 'ヨウセイ', hp: 28, atk: 10, def: 6,  spd: 16, basic: 'obake',     element: 'light',   towerOnly: true },
  phoenix: { name: 'ほうおう型',   short: 'ホウオウ', hp: 40, atk: 16, def: 8,  spd: 15, basic: 'peck',      element: 'fire',    towerOnly: true },
});
Object.assign(CORE_BIAS, {
  fox:     { role: 'ひのこうげき',   atk: 1.25, spd: 1.25, def: .8 },
  crab:    { role: 'かたいはさみ',   def: 1.4, atk: 1.1, spd: .65 },
  spider:  { role: 'どくのわな',     atk: 1.2, spd: 1.2, hp: .85 },
  jelly:   { role: 'ふわふわたいりょく', hp: 1.5, def: .8, atk: .85 },
  cactus:  { role: 'とげとげがた',   def: 1.2, atk: 1.2, spd: .65 },
  owl:     { role: 'よるのスナイパー', spd: 1.4, atk: 1.2, hp: .8 },
  whale:   { role: 'うみのだいじゅう', hp: 1.8, def: 1.2, spd: .55 },
  knight:  { role: 'きしだん',       def: 1.5, atk: 1.2, hp: 1.1, spd: .8 },
  fairy:   { role: 'ようせいのまほう', spd: 1.5, atk: 1.1, hp: .7, def: .7 },
  phoenix: { role: 'ふっかつのほのお', atk: 1.4, spd: 1.3, hp: 1.1, def: .85 },
});
Object.assign(ITEMS, {
  core_fox:     { name: 'きつねの核',     kind: 'core', species: 'fox',     color: '#e8863a', price: 45, rarity: 1, desc: 'きつね型のもとになる核。ひのこうげきが とくい。' },
  core_crab:    { name: 'かにの核',       kind: 'core', species: 'crab',    color: '#d85a4a', price: 50, rarity: 1, desc: 'かに型のもとになる核。ぼうぎょが かたい。' },
  core_spider:  { name: 'くもの核',       kind: 'core', species: 'spider',  color: '#7a5a8a', price: 70, rarity: 2, desc: 'くも型のもとになる核。どくが とくい。' },
  core_jelly:   { name: 'くらげの核',     kind: 'core', species: 'jelly',   color: '#9ad8f0', price: 70, rarity: 2, desc: 'くらげ型のもとになる核。たいりょくが おおい。' },
  core_cactus:  { name: 'サボテンの核',   kind: 'core', species: 'cactus',  color: '#58b04a', price: 60, rarity: 2, desc: 'サボテン型のもとになる核。とげとげ。' },
  core_owl:     { name: 'ふくろうの核',   kind: 'core', species: 'owl',     color: '#a08a6a', rarity: 3, desc: '塔の しれんで てにはいる。よるの スナイパー。' },
  core_whale:   { name: 'くじらの核',     kind: 'core', species: 'whale',   color: '#4a78b8', rarity: 3, desc: 'ボスチャレンジで てにはいる。とびきり たいりょくが おおい。' },
  core_knight:  { name: 'ナイトの核',     kind: 'core', species: 'knight',  color: '#aab6d0', rarity: 3, desc: '塔の しれんで てにはいる。かたくて つよい きし。' },
  core_fairy:   { name: 'ようせいの核',   kind: 'core', species: 'fairy',   color: '#f4c8f0', rarity: 3, desc: 'ボスチャレンジで てにはいる。まほうに すぐれる。' },
  core_phoenix: { name: 'ほうおうの核',   kind: 'core', species: 'phoenix', color: '#ff8a3a', rarity: 3, desc: '塔の さいこう難度で てにはいる。ほのおの ふっかつ。' },

  // ふつうに手に入る素材（ショップ・ドロップ）
  foxtail:   { name: 'キツネのしっぽ',   kind: 'part', color: '#e89a4a', price: 40, element: 'fire', stats: { spd: 4, atk: 2 }, moves: ['hinoko'], desc: 'ふさふさの きつねびの しっぽ。ほのお属性。' },
  crabshell: { name: 'カニのこうら',     kind: 'part', color: '#e06a58', price: 45, element: 'water', stats: { def: 6, hp: 4 }, moves: ['mizudeppou'], desc: 'あかくて かたい こうら。みず属性。' },
  webthread: { name: 'くものいと',       kind: 'part', color: '#e8e8f4', price: 35, stats: { spd: 3, atk: 2 }, moves: ['ito'], desc: 'ねばねばの すきとおった いと。' },
  jellycap:  { name: 'クラゲのかさ',     kind: 'part', color: '#b8e8f8', price: 40, element: 'water', stats: { hp: 10, def: 2 }, moves: ['mizudeppou'], desc: 'ぷるぷるの かさ。みず属性。' },
  needle:    { name: 'サボテンのはり',   kind: 'part', color: '#6ac058', price: 40, element: 'grass', stats: { atk: 5, def: 1 }, moves: ['happa'], desc: 'ちくちくの はり。くさ属性。' },
  owlfeather:{ name: 'ふくろうの羽',     kind: 'part', color: '#b8a080', price: 55, rarity: 2, element: 'dark', stats: { spd: 4, def: 2 }, moves: ['kage'], desc: 'おとを たてない やわらかい 羽。やみ属性。' },
  ninja:     { name: 'ニンジャずきん',   kind: 'part', color: '#3a3a52', price: 60, rarity: 2, element: 'dark', stats: { spd: 6, atk: 3, def: -2 }, moves: ['kage'], desc: 'すばやく うごける ずきん。まもりは うすい。' },
  magnet:    { name: 'じしゃく',         kind: 'part', color: '#d84a4a', price: 55, rarity: 2, element: 'thunder', stats: { def: 5, atk: 3 }, moves: ['biribiri'], desc: 'ぴりぴり ひきよせる じしゃく。かみなり属性。' },
  sunhat:    { name: 'ひまわりのかんむり', kind: 'part', color: '#ffd84a', price: 55, rarity: 2, element: 'light', stats: { hp: 12, def: 3 }, moves: ['iyashi'], desc: 'あたたかい ひかりの かんむり。ひかり属性。' },
  seashell:  { name: 'しおかぜのかい',   kind: 'part', color: '#f0c8d8', price: 50, rarity: 2, element: 'water', stats: { def: 4, spd: 3 }, moves: ['nami'], desc: 'うみの かおりの 貝がら。みず属性。' },

  // 塔・ボスチャレンジの高難度でしか手に入らない素材
  trialsword:  { name: 'しれんのつるぎ',     kind: 'part', color: '#e8f0ff', rarity: 3, stats: { atk: 13 }, moves: ['kamikudaki'], desc: '塔の しれんを のりこえた しるし。' },
  towermedal:  { name: 'とうのメダル',       kind: 'part', color: '#f0d060', rarity: 3, stats: { hp: 12, atk: 4, def: 4, spd: 4 }, desc: '塔を のぼりきった ものに あたえられる メダル。' },
  skybanner:   { name: 'てんくうのはた',     kind: 'part', color: '#a8f0e0', rarity: 3, element: 'wind', stats: { spd: 12, atk: 6 }, moves: ['tatsumaki'], desc: 'たかい 塔の いただきに はためく はた。' },
  heroscrown:  { name: 'ゆうしゃのかんむり', kind: 'part', color: '#fff0a0', rarity: 3, element: 'light', stats: { hp: 8, atk: 7, def: 7, spd: 7 }, moves: ['kagayaki'], desc: 'つわものだけが かぶれる かんむり。' },
  dragonscale2:{ name: 'しんりゅうのうろこ', kind: 'part', color: '#58c8a8', rarity: 3, stats: { def: 14, atk: 8, spd: 4 }, moves: ['kamikudaki'], desc: '塔の ばんにんが まもる しんりゅうの うろこ。' },
  bossfang:    { name: 'ボスのきば',         kind: 'part', color: '#d8d0e8', rarity: 3, element: 'dark', stats: { atk: 14 }, moves: ['yami'], desc: 'ボスチャレンジの しょうこ。やみ属性。' },
  conquerorcape:{ name: 'しょうりのマント',  kind: 'part', color: '#c83a4a', rarity: 3, stats: { def: 12, hp: 16 }, desc: 'ボスを うちやぶった ものの マント。' },
  titanheart:  { name: 'タイタンのこどう',   kind: 'part', color: '#e87a7a', rarity: 3, stats: { hp: 38, def: 4, spd: -3 }, desc: 'どくん、どくん と うごく きょだいな しんぞう。' },
  voidshard:   { name: 'ましょうのかけら',   kind: 'part', color: '#6a3aa8', rarity: 3, element: 'dark', stats: { atk: 15, spd: 6 }, moves: ['yami', 'kage'], desc: 'ふれると こころが さむくなる かけら。' },
  infinitydrop:{ name: 'むげんのしずく',     kind: 'part', color: '#f8f4ff', rarity: 3, element: 'light', stats: { hp: 30, atk: 9, def: 9, spd: 9 }, moves: ['kagayaki', 'hikari'], desc: '20だんかいの ちょうてんで うまれる しずく。' },
});
for (const id of ['core_owl', 'core_whale', 'core_knight', 'core_fairy', 'core_phoenix', 'trialsword', 'towermedal', 'skybanner', 'heroscrown', 'dragonscale2', 'bossfang', 'conquerorcape', 'titanheart', 'voidshard', 'infinitydrop']) ITEMS[id].exclusive = true;

{
  const D = (e, id, p) => ENEMIES[e].drops.push([id, p]);
  D('nonezumi', 'webthread', .1); D('hotarumoth', 'webthread', .15); D('honokitsune', 'foxtail', .2); D('sasori', 'crabshell', .1); D('kanigolem', 'crabshell', .2);
  D('kurage', 'jellycap', .2); D('sabotenman', 'needle', .25); D('kageobake', 'owlfeather', .1); D('koumori', 'ninja', .1); D('raiju', 'magnet', .12); D('hanamushi', 'sunhat', .08);
  D('sakanaman', 'seashell', .1); D('umidori', 'seashell', .12);
  const S = (v, list) => VILLAGES.find(x => x.id === v).shop.push(...list);
  S('v1', ['core_fox', 'webthread']); S('v2', ['foxtail', 'core_crab', 'needle']); S('v3', ['crabshell', 'jellycap', 'seashell']); S('v4', ['needle', 'core_cactus', 'core_crab']);
  S('v5', ['foxtail', 'core_fox']); S('v6', ['magnet', 'ninja', 'core_spider']); S('v7', ['jellycap', 'core_jelly']); S('v8', ['webthread', 'core_spider', 'owlfeather']);
  S('v9', ['magnet', 'core_cactus']); S('v10', ['sunhat', 'ninja', 'core_jelly']);
}
