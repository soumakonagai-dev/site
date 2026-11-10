'use strict';
// ===== 素材ふたつで つく とくべつな技 =====
// COMBOS のキーは「素材A+素材B」（名前順にならべたもの）。つくる時に ふたつとも入れると、その技がおぼえられる。
// 技の追加フィールド：drain=あたえたダメージの割合だけ回復  hits=連続で当たる回数
const COMBO_MOVES = {
  kogoekaze:   { name: 'こごえるかぜ',     power: 95, en: 3, element: 'ice', chill: .5, fx: 'breath', desc: 'こおりと かぜの ふぶき。' },
  honootsumuji:{ name: 'ほのおのつむじ',   power: 95, en: 3, element: 'fire', burn: .5, fx: 'swirl', desc: 'ほのおの うずで やきつくす。' },
  yamidoku:    { name: 'やみのどく',       power: 80, en: 2, element: 'dark', poison: .6, fx: 'swirl', desc: 'かげに まぎれた どく。' },
  denjihou:    { name: 'でんじほう',       power: 100, en: 3, element: 'thunder', fx: 'beam', big: true, desc: 'はがねの 砲身から いなずま。' },
  magmapunch:  { name: 'マグマパンチ',     power: 90, en: 3, element: 'fire', burn: .4, fx: 'impact', big: true, desc: 'あつい こぶしで なぐる。' },
  tsukinoshizuku: { name: 'つきのしずく',  power: 0, en: 2, element: 'light', heal: .6, fx: 'heal', desc: 'HPを おおきく かいふく。' },
  drainkiss:   { name: 'ドレインキッス',   power: 60, en: 2, element: 'grass', drain: .5, fx: 'whip', desc: 'あたえたダメージの はんぶんを すいとる。' },
  dokunokiba:  { name: 'どくのきば',       power: 75, en: 2, element: 'poison', poison: .5, fx: 'slash', desc: 'どくを おくりこむ きば。' },
  hikariyami:  { name: 'ひかりとやみ',     power: 110, en: 4, element: 'light', fx: 'beam', big: true, desc: 'あいはんする ちからが ぶつかる。' },
  hyakuretsu:  { name: 'ひゃくれつひっかき', power: 28, en: 2, element: 'none', hits: 3, fx: 'slash', desc: '3かい れんぞくで ひっかく。' },
  hasamiuchi:  { name: 'はさみうち',       power: 48, en: 2, element: 'water', hits: 2, fx: 'slash', desc: '2かい れんぞくで はさむ。' },
  tairyuu:     { name: 'たいりゅう',       power: 90, en: 3, element: 'water', fx: 'wave', big: true, desc: 'おおきな ながれに のみこむ。' },
  togenoarashi:{ name: 'とげのあらし',     power: 20, en: 2, element: 'none', hits: 4, fx: 'proj', desc: '4かい れんぞくで とげを とばす。' },
  sonicdive:   { name: 'ソニックダイブ',   power: 70, en: 2, element: 'wind', priority: 1, fx: 'impact', desc: 'さきに ちょうそくで つっこむ。' },
  prism:       { name: 'プリズムレーザー', power: 100, en: 3, element: 'light', fx: 'beam', big: true, desc: 'にじいろの こうせん。' },
  ryuunoikazuchi: { name: 'りゅうのいかずち', power: 115, en: 4, element: 'thunder', fx: 'bolt', big: true, desc: 'りゅうが よぶ いかずち。' },
  bodypress:   { name: 'ボディプレス',     power: 105, en: 3, element: 'none', fx: 'quake', big: true, desc: 'きょたいで おしつぶす。' },
  holylance:   { name: 'ホーリーランス',   power: 95, en: 3, element: 'light', fx: 'slash', big: true, desc: 'せいなる 角で つらぬく。' },
  dokushokushu:{ name: 'どくのしょくしゅ', power: 70, en: 2, element: 'poison', poison: .5, fx: 'whip', desc: 'どくの ぬめりを まとった しょくしゅ。' },
  norowaremanazashi: { name: 'のろいのまなざし', power: 85, en: 3, element: 'dark', fx: 'swirl', big: true, desc: 'みつめた あいてを のろう。' },
  yougyoku:    { name: 'ようきゅうのたま', power: 105, en: 4, element: 'fire', burn: .3, chill: .3, fx: 'explosion', big: true, desc: 'ほのおと こおりが ばくはつ。' },
  missile:     { name: 'ミサイルのあめ',   power: 35, en: 3, element: 'steel', hits: 3, fx: 'proj', desc: '3かい れんぞくで ミサイル。' },
  bubblebeam:  { name: 'バブルこうせん',   power: 25, en: 2, element: 'water', hits: 3, fx: 'proj', desc: '3かい れんぞくで あわを とばす。' },
  goldrush:    { name: 'ゴールドラッシュ', power: 100, en: 3, element: 'none', fx: 'impact', big: true, desc: 'きんぴかの つきすすみ。' },
  furusuna:    { name: 'ふるきすなあらし', power: 90, en: 3, element: 'earth', fx: 'rocks', desc: 'いにしえの すなが まいあがる。' },
};
Object.assign(MOVES, COMBO_MOVES);

const comboKey = (a, b) => [a, b].sort().join('+');
const COMBOS = {};
[
  ['icicle', 'windwing', 'kogoekaze'], ['flametail', 'windwing', 'honootsumuji'], ['toxinfang', 'shadowfog', 'yamidoku'],
  ['ironplate', 'thunderhorn', 'denjihou'], ['lavascale', 'rockfist', 'magmapunch'], ['pearl', 'moonstone', 'tsukinoshizuku'],
  ['vine', 'sweetnectar', 'drainkiss'], ['fang', 'venomsac', 'dokunokiba'], ['halo', 'shadowaura', 'hikariyami'],
  ['claw', 'claw', 'hyakuretsu'], ['crabclaw', 'crabclaw', 'hasamiuchi'], ['fishtail', 'mizukaki', 'tairyuu'],
  ['spikes', 'spikes', 'togenoarashi'], ['windfeather', 'wing', 'sonicdive'], ['gem', 'crystal', 'prism'],
  ['thunderwing', 'dragonwing', 'ryuunoikazuchi'], ['giant', 'armor', 'bodypress'], ['antler', 'unihorn', 'holylance'],
  ['tentacle', 'venomsac', 'dokushokushu'], ['eyes3', 'mask', 'norowaremanazashi'], ['fireorbs', 'iceorbs', 'yougyoku'],
  ['mechawing', 'visor', 'missile'], ['bubble', 'pearl', 'bubblebeam'], ['goldfur', 'goldscale', 'goldrush'],
  ['sandscale', 'fossil', 'furusuna'],
].forEach(([a, b, m]) => { COMBOS[comboKey(a, b)] = m; });

// 素材リストの中で ふたつ組み合わさっている とくべつ技（重なりなし・出てきた順）
function comboMovesOf(partIds) {
  const out = [], pool = partIds.slice();
  for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) {
    const m = COMBOS[comboKey(pool[i], pool[j])];
    if (m && !out.includes(m)) out.push(m);
  }
  return out;
}
