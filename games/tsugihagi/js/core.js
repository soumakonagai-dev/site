'use strict';
// ===== ゲーム状態・合成・成長・保存 =====
let S = null;       // セーブ対象の状態
let FIELD = null;   // 現在のフィールドシーン
const SAVE_KEY = 'tsugihagi_v3';

const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function elemMult(a, d) {
  if ((STRONG[a] || []).includes(d)) return 1.5;
  if ((STRONG[d] || []).includes(a)) return 0.75;
  return 1;
}

// ----- 合成 -----
function recipeKey(core, parts) { return core + '|' + parts.slice().sort().join(','); }
const RECIPE_MAP = {};
RECIPES.forEach(r => { RECIPE_MAP[recipeKey(r.core, r.parts)] = r; });

// 序盤に手に入るもの（レア度1）は弱め、めずらしいほど つよい（素材のボーナス倍率／核の強さ倍率）
const PART_TIER = { 1: .6, 2: 1, 3: 1.7 }, CORE_TIER = { 1: .8, 2: 1, 3: 1.25 };
const tierOf = it => it.rarity || 1;

// 核＋素材から「できあがる仲間」を予想する（固定レシピ → 組み合わせ式）
function craftPreview(coreId, partIds, core2Id) {
  const core = ITEMS[coreId], sp = SPECIES[core.species];
  const core2 = core2Id ? ITEMS[core2Id] : null, sp2 = core2 ? SPECIES[core2.species] : null;
  const recipe = !core2 ? (RECIPE_MAP[recipeKey(coreId, partIds)] || null) : null;
  const bonus = { hp: 0, atk: 0, def: 0, spd: 0 };
  const elCount = {}, abilities = new Set(), moveList = [];
  partIds.forEach(id => {
    const it = ITEMS[id];
    for (const k in (it.stats || {})) bonus[k] += it.stats[k] * PART_TIER[tierOf(it)];
    if (it.element) elCount[it.element] = (elCount[it.element] || 0) + (it.kind === 'essence' ? 2 : 1);
    if (it.ability) abilities.add(it.ability);
    (it.moves || []).forEach(m => moveList.push(m));
  });
  if (recipe) (recipe.abilities || []).forEach(a => abilities.add(a));
  // 属性：素材（エッセンスは2点）＋核の種族がもつ属性（.9点／2つめの核は.8点）。多い順に、上位2つが「複合タイプ」になる
  if (sp.element !== 'none') elCount[sp.element] = (elCount[sp.element] || 0) + .9;
  if (sp2 && sp2.element !== 'none') elCount[sp2.element] = (elCount[sp2.element] || 0) + .8;
  const sorted = Object.entries(elCount).sort((x, y) => y[1] - x[1]).map(e => e[0]);
  const element = recipe && recipe.element ? recipe.element : (sorted[0] || 'none');
  const element2 = recipe && recipe.element2 ? recipe.element2 : (sorted.find(e => e !== element) || null);
  // 能力値：核が2つなら 6:4 でまぜて、ハイブリッドボーナス（×1.06）
  const bs = (s, id, k) => s[k] * coreBias(id, k);
  const mix = k => Math.round(sp2 ? bs(sp, core.species, k) * .6 + bs(sp2, core2.species, k) * .4 : bs(sp, core.species, k));
  const base = { hp: mix('hp'), atk: mix('atk'), def: mix('def'), spd: mix('spd') };
  const moves = [];
  const combos = comboMovesOf(partIds);
  [sp.basic, ...(sp2 ? [sp2.basic] : []), ...combos, ...(recipe ? recipe.moves : []), ...moveList].forEach(m => { if (!moves.includes(m)) moves.push(m); });
  const elP = e => (e !== 'none' ? ELEM_PREFIX[e] : '');
  return {
    species: core.species, species2: core2 ? core2.species : null, element, element2, base, bonus, abilities: [...abilities], moves: moves.slice(0, 4), combos: combos.filter(m => moves.slice(0, 4).includes(m)),
    recipe, factor: (recipe ? recipe.factor : 1) * (sp2 ? 1.06 : 1) * (core2 ? (CORE_TIER[tierOf(core)] + CORE_TIER[tierOf(core2)]) / 2 : CORE_TIER[tierOf(core)]),
    name: recipe ? recipe.name : (sp2 ? elP(element) + sp2.short + sp.short : ELEM_PREFIX[element] + sp.short),
  };
}

// 複合タイプのあいてへのダメージ倍率（2つの属性の倍率をかける）
function defMult(atkEl, c) { let m = elemMult(atkEl, c.element); if (c.element2) m *= elemMult(atkEl, c.element2); return m; }
const hasType = (c, el) => c.element === el || c.element2 === el;

function craftLevel() {
  const all = S.party.concat(S.box);
  return Math.max(3, Math.max(...all.map(c => c.level)) - 1);
}

function makeCreature(pv, level, parts) {
  const sp = SPECIES[pv.species];
  const c = {
    uid: S.uid++, name: pv.name, species: pv.species, species2: pv.species2 || null, element: pv.element, element2: pv.element2 || null, level, exp: 0,
    base: pv.base ? { ...pv.base } : { hp: sp.hp, atk: sp.atk, def: sp.def, spd: sp.spd }, bonus: pv.bonus, factor: pv.factor,
    parts: parts || [], abilities: pv.abilities, moves: pv.moves, recipe: pv.recipe ? pv.recipe.id : null, custom: {}, hp: 1,
  };
  c.hp = maxHp(c);
  return c;
}

let ENEMY_UID = -1;
// 野生の敵は ひとまわり つよい。ほら穴の中は さらに +4（field.js の loadMap で設定）
let ENEMY_LV_BONUS = 0;
const LV_MAX = 60;
function makeEnemy(key, level, fac) {
  const d = ENEMIES[key], wild = !level && d.ai !== 'boss';
  if (wild) level = Math.round(d.level * 1.2) + 2 + ENEMY_LV_BONUS;
  const c = { uid: ENEMY_UID--, name: d.name, species: d.shape, element: d.element, element2: d.element2 || null, level: level || d.level, exp: 0, base: d.base,
    bonus: {}, factor: fac || (wild ? 1.12 : d.ai === 'boss' ? 1.1 : 1), parts: d.parts, abilities: [], moves: d.moves, hp: 1 };
  c.hp = maxHp(c);
  return c;
}

// 核（種族）ごとの能力の差を大きく、素材のボーナスも大きく効かせる
const SPREAD = 1.25, BONUS_MUL = { hp: 2, atk: 2.5, def: 2.5, spd: 2.5 }, BASE_MEAN = { atk: 10.5, def: 9, spd: 9.5 };
const spread = (v, k) => BASE_MEAN[k] ? Math.max(2, BASE_MEAN[k] + (v - BASE_MEAN[k]) * SPREAD) : v;
function statsOf(c) {
  const L = c.level, f = c.factor || 1, b = c.base, bo = c.bonus || {};
  const g = 1 + (L - 1) * 0.10, v = k => Math.max(b[k] * (k === 'hp' ? .5 : .4), (k === 'hp' ? b.hp * (1 + (b.hp - 40) / 80) : spread(b[k], k)) + (bo[k] || 0) * BONUS_MUL[k]);
  return {
    hp: Math.max(1, Math.floor(v('hp') * f * (1 + (L - 1) * 0.14))),
    atk: Math.max(1, Math.floor(v('atk') * f * g)),
    def: Math.max(1, Math.floor(v('def') * f * g)),
    spd: Math.max(1, Math.floor(v('spd') * f * g)),
  };
}
const maxHp = c => statsOf(c).hp;

const expNeed = L => 12 + L * 8 + Math.floor(L * L * .5);
// 経験値を足してメッセージ一覧を返す
function gainExp(c, amt) {
  const msgs = [];
  if (c.level >= LV_MAX) return msgs;
  c.exp += amt;
  while (c.level < LV_MAX && c.exp >= expNeed(c.level)) {
    c.exp -= expNeed(c.level);
    const before = maxHp(c);
    c.level++;
    c.hp += maxHp(c) - before;
    msgs.push(`${c.name}は レベル${c.level}に あがった！`);
  }
  return msgs;
}

// ----- 持ち物 -----
function addItem(id, n = 1) { S.inv[id] = (S.inv[id] || 0) + n; }
function itemCount(id) { return S.inv[id] || 0; }
function takeItem(id, n = 1) { S.inv[id] = Math.max(0, itemCount(id) - n); }

// ----- フィールド能力 -----
function abilityHolder(ab) {
  return S.party.find(c => c.abilities.includes(ab) || c.moves.some(m => MOVES[m].field === ab)) || null;
}

// ----- 新規・保存 -----
function newGame() {
  S = {
    x: null, y: null, camp: { x: null, y: null }, w: 50,
    party: [], box: [], inv: { potion: 3 },
    flags: { cut: {}, chest: {}, boss: {}, trainer: {}, gate: {}, recipes: {}, chal: {} }, streak: { id: null, n: 0 }, uid: 1,
  };
  const c = makeCreature(craftPreview('core_beast', []), 5, []);
  c.name = 'コロ';
  S.party.push(c);
}
// ----- ちずの「いったことのある場所」（2タイル四方のマス）-----
const FOG_W = 200, FOG_H = 140;
let FOG = null, FOG_C = null, FOG_DIRTY = true;
function fogInit() {
  FOG = new Uint8Array(FOG_W * FOG_H); FOG_DIRTY = true;
  if (S && typeof S.fog === 'string') for (let i = 0; i < FOG.length; i++) FOG[i] = S.fog.charCodeAt(i) === 49 ? 1 : 0;
}
function fogReveal(tx, ty, r) {
  if (!FOG) return;
  const cx = tx / 2, cy = ty / 2, rc = r / 2;
  for (let y = Math.max(0, Math.floor(cy - rc)); y <= Math.min(FOG_H - 1, Math.ceil(cy + rc)); y++) for (let x = Math.max(0, Math.floor(cx - rc)); x <= Math.min(FOG_W - 1, Math.ceil(cx + rc)); x++) {
    if ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= rc * rc && !FOG[y * FOG_W + x]) { FOG[y * FOG_W + x] = 1; FOG_DIRTY = true; }
  }
}
const fogSeen = (tx, ty) => !!FOG && tx >= 0 && ty >= 0 && FOG[Math.floor(ty / 2) * FOG_W + Math.floor(tx / 2)] === 1;
function fogCanvas() {
  if (!FOG_C) { FOG_C = document.createElement('canvas'); FOG_C.width = FOG_W; FOG_C.height = FOG_H; }
  if (FOG_DIRTY) {
    const g = FOG_C.getContext('2d'), im = g.createImageData(FOG_W, FOG_H);
    for (let i = 0; i < FOG.length; i++) { const o = i * 4; im.data[o] = 5; im.data[o + 1] = 6; im.data[o + 2] = 12; im.data[o + 3] = FOG[i] ? 0 : 255; }
    g.putImageData(im, 0, 0); FOG_DIRTY = false;
  }
  return FOG_C;
}

function saveGame() {
  try {
    if (FOG) S.fog = Array.from(FOG, v => (v ? '1' : '0')).join('');
    if (FIELD) { S.x = FIELD.px / TILE; S.y = FIELD.py / TILE; S.map = FIELD.mapId; }
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
    return true;
  } catch (e) { return false; }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function loadGame() {
  try { S = JSON.parse(localStorage.getItem(SAVE_KEY)); return !!S; } catch (e) { return false; }
}
function healAll() { S.party.concat(S.box).forEach(c => { c.hp = maxHp(c); }); }
