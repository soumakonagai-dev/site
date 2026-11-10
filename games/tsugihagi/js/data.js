'use strict';
// ===== ツギハギの森：データ定義 =====
const TILE = 32, W = 640, H = 360;

const ELEMENTS = {
  none:    { name: 'ノーマル', color: '#c8a878' },
  fire:    { name: 'ほのお',   color: '#e8643c' },
  water:   { name: 'みず',     color: '#4aa3df' },
  grass:   { name: 'くさ',     color: '#5cb85c' },
  earth:   { name: 'つち',     color: '#a0783c' },
  thunder: { name: 'かみなり', color: '#f2d03b' },
  light:   { name: 'ひかり',   color: '#f4ecb0' },
  dark:    { name: 'やみ',     color: '#7a5aa8' },
};
// 矢印の先に強い（1.5倍）。逆は0.75倍
const BEATS = { fire: 'grass', grass: 'earth', earth: 'thunder', thunder: 'water', water: 'fire', light: 'dark', dark: 'light' };

const ABILITY_NAMES = { cut: 'きる', swim: 'およぐ', fly: 'とぶ', smash: 'くだく', heat: 'たえねつ', light: 'てらす' };

// kind: core=核 / part=パーツ / essence=エッセンス / use=つかうもの
// rarity: 1=ふつう 2=めずらしい 3=レア（ショップには並ばない）  price: ショップでの値段(W)
const ITEMS = {
  core_beast: { name: 'けものの核',   kind: 'core', species: 'beast', color: '#b98b5a', price: 30, desc: 'けもの型のもとになる核。' },
  core_bird:  { name: 'とりの核',     kind: 'core', species: 'bird',  color: '#e8c25a', price: 40, desc: 'とり型のもとになる核。すばやい。' },
  core_fish:  { name: 'さかなの核',   kind: 'core', species: 'fish',  color: '#6ab4d8', price: 40, desc: 'さかな型のもとになる核。' },
  core_bug:   { name: 'むしの核',     kind: 'core', species: 'bug',   color: '#8ec24a', price: 35, desc: 'むし型のもとになる核。バランスがいい。' },
  core_golem: { name: 'いしの核',     kind: 'core', species: 'golem', color: '#9a9aa6', price: 60, rarity: 2, desc: 'ゴーレム型のもとになる核。かたくて おそい。' },
  core_ghost: { name: 'まぼろしの核', kind: 'core', species: 'ghost', color: '#9a7ad0', rarity: 3, desc: 'おばけ型のもとになる核。ふしぎな力がやどる。' },
  core_dino:  { name: 'きょうりゅうの核', kind: 'core', species: 'dino', color: '#d0603a', rarity: 3, desc: 'とほうもなく強い きょうりゅう型の核。' },

  claw:     { name: 'するどい爪',   kind: 'part', color: '#b9bccb', price: 25, stats: { atk: 3 }, ability: 'cut', moves: ['kirisaku'], desc: 'ATK+3。くさむらを「きる」ちからがつく。' },
  mizukaki: { name: 'みずかき',     kind: 'part', color: '#3a9ad9', price: 35, element: 'water', stats: { spd: 3, def: 1 }, ability: 'swim', moves: ['mizudeppou'], desc: 'みず属性。かわを「およぐ」ちからがつく。' },
  wing:     { name: 'つばさの羽',   kind: 'part', color: '#eae6d6', price: 30, stats: { spd: 4 }, ability: 'fly', moves: ['hayabusa'], desc: 'SPD+4。たにを「とぶ」ちからがつく。' },
  shell:    { name: 'かたい殻',     kind: 'part', color: '#8a6a48', price: 30, stats: { def: 4, spd: -1 }, moves: ['dosun'], desc: 'DEF+4。おもたい。' },
  hotaru:   { name: 'ほたる石',     kind: 'part', color: '#f2e27a', stats: { spd: 1, atk: 1 }, ability: 'light', moves: ['pikapika'], desc: 'ぼんやり光る石。' },
  fang:     { name: 'するどい牙',   kind: 'part', color: '#f0f0f0', price: 35, stats: { atk: 4 }, moves: ['bite'], desc: 'ATK+4。' },
  vine:     { name: 'つるのくき',   kind: 'part', color: '#4f9a4a', price: 30, element: 'grass', stats: { def: 1, hp: 4 }, moves: ['tsurumuchi'], desc: 'くさ属性。HP+4 DEF+1。' },
  fur:      { name: 'ふわふわの毛', kind: 'part', color: '#f6efe4', price: 25, stats: { hp: 10 }, moves: ['iyashi'], desc: 'HP+10。' },
  rockfist: { name: 'いわのこぶし', kind: 'part', color: '#8c8c98', price: 50, stats: { atk: 4, def: 2 }, ability: 'smash', moves: ['iwa'], desc: 'おおいわを「くだく」ちからがつく。' },
  crabclaw: { name: 'カニのはさみ', kind: 'part', color: '#e8785a', price: 35, stats: { atk: 5 }, moves: ['bite'], desc: 'ATK+5。' },
  lavascale:{ name: '溶岩のうろこ', kind: 'part', color: '#d4502a', rarity: 2, element: 'fire', stats: { def: 3, atk: 2 }, ability: 'heat', moves: ['hinoko'], desc: '溶岩を「たえねつ」で わたれる。' },
  sandscale:{ name: '砂ぼこりのうろこ', kind: 'part', color: '#d2b070', rarity: 2, element: 'earth', stats: { def: 5, spd: 1 }, moves: ['suna'], desc: 'つち属性。DEF+5。' },
  fossil:   { name: '化石のかけら', kind: 'part', color: '#cbbf9a', rarity: 2, element: 'earth', stats: { atk: 6 }, moves: ['iwa'], desc: 'つち属性。ATK+6。' },
  kabutohorn:{ name: 'かぶとの角',  kind: 'part', color: '#5a4636', rarity: 2, stats: { atk: 6, def: 2 }, moves: ['dosun'], desc: 'ATK+6 DEF+2。' },
  // ---- レア（モンスターごとの珍しいドロップ）----
  goldfur:    { name: '黄金の毛',     kind: 'part', color: '#f2cf5a', rarity: 3, stats: { hp: 24 }, moves: ['iyashi'], desc: 'HP+24。いやしのちからを もつ。' },
  windfeather:{ name: '風切り羽',     kind: 'part', color: '#cfeaff', rarity: 3, stats: { spd: 8 }, ability: 'fly', moves: ['hayabusa'], desc: 'SPD+8。' },
  sweetnectar:{ name: 'あまい蜜',     kind: 'part', color: '#f0a050', rarity: 3, element: 'grass', stats: { hp: 12, def: 2 }, moves: ['iyashi', 'happa'], desc: 'くさ属性。HP+12。' },
  pearl:      { name: 'しんじゅ',     kind: 'part', color: '#f4f0ff', rarity: 3, element: 'water', stats: { def: 6 }, ability: 'swim', moves: ['nami'], desc: 'みず属性。DEF+6。' },
  moonstone:  { name: '月の石',       kind: 'part', color: '#e4e0ff', rarity: 3, element: 'light', stats: { atk: 3, spd: 3 }, moves: ['hikari'], desc: 'ひかり属性。' },
  flamecore:  { name: 'ほのおの心',   kind: 'part', color: '#ff6a2a', rarity: 3, element: 'fire', stats: { atk: 8 }, moves: ['bakuen'], desc: 'ほのお属性。ATK+8。' },
  crystal:    { name: 'きらめく結晶', kind: 'part', color: '#b8f0ff', rarity: 3, element: 'light', stats: { def: 6, hp: 6 }, moves: ['hikari'], desc: 'ひかり属性。DEF+6。' },
  thunderhorn:{ name: '雷の角',       kind: 'part', color: '#ffe84a', rarity: 3, element: 'thunder', stats: { atk: 7, spd: 3 }, moves: ['kaminari'], desc: 'かみなり属性。ATK+7。' },
  shadowfog:  { name: 'かげのきり',   kind: 'part', color: '#5a3a80', rarity: 3, element: 'dark', stats: { atk: 4, spd: 4 }, moves: ['kage'], desc: 'やみ属性。' },

  ess_fire:    { name: '火のしずく',   kind: 'essence', color: '#f08a3c', price: 35, element: 'fire',  stats: { atk: 2 }, moves: ['hinoko'], desc: 'ほのお属性を つよくする。' },
  ess_water:   { name: '水のしずく',   kind: 'essence', color: '#5bb8f0', price: 35, element: 'water', stats: { def: 1 }, moves: ['mizudeppou'], desc: 'みず属性を つよくする。' },
  ess_grass:   { name: '草のしずく',   kind: 'essence', color: '#7ccf6a', price: 35, element: 'grass', stats: { hp: 3 }, moves: ['happa'], desc: 'くさ属性を つよくする。' },
  ess_earth:   { name: '土のしずく',   kind: 'essence', color: '#b08a4c', rarity: 2, element: 'earth', stats: { atk: 1, def: 1 }, moves: ['suna'], desc: 'つち属性を つよくする。' },
  ess_thunder: { name: '雷のかけら',   kind: 'essence', color: '#f6dc4a', rarity: 2, element: 'thunder', stats: { spd: 2 }, moves: ['biribiri'], desc: 'かみなり属性を つよくする。' },
  ess_light:   { name: '光のかけら',   kind: 'essence', color: '#fff4b8', rarity: 2, element: 'light', stats: { spd: 1 }, moves: ['hikari'], desc: 'ひかり属性を つよくする。' },
  ess_dark:    { name: '闇のかけら',   kind: 'essence', color: '#7a5aa8', rarity: 2, element: 'dark', stats: { atk: 2 }, moves: ['kage'], desc: 'やみ属性を つよくする。' },

  potion:   { name: 'きずぐすり',   kind: 'use', color: '#e86a8a', price: 20, heal: 40,  desc: 'HPを40かいふくする。' },
  hipotion: { name: 'いいきずぐすり', kind: 'use', color: '#e84a6a', price: 60, heal: 100, desc: 'HPを100かいふくする。' },
};
for (const id in ITEMS) ITEMS[id].rarity = ITEMS[id].rarity || 1;

const SPECIES = {
  beast: { name: 'けもの型',   short: 'ケモノ',   hp: 40, atk: 10, def: 8,  spd: 9,  basic: 'tackle',   element: 'none' },
  bird:  { name: 'とり型',     short: 'トリ',     hp: 32, atk: 9,  def: 6,  spd: 13, basic: 'peck',     element: 'none' },
  fish:  { name: 'さかな型',   short: 'ウオ',     hp: 36, atk: 9,  def: 8,  spd: 10, basic: 'tackle',   element: 'none' },
  bug:   { name: 'むし型',     short: 'ムシ',     hp: 34, atk: 10, def: 9,  spd: 11, basic: 'ito',      element: 'none' },
  golem: { name: 'ゴーレム型', short: 'ゴーレム', hp: 48, atk: 11, def: 14, spd: 5,  basic: 'gotsun',   element: 'earth' },
  ghost: { name: 'おばけ型',   short: 'オバケ',   hp: 30, atk: 12, def: 6,  spd: 14, basic: 'obake',    element: 'dark' },
  dino:  { name: 'きょうりゅう型', short: 'ザウルス', hp: 56, atk: 17, def: 12, spd: 11, basic: 'kamitsuki', element: 'earth' },
};
const ELEM_PREFIX = { none: 'ツギ', fire: 'ヒノ', water: 'ミズ', grass: 'モリ', earth: 'ツチ', thunder: 'イナ', light: 'ヒカリ', dark: 'ヤミ' };

// en=EN消費 field=フィールド能力 priority=先手度 fx=攻撃エフェクトの種類
const MOVES = {
  tackle:     { name: 'たいあたり',   power: 40, en: 0, element: 'none', fx: 'impact' },
  peck:       { name: 'つつく',       power: 40, en: 0, element: 'none', fx: 'impact' },
  ito:        { name: 'ねばねばいと', power: 42, en: 0, element: 'none', fx: 'whip' },
  gotsun:     { name: 'ごつん',       power: 45, en: 0, element: 'none', fx: 'impact' },
  obake:      { name: 'おどかす',     power: 42, en: 0, element: 'dark', fx: 'swirl' },
  kamitsuki:  { name: 'かみつき',     power: 52, en: 0, element: 'none', fx: 'slash' },
  kirisaku:   { name: 'きりさく',     power: 70, en: 2, element: 'none', fx: 'slash', field: 'cut', desc: 'フィールドでくさむらを きれる。' },
  bite:       { name: 'かみつく',     power: 60, en: 1, element: 'none', fx: 'slash' },
  mizudeppou: { name: 'みずでっぽう', power: 55, en: 1, element: 'water', fx: 'proj' },
  hinoko:     { name: 'ひのこ',       power: 55, en: 1, element: 'fire', burn: .3, fx: 'proj' },
  happa:      { name: 'はっぱカッター', power: 55, en: 1, element: 'grass', fx: 'proj' },
  tsurumuchi: { name: 'つるのムチ',   power: 65, en: 2, element: 'grass', fx: 'whip' },
  nami:       { name: 'なみのり',     power: 80, en: 3, element: 'water', fx: 'wave', field: 'swim', desc: 'フィールドでかわを およげる。' },
  honoo:      { name: 'ほのおのいき', power: 85, en: 3, element: 'fire', burn: .3, fx: 'breath' },
  bakuen:     { name: 'ばくえん',     power: 105, en: 4, element: 'fire', burn: .4, fx: 'explosion' },
  hayabusa:   { name: 'はやぶさ',     power: 50, en: 1, element: 'none', priority: 1, fx: 'impact', desc: 'さきに こうげきできる。' },
  pikapika:   { name: 'ぴかぴか',     power: 45, en: 1, element: 'light', fx: 'beam' },
  iyashi:     { name: 'いやしのひかり', power: 0, en: 2, element: 'light', heal: .35, fx: 'heal', desc: 'じぶんのHPを すこし かいふく。' },
  dosun:      { name: 'ドスン',       power: 70, en: 2, element: 'none', fx: 'quake' },
  biribiri:   { name: 'ビリビリ',     power: 60, en: 1, element: 'thunder', fx: 'bolt' },
  kaminari:   { name: 'かみなり',     power: 92, en: 3, element: 'thunder', fx: 'bolt', big: true },
  suna:       { name: 'すなあらし',   power: 52, en: 1, element: 'earth', fx: 'rocks' },
  iwa:        { name: 'いわおとし',   power: 72, en: 2, element: 'earth', fx: 'rocks', field: 'smash', desc: 'フィールドでおおいわを くだける。' },
  jishin:     { name: 'じしん',       power: 98, en: 3, element: 'earth', fx: 'quake', big: true },
  kage:       { name: 'かげうち',     power: 55, en: 1, element: 'dark', priority: 1, fx: 'swirl', desc: 'さきに こうげきできる。' },
  yami:       { name: 'やみのはどう', power: 88, en: 3, element: 'dark', fx: 'swirl', big: true },
  hikari:     { name: 'ひかりのたま', power: 62, en: 1, element: 'light', fx: 'beam' },
  kagayaki:   { name: 'きらめきビーム', power: 90, en: 3, element: 'light', fx: 'beam', big: true },
  kamikudaki: { name: 'かみくだく',   power: 96, en: 3, element: 'none', fx: 'slash', big: true },
  hoeru:      { name: 'たいこのほうこう', power: 115, en: 4, element: 'earth', fx: 'quake', big: true },
};

// 固定レシピ：核＋素材が完全に一致したとき、専用の名前・ボーナス・技がつく
const RECIPES = [
  { id: 'sora',   name: 'ソラバネ',   core: 'core_bird',  parts: ['wing', 'wing'],                      element: 'none',  moves: ['hayabusa'],            abilities: ['fly'],  factor: 1.2, hint: 'とりの核に つばさの羽を ふたつ。' },
  { id: 'kawauso', name: 'カワウソ',  core: 'core_beast', parts: ['mizukaki', 'mizukaki', 'ess_water'], element: 'water', moves: ['nami', 'mizudeppou'],  abilities: ['swim'], factor: 1.2, hint: 'けものの核に みずかきを ふたつと 水のしずく。' },
  { id: 'kiba',   name: 'キバツメ',   core: 'core_beast', parts: ['claw', 'fang'],                      element: 'none',  moves: ['bite', 'kirisaku'],    abilities: ['cut'],  factor: 1.2, hint: 'けものの核に 爪と 牙。' },
  { id: 'mizuuo', name: 'ミズウオ',   core: 'core_fish',  parts: ['mizukaki', 'ess_water'],             element: 'water', moves: ['nami'],                abilities: ['swim'], factor: 1.2, hint: 'さかなの核に みずかきと 水のしずく。' },
  { id: 'mori',   name: 'モリジシ',   core: 'core_beast', parts: ['vine', 'ess_grass'],                 element: 'grass', moves: ['tsurumuchi', 'happa'], abilities: [],       factor: 1.2, hint: 'けものの核に つると 草のしずく。' },
  { id: 'hinotori', name: 'ヒノトリ', core: 'core_bird',  parts: ['ess_fire', 'hotaru'],                element: 'fire',  moves: ['honoo'],               abilities: [],       factor: 1.2, hint: 'とりの核に 火のしずくと ほたる石。' },
  { id: 'kabuton', name: 'カブトン',  core: 'core_bug',   parts: ['kabutohorn', 'shell'],               element: 'earth', moves: ['dosun', 'iwa'],        abilities: ['smash'], factor: 1.25, hint: 'むしの核に かぶとの角と かたい殻。' },
  { id: 'magma',  name: 'マグマゴーレム', core: 'core_golem', parts: ['lavascale', 'ess_fire'],         element: 'fire',  moves: ['honoo', 'dosun'],      abilities: ['heat', 'smash'], factor: 1.25, hint: 'いしの核に 溶岩のうろこと 火のしずく。' },
  { id: 'raikou', name: 'ライコウ',   core: 'core_beast', parts: ['thunderhorn', 'ess_thunder'],        element: 'thunder', moves: ['kaminari', 'biribiri'], abilities: [],     factor: 1.25, hint: 'けものの核に 雷の角と 雷のかけら。' },
  { id: 'tide',   name: 'タイドラ',   core: 'core_fish',  parts: ['pearl', 'ess_water'],                element: 'water', moves: ['nami', 'bakuen'],      abilities: ['swim'], factor: 1.3, hint: 'さかなの核に しんじゅと 水のしずく。' },
  { id: 'holy',   name: 'ホーリーバード', core: 'core_bird', parts: ['moonstone', 'ess_light'],        element: 'light', moves: ['kagayaki', 'hayabusa'], abilities: ['fly'],  factor: 1.3, hint: 'とりの核に 月の石と 光のかけら。' },
  { id: 'yurei',  name: 'ユーレイ',   core: 'core_ghost', parts: ['shadowfog', 'ess_dark'],             element: 'dark',  moves: ['yami', 'kage'],        abilities: [],       factor: 1.3, hint: 'まぼろしの核に かげのきりと 闇のかけら。' },
  { id: 'tyranno', name: 'ティラノン', core: 'core_dino', parts: ['fang', 'ess_fire'],                  element: 'fire',  moves: ['kamikudaki', 'bakuen'], abilities: [],      factor: 1.3, hint: 'きょうりゅうの核に 牙と 火のしずく。' },
  { id: 'trike',  name: 'トリケラン', core: 'core_dino',  parts: ['shell', 'kabutohorn'],               element: 'earth', moves: ['jishin', 'dosun'],     abilities: ['smash'], factor: 1.3, hint: 'きょうりゅうの核に かたい殻と かぶとの角。' },
  { id: 'raptor', name: 'ラプトル',   core: 'core_dino',  parts: ['wing', 'claw'],                      element: 'none',  moves: ['kamikudaki', 'hayabusa', 'kirisaku'], abilities: ['fly', 'cut'], factor: 1.3, hint: 'きょうりゅうの核に つばさの羽と 爪。' },
  { id: 'gaia',   name: 'ガイアレックス', core: 'core_dino', parts: ['fossil', 'ess_earth', 'crystal'], element: 'earth', moves: ['hoeru', 'jishin', 'hikari'], abilities: ['smash'], factor: 1.4, hint: 'きょうりゅうの核に 化石と 土のしずくと 結晶。（さいきょうのレシピ）' },
];

const bs = (sh, k = 1) => { const s = SPECIES[sh]; return { hp: Math.round(s.hp * k), atk: Math.round(s.atk * k), def: Math.round(s.def * k), spd: Math.round(s.spd * k) }; };
// ai: wander=うろうろ / chase=近づくと追いかける / sleep=ねている / boss
// rare:[アイテム, 確率]  そのモンスターだけが落とす めずらしい素材
const ENEMIES = {
  // ---- 草原 ----
  nonezumi:   { name: 'ノネズミ',   shape: 'beast', element: 'none',  level: 3, base: { hp: 34, atk: 9,  def: 7, spd: 9 },  moves: ['tackle'], parts: [], ai: 'wander', speed: 28,
                drops: [['core_beast', .25], ['claw', .3], ['fur', .15], ['potion', .08]], rare: ['goldfur', .05] },
  kusabane:   { name: 'クサバネ',   shape: 'bird',  element: 'grass', level: 4, base: { hp: 28, atk: 9,  def: 6, spd: 12 }, moves: ['peck', 'happa'], parts: ['wing'], ai: 'wander', speed: 32,
                drops: [['core_bird', .22], ['wing', .3], ['ess_grass', .12], ['potion', .06]], rare: ['windfeather', .05] },
  hanamushi:  { name: 'ハナムシ',   shape: 'beast', element: 'grass', level: 3, base: { hp: 36, atk: 8,  def: 8, spd: 6 },  moves: ['tackle', 'happa'], parts: ['vine'], ai: 'sleep', speed: 0,
                drops: [['vine', .4], ['ess_grass', .15], ['core_beast', .2]], rare: ['sweetnectar', .05] },
  // ---- 森 ----
  kawanezumi: { name: 'カワネズミ', shape: 'beast', element: 'water', level: 5, base: { hp: 34, atk: 10, def: 8, spd: 10 }, moves: ['tackle', 'mizudeppou'], parts: ['mizukaki'], ai: 'wander', speed: 30,
                drops: [['mizukaki', .4], ['core_fish', .2], ['ess_water', .15], ['core_beast', .15]], rare: ['pearl', .05] },
  hotarumoth: { name: 'ホタルガ',   shape: 'bird',  element: 'none',  level: 5, base: { hp: 30, atk: 10, def: 6, spd: 13 }, moves: ['peck', 'pikapika'], parts: ['hotaru', 'wing'], ai: 'chase', speed: 48,
                drops: [['hotaru', .4], ['wing', .2], ['core_bird', .2], ['potion', .06]], rare: ['moonstone', .05] },
  honokitsune: { name: 'ホノキツネ', shape: 'beast', element: 'fire',  level: 6, base: { hp: 36, atk: 11, def: 8, spd: 11 }, moves: ['tackle', 'hinoko', 'bite'], parts: ['fang', 'ess_fire'], ai: 'chase', speed: 50,
                drops: [['ess_fire', .3], ['fang', .3], ['core_beast', .2], ['shell', .1]], rare: ['flamecore', .05] },
  mushikabuto:{ name: 'ムシカブト', shape: 'bug',   element: 'grass', level: 6, base: bs('bug', 1.0), moves: ['ito', 'happa'], parts: ['shell'], ai: 'wander', speed: 30,
                drops: [['core_bug', .25], ['shell', .25], ['ess_grass', .15]], rare: ['kabutohorn', .05] },
  iwakoro:    { name: 'イワコロ',   shape: 'golem', element: 'earth', level: 6, base: bs('golem', .9), moves: ['gotsun', 'suna'], parts: ['shell'], ai: 'sleep', speed: 0,
                drops: [['core_golem', .2], ['rockfist', .3], ['ess_earth', .15]], rare: ['crystal', .05] },
  // ---- 海辺 ----
  kanigolem:  { name: 'カニゴーレム', shape: 'golem', element: 'water', level: 7, base: bs('golem', .95), moves: ['gotsun', 'mizudeppou'], parts: ['shell', 'claw'], ai: 'wander', speed: 24,
                drops: [['crabclaw', .4], ['core_golem', .15], ['ess_water', .2]], rare: ['pearl', .05] },
  umidori:    { name: 'ウミドリ',   shape: 'bird',  element: 'water', level: 7, base: bs('bird', 1.05), moves: ['peck', 'mizudeppou'], parts: ['wing', 'mizukaki'], ai: 'wander', speed: 44,
                drops: [['core_bird', .2], ['wing', .25], ['ess_water', .2], ['mizukaki', .2]], rare: ['windfeather', .05] },
  sakanaman:  { name: 'サカナマン', shape: 'fish',  element: 'water', level: 8, base: bs('fish', 1.05), moves: ['tackle', 'mizudeppou', 'nami'], parts: ['mizukaki'], ai: 'wander', speed: 34,
                drops: [['core_fish', .25], ['mizukaki', .35], ['ess_water', .2]], rare: ['pearl', .06] },
  kurage:     { name: 'ヤミクラゲ', shape: 'ghost', element: 'water', level: 8, base: bs('ghost', 1.0), moves: ['obake', 'mizudeppou', 'pikapika'], parts: [], ai: 'chase', speed: 40,
                drops: [['ess_water', .3], ['hotaru', .2], ['ess_dark', .1]], rare: ['core_ghost', .03] },
  // ---- 砂漠 ----
  sasori:     { name: 'サソリン',   shape: 'bug',   element: 'earth', level: 9, base: bs('bug', 1.1), moves: ['ito', 'suna', 'bite'], parts: ['claw', 'fang'], ai: 'chase', speed: 50,
                drops: [['core_bug', .25], ['claw', .3], ['ess_earth', .25]], rare: ['fossil', .05] },
  sabotenman: { name: 'サボテンマン', shape: 'golem', element: 'grass', level: 9, base: bs('golem', 1.0), moves: ['gotsun', 'happa', 'suna'], parts: ['vine'], ai: 'sleep', speed: 0,
                drops: [['core_golem', .2], ['vine', .3], ['ess_grass', .2], ['ess_earth', .15]], rare: ['sandscale', .05] },
  sunatori:   { name: 'スナドリ',   shape: 'bird',  element: 'earth', level: 9, base: bs('bird', 1.1), moves: ['peck', 'suna', 'hayabusa'], parts: ['wing'], ai: 'wander', speed: 44,
                drops: [['core_bird', .2], ['wing', .3], ['ess_earth', .2]], rare: ['windfeather', .05] },
  sunazaurus: { name: 'スナザウルス', shape: 'dino', element: 'earth', level: 12, base: bs('dino', .95), moves: ['kamitsuki', 'suna', 'iwa', 'jishin'], parts: ['fang', 'shell'], ai: 'chase', speed: 44,
                drops: [['fang', .5], ['fossil', .3], ['ess_earth', .3], ['potion', .2]], rare: ['core_dino', .12] },
  // ---- 火山 ----
  hinotori:   { name: 'ヒノトリ',   shape: 'bird',  element: 'fire',  level: 11, base: bs('bird', 1.15), moves: ['peck', 'hinoko', 'hayabusa'], parts: ['ess_fire', 'wing'], ai: 'chase', speed: 52,
                drops: [['core_bird', .2], ['ess_fire', .35], ['wing', .25]], rare: ['flamecore', .05] },
  magmagolem: { name: 'マグマゴーレム', shape: 'golem', element: 'fire', level: 11, base: bs('golem', 1.1), moves: ['gotsun', 'hinoko', 'dosun'], parts: ['shell', 'ess_fire'], ai: 'wander', speed: 22,
                drops: [['core_golem', .2], ['lavascale', .35], ['rockfist', .25], ['ess_fire', .25]], rare: ['core_dino', .04] },
  kazanmushi: { name: 'カザンムシ', shape: 'bug',   element: 'fire',  level: 11, base: bs('bug', 1.15), moves: ['ito', 'hinoko', 'bite'], parts: ['fang'], ai: 'chase', speed: 48,
                drops: [['core_bug', .25], ['lavascale', .2], ['fang', .3], ['ess_fire', .2]], rare: ['kabutohorn', .06] },
  firesaurus: { name: 'ヒザウルス', shape: 'dino',  element: 'fire',  level: 13, base: bs('dino', 1.0), moves: ['kamitsuki', 'hinoko', 'honoo', 'bakuen'], parts: ['fang', 'ess_fire', 'shell'], ai: 'chase', speed: 46,
                drops: [['fang', .5], ['lavascale', .4], ['ess_fire', .4], ['hipotion', .15]], rare: ['core_dino', .15] },
  // ---- いせき ----
  raiju:      { name: 'ライジュウ', shape: 'beast', element: 'thunder', level: 14, base: bs('beast', 1.4), moves: ['tackle', 'biribiri', 'bite', 'kaminari'], parts: ['fang'], ai: 'chase', speed: 54,
                drops: [['core_beast', .25], ['fang', .3], ['ess_thunder', .3]], rare: ['thunderhorn', .05] },
  kaminaritori:{ name: 'カミナリドリ', shape: 'bird', element: 'thunder', level: 14, base: bs('bird', 1.4), moves: ['peck', 'biribiri', 'hayabusa'], parts: ['wing'], ai: 'chase', speed: 56,
                drops: [['core_bird', .2], ['wing', .3], ['ess_thunder', .3]], rare: ['thunderhorn', .05] },
  kageobake:  { name: 'カゲオバケ', shape: 'ghost', element: 'dark',  level: 14, base: bs('ghost', 1.3), moves: ['obake', 'kage', 'yami'], parts: [], ai: 'wander', speed: 36,
                drops: [['ess_dark', .35], ['ess_light', .15], ['hipotion', .1]], rare: ['shadowfog', .06] },
  hikarigolem:{ name: 'ヒカリゴーレム', shape: 'golem', element: 'light', level: 14, base: bs('golem', 1.25), moves: ['gotsun', 'hikari', 'dosun'], parts: ['shell'], ai: 'sleep', speed: 0,
                drops: [['core_golem', .2], ['rockfist', .3], ['ess_light', .3]], rare: ['crystal', .06] },
  kodaisaurus:{ name: 'コダイザウルス', shape: 'dino', element: 'thunder', level: 16, base: bs('dino', 1.05), moves: ['kamitsuki', 'biribiri', 'kaminari', 'jishin'], parts: ['fang', 'shell', 'ess_thunder'], ai: 'chase', speed: 48,
                drops: [['fang', .5], ['fossil', .4], ['ess_thunder', .4], ['hipotion', .2]], rare: ['core_dino', .2] },
  // ---- ボス（ぬし）----
  morinushi:  { name: 'モリヌシ',   shape: 'beast', element: 'grass', level: 9, base: { hp: 62, atk: 12, def: 11, spd: 9 }, moves: ['tackle', 'tsurumuchi', 'happa', 'dosun'], parts: ['vine', 'shell', 'ess_grass'], ai: 'boss', speed: 0,
                drops: [['shell', 1], ['core_bug', 1], ['core_dino', 1], ['potion', 2]] },
  magmadon:   { name: 'マグマドン', shape: 'dino',  element: 'fire',  level: 15, base: bs('dino', 1.1), moves: ['kamitsuki', 'honoo', 'bakuen', 'jishin'], parts: ['fang', 'shell', 'ess_fire', 'vine'], ai: 'boss', speed: 0,
                drops: [['core_dino', 1], ['flamecore', 1], ['lavascale', 2], ['hipotion', 2]] },
  gaiarex:    { name: 'ガイアレックス', shape: 'dino', element: 'earth', level: 19, base: bs('dino', 1.25), moves: ['kamitsuki', 'kamikudaki', 'jishin', 'kaminari'], parts: ['fang', 'shell', 'ess_thunder', 'ess_fire'], ai: 'boss', speed: 0,
                drops: [['core_dino', 2], ['crystal', 1], ['thunderhorn', 1], ['hipotion', 3]] },
};

// ----- 村のトレーナー（バトルすると Wポイントがもらえる）-----
const TRAINERS = {
  mina:   { name: 'ミナ',       reward: 40,  team: [['nonezumi', 3], ['kusabane', 3]], before: ['しょうぶだ！ わたしの なかまと たたかおう！'], win: ['つよいね！ また あそぼう。'], after: ['もういちど しょうぶする？'] },
  dai:    { name: 'ダイ',       reward: 60,  team: [['hanamushi', 4], ['nonezumi', 4]], before: ['ぼくの ツギハギ獣は ねぼすけだけど つよいぞ！'], win: ['まけたー！ くやしい…'], after: ['つぎは まけないぞ！'] },
  kenta:  { name: 'ケンタ',     reward: 90,  team: [['kawanezumi', 6], ['mushikabuto', 7]], before: ['かわで きたえた なかまを みせてやる！'], win: ['すごい… いい かんじに ツギハギだね。'], after: ['もう いっぺん やろうぜ。'] },
  leaf:   { name: 'リーフ',     reward: 130, team: [['hotarumoth', 7], ['iwakoro', 7], ['honokitsune', 8]], before: ['森の みちは わたしが まもる。かかってきなさい。'], win: ['…みごと。この森の ちからを つれていって。'], after: ['また しょうぶ？ いいわよ。'] },
  saki:   { name: 'サキ',       reward: 150, team: [['umidori', 8], ['sakanaman', 8]], before: ['うみの なかまは はやいわよ！'], win: ['なみに のまれた みたい…'], after: ['もう いっかい おねがい！'] },
  gen:    { name: '漁師のゲン', reward: 220, team: [['kanigolem', 9], ['sakanaman', 9], ['kurage', 9]], before: ['わしの 三匹は 海で きたえた。わかいの、いくぞ！'], win: ['がっはっは！ やるじゃねえか！'], after: ['また かかってこい！'] },
  hasan:  { name: 'ハサン',     reward: 260, team: [['sunatori', 10], ['sasori', 10]], before: ['砂漠を こえる ものは わたしの しけんを うける。'], win: ['…みとめよう。'], after: ['また ためしたいか？'] },
  jami:   { name: 'ジャミ',     reward: 340, team: [['sabotenman', 11], ['sasori', 11], ['sunatori', 11]], before: ['砂の せんしの ほこりに かけて、まけられん！'], win: ['まいった。おまえは ほんものだ。'], after: ['もう ひとたたかい、どうだ。'] },
  gou:    { name: '鍛冶屋のゴウ', reward: 400, team: [['magmagolem', 12], ['hinotori', 12]], before: ['鉄と 火で きたえた ツギハギ獣だ！ うけてみろ！'], win: ['ぐぬぬ… いいウデだ！'], after: ['火は まだ もえてるぜ。'] },
  kagutsuchi: { name: 'カグツチ', reward: 560, team: [['kazanmushi', 13], ['hinotori', 13], ['magmagolem', 13], ['firesaurus', 14]], before: ['火山の ぬしに いどむなら、まず わたしを たおせ！'], win: ['みごと…！ マグマドンに きをつけろ。'], after: ['また こい。ほのおは きえぬ。'] },
  luna:   { name: '学者のルナ', reward: 620, team: [['kageobake', 15], ['hikarigolem', 15]], before: ['この いせきの なぞを とくには ちからが いるの。'], win: ['おどろいた… あなた、ほんものね。'], after: ['もっと けんきゅうさせて！'] },
  van:    { name: '番人ヴァン', reward: 900, team: [['raiju', 16], ['kaminaritori', 16], ['kodaisaurus', 17]], before: ['ここから さきは ガイアレックスの なわばり。わたしを こえてゆけ。'], win: ['…ゆけ。そして たしかめてこい。'], after: ['いつでも あいてに なろう。'] },
};

// ----- 地域・村 -----
const REGIONS = {
  meadow:  { name: 'はじまりの草原', theme: 'meadow',  ground: 'grass',  rect: [0, 50, 52, 99], hub: [26, 75] },
  forest:  { name: 'ささやきの森',   theme: 'forest',  ground: 'forest', rect: [53, 50, 106, 99], hub: [80, 75] },
  seaside: { name: '潮風の海辺',     theme: 'sea',     ground: 'sand',   rect: [0, 0, 52, 49], hub: [30, 25] },
  desert:  { name: 'ひからびた砂漠', theme: 'desert',  ground: 'desert', rect: [107, 50, 159, 99], hub: [133, 75] },
  volcano: { name: 'ほのおの火山',   theme: 'volcano', ground: 'ash',    rect: [53, 0, 106, 49], hub: [80, 25] },
  ruins:   { name: 'いかずちの遺跡', theme: 'ruins',   ground: 'ruin',   rect: [107, 0, 159, 49], hub: [133, 25] },
};
const REGION_KEYS = Object.keys(REGIONS);

// 野生モンスター：[敵ID, 重み]  elite は大型の強敵（数がすくない）
const REGION_SPAWN = {
  meadow:  { n: 26, table: [['nonezumi', 3], ['kusabane', 2], ['hanamushi', 2]] },
  forest:  { n: 30, table: [['kawanezumi', 2], ['hotarumoth', 2], ['honokitsune', 2], ['mushikabuto', 2], ['iwakoro', 2]] },
  seaside: { n: 30, table: [['kanigolem', 2], ['umidori', 2], ['sakanaman', 2], ['kurage', 2]] },
  desert:  { n: 30, table: [['sasori', 2], ['sabotenman', 2], ['sunatori', 2]], elite: ['sunazaurus', 3] },
  volcano: { n: 30, table: [['hinotori', 2], ['magmagolem', 2], ['kazanmushi', 2]], elite: ['firesaurus', 3] },
  ruins:   { n: 30, table: [['raiju', 2], ['kaminaritori', 2], ['kageobake', 2], ['hikarigolem', 2]], elite: ['kodaisaurus', 3] },
};

const LOOKS = [
  { skin: '#f6d0a8', hair: '#5a3524', top: '#4a8ad0', pants: '#3c3350' },
  { skin: '#e8b890', hair: '#2a2a3a', top: '#d0584a', pants: '#4a3a30' },
  { skin: '#f6d0a8', hair: '#d8a040', top: '#58a858', pants: '#3a4a60' },
  { skin: '#c88c64', hair: '#1a1a24', top: '#e0b040', pants: '#5a3a3a' },
  { skin: '#f2c8a0', hair: '#b04a6a', top: '#8a5ac0', pants: '#3a3a50' },
  { skin: '#e8b890', hair: '#c8c8d0', top: '#7a6a58', pants: '#3a3030' },
];
// 村：shop=ショップの品ぞろえ  npcs の dx,dy は村の中心からのずれ
const VILLAGES = [
  { id: 'v1', name: 'はじまりの村', region: 'meadow', shop: ['core_beast', 'core_bird', 'potion', 'claw', 'wing', 'fur'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: 'ミセばあ', look: 2 },
    { type: 'villager', dx: -5, dy: 0, name: 'むらの おじさん', look: 5, lines: ['ようこそ、はじまりの村へ。','この世界は いくつもの 大地に わかれておる。大地の さかいには 大きな 門があって、強い 門番が 道を ふさいでおるんじゃ。','門番を たおせば 先へ すすめる。まずは 地図(Mキー)を ひらいて、近くの 大地へ つづく 門を さがしてみなさい。'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'ミナ', look: 4, trainer: 'mina' },
    { type: 'trainer', dx: 4, dy: 2, name: 'ダイ', look: 1, trainer: 'dai' },
  ] },
  { id: 'v2', name: 'モリビトの里', region: 'forest', shop: ['core_bug', 'core_beast', 'mizukaki', 'vine', 'rockfist', 'potion', 'ess_grass'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: '森の商人', look: 3 },
    { type: 'villager', dx: -5, dy: 0, name: '森の長老', look: 5, lines: ['ここは 森の民の 里じゃ。','森から 先の 門番は もっと つよい。仲間を そだてて、レベルを あげてから いどむのじゃ。','素材を くみあわせれば、もっと つよい 仲間が つくれる。工房を うまく つかうんじゃぞ。'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'ケンタ', look: 0, trainer: 'kenta' },
    { type: 'trainer', dx: 4, dy: 2, name: 'リーフ', look: 2, trainer: 'leaf' },
  ] },
  { id: 'v3', name: '潮風の港町', region: 'seaside', shop: ['core_fish', 'core_bird', 'mizukaki', 'crabclaw', 'ess_water', 'potion'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: '港の おかみ', look: 4 },
    { type: 'villager', dx: -5, dy: 0, name: '船乗り', look: 3, lines: ['うみの モンスターは みず属性だ。','くさ や かみなりが 効くぞ。','門番に まけても 大丈夫。キャンプに もどされるだけだ。つよくなって また 挑め！'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'サキ', look: 4, trainer: 'saki' },
    { type: 'trainer', dx: 4, dy: 2, name: '漁師のゲン', look: 5, trainer: 'gen' },
  ] },
  { id: 'v4', name: 'オアシスの町', region: 'desert', shop: ['core_bug', 'core_golem', 'shell', 'ess_grass', 'wing', 'potion', 'hipotion'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: '砂漠の商人', look: 3 },
    { type: 'villager', dx: -5, dy: 0, name: '旅の学者', look: 5, lines: ['砂漠には ときどき 巨大な「ザウルス」が あらわれる。', 'ちゅうい しなさい。たおせば「きょうりゅうの核」が てに はいるかもしれん。', 'かくは とても つよい ツギハギ獣に なれるぞ。'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'ハサン', look: 3, trainer: 'hasan' },
    { type: 'trainer', dx: 4, dy: 2, name: 'ジャミ', look: 1, trainer: 'jami' },
  ] },
  { id: 'v5', name: 'カジの村', region: 'volcano', shop: ['core_golem', 'ess_fire', 'fang', 'shell', 'rockfist', 'hipotion'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: '鍛冶屋の おやじ', look: 1 },
    { type: 'villager', dx: -5, dy: 0, name: '村の おばば', look: 5, lines: ['この 火山の ぬしは マグマドン。','ほのおの ぬしには みず属性が よく きくよ。','門番に まけた ときは、なかまの そだてなおしと 素材の くみあわせを みなおすんじゃ。'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'ゴウ', look: 1, trainer: 'gou' },
    { type: 'trainer', dx: 4, dy: 2, name: 'カグツチ', look: 4, trainer: 'kagutsuchi' },
  ] },
  { id: 'v6', name: 'いせきの野営地', region: 'ruins', shop: ['core_golem', 'core_bird', 'hipotion', 'claw', 'fang', 'ess_grass'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: '遺跡の行商人', look: 2 },
    { type: 'villager', dx: -5, dy: 0, name: '調査隊長', look: 0, lines: ['この 遺跡の おくに「ガイアレックス」が ねむっている。', 'つち属性の さいきょうの ぬしだ。くさ属性か みず属性なら いい しょうぶに なる。', '無事に もどれたら おれたちに はなしを きかせてくれ！'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'ルナ', look: 4, trainer: 'luna' },
    { type: 'trainer', dx: 4, dy: 2, name: 'ヴァン', look: 5, trainer: 'van' },
  ] },
];
