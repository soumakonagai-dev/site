'use strict';
// ===== データ追加その3：新タイプ（こおり・どく・はがね・かぜ）と新バイオーム4つ =====
// 相性は STRONG[こうげき側] = [つよい相手…]。あいてが こうげき側に強ければ 0.75倍
Object.assign(ELEMENTS, {
  ice:    { name: 'こおり', color: '#8fdcf0' },
  poison: { name: 'どく',   color: '#a050c0' },
  steel:  { name: 'はがね', color: '#9aa8b8' },
  wind:   { name: 'かぜ',   color: '#a8e8d0' },
});
Object.assign(ELEM_PREFIX, { ice: 'コオリ', poison: 'ドク', steel: 'ハガネ', wind: 'カゼ' });
const STRONG = {
  fire: ['grass', 'ice', 'steel'], water: ['fire', 'earth'], grass: ['water', 'earth'], earth: ['thunder', 'fire', 'poison', 'steel'],
  thunder: ['water', 'wind'], ice: ['grass', 'earth', 'wind'], wind: ['grass', 'poison'], poison: ['grass', 'light'], steel: ['ice', 'light'],
  light: ['dark'], dark: ['light', 'wind'],
};

// ---------- 技 ----------
Object.assign(MOVES, {
  kori:      { name: 'こおりのつぶて', power: 55, en: 1, element: 'ice', chill: .25, fx: 'proj' },
  tsurara:   { name: 'つららおとし',   power: 72, en: 2, element: 'ice', chill: .2, fx: 'proj' },
  fubuki:    { name: 'ふぶき',         power: 90, en: 3, element: 'ice', chill: .4, fx: 'breath', big: true },
  doku:      { name: 'どくのきり',     power: 52, en: 1, element: 'poison', poison: .3, fx: 'swirl' },
  dokubari:  { name: 'どくばり',       power: 60, en: 1, element: 'poison', poison: .3, fx: 'proj' },
  hedoro:    { name: 'ヘドロばくだん', power: 90, en: 3, element: 'poison', poison: .4, fx: 'swirl', big: true },
  tekken:    { name: 'てっけん',       power: 62, en: 1, element: 'steel', fx: 'slash' },
  metal:     { name: 'メタルクロー',   power: 76, en: 2, element: 'steel', fx: 'slash' },
  cannon:    { name: 'ラスターキャノン', power: 94, en: 3, element: 'steel', fx: 'beam', big: true },
  kamaitachi:{ name: 'かまいたち',     power: 55, en: 1, element: 'wind', fx: 'slash' },
  tsumuji:   { name: 'つむじかぜ',     power: 68, en: 2, element: 'wind', fx: 'swirl' },
  tatsumaki: { name: 'たつまき',       power: 94, en: 3, element: 'wind', fx: 'swirl', big: true },
});

// ---------- 素材 ----------
Object.assign(ITEMS, {
  ess_ice:    { name: '氷のしずく',   kind: 'essence', color: '#9fe4f8', price: 40, element: 'ice',    stats: { def: 1 }, moves: ['kori'],     desc: 'こおり属性を つよくする。' },
  ess_poison: { name: '毒のしずく',   kind: 'essence', color: '#b068d0', price: 40, element: 'poison', stats: { atk: 1 }, moves: ['doku'],     desc: 'どく属性を つよくする。' },
  ess_steel:  { name: '鋼のかけら',   kind: 'essence', color: '#aab6c6', price: 40, element: 'steel',  stats: { def: 2 }, moves: ['tekken'],   desc: 'はがね属性を つよくする。' },
  ess_wind:   { name: '風のしずく',   kind: 'essence', color: '#b8f0dc', price: 40, element: 'wind',   stats: { spd: 2 }, moves: ['kamaitachi'], desc: 'かぜ属性を つよくする。' },
  icicle:     { name: 'つらら',       kind: 'part', color: '#bfefff', price: 40, element: 'ice', stats: { atk: 3 }, moves: ['kori'], desc: 'ひたいに こおりの 角。こおり属性。' },
  snowfur:    { name: 'ゆきのけがわ', kind: 'part', color: '#eaf6ff', price: 40, element: 'ice', stats: { hp: 8, def: 2 }, moves: ['kori'], desc: 'まっしろな 毛皮。こおり属性。' },
  venomsac:   { name: 'どくぶくろ',   kind: 'part', color: '#a070c8', price: 40, element: 'poison', stats: { hp: 4, atk: 2 }, moves: ['doku'], desc: 'からだに どくの もよう。どく属性。' },
  toxinfang:  { name: 'どくきば',     kind: 'part', color: '#c090e0', price: 45, element: 'poison', stats: { atk: 4 }, moves: ['dokubari'], desc: 'どくの きば。どく属性。' },
  ironplate:  { name: 'はがねのよろい', kind: 'part', color: '#aab4c4', price: 55, element: 'steel', stats: { def: 6, spd: -1 }, moves: ['tekken'], desc: 'ぴかぴかの はがねの よろい。' },
  steelclaw:  { name: 'はがねのつめ', kind: 'part', color: '#c4ccd8', price: 50, element: 'steel', stats: { atk: 5 }, ability: 'cut', moves: ['metal'], desc: '「きる」ちから。はがね属性。' },
  windwing:   { name: 'かぜのはね',   kind: 'part', color: '#bff0e0', price: 55, element: 'wind', stats: { spd: 5 }, ability: 'fly', moves: ['kamaitachi'], desc: 'かるい はね。「とぶ」ちから。かぜ属性。' },
  gale:       { name: 'そよかぜの玉', kind: 'part', color: '#d8fff0', price: 45, element: 'wind', stats: { spd: 3, atk: 2 }, moves: ['tsumuji'], desc: 'まわりに そよかぜ。かぜ属性。' },
  // ---- レア ----
  glacier:    { name: '氷河のかけら', kind: 'part', color: '#9fe0ff', rarity: 3, element: 'ice', stats: { atk: 7, def: 3 }, moves: ['fubuki'], desc: '万年氷の かけら。こおり属性。' },
  basilisk:   { name: 'バジリスクの牙', kind: 'part', color: '#b050e0', rarity: 3, element: 'poison', stats: { atk: 8, spd: 2 }, moves: ['hedoro'], desc: 'ふれると いのちとりの どく。' },
  adamant:    { name: 'アダマンタイト', kind: 'part', color: '#8aa0d0', rarity: 3, element: 'steel', stats: { def: 9, atk: 4 }, moves: ['cannon'], desc: 'とても かたい ふしぎな 金属。' },
  tempest:    { name: 'あらしのはね', kind: 'part', color: '#a0ffd8', rarity: 3, element: 'wind', stats: { spd: 8, atk: 3 }, ability: 'fly', moves: ['tatsumaki'], desc: 'あらしを よぶ はね。「とぶ」ちから。' },
});
for (const id in ITEMS) ITEMS[id].rarity = ITEMS[id].rarity || 1;

// ---------- バイオーム ----------
Object.assign(REGIONS, {
  snow:  { name: 'こおりの雪原',   theme: 'snow',  ground: 'snow',  rect: [160, 0, 212, 49],  hub: [186, 25] },
  swamp: { name: 'どくの沼地',     theme: 'swamp', ground: 'swamp', rect: [160, 50, 212, 99], hub: [186, 75] },
  mine:  { name: 'はがねの鉱山',   theme: 'mine',  ground: 'mine',  rect: [213, 50, 265, 99], hub: [239, 75] },
  sky:   { name: 'かぜの空島',     theme: 'sky',   ground: 'sky',   rect: [213, 0, 265, 49],  hub: [239, 25] },
});
REGION_KEYS.length = 0; REGION_KEYS.push(...Object.keys(REGIONS));

// ---------- 敵 ----------
Object.assign(ENEMIES, {
  // 雪原
  yukiusagi: { name: 'ユキウサギ', shape: 'rabbit', element: 'ice', level: 16, base: bs('rabbit', 1.5), moves: ['hane', 'kori'], parts: ['bigear', 'snowfur'], ai: 'wander', speed: 44,
    drops: [['core_rabbit', .2], ['snowfur', .3], ['ess_ice', .25]], rare: ['glacier', .04] },
  frostwolf: { name: 'フロストウルフ', shape: 'beast', element: 'ice', level: 17, base: bs('beast', 1.5), moves: ['tackle', 'kori', 'bite'], parts: ['fang', 'icicle'], ai: 'chase', speed: 52,
    drops: [['core_beast', .2], ['icicle', .3], ['ess_ice', .25]], rare: ['glacier', .05] },
  yukidaruma: { name: 'ユキダルマ', shape: 'golem', element: 'ice', element2: 'steel', level: 17, base: bs('golem', 1.35), moves: ['gotsun', 'kori', 'dosun'], parts: ['shell', 'snowfur'], ai: 'sleep', speed: 0,
    drops: [['core_golem', .2], ['snowfur', .2], ['ess_ice', .3]], rare: ['adamant', .03] },
  penguin: { name: 'コオリペンギン', shape: 'bird', element: 'ice', element2: 'water', level: 16, base: bs('bird', 1.5), moves: ['peck', 'kori', 'mizudeppou'], parts: ['fishtail'], ai: 'wander', speed: 40,
    drops: [['core_bird', .2], ['ess_ice', .2], ['fishtail', .2]], rare: ['tempest', .03] },
  icedragon: { name: 'アイスドラゴン', shape: 'dragon', element: 'ice', element2: 'wind', level: 21, base: bs('dragon', 1.2), moves: ['kamitsuki', 'kori', 'fubuki', 'tsurara'], parts: ['dragonwing', 'icicle'], ai: 'chase', speed: 48,
    drops: [['icicle', .4], ['ess_ice', .4], ['hipotion', .15]], rare: ['core_dragon', .12] },
  // 沼地
  dokuslime: { name: 'どくスライム', shape: 'slime', element: 'poison', level: 14, base: bs('slime', 1.5), moves: ['nebaneba', 'doku'], parts: ['venomsac'], ai: 'wander', speed: 20,
    drops: [['core_slime', .25], ['venomsac', .3], ['ess_poison', .25]], rare: ['basilisk', .03] },
  numahebi: { name: 'ヌマヘビ', shape: 'snake', element: 'poison', element2: 'water', level: 15, base: bs('snake', 1.45), moves: ['kamitsuki', 'dokubari', 'doku'], parts: ['toxinfang', 'stripes'], ai: 'chase', speed: 48,
    drops: [['core_snake', .25], ['toxinfang', .3], ['ess_poison', .25]], rare: ['basilisk', .04] },
  venomkinoko: { name: 'ベノムキノコ', shape: 'mushroom', element: 'poison', element2: 'grass', level: 15, base: bs('mushroom', 1.45), moves: ['hoshi', 'doku'], parts: ['mushcap', 'venomsac'], ai: 'sleep', speed: 0,
    drops: [['core_mush', .25], ['venomsac', .25], ['ess_poison', .25]], rare: ['petal', .05] },
  bogghost: { name: 'ボグゴースト', shape: 'ghost', element: 'poison', element2: 'dark', level: 16, base: bs('ghost', 1.5), moves: ['obake', 'doku', 'kage'], parts: [], ai: 'wander', speed: 36,
    drops: [['ess_poison', .3], ['ess_dark', .2]], rare: ['core_ghost', .04] },
  swampcroc: { name: 'ヌマワニ', shape: 'dino', element: 'poison', element2: 'water', level: 19, base: bs('dino', 1.1), moves: ['kamitsuki', 'dokubari', 'hedoro', 'mizudeppou'], parts: ['toxinfang', 'shell'], ai: 'chase', speed: 46,
    drops: [['toxinfang', .4], ['venomsac', .3], ['ess_poison', .4]], rare: ['core_dino', .14] },
  // 鉱山
  tetsugolem: { name: 'テツゴーレム', shape: 'golem', element: 'steel', level: 19, base: bs('golem', 1.55), moves: ['gotsun', 'tekken', 'dosun'], parts: ['ironplate'], ai: 'sleep', speed: 0,
    drops: [['core_golem', .2], ['ironplate', .3], ['ess_steel', .3]], rare: ['adamant', .04] },
  haganemushi: { name: 'ハガネムシ', shape: 'bug', element: 'steel', level: 18, base: bs('bug', 1.6), moves: ['ito', 'tekken', 'bite'], parts: ['ironplate'], ai: 'chase', speed: 50,
    drops: [['core_bug', .25], ['steelclaw', .25], ['ess_steel', .25]], rare: ['adamant', .04] },
  drillmole: { name: 'ドリルモグラ', shape: 'beast', element: 'steel', element2: 'earth', level: 18, base: bs('beast', 1.6), moves: ['tackle', 'tekken', 'suna'], parts: ['steelclaw'], ai: 'wander', speed: 40,
    drops: [['core_beast', .25], ['steelclaw', .3], ['ess_steel', .25]], rare: ['adamant', .03] },
  robosoldier: { name: 'ロボへい', shape: 'robot', element: 'steel', element2: 'thunder', level: 20, base: bs('robot', 1.4), moves: ['gotsun', 'tekken', 'metal'], parts: ['armor', 'gem'], ai: 'sleep', speed: 0,
    drops: [['ironplate', .25], ['ess_steel', .3], ['hipotion', .1]], rare: ['core_robot', .12] },
  metallizard: { name: 'メタルザウルス', shape: 'dino', element: 'steel', element2: 'earth', level: 23, base: bs('dino', 1.15), moves: ['kamitsuki', 'metal', 'cannon', 'jishin'], parts: ['ironplate', 'fang'], ai: 'chase', speed: 46,
    drops: [['ironplate', .4], ['steelclaw', .3], ['hipotion', .2]], rare: ['core_dino', .15] },
  // 空島
  fuuchou: { name: 'フウチョウ', shape: 'bird', element: 'wind', level: 20, base: bs('bird', 1.8), moves: ['peck', 'kamaitachi', 'hayabusa'], parts: ['windwing'], ai: 'wander', speed: 54,
    drops: [['core_bird', .2], ['windwing', .3], ['ess_wind', .3]], rare: ['tempest', .05] },
  kazekoumori: { name: 'カゼコウモリ', shape: 'bat', element: 'wind', element2: 'dark', level: 20, base: bs('bat', 1.7), moves: ['obake', 'kamaitachi', 'tsumuji'], parts: ['batwing'], ai: 'chase', speed: 56,
    drops: [['core_bat', .2], ['gale', .3], ['ess_wind', .3]], rare: ['tempest', .04] },
  cloudslime: { name: 'クラウドスライム', shape: 'slime', element: 'wind', level: 19, base: bs('slime', 1.8), moves: ['nebaneba', 'kamaitachi'], parts: ['gale'], ai: 'wander', speed: 24,
    drops: [['core_slime', .25], ['gale', .3], ['ess_wind', .25]], rare: ['fairywing', .06] },
  winddragon: { name: 'ウィンドドラゴン', shape: 'dragon', element: 'wind', element2: 'thunder', level: 24, base: bs('dragon', 1.25), moves: ['kamitsuki', 'kamaitachi', 'tsumuji', 'tatsumaki'], parts: ['dragonwing', 'windwing'], ai: 'chase', speed: 52,
    drops: [['windwing', .4], ['ess_wind', .4], ['hipotion', .2]], rare: ['core_dragon', .15] },
});
Object.assign(REGION_SPAWN, {
  snow:  { n: 30, table: [['yukiusagi', 3], ['frostwolf', 2], ['yukidaruma', 2], ['penguin', 2]], elite: ['icedragon', 3] },
  swamp: { n: 30, table: [['dokuslime', 3], ['numahebi', 2], ['venomkinoko', 2], ['bogghost', 2]], elite: ['swampcroc', 3] },
  mine:  { n: 30, table: [['tetsugolem', 2], ['haganemushi', 2], ['drillmole', 3], ['robosoldier', 2]], elite: ['metallizard', 3] },
  sky:   { n: 24, table: [['fuuchou', 3], ['kazekoumori', 2], ['cloudslime', 2]], elite: ['winddragon', 2] },
});

// ---------- トレーナー ----------
Object.assign(TRAINERS, {
  miyuki: { name: '雪の少女ミユキ', reward: 700,  team: [['yukiusagi', 17], ['penguin', 17]], before: ['ゆきあそび しよう！ でも しょうぶは まけないよ！'], win: ['つめたい…ううん、あつい しょうぶだったね！'], after: ['また ゆきあそび する？'] },
  hyo:    { name: 'スキーヤーヒョウ', reward: 850, team: [['frostwolf', 18], ['yukidaruma', 18], ['penguin', 18]], before: ['この雪原は おれの ゲレンデだ。かけぬけるぜ！'], win: ['すべりこみ アウト、か…！'], after: ['もう いっぽん いくか？'] },
  dokuo:  { name: '毒使いドクオ', reward: 650, team: [['dokuslime', 15], ['venomkinoko', 16], ['numahebi', 16]], before: ['ヒヒヒ…どくは じわじわ ききますよ…'], win: ['ぐぬぬ…どくけしが ほしい…'], after: ['また ためしますか…ヒヒ。'] },
  numa:   { name: '沼の魔女ヌマ', reward: 900, team: [['bogghost', 17], ['numahebi', 17], ['swampcroc', 19]], before: ['この沼に はいった ものは にがさないよ！'], win: ['…ほう。おまえ、ただ者じゃないね。'], after: ['また おいで。ぬまは まっているよ。'] },
  tetsu:  { name: '坑夫テツ', reward: 1000, team: [['haganemushi', 19], ['drillmole', 19], ['tetsugolem', 19]], before: ['鉱山の おくへ いくなら おれの ツルハシを こえてけ！'], win: ['やるじゃねえか！ いい ほりだしものだ！'], after: ['もういっちょ いくか！'] },
  gonzo:  { name: '親方ゴンゾウ', reward: 1300, team: [['robosoldier', 21], ['tetsugolem', 21], ['metallizard', 22]], before: ['わしの ロボ部隊が あいてだ。てかげん なしだぞ！'], win: ['わっはっは！ ごうかくじゃ！'], after: ['いつでも かかってこい！'] },
  fuuka:  { name: '風使いフウカ', reward: 1200, team: [['fuuchou', 21], ['kazekoumori', 21], ['cloudslime', 21]], before: ['かぜに のって あそびましょ！ ついてこれる？'], win: ['すごい…かぜより はやいのね！'], after: ['もういちど かぜを よぶわ！'] },
  sora:   { name: '空の守り人ソラ', reward: 1600, team: [['kazekoumori', 22], ['fuuchou', 22], ['winddragon', 23]], before: ['ここは 空の はて。さいごの しれんだ！'], win: ['…みごとだ。おまえは 空に みとめられた。'], after: ['いつでも あいてに なろう。'] },
});

// ---------- 村 ----------
VILLAGES.push(
  { id: 'v7', name: 'ふぶきの村', region: 'snow', shop: ['core_rabbit', 'snowfur', 'icicle', 'ess_ice', 'dye_blue', 'hipotion'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: '雪の商人', look: 2 },
    { type: 'villager', dx: -5, dy: 0, name: '雪かきの おじいさん', look: 5, lines: ['ここは ふぶきの 村じゃ。ほら、こおりの うえは つるつる すべるぞ。','こおり属性は ほのお属性が にがてじゃ。はがね属性にも よわいぞ。','空島へ つづく 門の 門番は とても つよいと きく。じゅんびを わすれずにな。'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'ミユキ', look: 4, trainer: 'miyuki' },
    { type: 'trainer', dx: 4, dy: 2, name: 'ヒョウ', look: 3, trainer: 'hyo' },
  ] },
  { id: 'v8', name: 'ぬまの集落', region: 'swamp', shop: ['core_slime', 'core_snake', 'venomsac', 'toxinfang', 'ess_poison', 'hipotion'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: '沼の商人', look: 3 },
    { type: 'villager', dx: -5, dy: 0, name: '沼地の ものしり', look: 5, lines: ['ぬまの みずは ぬかるんで あるきにくい。ゆっくり すすむんじゃ。','どく属性は はがね属性には きかん。じめんにも よわいぞ。','どくの モンスターに やられると どく状態に なる。ぜんかいふくが ええぞ。'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'ドクオ', look: 1, trainer: 'dokuo' },
    { type: 'trainer', dx: 4, dy: 2, name: 'ヌマ', look: 4, trainer: 'numa' },
  ] },
  { id: 'v9', name: 'こうざんの町', region: 'mine', shop: ['core_golem', 'ironplate', 'steelclaw', 'ess_steel', 'armor', 'hipotion'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: '鉱山の おかみ', look: 4 },
    { type: 'villager', dx: -5, dy: 0, name: '鉱山の 古株', look: 5, lines: ['この山は はがねの 宝庫じゃ。ほるほど いい 鉱石が とれる。','はがね属性は ほのお・じめんに よわい。','アダマンタイトは ここの どこかの ぬしが もっとるらしいぞ。'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'テツ', look: 1, trainer: 'tetsu' },
    { type: 'trainer', dx: 4, dy: 2, name: 'ゴンゾウ', look: 5, trainer: 'gonzo' },
  ] },
  { id: 'v10', name: 'そらの浮島', region: 'sky', shop: ['core_bird', 'core_bat', 'windwing', 'gale', 'ess_wind', 'fairywing', 'hipotion'], npcs: [
    { type: 'shop', dx: 2, dy: -2, name: '空の行商人', look: 2 },
    { type: 'villager', dx: -5, dy: 0, name: '島の ながもの', look: 5, lines: ['ここは 空に うかぶ 島じゃ。島と島は 雲の 橋で つながっておる。','かぜ属性は こおり・かみなりに よわい。','たつまきの 技は かぜ属性の きわみ。あらしのはねで おぼえられるそうじゃ。'] },
    { type: 'trainer', dx: -3, dy: 2, name: 'フウカ', look: 4, trainer: 'fuuka' },
    { type: 'trainer', dx: 4, dy: 2, name: 'ソラ', look: 0, trainer: 'sora' },
  ] },
);

// ---------- レシピ ----------
RECIPES.push(
  { id: 'hyoga', name: 'ヒョウガオオカミ', core: 'core_beast', parts: ['icicle', 'ess_ice'], element: 'ice', moves: ['kori', 'bite', 'tsurara'], abilities: [], factor: 1.25, hint: 'けものの核に つららと 氷のしずく。' },
  { id: 'blizzard', name: 'ブリザードドラゴン', core: 'core_dragon', parts: ['glacier', 'ess_ice'], element: 'ice', element2: 'wind', moves: ['fubuki', 'kamitsuki', 'tatsumaki'], abilities: [], factor: 1.4, hint: 'りゅうの核に 氷河のかけらと 氷のしずく。' },
  { id: 'dokuhebi', name: 'ドクヘビ', core: 'core_snake', parts: ['toxinfang', 'ess_poison'], element: 'poison', moves: ['dokubari', 'doku', 'kamitsuki'], abilities: [], factor: 1.25, hint: 'へびの核に どくきばと 毒のしずく。' },
  { id: 'basiliskx', name: 'バジリスク', core: 'core_snake', parts: ['basilisk', 'venomsac'], element: 'poison', element2: 'earth', moves: ['hedoro', 'dokubari', 'iwa'], abilities: [], factor: 1.35, hint: 'へびの核に バジリスクの牙と どくぶくろ。' },
  { id: 'tekkogolem', name: 'テッコウゴーレム', core: 'core_golem', parts: ['ironplate', 'ess_steel'], element: 'steel', moves: ['tekken', 'dosun', 'cannon'], abilities: ['smash'], factor: 1.3, hint: 'いしの核に はがねのよろいと 鋼のかけら。' },
  { id: 'adamantrobo', name: 'アダマンロボ', core: 'core_robot', parts: ['adamant', 'ess_steel'], element: 'steel', moves: ['cannon', 'metal', 'dosun'], abilities: [], factor: 1.4, hint: 'からくりの核に アダマンタイトと 鋼のかけら。' },
  { id: 'kazetori', name: 'カゼノトリ', core: 'core_bird', parts: ['windwing', 'ess_wind'], element: 'wind', moves: ['kamaitachi', 'hayabusa', 'tsumuji'], abilities: ['fly'], factor: 1.25, hint: 'とりの核に かぜのはねと 風のしずく。' },
  { id: 'tempestdra', name: 'テンペストドラゴン', core: 'core_dragon', parts: ['tempest', 'ess_wind'], element: 'wind', element2: 'thunder', moves: ['tatsumaki', 'kaminari', 'kamitsuki'], abilities: ['fly'], factor: 1.45, hint: 'りゅうの核に あらしのはねと 風のしずく。' },
);
