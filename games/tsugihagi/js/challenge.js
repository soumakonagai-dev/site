'use strict';
// ===== 試練の塔 と ボスチャレンジ =====
// どちらも 村の人に はなしかけて、むずかしさ（1〜20）をえらんでちょうせんする。
// 高難度でしか手に入らない核・素材がある（CH_EXCL：[アイテム, 必要な難度]）。はじめて手に入れるときは必ず もらえ、2回目からは一定の確率。
const CH_MAX = 20;
const CH_SITES = {
  tower_v2:  { id: 'tower_v2',  kind: 'tower', name: 'みどりの試練の塔',     village: 'v2',  pool: ['meadow', 'forest', 'seaside'], guard: ['morinushi', 'nushi_forest', 'nushi_meadow'] },
  tower_v5:  { id: 'tower_v5',  kind: 'tower', name: 'ほのおの試練の塔',     village: 'v5',  pool: ['desert', 'volcano', 'ruins'], guard: ['magmadon', 'nushi_volcano', 'nushi_desert'] },
  tower_v7:  { id: 'tower_v7',  kind: 'tower', name: 'こごえの試練の塔',     village: 'v7',  pool: ['snow', 'swamp', 'mine'], guard: ['nushi_snow', 'nushi_swamp', 'nushi_mine'] },
  tower_v10: { id: 'tower_v10', kind: 'tower', name: 'てんくうの試練の塔',   village: 'v10', pool: ['meadow', 'forest', 'seaside', 'desert', 'volcano', 'ruins', 'snow', 'swamp', 'mine', 'sky'], guard: ['gaiarex', 'nushi_sky', 'nushi_ruins'] },
  boss_v3:   { id: 'boss_v3',   kind: 'boss',  name: 'ボスチャレンジ・はじまり', village: 'v3', bosses: ['morinushi', 'nushi_meadow', 'nushi_forest', 'nushi_seaside'] },
  boss_v6:   { id: 'boss_v6',   kind: 'boss',  name: 'ボスチャレンジ・ほのお',   village: 'v6', bosses: ['magmadon', 'nushi_desert', 'nushi_volcano', 'nushi_ruins'] },
  boss_v8:   { id: 'boss_v8',   kind: 'boss',  name: 'ボスチャレンジ・こごえ',   village: 'v8', bosses: ['nushi_snow', 'nushi_swamp', 'nushi_mine', 'nushi_sky'] },
  boss_v9:   { id: 'boss_v9',   kind: 'boss',  name: 'ボスチャレンジ・さいきょう', village: 'v9', bosses: ['gaiarex', 'nushi_volcano', 'nushi_mine', 'nushi_sky', 'nushi_swamp'] },
};
const CH_EXCL = {
  tower: [['core_owl', 8], ['trialsword', 10], ['towermedal', 12], ['skybanner', 14], ['core_knight', 15], ['heroscrown', 16], ['dragonscale2', 18], ['core_phoenix', 20]],
  boss:  [['bossfang', 10], ['core_whale', 12], ['conquerorcape', 12], ['titanheart', 14], ['voidshard', 17], ['core_fairy', 18], ['infinitydrop', 20]],
};
const chLevel = d => 8 + d * 3;                 // 塔の敵の基本レベル
const chFactor = d => 1 + d * .03;              // 塔の敵の能力倍率
const chFloors = d => 3 + Math.ceil(d / 5);      // 塔の階数

// 村にしゅうれい所の人をおく
Object.values(CH_SITES).forEach(c => {
  const v = VILLAGES.find(x => x.id === c.village);
  v.npcs.push(c.kind === 'tower'
    ? { type: 'challenge', dx: 6, dy: 1, name: '塔のあんないにん', look: 5, ch: c.id }
    : { type: 'challenge', dx: -6, dy: 1, name: 'ちょうせんの しんぱん', look: 2, ch: c.id });
});

// ---- むずかしさ（1〜20）をえらぶ画面 ----
class ChallengeScene {
  constructor(site, bossKey, cb) { this.site = site; this.bossKey = bossKey; this.cb = cb; this.d = Math.max(1, Math.min(CH_MAX, (S.flags.chal && S.flags.chal['best_' + site.id] || 0) + 1)); this.t = 0; }
  update(dt) {
    this.t += dt;
    if (Input.rep.left) { this.d = Math.max(1, this.d - 1); sfx('cursor'); }
    if (Input.rep.right) { this.d = Math.min(CH_MAX, this.d + 1); sfx('cursor'); }
    if (Input.rep.up) { this.d = Math.min(CH_MAX, this.d + 5); sfx('cursor'); }
    if (Input.rep.down) { this.d = Math.max(1, this.d - 5); sfx('cursor'); }
    if (Input.edge.cancel) { sfx('back'); Scenes.pop(); return; }
    if (Input.edge.ok) { sfx('ok'); Scenes.pop(); this.cb(this.d); }
  }
  draw() {
    const s = this.site, d = this.d, flags = S.flags.chal || {}, best = flags['best_' + s.id] || 0;
    ctx.fillStyle = 'rgba(8,10,24,.88)'; ctx.fillRect(0, 0, W, H);
    box(40, 24, 560, 312);
    txt(s.name + (this.bossKey ? '：' + ENEMIES[this.bossKey].name : ''), 320, 36, { size: 16, align: 'center' });
    txt('むずかしさ', 320, 66, { size: 12, align: 'center', color: '#bfb89a' });
    txt(`◀  ${d}  ▶`, 320, 82, { size: 30, align: 'center', color: d >= 15 ? '#ff8a6a' : d >= 8 ? '#ffd96a' : '#fff' });
    for (let i = 1; i <= CH_MAX; i++) {
      const x = 90 + (i - 1) * 24; rr(x, 124, 20, 14, 3); ctx.fillStyle = i <= d ? (i >= 15 ? '#ff6a4a' : i >= 8 ? '#f0c040' : '#7ac860') : 'rgba(255,255,255,.14)'; ctx.fill();
      if (i === best) { ctx.fillStyle = '#fff'; ctx.fillRect(x + 8, 140, 4, 4); }
    }
    const lv = s.kind === 'tower' ? chLevel(d) : ENEMIES[this.bossKey].level + d * 2;
    txt(s.kind === 'tower' ? `${chFloors(d)}かい  てきの めやす Lv${lv}〜${lv + chFloors(d)}` : `ボスの めやす Lv${lv}`, 320, 152, { size: 13, align: 'center' });
    txt(best ? `これまでの さいこう：むずかしさ ${best}` : 'まだ クリアしていない', 320, 172, { size: 11, align: 'center', color: '#aaa' });
    txt('高難度でしか てにはいらない もの', 60, 196, { size: 11, color: '#bfb89a' });
    CH_EXCL[s.kind].forEach(([id, min], i) => {
      const x = 60 + (i % 2) * 270, y = 214 + Math.floor(i / 2) * 22, got = flags['got_' + id], ok = d >= min;
      txt(`${got ? '✔' : ok ? '◎' : '・'} ${ITEMS[id].name}`, x, y, { size: 13, color: got ? '#8ad88a' : ok ? '#ffd96a' : '#888' });
      txt(`難度${min}〜`, x + 250, y + 1, { size: 10, align: 'right', color: '#888' });
    });
    txt('←→：±1   ↑↓：±5   Z：ちょうせん   X：やめる', 320, 316, { size: 11, align: 'center', color: '#aaa' });
  }
}

// ---- 実行 ----
function chalStart(fld, n) {
  const site = CH_SITES[n.ch]; S.flags.chal = S.flags.chal || {};
  const say = ls => ls.map(l => `${n.name}「${l}」`);
  if (site.kind === 'tower') {
    Scenes.push(new DialogScene(say([`ここは ${site.name}。のぼるほど つよい てきが まっている。`, 'むずかしさは 1〜20。はじめて クリアすると、めずらしい ほうしゅうが もらえるぞ。', 'かいの あいだに HPが すこし かいふくする。まけると キャンプへ もどされるから きをつけて！']), () => {
      Scenes.push(new MenuScene(site.name, [
        { label: 'ちょうせんする', fn: () => { Scenes.pop(); Scenes.push(new ChallengeScene(site, null, d => towerRun(fld, site, d, towerPlan(site, d), 0))); } },
        { label: 'やめる', fn: () => Scenes.pop() },
      ], { w: 260, x: 190, y: 120 }));
    }));
  } else {
    Scenes.push(new DialogScene(say([`ここは ${site.name}。かこに たおした ボスの かげと もういちど たたかえる。`, 'むずかしさを あげるほど ボスは つよくなる。たおせば めずらしい そざいが てにはいるぞ。']), () => {
      Scenes.push(new MenuScene('たたかう ボスを えらぶ', site.bosses.map(b => ({
        label: ENEMIES[b].name, fn: () => { Scenes.pop(); Scenes.push(new ChallengeScene(site, b, d => bossRun(fld, site, b, d))); },
      })).concat([{ label: 'やめる', fn: () => Scenes.pop() }]), { w: 280, x: 180, y: 20 }));
    }));
  }
}
function towerPlan(site, d) {
  const pool = [];
  site.pool.forEach(r => { REGION_SPAWN[r].table.forEach(([e]) => pool.push(e)); if (REGION_SPAWN[r].elite) pool.push(REGION_SPAWN[r].elite[0]); });
  const floors = chFloors(d), plan = [], base = chLevel(d), f = chFactor(d);
  for (let i = 0; i < floors - 1; i++) plan.push([pool[Math.floor(Math.random() * pool.length)], base + i, f]);
  const g = site.guard[Math.floor(Math.random() * site.guard.length)];
  plan.push([g, base + floors + 2, f * 1.15]);
  return plan;
}
function chalBattle(fld, name, team, reward, onEnd) {
  sfx('battle');
  Scenes.push(new BattleScene(null, { trainer: { name, team: [team], reward }, tid: 'chal_tmp', theme: fld.theme, onEnd: res => { fld.invuln = 1.6; onEnd(res); } }));
}
function towerRun(fld, site, d, plan, i) {
  const last = i === plan.length - 1;
  chalBattle(fld, last ? '塔のぬし' : '塔のばんにん', plan[i], d * 6, res => {
    if (res === 'lose') { fld.blackout(['…塔の ちからは ほんものだった。', `${i + 1}かいで たおれてしまった。キャンプで たてなおそう。`]); return; }
    if (res !== 'win') return;
    if (last) { chalReward(fld, site, d, `${site.name}を のぼりきった！`); return; }
    S.party.forEach(c => { const m = maxHp(c); c.hp = Math.min(m, c.hp > 0 ? c.hp + Math.floor(m * .3) : Math.floor(m * .25)); });
    sfx('heal');
    Scenes.push(new MenuScene(`${i + 1}かい クリア！（HPが すこし かいふく）`, [
      { label: `${i + 2}かいへ すすむ`, fn: () => { Scenes.pop(); towerRun(fld, site, d, plan, i + 1); } },
      { label: 'ここで やめる', fn: () => { Scenes.pop(); Scenes.push(new DialogScene(['とちゅうで おりてきた。ほうしゅうは もらえなかった…。'])); } },
    ], { w: 360, x: 140, y: 110, noCancel: true }));
  });
}
function bossRun(fld, site, key, d) {
  const lv = ENEMIES[key].level + d * 2;
  chalBattle(fld, 'ボスのかげ', [key, lv, 1 + d * .05], d * 10, res => {
    if (res === 'lose') { fld.blackout(['…ボスの かげは あまりに つよかった。', 'キャンプで やすんで、もういちど いどもう！']); return; }
    if (res === 'win') chalReward(fld, site, d, `${ENEMIES[key].name}の かげを うちやぶった！`);
  });
}

// ---- ほうしゅう ----
function chalReward(fld, site, d, head) {
  const flags = S.flags.chal = S.flags.chal || {}, lines = [head, `むずかしさ ${d} クリア！`], star = [];
  const w = d * (site.kind === 'tower' ? 120 : 180); S.w += w; lines.push(`Wポイントを ${w} てにいれた！`);
  const parts = r => Object.keys(ITEMS).filter(i => (ITEMS[i].kind === 'part' || ITEMS[i].kind === 'essence') && ITEMS[i].rarity === r && !ITEMS[i].exclusive);
  const cores = Object.keys(ITEMS).filter(i => ITEMS[i].kind === 'core' && ITEMS[i].rarity < 3);
  const pk = a => a[Math.floor(Math.random() * a.length)];
  const tier = d >= 13 ? [parts(3), parts(2), parts(2)] : d >= 6 ? [parts(2), parts(2), parts(1)] : [parts(1), parts(1), parts(2)];
  const got = {}; tier.concat(d >= 10 ? [cores] : []).forEach(p => { const id = pk(p); got[id] = (got[id] || 0) + 1; });
  for (const id in got) { addItem(id, got[id]); lines.push(`${ITEMS[id].name}×${got[id]} を てにいれた！`); }
  CH_EXCL[site.kind].forEach(([id, min]) => {
    if (d < min) return;
    if (!flags['got_' + id]) { flags['got_' + id] = 1; addItem(id, 1); star.push(`★ ${ITEMS[id].name} を はじめて てにいれた！`); }
    else if (Math.random() < .25) { addItem(id, 1); star.push(`★ ${ITEMS[id].name} を てにいれた！`); }
  });
  lines.push(...star);
  const k = 'best_' + site.id; if ((flags[k] || 0) < d) { flags[k] = d; if (d < CH_MAX) lines.push(`つぎは むずかしさ ${d + 1} に ちょうせんできる。`); else lines.push('★ さいこう難度を せいは した！'); }
  sfx('chest'); saveGame();
  Scenes.push(new DialogScene(lines));
}
