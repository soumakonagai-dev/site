// アイテム・武器・開発レシピのデータ
//  - 戦利品(マップに落ちている) / 怪物の素材(倒すと落とす) / すぐ使うもの(包帯・弾薬)
//  - 武器: 最初から使える3つと、素材で開発できるもの。attr(属性)が怪物の弱点属性と合うと大きく効く
const Items = {
  // マップに落ちている戦利品
  scrap:   { name: '鉄くず',     color: 0xaab4c0, kind: 'mat' },
  powder:  { name: '火薬',       color: 0xf0a030, kind: 'mat' },
  oil:     { name: '灯油',       color: 0xe6d24a, kind: 'mat' },
  salt:    { name: '塩',         color: 0xf6f6f6, kind: 'mat' },
  battery: { name: '電池',       color: 0x50d4ff, kind: 'mat' },
  bottle:  { name: '空き瓶',     color: 0x7cf0b4, kind: 'mat' },
  // 怪物の素材
  blood:   { name: '鼻なしの血', color: 0xd81818, kind: 'mat' },
  thread:  { name: '蜘蛛の糸',   color: 0xeceef6, kind: 'mat' },
  claw:    { name: '水底の爪',   color: 0x3aa6c8, kind: 'mat' },
  shard:   { name: '影のかけら', color: 0x9a66ff, kind: 'mat' },
  chain:   { name: '番人の鎖',   color: 0x9a9a9a, kind: 'mat' },
  tear:    { name: '涙の結晶',   color: 0x8ad8ff, kind: 'mat' },
  acid:    { name: '酸の袋',     color: 0xa8ff40, kind: 'mat' },
  hair:    { name: '髪の束',     color: 0x6a4a8a, kind: 'mat' },
  finger:  { name: '長い指',     color: 0xe8d8c8, kind: 'mat' },
  heart:   { name: '割れた心臓', color: 0xff4060, kind: 'mat' },
  doll:    { name: '人形の髪',   color: 0x303040, kind: 'mat' },
  neck:    { name: '伸びた首の皮', color: 0xd8c8b0, kind: 'mat' },
  shell:   { name: '百足の殻',   color: 0x8a3a22, kind: 'mat' },
  bone:    { name: '巨人の骨',   color: 0xe6e0cc, kind: 'mat' },
  wick:    { name: '提灯の灯芯', color: 0xffa040, kind: 'mat' },
  paper:   { name: '唐傘の和紙', color: 0xc8a070, kind: 'mat' },
  fang:    { name: '背中の牙',   color: 0xefe6d0, kind: 'mat' },
  blade:   { name: '錆びた包丁', color: 0x9aa4b0, kind: 'mat' },
  // 拾うとすぐ使うもの
  bandage: { name: '包帯',       color: 0x66ff88, kind: 'heal', note: 'HPが回復する' },
  ammo:    { name: '弾薬',       color: 0xffd060, kind: 'ammo', note: '持っている武器の弾が増える' },
};

// 戦利品の出やすさ(マップに落ちているもの)
const LootTable = [
  { item: 'scrap', w: 5 }, { item: 'powder', w: 2.5 }, { item: 'oil', w: 2.5 }, { item: 'salt', w: 2.5 },
  { item: 'battery', w: 3 }, { item: 'bottle', w: 2 }, { item: 'bandage', w: 3 },
];
function rollLoot() {
  const total = LootTable.reduce((s, e) => s + e.w, 0);
  let r = Math.random() * total;
  for (const e of LootTable) { r -= e.w; if (r <= 0) return e.item; }
  return LootTable[0].item;
}

// 武器。recipe があるものは、戦利品ボックスの素材で開発する
const Weapons = {
  handgun: { id: 'handgun', name: 'ハンドガン', attr: 'phys', dmg: 12, pellets: 1, spread: 0.004, rate: 0.38, ammo: 18, snd: 'handgun', start: true,
    desc: '精密に狙える物理攻撃。小さい的に向く。' },
  shotgun: { id: 'shotgun', name: 'ショットガン', attr: 'phys', dmg: 8, pellets: 8, spread: 0.065, rate: 0.95, ammo: 6, snd: 'shotgun', start: true,
    desc: '近距離で広く当たる。遠いと散って外れやすい。' },
  flash: { id: 'flash', name: '強力ライト', attr: 'light', dmg: 3, pellets: 1, spread: 0, rate: 0.5, ammo: 99, snd: 'flash', start: true,
    desc: '光で照らす。光に弱い相手にだけ意味がある。' },

  flamer: { id: 'flamer', name: '火炎放射器', attr: 'fire', dmg: 5, pellets: 1, spread: 0.02, rate: 0.12, ammo: 40, snd: 'flame',
    desc: '炎を浴びせ続ける。火に弱い相手に。弾(燃料)の減りが速い。',
    recipe: { oil: 2, scrap: 2, thread: 1 } },
  taser: { id: 'taser', name: '電撃銃', attr: 'elec', dmg: 16, pellets: 1, spread: 0.004, rate: 0.7, ammo: 10, snd: 'zap',
    desc: '高圧の電気を撃つ。水や濡れた体に効く。',
    recipe: { battery: 3, scrap: 1, claw: 1 } },
  saltgun: { id: 'saltgun', name: '塩水銃', attr: 'holy', dmg: 10, pellets: 3, spread: 0.04, rate: 0.6, ammo: 12, snd: 'salt',
    desc: '清めた塩水を撒く。霊のようなものに効く。',
    recipe: { salt: 3, bottle: 1, blood: 1 } },
  heavy: { id: 'heavy', name: '徹甲ハンドガン', attr: 'phys', dmg: 24, pellets: 1, spread: 0.003, rate: 0.5, ammo: 12, snd: 'heavy',
    desc: '重い弾を撃つ。硬い相手の弱点に。',
    recipe: { scrap: 4, powder: 2, chain: 1 } },
  flash2: { id: 'flash2', name: '閃光ライトMk2', attr: 'light', dmg: 8, pellets: 1, spread: 0, rate: 0.3, ammo: 99, snd: 'flash',
    desc: '強力ライトの改良型。光に弱い相手を素早く焼く。',
    recipe: { battery: 2, shard: 1 } },
};

Object.assign(Weapons, {
  rifle: { id: 'rifle', name: 'ライフル', attr: 'phys', dmg: 30, pellets: 1, spread: 0.002, rate: 0.9, ammo: 8, snd: 'heavy',
    desc: '一発が重い。遠くの弱点を狙い撃つ。', recipe: { scrap: 4, powder: 2, finger: 1 } },
  arcgun: { id: 'arcgun', name: 'アーク放電銃', attr: 'elec', dmg: 9, pellets: 3, spread: 0.05, rate: 0.35, ammo: 20, snd: 'zap',
    desc: '三本の電光を放つ。濡れた体や水の怪物に。', recipe: { battery: 3, hair: 1, acid: 1 } },
  holyflame: { id: 'holyflame', name: '聖炎放射器', attr: 'holy', dmg: 6, pellets: 1, spread: 0.02, rate: 0.12, ammo: 40, snd: 'flame',
    desc: '清めた炎を浴びせ続ける。霊のようなものに。', recipe: { oil: 2, salt: 2, tear: 1, heart: 1 } },
});

// 後半の武器(強い怪物の素材が要る)
Object.assign(Weapons, {
  smg: { id: 'smg', name: 'サブマシンガン', attr: 'phys', dmg: 5, pellets: 1, spread: 0.03, rate: 0.09, ammo: 30, snd: 'handgun',
    desc: '連射で削る。弱点が分からない相手にも、数で押せる。', recipe: { scrap: 4, powder: 2, shell: 1 } },
  hellfire: { id: 'hellfire', name: '業火放射器', attr: 'fire', dmg: 8, pellets: 1, spread: 0.025, rate: 0.1, ammo: 50, snd: 'flame',
    desc: '火炎放射器の強化型。燃えやすいものを一気に焼く。', recipe: { oil: 3, powder: 2, wick: 1 } },
  coil: { id: 'coil', name: 'コイルガン', attr: 'elec', dmg: 34, pellets: 1, spread: 0.002, rate: 0.8, ammo: 8, snd: 'zap',
    desc: '強い電気を一点に撃ち込む。', recipe: { battery: 4, neck: 1, fang: 1 } },
  holywater: { id: 'holywater', name: '聖水散弾', attr: 'holy', dmg: 8, pellets: 5, spread: 0.05, rate: 0.55, ammo: 10, snd: 'salt',
    desc: '清めた水を広く撒く。霊や亡者に。', recipe: { salt: 4, bottle: 2, bone: 1 } },
  flash3: { id: 'flash3', name: '閃光ライトMk3', attr: 'light', dmg: 12, pellets: 1, spread: 0, rate: 0.25, ammo: 99, snd: 'flash',
    desc: 'とても強い光。光に弱い相手を、瞬く間に焼く。', recipe: { shard: 2, battery: 2, paper: 1 } },
  cannon: { id: 'cannon', name: '大口径カノン', attr: 'phys', dmg: 60, pellets: 1, spread: 0.003, rate: 1.3, ammo: 5, snd: 'heavy',
    desc: '一撃が桁違い。弱点でなくても、体力を大きく削る。', recipe: { chain: 2, bone: 2, blade: 1, scrap: 3 } },
});

// リロードの時間(秒)。弾は無限で、弾倉(ammo の数)を撃ち切るとリロードして満タンになる。ライトは弾切れしない
const RELOAD = { handgun: 1.3, shotgun: 2.2, flamer: 2.4, taser: 1.7, saltgun: 1.9, heavy: 1.7, rifle: 2.3, arcgun: 1.9, holyflame: 2.5, smg: 1.6, hellfire: 2.6, coil: 2.2, holywater: 2.3, cannon: 2.8 };
for (const k in RELOAD) Weapons[k].reload = RELOAD[k];

const ATTR_NAME = { phys: '物理', fire: '炎', elec: '電気', light: '光', holy: '聖' };

// 弱点属性に効く武器の名前(図鑑の「おすすめ」表示用)
function weaponsForAttr(attr) {
  return Object.values(Weapons).filter(w => w.attr === attr).map(w => w.name);
}
