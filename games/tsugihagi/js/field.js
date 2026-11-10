'use strict';
// ===== フィールド（広いワールドを自由に移動・関所・村・シンボルエンカウント）=====
let WORLD = null, MAPS_ALL = null;

// ふつうの地形に「ひつようなちから」はない。道をふさぐのは 門(G)と門番だけ
const GATEINFO = {};
const MODE_SPEED = { swim: .68, fly: 1.05, heat: .9 };

// ミニマップ（1タイル=1px）
function buildMini(Wd) {
  const c = document.createElement('canvas'); c.width = Wd.w; c.height = Wd.h; const m = c.getContext('2d');
  const gc = { snow: '#e8f2fa', swamp: '#4a5a3c', mine: '#7a6a58', sky: '#eef6ff', cave: '#3a3648', grass: '#7cc067', forest: '#3e6644', sand: '#e6d49c', desert: '#dab070', ash: '#544442', ruin: '#9292a2', village: '#e8d8a8', path: '#cdae74' };
  const tc = { G: '#8a5a2a', i: '#bfe8ff', g: '#3a4a30', Y: '#a8d8f0', e: '#9a8a78', U: '#7a6a58', V: '#5a4a3a', N: '#e8d8a8', O: '#000', Q: '#1c1824', D: '#ffd84a', A: '#fff', M: '#3a3a40', w: '#2a68b0', '~': '#58b4ee', L: '#e8481a', X: '#0a0610', T: '#2a6a34', P: '#3f9647', K: '#4a8a3a', I: '#6a6a80', r: '#7a7a82', F: '#8a5a2a', H: '#c8503c', B: '#d8a030', C: '#fff', c: '#ffd84a', b: '#2c8a3c', R: '#8a8a96' };
  for (let y = 0; y < Wd.h; y++) for (let x = 0; x < Wd.w; x++) { const ch = Wd.tiles[y][x]; m.fillStyle = tc[ch] || gc[Wd.ground[y][x]]; m.fillRect(x, y, 1, 1); }
  return c;
}

class FieldScene {
  constructor() {
    this.opaque = true; this.t = 0; this.toastS = ''; this.toastT = 0; this.hintCd = 0; this.invuln = 1;
    this.face = { x: 0, y: 1 }; this.moving = false; this.mode = null; this.walk = 0;
    FIELD = this;
    MAPS_ALL = buildMaps(); WORLD = MAPS_ALL.world; fogInit(); this.fogT = 0; this.minis = {}; this.fadeT = 0; this.lastWorld = null;
    const st = MAPS_ALL.world.start;
    if (S.x == null) { S.x = st.x + .5; S.y = st.y + .5; S.map = 'world'; }
    if (!S.camp || S.camp.x == null) S.camp = { map: 'world', x: st.x, y: st.y };
    S.flags.gate = S.flags.gate || {};
    this.loadMap(S.map && MAPS_ALL[S.map] ? S.map : 'world', S.x, S.y, true);
  }
  // 門番をたおした：その行き先への門を ぜんぶ開ける
  openGate(dest) {
    (this.W.gates || []).filter(g => g.dst === dest).forEach(g => {
      g.cells.forEach(([x, y]) => { this.tiles[y][x] = '.'; });
      this.npcs.filter(n => n.type === 'guard' && n.dest === dest && n.home[0] === g.guard[0] && n.home[1] === g.guard[1]).forEach(n => {
        n.type = 'villager'; n.lines = TRAINERS['gate_' + dest].after; n.x += g.p[0] * 3 * TILE; n.y += g.p[1] * 3 * TILE;
      });
    });
  }
  // マップをきりかえる（x,y はタイル座標。小数あり）
  loadMap(id, x, y, first) {
    if (this.mapId === 'world') this.lastWorld = [this.px, this.py];
    const W_ = MAPS_ALL[id]; this.mapId = id; this.W = W_; this.tiles = W_.tiles; this.npcs = W_.npcs; S.map = id;
    if (id === 'world') for (const k in S.flags.cut) { const [cx, cy] = k.split(',').map(Number); this.tiles[cy][cx] = '.'; }
    if (id === 'world') for (const dest in S.flags.gate) if (S.flags.gate[dest]) this.openGate(dest);
    for (const k in W_.chests) if (S.flags.chest[W_.chests[k].id]) { const [cx, cy] = k.split(',').map(Number); this.tiles[cy][cx] = 'o'; }
    this.mini = this.minis[id] || (this.minis[id] = buildMini(W_));
    this.px = x * TILE; this.py = y * TILE; this.mode = null;
    this.trail = []; for (let i = 0; i < 40; i++) this.trail.push({ x: this.px, y: this.py, fx: 1 });
    this.enemies = []; ENEMY_LV_BONUS = W_.cave ? 4 : 0;
    W_.spawns.forEach(s => {
      const d = ENEMIES[s.e];
      if (d.ai === 'boss' && S.flags.boss[s.e]) return;
      this.enemies.push({ key: s.e, x: (s.x + .5) * TILE, y: (s.y + .5) * TILE, hx: (s.x + .5) * TILE, hy: (s.y + .5) * TILE, dir: { x: 0, y: 1 }, vx: 0, vy: 0, mt: 0, stun: 0, alive: true, resp: 0 });
    });
    this.region = null; this.village = null; this.bannerT = 0; this.bannerName = '';
    this.fadeT = first ? 0 : .5; this.invuln = first ? this.invuln : 1.5;
    this.updateRegion(true);
  }
  tile(tx, ty) { return ty < 0 || tx < 0 || ty >= this.W.h || tx >= this.W.w ? 'M' : this.tiles[ty][tx]; }
  toast(s, t = 2.6) { this.toastS = s; this.toastT = t; }
  hint(s) { if (this.hintCd <= 0) { this.toast(s); this.hintCd = 3; sfx('back'); } }
  updateRegion(first) {
    const tx = Math.floor(this.px / TILE), ty = Math.floor(this.py / TILE);
    const k = this.W.regionOf(tx, ty);
    if (k !== this.region) { this.region = k; this.theme = k === 'cave' ? 'cave' : REGIONS[k].theme; this.bannerName = k === 'cave' ? this.W.name : REGIONS[k].name; this.bannerT = 3; }
    const v = this.W.villages.find(v => Math.abs(tx - v.cx) <= 8 && Math.abs(ty - v.cy) <= 5);
    if ((v && v.id) !== (this.village && this.village.id)) { this.village = v || null; if (v && !first) { this.bannerName = v.name; this.bannerT = 3; } }
  }

  // プレイヤーがその位置に立てるか。関所は能力しだい
  canStand(x, y) {
    const h = 6, gates = [];
    for (const [cx, cy] of [[x - h, y - h], [x + h, y - h], [x - h, y + h], [x + h, y + h]]) {
      const tx = Math.floor(cx / TILE), ty = Math.floor(cy / TILE), ch = this.tile(tx, ty);
      if (SOLID_CH.includes(ch)) return false;
      if (GATEINFO[ch]) gates.push([tx, ty, ch]);
    }
    for (const n of this.npcs) if (Math.hypot(x - n.x, y - n.y) < 13) return false;
    for (const [tx, ty, ch] of gates) {
      const G = GATEINFO[ch], m = abilityHolder(G.ab);
      if (!m) { this.hint(G.hint); return false; }
      if (G.eat) { this.tiles[ty][tx] = '.'; S.flags.cut[tx + ',' + ty] = 1; this.toast(`${m.name}が ${G.done}`); sfx(G.fx); }
    }
    return true;
  }
  enemyCan(x, y) {
    const h = 6;
    for (const [cx, cy] of [[x - h, y - h], [x + h, y - h], [x + h, y + h], [x - h, y + h]]) {
      const ch = this.tile(Math.floor(cx / TILE), Math.floor(cy / TILE));
      if (SOLID_CH.includes(ch) || GATEINFO[ch]) return false;
    }
    return true;
  }

  update(dt) {
    if (this.mapId === 'world' && (this.fogT -= dt) <= 0) { this.fogT = .2; fogReveal(this.px / TILE, this.py / TILE, 11); }
    this.t += dt; this.hintCd -= dt; this.toastT -= dt; this.bannerT -= dt; this.invuln -= dt;
    if (Input.edge.cancel) { sfx('ok'); this.openMenu(); return; }
    if (Input.edge.map) { sfx('ok'); Scenes.push(new WorldMapScene()); return; }

    // ---- 移動 ----
    const dx = (Input.held.right ? 1 : 0) - (Input.held.left ? 1 : 0), dy = (Input.held.down ? 1 : 0) - (Input.held.up ? 1 : 0);
    // 氷の上(i)はすべる／ぬかるみ(g)はおそい
    const ut = this.tile(Math.floor(this.px / TILE), Math.floor(this.py / TILE)), onIce = ut === 'i';
    const kk = dx && dy ? .7071 : 1, base = 94 * (MODE_SPEED[this.mode] || 1) * (ut === 'g' ? .55 : ut === '~' ? .75 : 1);
    let vx = dx * kk * base, vy = dy * kk * base;
    if (onIce) { const a = Math.min(1, dt * 1.8); this.ivx = (this.ivx || 0) + (vx - (this.ivx || 0)) * a; this.ivy = (this.ivy || 0) + (vy - (this.ivy || 0)) * a; vx = this.ivx; vy = this.ivy; } else { this.ivx = vx; this.ivy = vy; }
    this.moving = !!(dx || dy) || (onIce && Math.hypot(vx, vy) > 8);
    if (this.moving) {
      if (dx) this.face = { x: dx, y: 0 }; else if (dy) this.face = { x: 0, y: dy };
      const nx = this.px + vx * dt; if (this.canStand(nx, this.py)) this.px = nx; else this.ivx = 0;
      const ny = this.py + vy * dt; if (this.canStand(this.px, ny)) this.py = ny; else this.ivy = 0;
      this.walk += dt;
      const last = this.trail[this.trail.length - 1];
      if (Math.hypot(this.px - last.x, this.py - last.y) > 3) { this.trail.push({ x: this.px, y: this.py, fx: this.face.x }); if (this.trail.length > 40) this.trail.shift(); }
    } else this.walk = 0;
    const tx = Math.floor(this.px / TILE), ty = Math.floor(this.py / TILE);
    const gi = GATEINFO[this.tile(tx, ty)], nowMode = gi && gi.mode ? gi.mode : null;
    if (nowMode && nowMode !== this.mode) { const m = abilityHolder(gi.ab); if (m) this.toast(`${m.name}の ちから！ ${gi.ride}`); }
    this.mode = nowMode;
    if (this.moving) {
      this.stepT = (this.stepT || 0) + dt;
      if (this.stepT > (nowMode ? .45 : .3)) {
        this.stepT = 0;
        const gk = this.W.ground[ty][tx];
        sfx(nowMode === 'swim' ? 'step_water' : nowMode === 'fly' ? 'whoosh' : nowMode === 'heat' ? 'lava' : 'step_' + ({ sand: 'sand', desert: 'sand', ash: 'stone', ruin: 'stone', village: 'wood', path: 'grass', snow: 'sand', swamp: 'water', mine: 'stone', sky: 'wood', cave: 'stone' }[gk] || 'grass'));
      }
    }
    if (nowMode && nowMode !== this.mode0) sfx(nowMode === 'swim' ? 'splash' : nowMode === 'fly' ? 'whoosh' : 'lava');
    this.mode0 = nowMode;
    this.updateRegion(false);

    // ---- 階段・洞窟の出入口 ----
    const wp = this.W.warps[tx + ',' + ty];
    if (wp && this.fadeT <= .15) { sfx('warp'); this.loadMap(wp.map, wp.x + .5, wp.y + .5); return; }
    this.fadeT = Math.max(0, this.fadeT - dt);

    // ---- 調べる ----
    if (Input.edge.ok) this.interact();

    // ---- 敵 ----
    for (const e of this.enemies) {
      const d = ENEMIES[e.key], dist = Math.hypot(this.px - e.x, this.py - e.y);
      if (!e.alive) {
        e.resp -= dt;
        if (e.resp <= 0 && d.ai !== 'boss' && dist > 280) { e.alive = true; e.x = e.hx; e.y = e.hy; e.stun = 0; }
        continue;
      }
      if (dist > 420) continue;
      e.stun -= dt;
      if (e.stun <= 0 && d.ai !== 'sleep' && d.ai !== 'boss') {
        e.mt -= dt;
        let vx = 0, vy = 0, sp = d.speed;
        if (d.ai === 'chase' && dist < 120 && this.invuln <= 0) { vx = (this.px - e.x) / dist; vy = (this.py - e.y) / dist; }
        else {
          if (e.mt <= 0) {
            e.mt = rnd(.8, 2.2);
            const home = Math.hypot(e.hx - e.x, e.hy - e.y) > 110;
            const a = home ? Math.atan2(e.hy - e.y, e.hx - e.x) : Math.random() * 6.283;
            e.vx = Math.random() < .3 && !home ? 0 : Math.cos(a); e.vy = e.vx === 0 && !home ? 0 : Math.sin(a);
          }
          vx = e.vx; vy = e.vy; sp *= .6;
        }
        if (vx || vy) {
          const nx = e.x + vx * sp * dt, ny = e.y + vy * sp * dt;
          if (this.enemyCan(nx, e.y)) e.x = nx; else e.mt = 0;
          if (this.enemyCan(e.x, ny)) e.y = ny; else e.mt = 0;
          const l = Math.hypot(vx, vy); e.dir = { x: vx / l, y: vy / l };
        }
      }
      const reach = d.ai === 'boss' ? 26 : d.shape === 'dino' ? 20 : 14;
      if (e.stun <= 0 && this.invuln <= 0 && dist < reach) { this.startBattle(e); return; }
    }
  }

  startBattle(e) {
    const d = ENEMIES[e.key];
    const vx = (this.px - e.x), vy = (this.py - e.y), l = Math.hypot(vx, vy) || 1;
    // 敵の背中がわから触れれば先制／こちらの背中に触れられれば不意打ち
    let preempt = d.ai === 'sleep' || (e.dir.x * vx + e.dir.y * vy) / l < -.3;
    let ambush = !preempt && d.ai !== 'boss' && (this.face.x * -vx + this.face.y * -vy) / l < -.3;
    if (d.ai === 'boss') preempt = ambush = false;
    sfx('battle');
    Scenes.push(new BattleScene(e.key, { preempt, ambush, theme: this.theme, onEnd: res => this.afterBattle(e, res) }));
  }
  blackout(lines) {
    healAll();
    const c = S.camp; this.loadMap(c.map || 'world', c.x + .5, c.y + .5);
    Scenes.push(new DialogScene(lines || ['…きがつくと キャンプに もどっていた。', 'なかまは みんな げんきを とりもどした。']));
  }
  afterBattle(e, res) {
    this.invuln = 1.6;
    if (res === 'win') {
      e.alive = false; e.resp = 80;
      const d = ENEMIES[e.key];
      if (d.ai === 'boss') {
        S.flags.boss[e.key] = true; saveGame();
        const L = {
          morinushi: ['モリのぬしを たおした！ 森が しずかに ゆれている。', 'ぬしは「きょうりゅうの核」を のこしていった…！', 'あたらしい レシピを ためしてみよう。（レシピちょう）'],
          magmadon: ['火山の王 マグマドンを たおした！', 'あたりの 溶岩が すこし しずまった。', '北東の いかずちの遺跡が きみを まっている。'],
          gaiarex: ['ガイアレックスが しずかに めを とじた…。', 'せかいに しずけさが もどった。', 'おめでとう！ ひとまず クリアだ！', 'まだ みぬ レシピや レアな そざいを さがしにいこう。'],
        }[e.key] || [`${d.name}を たおした！`, 'この ちいきの ほらあなに しかない レアな そざいを てにいれた！'];
        Scenes.push(new DialogScene(L));
      }
    } else if (res === 'lose') this.blackout();
    else if (res === 'run') e.stun = 2.5;
  }

  nearNpc(fx, fy) { return this.npcs.find(n => Math.hypot(n.x - fx, n.y - fy) < 22); }
  interact() {
    const fx = this.px + this.face.x * 18, fy = this.py + this.face.y * 18;
    const n = this.nearNpc(fx, fy);
    if (n) { this.talk(n); return; }
    const tx = Math.floor(fx / TILE), ty = Math.floor(fy / TILE), ch = this.tile(tx, ty), key = tx + ',' + ty;
    if (ch === 'C') {
      S.camp = { map: this.mapId, x: tx, y: ty + 1 };
      sfx('ok');
      Scenes.push(new MenuScene('キャンプ・工房', [
        { label: 'ごうせい', fn: () => Scenes.push(new CraftScene()) },
        { label: 'パーティ・あずかり', fn: () => Scenes.push(new PartyScene('camp')) },
        { label: 'なまえ・みために かえる', fn: () => Scenes.push(new PartyScene('pick', i => Scenes.push(new CustomizeScene(S.party[i], {})), 'だれを かえる？')) },
        { label: 'レシピちょう', fn: () => Scenes.push(new RecipeScene()) },
        { label: 'やすむ（かいふく・セーブ）', fn: () => { healAll(); saveGame(); sfx('heal'); Scenes.push(new DialogScene(['ぐっすり やすんだ。', 'なかまの HPが ぜんかいふくした！ （セーブした）'])); } },
        { label: 'やめる', fn: () => Scenes.pop() },
      ], { x: 330, y: 20, w: 300 }));
    } else if (ch === 'B') {
      Scenes.push(new ShopScene(this.W.shopAt[key], 'ショップ'));
    } else if (ch === 'c') {
      const chest = this.W.chests[key]; if (!chest) return;
      this.tiles[ty][tx] = 'o'; S.flags.chest[chest.id] = 1; sfx('chest');
      chest.items.forEach(([id, n]) => addItem(id, n));
      Scenes.push(new DialogScene(['たからばこを あけた！', ...chest.items.map(([id, n]) => `${ITEMS[id].name}×${n} を てにいれた！`)]));
    } else if (ch === 'S') {
      const s = this.W.signs[key]; if (s) Scenes.push(new DialogScene(s));
    } else if (ch === 'G') this.toast('大きな 門が とじている。門番に はなしかけよう。');
    else if (ch === 'o') this.toast('からっぽだ。');
  }
  talk(n) {
    const vx = this.px - n.x, vy = this.py - n.y;
    n.face = Math.abs(vx) > Math.abs(vy) ? { x: Math.sign(vx), y: 0 } : { x: 0, y: Math.sign(vy) };
    const say = ls => ls.map(l => `${n.name}「${l}」`);
    if (n.type === 'villager') Scenes.push(new DialogScene(say(n.lines)));
    else if (n.type === 'shop') Scenes.push(new DialogScene(say(['いらっしゃい！ Wポイントで なんでも かっていってね。']), () => Scenes.push(new ShopScene(n.shop, n.name))));
    else if (n.type === 'challenge') chalStart(this, n);
    else if (n.type === 'guard') {
      const T = TRAINERS[n.trainer];
      Scenes.push(new DialogScene(say(T.before), () => {
        sfx('battle');
        Scenes.push(new BattleScene(null, { trainer: T, tid: n.trainer, theme: this.theme, onEnd: res => this.afterGuard(n, T, res) }));
      }));
    } else if (n.type === 'trainer') {
      const T = TRAINERS[n.trainer], done = S.flags.trainer[n.trainer];
      Scenes.push(new DialogScene(say(done ? T.after : T.before), () => {
        sfx('battle');
        Scenes.push(new BattleScene(null, { trainer: T, tid: n.trainer, theme: this.theme, onEnd: res => this.afterTrainer(n, T, res) }));
      }));
    }
  }
  afterGuard(n, T, res) {
    this.invuln = 1.6;
    if (res === 'win') { S.flags.gate[n.dest] = true; S.flags.trainer[n.trainer] = true; sfx('chest'); this.openGate(n.dest); saveGame(); Scenes.push(new DialogScene(T.win.map(l => `${n.name}「${l}」`).concat(['★ もんが ひらいた！']))); }
    else if (res === 'lose') this.blackout(['…もんばんの ちからは ほんものだった。', 'キャンプで やすんで、もっと つよくなって もういちど いどもう！']);
  }
  afterTrainer(n, T, res) {
    this.invuln = 1.6;
    if (res === 'win') { S.flags.trainer[n.trainer] = true; Scenes.push(new DialogScene(T.win.map(l => `${n.name}「${l}」`))); }
    else if (res === 'lose') this.blackout();
  }

  openMenu() {
    Scenes.push(new MenuScene(`メニュー   W ${S.w}`, [
      { label: 'パーティ', fn: () => Scenes.push(new PartyScene('view')) },
      { label: 'もちもの', fn: () => Scenes.push(new BagScene()) },
      { label: 'レシピちょう', fn: () => Scenes.push(new RecipeScene()) },
      { label: 'ちず', fn: () => Scenes.push(new WorldMapScene()) },
      { label: Snd.isMuted() ? 'おと：OFF → ON' : 'おと：ON → OFF', fn: () => { Snd.setMuted(!Snd.isMuted()); Scenes.pop(); } },
      { label: 'セーブ', fn: () => { const ok = saveGame(); Scenes.push(new DialogScene([ok ? 'セーブした！' : 'セーブできなかった…'])); } },
      { label: 'タイトルへ', fn: () => { Scenes.pop(); Scenes.replace(new TitleScene()); } },
      { label: 'とじる', fn: () => Scenes.pop() },
    ], { w: 230, x: 400 }));
  }

  // ---- 描画 ----
  draw() {
    const camX = clamp(this.px - W / 2, 0, this.W.w * TILE - W), camY = clamp(this.py - H / 2, 0, this.W.h * TILE - H);
    ctx.save(); ctx.translate(-Math.round(camX), -Math.round(camY));
    const x0 = Math.floor(camX / TILE), y0 = Math.floor(camY / TILE);
    for (let ty = y0; ty <= y0 + 12; ty++) for (let tx = x0; tx <= x0 + 20; tx++) {
      if (tx < 0 || ty < 0 || tx >= this.W.w || ty >= this.W.h) continue;
      this.drawTile(this.tiles[ty][tx], tx * TILE, ty * TILE, tx, ty);
    }
    const ents = [], vis = (x, y) => x > camX - 60 && x < camX + W + 60 && y > camY - 60 && y < camY + H + 80;
    this.enemies.forEach(e => { if (e.alive && vis(e.x, e.y)) ents.push({ y: e.y, f: () => this.drawEnemy(e) }); });
    this.npcs.forEach(n => { if (vis(n.x, n.y)) ents.push({ y: n.y, f: () => this.drawNpc(n) }); });
    const lead = S.party.find(c => c.hp > 0) || S.party[0];
    const tp = this.trail[Math.max(0, this.trail.length - 13)];
    ents.push({ y: tp.y, f: () => drawCreature(lead, tp.x, tp.y - 6 - (this.mode === 'fly' ? 10 : 0), lead.species === 'dino' ? 40 : 30, (tp.fx || 1) >= 0 ? 1 : -1, this.t) });
    ents.push({ y: this.py, f: () => drawHero(this.px, this.py - 2, this.face, this.moving ? this.walk : 0, this.mode === 'swim', null, this.mode === 'fly' || this.mode === 'heat' ? this.mode : null) });
    ents.sort((a, b) => a.y - b.y).forEach(o => o.f());
    for (let ty = y0 - 1; ty <= y0 + 13; ty++) for (let tx = x0; tx <= x0 + 20; tx++) { const ch = this.tile(tx, ty); if (ch === 'T' || ch === 'P') this.drawCanopy(tx * TILE, ty * TILE, tx, ty); }
    ctx.restore();
    this.drawAmbient();
    if (this.W.dark) this.drawDark();
    if (this.fadeT > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, this.fadeT * 2)})`; ctx.fillRect(0, 0, W, H); }

    // HUD
    if (this.bannerT > 0) { ctx.globalAlpha = clamp(this.bannerT, 0, 1); box(W / 2 - 120, 14, 240, 32); txt(this.bannerName, W / 2, 21, { size: 16, align: 'center' }); ctx.globalAlpha = 1; }
    box(8, 8, 96, 24, { bg: 'rgba(30,36,64,.88)' }); txt('W', 18, 12, { size: 13, color: '#ffd96a' }); txt(String(S.w), 96, 12, { size: 13, align: 'right' });
    S.party.forEach((c, i) => {
      const x = W - 112, y = 8 + i * 22;
      ctx.globalAlpha = .85; rr(x, y, 104, 19, 5); ctx.fillStyle = 'rgba(10,14,30,.7)'; ctx.fill(); ctx.globalAlpha = 1;
      txt(c.name.slice(0, 5), x + 5, y + 3, { size: 10, color: c.hp > 0 ? '#fff' : '#e66' });
      bar(x + 52, y + 7, 48, 5, c.hp / maxHp(c));
    });
    // ミニマップ
    const mh = Math.max(24, Math.min(50, Math.round(80 * this.W.h / this.W.w))), mx = W - 92, my = H - 12 - mh;
    box(mx - 3, my - 3, 86, mh + 6, { bg: 'rgba(10,14,30,.6)', bg2: 'rgba(10,14,30,.6)' });
    ctx.save(); rr(mx, my, 80, mh, 4); ctx.clip(); ctx.globalAlpha = .9; ctx.drawImage(this.mini, 0, 0, this.W.w, this.W.h, mx, my, 80, mh); ctx.globalAlpha = 1;
    if (this.mapId === 'world') ctx.drawImage(fogCanvas(), 0, 0, FOG_W, FOG_H, mx, my, 80, mh);
    ctx.fillStyle = Math.floor(this.t * 3) % 2 ? '#fff' : '#ff4a4a'; ctx.beginPath(); ctx.arc(mx + this.px / TILE / this.W.w * 80, my + this.py / TILE / this.W.h * mh, 2.4, 0, 7); ctx.fill(); ctx.restore();
    if (this.toastT > 0) { box(40, 296, 560, 40, { bg: 'rgba(30,36,64,.92)' }); txt(this.toastS, W / 2, 307, { size: 13, align: 'center' }); }
    txt('Z：しらべる  X：メニュー  M：ちず', 10, H - 18, { size: 10, color: 'rgba(255,255,255,.75)', shadow: true });
  }
  drawNpc(n) {
    drawHero(n.x, n.y - 2, n.face, 0, false, n.look);
    const near = Math.hypot(this.px - n.x, this.py - n.y) < 56;
    if ((n.type === 'trainer' || n.type === 'guard') && !S.flags.trainer[n.trainer]) txt('!', n.x - 3, n.y - 40 + Math.sin(this.t * 6) * 2, { size: 14, color: '#ff6a5a', shadow: true });
    if (n.type === 'shop') { ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(n.x, n.y - 34, 6, 0, 7); ctx.fill(); txt('W', n.x, n.y - 39, { size: 9, align: 'center', color: '#7a5a10' }); }
    if (near) { rr(n.x - 34, n.y - 58, 68, 15, 6); ctx.fillStyle = 'rgba(10,14,30,.75)'; ctx.fill(); txt(n.name, n.x, n.y - 57, { size: 9, align: 'center' }); }
  }
  drawEnemy(e) {
    const d = ENEMIES[e.key], size = d.ai === 'boss' ? 84 : d.shape === 'dino' ? 56 : d.shape === 'golem' ? 34 : 30;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(e.x, e.y + 8, size * .35, 4, 0, 0, 7); ctx.fill();
    drawCreature({ species: d.shape, element: d.element, parts: d.parts }, e.x, e.y - size * .12, size, e.dir.x >= 0 ? 1 : -1, this.t + e.x);
    if (d.ai === 'sleep') txt('z', e.x + 8, e.y - 26 + Math.sin(this.t * 3) * 2, { size: 11, shadow: true });
    if (d.ai === 'chase' && e.stun <= 0 && Math.hypot(this.px - e.x, this.py - e.y) < 120) txt('!', e.x - 3, e.y - size - 6, { size: 14, color: '#ffe36a', shadow: true });
    if (d.shape === 'dino' && d.ai !== 'boss') txt('★', e.x - 5, e.y - size - 4, { size: 10, color: '#ff8a5a', shadow: true });
  }
}
