'use strict';
// ===== データ追加その5：コアのとくい・ふとくい／ひきかえ素材 =====
// 核（種族）ごとの能力のかたより。倍率で、つくるときの能力値にかかる（hp/atk/def/spd）
const CORE_BIAS = {
  beast:    { role: 'こうげきがた',   atk: 1.35, def: .85 },
  bird:     { role: 'すばやさがた',   spd: 1.5, def: .8 },
  fish:     { role: 'すいすいがた',   spd: 1.2, hp: 1.1, atk: .9 },
  bug:      { role: 'ソクコウがた',   atk: 1.2, spd: 1.25, hp: .8 },
  golem:    { role: 'ぼうぎょとっか', def: 1.6, spd: .6, atk: .9 },
  ghost:    { role: 'ガラスのだいほう', atk: 1.3, spd: 1.3, hp: .7, def: .7 },
  dino:     { role: 'ちからもち',     hp: 1.3, atk: 1.3, spd: .85 },
  slime:    { role: 'たいりょくとっか', hp: 1.7, atk: .8, spd: .8 },
  rabbit:   { role: 'ちょうすばやい', spd: 1.7, hp: .8, def: .7 },
  plant:    { role: 'じゅくせいがた', hp: 1.4, def: 1.2, atk: .8, spd: .7 },
  mushroom: { role: 'かたいキノコ',   def: 1.4, hp: 1.1, spd: .7, atk: .9 },
  snake:    { role: 'ふいうちがた',   atk: 1.25, spd: 1.25, def: .8, hp: .8 },
  turtle:   { role: 'てっぺきがた',   def: 1.7, hp: 1.2, spd: .5, atk: .8 },
  octopus:  { role: 'パワーがた',     atk: 1.3, hp: 1.1, spd: .8 },
  bat:      { role: 'ヒットアンドアウェイ', spd: 1.4, atk: 1.1, hp: .7, def: .8 },
  dragon:   { role: 'おうじゃ',       hp: 1.15, atk: 1.15 },
  robot:    { role: 'じゅうそうがた', def: 1.3, atk: 1.2, hp: 1.1, spd: .7 },
};
const coreBias = (spId, k) => (CORE_BIAS[spId] && CORE_BIAS[spId][k]) || 1;

// つけると 何かが 下がるかわりに 何かが つよくなる素材
Object.assign(ITEMS, {
  warband:    { name: 'せんしのはちまき', kind: 'part', color: '#c84a3a', price: 30, stats: { atk: 5, def: -3 }, desc: 'こうげき ↑  ぼうぎょ ↓' },
  sleepseed:  { name: 'ねむりのたね',     kind: 'part', color: '#9ab88a', price: 30, stats: { hp: 14, atk: -3 }, desc: 'たいりょく ↑  こうげき ↓' },
  charm:      { name: 'まもりのおふだ',   kind: 'part', color: '#e8d8a0', price: 30, stats: { def: 5, atk: -3 }, desc: 'ぼうぎょ ↑  こうげき ↓' },
  shedskin:   { name: 'ぬけがらのころも', kind: 'part', color: '#c8c0a8', price: 35, stats: { spd: 5, hp: -6 }, desc: 'すばやさ ↑  たいりょく ↓' },
  glasshorn:  { name: 'ガラスのつの',     kind: 'part', color: '#cfeaff', price: 60, rarity: 2, stats: { atk: 9, def: -4, hp: -6 }, desc: 'こうげき ↑↑  ぼうぎょ・たいりょく ↓' },
  leadarmor:  { name: 'おもりのよろい',   kind: 'part', color: '#6a6e7a', price: 60, rarity: 2, stats: { def: 10, spd: -6 }, desc: 'ぼうぎょ ↑↑  すばやさ ↓↓' },
  featherlite:{ name: 'かるがるのはね',   kind: 'part', color: '#f0f8ff', price: 60, rarity: 2, stats: { spd: 8, def: -4, hp: -6 }, desc: 'すばやさ ↑↑  ぼうぎょ・たいりょく ↓' },
  blubber:    { name: 'ぶあついあぶら',   kind: 'part', color: '#f0d8b8', price: 55, rarity: 2, stats: { hp: 22, spd: -4, atk: -2 }, desc: 'たいりょく ↑↑  すばやさ ↓' },
  powerstone: { name: 'ちからのいし',     kind: 'part', color: '#d8704a', price: 65, rarity: 2, stats: { atk: 10, spd: -5 }, desc: 'こうげき ↑↑  すばやさ ↓' },
  rageeye:    { name: 'いかりのめ',       kind: 'part', color: '#ff4a3a', rarity: 3, stats: { atk: 8, spd: 3, def: -6 }, desc: 'こうげき ↑ すばやさ ↑  ぼうぎょ ↓↓' },
});
for (const id of ['warband', 'sleepseed', 'charm', 'shedskin', 'glasshorn', 'leadarmor', 'featherlite', 'blubber', 'powerstone', 'rageeye']) ITEMS[id].rarity = ITEMS[id].rarity || 1;
{
  const D = (e, id, p) => ENEMIES[e].drops.push([id, p]);
  const Rr = (e, id, p) => { const d = ENEMIES[e]; d.rares = (d.rares || (d.rare ? [d.rare] : [])).concat([[id, p]]); };
  D('nonezumi', 'warband', .15); D('usagi', 'sleepseed', .15); D('kame', 'charm', .2); D('kinoko', 'sleepseed', .15); D('hebi', 'shedskin', .2);
  D('iwakoro', 'charm', .12); D('sasori', 'warband', .12); D('tetsugolem', 'leadarmor', .1); D('kame', 'blubber', .1); D('kurage', 'blubber', .1);
  D('hikarigolem', 'glasshorn', .08); D('kazanmushi', 'powerstone', .1); D('kaminaritori', 'featherlite', .1); D('fuuchou', 'featherlite', .1);
  Rr('kodaisaurus', 'rageeye', .03); Rr('magmagolem', 'rageeye', .03); Rr('kageobake', 'rageeye', .03);
  const S = (v, list) => VILLAGES.find(x => x.id === v).shop.push(...list);
  S('v1', ['warband', 'sleepseed', 'charm']); S('v2', ['shedskin', 'warband']); S('v3', ['blubber', 'charm']); S('v4', ['powerstone', 'shedskin']);
  S('v5', ['powerstone', 'glasshorn']); S('v6', ['featherlite', 'glasshorn']); S('v7', ['blubber', 'leadarmor']); S('v8', ['sleepseed', 'shedskin']);
  S('v9', ['leadarmor', 'powerstone']); S('v10', ['featherlite', 'glasshorn']);
}
