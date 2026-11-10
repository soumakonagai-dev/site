'use strict';
// ===== データ追加：核（種族）・素材・技・レシピ・敵 =====
// 素材の見た目（羽・角・しっぽ・よろい…）は js/look.js の LOOK に、素材IDと同じ名前で定義してある。

// ---------- 技 ----------
Object.assign(MOVES, {
  tsuno:    { name: 'つのでつく',   power: 65, en: 1, element: 'none', fx: 'impact' },
  toge:     { name: 'とげとげ',     power: 62, en: 1, element: 'none', fx: 'whip' },
  nebaneba: { name: 'ねばねば',     power: 40, en: 0, element: 'none', fx: 'whip' },
  hane:     { name: 'とびはねる',   power: 42, en: 0, element: 'none', fx: 'impact' },
  hoshi:    { name: 'ほうし',       power: 40, en: 0, element: 'grass', fx: 'proj' },
  sumi:     { name: 'すみふき',     power: 44, en: 0, element: 'dark', fx: 'swirl' },
});

// ---------- 種族（核）----------
Object.assign(SPECIES, {
  slime:    { name: 'スライム型',   short: 'スライム', hp: 46, atk: 8,  def: 7,  spd: 6,  basic: 'nebaneba', element: 'none' },
  rabbit:   { name: 'うさぎ型',     short: 'ウサギ',   hp: 32, atk: 9,  def: 6,  spd: 15, basic: 'hane',     element: 'none' },
  plant:    { name: 'くさばな型',   short: 'ハナ',     hp: 42, atk: 9,  def: 9,  spd: 6,  basic: 'tackle',   element: 'grass' },
  mushroom: { name: 'きのこ型',     short: 'キノコ',   hp: 38, atk: 8,  def: 10, spd: 7,  basic: 'hoshi',    element: 'grass' },
  snake:    { name: 'へび型',       short: 'ヘビ',     hp: 33, atk: 12, def: 7,  spd: 12, basic: 'kamitsuki', element: 'none' },
  turtle:   { name: 'かめ型',       short: 'カメ',     hp: 46, atk: 9,  def: 15, spd: 4,  basic: 'gotsun',   element: 'water' },
  octopus:  { name: 'たこ型',       short: 'タコ',     hp: 38, atk: 11, def: 8,  spd: 9,  basic: 'sumi',     element: 'water' },
  bat:      { name: 'こうもり型',   short: 'コウモリ', hp: 30, atk: 10, def: 6,  spd: 15, basic: 'obake',    element: 'dark' },
  dragon:   { name: 'ドラゴン型',   short: 'ドラゴン', hp: 52, atk: 16, def: 12, spd: 12, basic: 'kamitsuki', element: 'none' },
  robot:    { name: 'ロボ型',       short: 'ロボ',     hp: 44, atk: 13, def: 14, spd: 8,  basic: 'gotsun',   element: 'none' },
});

// ---------- 核 ----------
Object.assign(ITEMS, {
  core_slime:  { name: 'スライムの核',   kind: 'core', species: 'slime',    color: '#7ad88a', price: 25, desc: 'ぷにぷにの スライム型。HPが高い。' },
  core_rabbit: { name: 'うさぎの核',     kind: 'core', species: 'rabbit',   color: '#f0d8d0', price: 30, desc: 'うさぎ型。とても すばやい。' },
  core_plant:  { name: 'くさばなの核',   kind: 'core', species: 'plant',    color: '#78c860', price: 35, desc: 'くさばな型。くさ属性。' },
  core_mush:   { name: 'きのこの核',     kind: 'core', species: 'mushroom', color: '#d86a5a', price: 35, desc: 'きのこ型。くさ属性でかたい。' },
  core_snake:  { name: 'へびの核',       kind: 'core', species: 'snake',    color: '#8a9a4a', price: 40, desc: 'へび型。こうげきが高い。' },
  core_turtle: { name: 'かめの核',       kind: 'core', species: 'turtle',   color: '#4a9a8a', price: 50, desc: 'かめ型。みず属性で とてもかたい。' },
  core_octo:   { name: 'たこの核',       kind: 'core', species: 'octopus',  color: '#d86a9a', price: 50, desc: 'たこ型。みず属性。' },
  core_bat:    { name: 'こうもりの核',   kind: 'core', species: 'bat',      color: '#6a4a8a', price: 60, rarity: 2, desc: 'こうもり型。やみ属性ですばやい。' },
  core_dragon: { name: 'りゅうの核',     kind: 'core', species: 'dragon',   color: '#c83a3a', rarity: 3, desc: 'きょうりゅうと ならぶ さいきょう クラスの ドラゴン型。' },
  core_robot:  { name: 'からくりの核',   kind: 'core', species: 'robot',    color: '#8aa0b8', rarity: 3, desc: 'ロボ型。とても かたくて こうげきも高い。' },
});

// ---------- 素材（見た目が大きく変わる）----------
Object.assign(ITEMS, {
  // 染料：からだの色が変わる
  dye_red:    { name: 'あかい染料',   kind: 'part', color: '#d84a3a', price: 15, stats: { hp: 2 }, desc: 'からだが あかく そまる。' },
  dye_blue:   { name: 'あおい染料',   kind: 'part', color: '#3a78d8', price: 15, stats: { hp: 2 }, desc: 'からだが あおく そまる。' },
  dye_green:  { name: 'みどりの染料', kind: 'part', color: '#4ab85a', price: 15, stats: { hp: 2 }, desc: 'からだが みどりに そまる。' },
  dye_purple: { name: 'むらさきの染料', kind: 'part', color: '#8a58c8', price: 15, stats: { hp: 2 }, desc: 'からだが むらさきに そまる。' },
  dye_gold:   { name: 'こがねの染料', kind: 'part', color: '#e8c040', price: 40, rarity: 2, stats: { hp: 4 }, desc: 'からだが きんいろに かがやく。' },
  // 角・耳・毛
  horn_small: { name: 'ちいさな角',   kind: 'part', color: '#f4ecd0', price: 30, stats: { atk: 2, def: 1 }, moves: ['tsuno'], desc: 'ひたいに 角が はえる。' },
  antler:     { name: 'りっぱな枝角', kind: 'part', color: '#9a6a3c', price: 55, rarity: 2, stats: { atk: 3, hp: 6 }, moves: ['tsuno', 'happa'], desc: 'えだわかれした 大きな角。' },
  bigear:     { name: 'ながいみみ',   kind: 'part', color: '#f0d8d0', price: 30, stats: { spd: 3 }, moves: ['hayabusa'], desc: 'ながい みみが はえる。SPD+3。' },
  mane:       { name: 'ふさふさのたてがみ', kind: 'part', color: '#8a5a2c', price: 35, stats: { atk: 2, hp: 5 }, moves: ['bite'], desc: 'あたまの まわりに たてがみ。' },
  // 翼・しっぽ
  batwing:    { name: 'こうもりの翼', kind: 'part', color: '#51396e', price: 40, stats: { spd: 3 }, ability: 'fly', moves: ['kage'], desc: 'こうもりの つばさ。「とぶ」ちから。' },
  fairywing:  { name: 'ようせいのはね', kind: 'part', color: '#d8f0ff', price: 70, rarity: 2, element: 'light', stats: { spd: 3, hp: 4 }, ability: 'fly', moves: ['hikari'], desc: 'すきとおる はね。ひかり属性。「とぶ」ちから。' },
  flametail:  { name: 'ほのおのしっぽ', kind: 'part', color: '#ff8a3a', price: 40, element: 'fire', stats: { atk: 2 }, moves: ['hinoko'], desc: 'しっぽが もえている。ほのお属性。' },
  fishtail:   { name: 'おおきなひれ', kind: 'part', color: '#58b8e8', price: 40, element: 'water', stats: { spd: 3 }, ability: 'swim', moves: ['mizudeppou'], desc: 'おおきな ひれ。みず属性。「およぐ」ちから。' },
  tentacle:   { name: 'ぬるぬるの触手', kind: 'part', color: '#c05a8a', price: 55, rarity: 2, stats: { atk: 3 }, moves: ['sumi'], desc: 'おなかから 触手が のびる。' },
  // よろい・とげ・もよう
  armor:      { name: 'てつのよろい', kind: 'part', color: '#8a94a8', price: 45, stats: { def: 5, spd: -1 }, moves: ['dosun'], desc: 'せなかを おおう よろい。DEF+5。' },
  rockarmor:  { name: 'いわのよろい', kind: 'part', color: '#8a7a68', price: 70, rarity: 2, stats: { def: 7, spd: -2 }, ability: 'smash', moves: ['iwa'], desc: 'ごつごつの いわを まとう。「くだく」ちから。' },
  spikes:     { name: 'するどいとげ', kind: 'part', color: '#e8e4d0', price: 35, stats: { atk: 3, def: 1 }, moves: ['toge'], desc: 'せなかに とげが ならぶ。' },
  stripes:    { name: 'しまもよう',   kind: 'part', color: '#d8a040', price: 25, stats: { spd: 2, atk: 1 }, moves: ['hayabusa'], desc: 'からだに しまもよう。' },
  spots:      { name: 'みずたまもよう', kind: 'part', color: '#f0d0e0', price: 25, stats: { hp: 6 }, moves: ['iyashi'], desc: 'からだに みずたまもよう。' },
  // 顔まわり・頭
  eyes3:      { name: 'みっつめの目', kind: 'part', color: '#a060e0', price: 60, rarity: 2, stats: { atk: 2, spd: 2 }, ability: 'light', moves: ['pikapika'], desc: 'ひたいに ひかる 3つめの目。' },
  gem:        { name: 'ひたいの宝石', kind: 'part', color: '#60d8e8', price: 65, rarity: 2, element: 'light', stats: { def: 3, atk: 2 }, moves: ['hikari'], desc: 'あたまに 宝石。ひかり属性。' },
  mushcap:    { name: 'きのこのかさ', kind: 'part', color: '#d84a4a', price: 30, element: 'grass', stats: { hp: 6, def: 1 }, moves: ['hoshi'], desc: 'あたまに きのこの かさ。' },
  petal:      { name: 'はなびらのえり', kind: 'part', color: '#ff9ac0', price: 50, rarity: 2, element: 'grass', stats: { hp: 8 }, moves: ['iyashi'], desc: 'くびに はなびらの えり。' },
  // 体の大きさ
  giant:      { name: 'きょだい化の実', kind: 'part', color: '#e8a050', price: 80, rarity: 2, stats: { hp: 20, atk: 2, spd: -3 }, moves: ['dosun'], desc: 'たべると からだが とても おおきくなる。' },
  tiny:       { name: 'ちいさくなる実', kind: 'part', color: '#a0d070', price: 70, rarity: 2, stats: { spd: 4, def: -1 }, moves: ['hayabusa'], desc: 'たべると からだが ちいさく すばしこくなる。' },
  // ---- レア ----
  flamemane:  { name: 'ほのおのたてがみ', kind: 'part', color: '#ff6a2a', rarity: 3, element: 'fire', stats: { atk: 7, hp: 6 }, moves: ['honoo'], desc: 'あたまが ほのおの たてがみに。' },
  thunderwing:{ name: 'かみなりのつばさ', kind: 'part', color: '#ffe84a', rarity: 3, element: 'thunder', stats: { spd: 7, atk: 3 }, ability: 'fly', moves: ['kaminari'], desc: 'いなずまの つばさ。「とぶ」ちから。' },
  dragonwing: { name: 'りゅうの翼',   kind: 'part', color: '#b03a2a', rarity: 3, stats: { atk: 5, spd: 5 }, ability: 'fly', moves: ['honoo', 'hayabusa'], desc: '大きな りゅうの つばさ。「とぶ」ちから。' },
  crown:      { name: 'まおうのかんむり', kind: 'part', color: '#f2cf5a', rarity: 3, stats: { atk: 3, def: 3, spd: 3, hp: 8 }, moves: ['kagayaki'], desc: 'かぶると おうさまの ふうかく。ぜんぶの ステータスが あがる。' },
  halo:       { name: 'てんしのわ',   kind: 'part', color: '#fff3a0', rarity: 3, element: 'light', stats: { hp: 14, def: 3 }, moves: ['iyashi', 'kagayaki'], desc: 'あたまの うえに ひかりの わ。' },
  shadowaura: { name: 'やみのオーラ', kind: 'part', color: '#7a4ac8', rarity: 3, element: 'dark', stats: { atk: 5, spd: 4 }, moves: ['yami'], desc: 'からだから やみの オーラが もれる。' },
  goldscale:  { name: 'こがねのうろこ', kind: 'part', color: '#f2cf5a', rarity: 3, stats: { def: 5, atk: 5 }, moves: ['kamikudaki'], desc: 'ぜんしんが きんいろの うろこに。' },
});
for (const id in ITEMS) ITEMS[id].rarity = ITEMS[id].rarity || 1;

// ---------- レシピ ----------
RECIPES.push(
  { id: 'honoodra', name: 'ホノオノドラゴン', core: 'core_dragon', parts: ['dragonwing', 'flamecore'], element: 'fire', moves: ['bakuen', 'honoo', 'kamikudaki'], abilities: ['fly', 'heat'], factor: 1.4, hint: 'りゅうの核に りゅうの翼と ほのおの心。' },
  { id: 'raijindra', name: 'ライジンドラゴン', core: 'core_dragon', parts: ['thunderwing', 'ess_thunder'], element: 'thunder', moves: ['kaminari', 'biribiri', 'kamikudaki'], abilities: ['fly'], factor: 1.4, hint: 'りゅうの核に かみなりのつばさと 雷のかけら。' },
  { id: 'holyslime', name: 'ホーリースライム', core: 'core_slime', parts: ['gem', 'ess_light'], element: 'light', moves: ['hikari', 'iyashi'], abilities: [], factor: 1.25, hint: 'スライムの核に 宝石と 光のかけら。' },
  { id: 'flowern', name: 'フラワーン', core: 'core_plant', parts: ['petal', 'ess_grass'], element: 'grass', moves: ['happa', 'iyashi', 'tsurumuchi'], abilities: [], factor: 1.25, hint: 'くさばなの核に はなびらと 草のしずく。' },
  { id: 'kingmush', name: 'キングマッシュ', core: 'core_mush', parts: ['mushcap', 'sweetnectar'], element: 'grass', moves: ['hoshi', 'iyashi', 'happa'], abilities: [], factor: 1.25, hint: 'きのこの核に きのこのかさと あまい蜜。' },
  { id: 'tidal', name: 'タイダルオクト', core: 'core_octo', parts: ['tentacle', 'pearl'], element: 'water', moves: ['nami', 'sumi', 'mizudeppou'], abilities: ['swim'], factor: 1.3, hint: 'たこの核に 触手と しんじゅ。' },
  { id: 'tetsukame', name: 'テツノカメ', core: 'core_turtle', parts: ['armor', 'rockarmor'], element: 'earth', moves: ['jishin', 'dosun', 'iwa'], abilities: ['smash'], factor: 1.3, hint: 'かめの核に てつのよろいと いわのよろい。' },
  { id: 'yamibat', name: 'ヤミノコウモリ', core: 'core_bat', parts: ['shadowaura', 'batwing'], element: 'dark', moves: ['yami', 'kage'], abilities: ['fly'], factor: 1.3, hint: 'こうもりの核に やみのオーラと こうもりの翼。' },
  { id: 'robokin', name: 'ロボキング', core: 'core_robot', parts: ['armor', 'gem'], element: 'none', moves: ['kagayaki', 'hikari', 'dosun'], abilities: [], factor: 1.35, hint: 'からくりの核に てつのよろいと 宝石。' },
  { id: 'moonrabbit', name: 'ムーンラビット', core: 'core_rabbit', parts: ['moonstone', 'bigear'], element: 'light', moves: ['hikari', 'hayabusa'], abilities: [], factor: 1.25, hint: 'うさぎの核に 月の石と ながいみみ。' },
  { id: 'viper', name: 'バイパー', core: 'core_snake', parts: ['stripes', 'spikes'], element: 'none', moves: ['toge', 'kamitsuki', 'hayabusa'], abilities: [], factor: 1.25, hint: 'へびの核に しまもようと とげ。' },
  { id: 'lionbeast', name: 'ライオネル', core: 'core_beast', parts: ['mane', 'horn_small'], element: 'none', moves: ['tsuno', 'bite'], abilities: [], factor: 1.2, hint: 'けものの核に たてがみと ちいさな角。' },
);

// ---------- 敵 ----------
Object.assign(ENEMIES, {
  usagi:     { name: 'ノウサギ', shape: 'rabbit', element: 'none', level: 3, base: bs('rabbit', 1), moves: ['hane', 'tackle'], parts: ['bigear'], ai: 'wander', speed: 40,
               drops: [['core_rabbit', .25], ['bigear', .3], ['fur', .15], ['potion', .06]], rare: ['tiny', .04] },
  slimey:    { name: 'グリーンスライム', shape: 'slime', element: 'grass', level: 3, base: bs('slime', 1), moves: ['nebaneba', 'happa'], parts: ['dye_green'], ai: 'wander', speed: 20,
               drops: [['core_slime', .3], ['dye_green', .2], ['ess_grass', .1]], rare: ['sweetnectar', .04] },
  kinoko:    { name: 'ドクキノコ', shape: 'mushroom', element: 'grass', level: 6, base: bs('mushroom', 1.05), moves: ['hoshi', 'happa'], parts: ['mushcap'], ai: 'sleep', speed: 0,
               drops: [['core_mush', .25], ['mushcap', .3], ['ess_grass', .15]], rare: ['petal', .05] },
  hebi:      { name: 'モリヘビ', shape: 'snake', element: 'grass', level: 6, base: bs('snake', 1.05), moves: ['kamitsuki', 'happa'], parts: ['stripes'], ai: 'chase', speed: 46,
               drops: [['core_snake', .25], ['stripes', .25], ['fang', .15]], rare: ['antler', .04] },
  tako:      { name: 'ウミタコ', shape: 'octopus', element: 'water', level: 8, base: bs('octopus', 1.05), moves: ['sumi', 'mizudeppou'], parts: ['tentacle'], ai: 'wander', speed: 26,
               drops: [['core_octo', .25], ['tentacle', .15], ['ess_water', .2]], rare: ['pearl', .05] },
  kame:      { name: 'イシガメ', shape: 'turtle', element: 'water', level: 7, base: bs('turtle', 1), moves: ['gotsun', 'mizudeppou'], parts: ['armor'], ai: 'wander', speed: 18,
               drops: [['core_turtle', .25], ['armor', .2], ['shell', .2]], rare: ['rockarmor', .05] },
  sunahebi:  { name: 'スナヘビ', shape: 'snake', element: 'earth', level: 10, base: bs('snake', 1.15), moves: ['kamitsuki', 'suna', 'iwa'], parts: ['stripes', 'spikes'], ai: 'chase', speed: 50,
               drops: [['core_snake', .25], ['spikes', .2], ['ess_earth', .2]], rare: ['sandscale', .05] },
  magmaslime:{ name: 'マグマスライム', shape: 'slime', element: 'fire', level: 11, base: bs('slime', 1.2), moves: ['nebaneba', 'hinoko'], parts: ['dye_red'], ai: 'wander', speed: 22,
               drops: [['core_slime', .25], ['dye_red', .2], ['ess_fire', .2]], rare: ['flamemane', .04] },
  hiryuu:    { name: 'ヒリュウ', shape: 'dragon', element: 'fire', level: 13, base: bs('dragon', 1.0), moves: ['kamitsuki', 'hinoko', 'honoo', 'bakuen'], parts: ['dragonwing', 'ess_fire'], ai: 'chase', speed: 50,
               drops: [['lavascale', .3], ['ess_fire', .3], ['flametail', .2], ['hipotion', .12]], rare: ['core_dragon', .12] },
  koumori:   { name: 'ヤミコウモリ', shape: 'bat', element: 'dark', level: 14, base: bs('bat', 1.3), moves: ['obake', 'kage', 'yami'], parts: ['batwing'], ai: 'chase', speed: 54,
               drops: [['core_bat', .2], ['batwing', .3], ['ess_dark', .25]], rare: ['shadowaura', .05] },
  guardian:  { name: 'ガーディアン', shape: 'robot', element: 'light', level: 15, base: bs('robot', 1.25), moves: ['gotsun', 'hikari', 'dosun'], parts: ['armor', 'gem'], ai: 'sleep', speed: 0,
               drops: [['rockfist', .3], ['armor', .25], ['ess_light', .25], ['hipotion', .1]], rare: ['core_robot', .12] },
});

// 既存の敵に、新しい素材をおとさせる
const addDrops = (e, list) => { ENEMIES[e].drops.push(...list); };
const addRare = (e, r) => { const d = ENEMIES[e]; d.rares = (d.rares || (d.rare ? [d.rare] : [])).concat([r]); };
addDrops('nonezumi', [['bigear', .18], ['stripes', .15], ['dye_red', .1]]);
addDrops('kusabane', [['spots', .15], ['dye_green', .12]]);
addDrops('hanamushi', [['mushcap', .2], ['dye_green', .1]]);
addDrops('kawanezumi', [['fishtail', .2], ['dye_blue', .12]]);
addDrops('hotarumoth', [['batwing', .15], ['dye_purple', .1]]);
addDrops('honokitsune', [['flametail', .25], ['mane', .15], ['dye_red', .12]]);
addDrops('mushikabuto', [['horn_small', .2], ['spikes', .15]]);
addDrops('iwakoro', [['armor', .15]]);
addDrops('kanigolem', [['armor', .15], ['spikes', .1]]);
addDrops('umidori', [['fishtail', .1], ['dye_blue', .1]]);
addDrops('sakanaman', [['fishtail', .2], ['spots', .1]]);
addDrops('kurage', [['dye_purple', .12]]);
addDrops('sasori', [['spikes', .2], ['stripes', .15]]);
addDrops('sabotenman', [['spikes', .25]]);
addDrops('sunatori', [['stripes', .15], ['bigear', .1]]);
addDrops('sunazaurus', [['dye_gold', .08]]);
addDrops('hinotori', [['flametail', .2], ['dye_red', .15]]);
addDrops('magmagolem', [['armor', .15]]);
addDrops('kazanmushi', [['horn_small', .2], ['spikes', .15]]);
addDrops('firesaurus', [['dye_gold', .1]]);
addDrops('raiju', [['mane', .2], ['stripes', .15]]);
addDrops('kaminaritori', [['dye_gold', .06]]);
addDrops('kageobake', [['dye_purple', .15]]);
addDrops('hikarigolem', [['armor', .15]]);
addDrops('kodaisaurus', [['dye_gold', .1]]);
// レア（1種類の敵が複数のレアを持てる）
addRare('kusabane', ['fairywing', .05]);
addRare('hotarumoth', ['fairywing', .04]);
addRare('mushikabuto', ['giant', .05]);
addRare('kawanezumi', ['tiny', .05]);
addRare('hanamushi', ['petal', .04]);
addRare('nonezumi', ['dye_gold', .03]);
addRare('raiju', ['antler', .06]);
addRare('hinotori', ['flamemane', .04]);
addRare('kaminaritori', ['thunderwing', .05]);
addRare('kageobake', ['eyes3', .06]);
addRare('kageobake', ['shadowaura', .04]);
addRare('hikarigolem', ['halo', .04]);
addRare('hikarigolem', ['gem', .08]);
addRare('sunazaurus', ['goldscale', .05]);
addRare('firesaurus', ['goldscale', .05]);
addRare('firesaurus', ['dragonwing', .04]);
addRare('kodaisaurus', ['thunderwing', .06]);
addRare('kazanmushi', ['kabutohorn', .06]);
addRare('kurage', ['tentacle', .08]);
addRare('tako', ['tentacle', .1]);
addRare('sasori', ['eyes3', .04]);
// ボスの確定ドロップ
ENEMIES.morinushi.drops.push(['antler', 1]);
ENEMIES.magmadon.drops.push(['dragonwing', 1]);
ENEMIES.gaiarex.drops.push(['crown', 1], ['halo', 1]);

// 出現するモンスター
const addSpawn = (r, list) => { REGION_SPAWN[r].table.push(...list); REGION_SPAWN[r].n += 6; };
addSpawn('meadow', [['usagi', 3], ['slimey', 2]]);
addSpawn('forest', [['kinoko', 2], ['hebi', 2]]);
addSpawn('seaside', [['tako', 2], ['kame', 2]]);
addSpawn('desert', [['sunahebi', 2]]);
addSpawn('volcano', [['magmaslime', 2], ['hiryuu', 1]]);
addSpawn('ruins', [['koumori', 2], ['guardian', 2]]);

// ショップに ふつうの核・素材をふやす
const shopAdd = (id, list) => { VILLAGES.find(v => v.id === id).shop.push(...list); };
shopAdd('v1', ['core_slime', 'core_rabbit', 'dye_red', 'bigear', 'stripes']);
shopAdd('v2', ['core_plant', 'core_mush', 'core_snake', 'horn_small', 'mushcap', 'dye_green', 'mane']);
shopAdd('v3', ['core_turtle', 'core_octo', 'fishtail', 'dye_blue', 'spots', 'armor']);
shopAdd('v4', ['core_snake', 'stripes', 'spikes', 'dye_gold', 'tiny']);
shopAdd('v5', ['flametail', 'mane', 'horn_small', 'dye_red', 'giant', 'armor']);
shopAdd('v6', ['core_bat', 'batwing', 'dye_purple', 'gem', 'eyes3', 'fairywing']);

// 複合タイプの敵
const dual = { kurage: 'dark', magmagolem: 'earth', firesaurus: 'earth', sunazaurus: 'fire', kodaisaurus: 'earth', kinoko: 'dark', sabotenman: 'earth', hiryuu: 'thunder', koumori: 'thunder', raiju: 'light', kaminaritori: 'light', hikarigolem: 'earth', kame: 'earth', tako: 'dark', hebi: 'dark', sunahebi: 'dark', mushikabuto: 'earth', magmadon: 'earth', gaiarex: 'thunder', guardian: 'thunder' };
for (const k in dual) ENEMIES[k].element2 = dual[k];
