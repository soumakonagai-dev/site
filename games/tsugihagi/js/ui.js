'use strict';
// ===== メニュー系の画面 =====
function nav(cur, len, up = 'up', down = 'down') {
  if (len <= 0) return 0;
  const before = cur;
  if (Input.rep[up]) cur = (cur - 1 + len) % len;
  if (Input.rep[down]) cur = (cur + 1) % len;
  if (cur !== before) sfx('cursor');
  return cur;
}
const abilityText = c => {
  const a = new Set(c.abilities);
  c.moves.forEach(m => { if (MOVES[m].field) a.add(MOVES[m].field); });
  return [...a].map(x => ABILITY_NAMES[x]).join('・') || 'なし';
};

// ----- メッセージ -----
class DialogScene {
  constructor(lines, cb) { this.lines = lines; this.i = 0; this.cb = cb; this.t = 0; }
  update(dt) {
    this.t += dt;
    if (Input.edge.ok || Input.edge.cancel) {
      if (++this.i >= this.lines.length) { Scenes.pop(); if (this.cb) this.cb(); }
    }
  }
  draw() {
    box(10, 262, 620, 88);
    wrap(this.lines[this.i], 590, 15).slice(0, 3).forEach((l, i) => txt(l, 26, 276 + i * 22, { size: 15 }));
    if (Math.sin(this.t * 6) > 0) txt('▼', 610, 328, { size: 11 });
  }
}

// ----- 汎用の縦メニュー -----
class MenuScene {
  constructor(title, items, o = {}) { this.title = title; this.items = items; this.sel = 0; this.o = o; this.x = o.x ?? 440; this.y = o.y ?? 20; this.w = o.w ?? 190; }
  update() {
    this.sel = nav(this.sel, this.items.length);
    if (Input.edge.cancel && !this.o.noCancel) { sfx('back'); Scenes.pop(); return; }
    if (Input.edge.ok) { const it = this.items[this.sel]; if (!it.off) { sfx('ok'); it.fn(); } }
  }
  draw() {
    const h = 40 + this.items.length * 28;
    box(this.x, this.y, this.w, h);
    if (this.title) txt(this.title, this.x + 14, this.y + 10, { size: 12, color: '#bfb89a' });
    this.items.forEach((it, i) => {
      const y = this.y + 34 + i * 28;
      if (i === this.sel) { rr(this.x + 8, y - 4, this.w - 16, 26, 6); ctx.fillStyle = 'rgba(255,230,140,.2)'; ctx.fill(); txt('▶', this.x + 12, y, { color: '#ffd96a' }); }
      txt(it.label, this.x + 32, y, { size: 14, color: it.off ? '#777' : '#fff' });
    });
  }
}

// ----- つくったあとの演出 -----
class ResultScene {
  constructor(c, where) { this.c = c; this.where = where; this.t = 0; }
  update(dt) { this.t += dt; if (this.t > .8 && (Input.edge.ok || Input.edge.cancel)) Scenes.pop(); }
  draw() {
    ctx.fillStyle = 'rgba(10,10,30,.85)'; ctx.fillRect(0, 0, W, H);
    const sc = Math.min(1, this.t * 2.5);
    sparkle(W / 2, 150, this.t, 14, 110);
    drawCreature(this.c, W / 2, 150, 150 * sc, 1, this.t);
    txt(`${this.c.name} が うまれた！`, W / 2, 232, { size: 22, align: 'center', shadow: true });
    chips(this.c, W / 2 - (this.c.element2 ? 53 : 26), 266);
    txt(`わざ：${this.c.moves.map(m => MOVES[m].name).join(' / ')}`, W / 2, 288, { size: 12, align: 'center' });
    txt(`のうりょく：${abilityText(this.c)}　${this.where}`, W / 2, 308, { size: 12, align: 'center', color: '#ffd96a' });
    if (this.t > .8) txt('Z：とじる', W / 2, 332, { size: 11, align: 'center', color: '#aaa' });
  }
}

// ----- なかまの詳細 -----
function drawDetails(c, x, y, w, h, t) {
  box(x, y, w, h);
  if (!c) { txt('(からっぽ)', x + w / 2, y + h / 2 - 8, { align: 'center', color: '#888' }); return; }
  const st = statsOf(c);
  drawCreature(c, x + w - 62, y + 62, 82, -1, t || 0);
  txt(c.name, x + 14, y + 12, { size: 18 });
  txt(`Lv ${c.level}`, x + 14, y + 36, { size: 12, color: '#ffd96a' });
  chips(c, x + 64, y + 36);
  bar(x + 14, y + 58, 110, 8, c.hp / st.hp);
  txt(`HP ${c.hp}/${st.hp}`, x + 14, y + 70, { size: 11 });
  txt(`ATK ${st.atk}   DEF ${st.def}   SPD ${st.spd}`, x + 14, y + 92, { size: 12 });
  txt('わざ', x + 14, y + 140, { size: 11, color: '#bfb89a' });
  c.moves.forEach((m, i) => {
    const mv = MOVES[m];
    txt(mv.name, x + 20, y + 158 + i * 20, { size: 12, color: ELEMENTS[mv.element].color });
    txt(`EN${mv.en}  ${mv.power ? 'いりょく' + mv.power : '回復'}`, x + w - 14, y + 158 + i * 20, { size: 11, align: 'right', color: '#ccc' });
  });
  const need = expNeed(c.level);
  txt(`つぎのレベルまで ${need - c.exp}`, x + 14, y + h - 22, { size: 11, color: '#999' });
}

// ----- パーティ（view=見るだけ / camp=入れ替え / pick=選ぶ） -----
class PartyScene {
  constructor(mode, cb, title) { this.mode = mode; this.cb = cb; this.title = title; this.col = 0; this.cur = [0, 0]; this.pick = null; this.t = 0; }
  rows(col) { return col === 0 ? (this.mode === 'camp' && S.party.length < 4 ? S.party.length + 1 : S.party.length) : S.box.length + 1; }
  update(dt) {
    this.t += dt;
    if (this.mode === 'camp') {
      if (Input.rep.left) this.col = 0;
      if (Input.rep.right) this.col = 1;
    }
    this.cur[this.col] = clamp(nav(this.cur[this.col], this.rows(this.col)), 0, this.rows(this.col) - 1);
    if (Input.edge.cancel) { sfx('back'); if (this.pick) this.pick = null; else Scenes.pop(); return; }
    if (!Input.edge.ok) return;
    const i = this.cur[this.col];
    if (this.mode === 'pick') { Scenes.pop(); this.cb(i); return; }
    if (this.mode !== 'camp') return;
    const list = this.col === 0 ? S.party : S.box;
    if (!this.pick) { if (i < list.length) { this.pick = { col: this.col, i }; sfx('ok'); } return; }
    this.apply(this.pick, { col: this.col, i }); this.pick = null;
  }
  apply(a, b) {
    const A = a.col === 0 ? S.party : S.box, B = b.col === 0 ? S.party : S.box;
    if (a.col === b.col && a.i === b.i) return;
    const ca = A[a.i], cb = B[b.i];
    if (cb === undefined) {
      if (a.col === 0 && S.party.length <= 1) return;
      if (b.col === 0 && S.party.length >= 4) return;
      A.splice(a.i, 1); B.push(ca);
    } else { A[a.i] = cb; B[b.i] = ca; }
    sfx('ok');
  }
  draw() {
    ctx.fillStyle = 'rgba(8,10,24,.75)'; ctx.fillRect(0, 0, W, H);
    const camp = this.mode === 'camp';
    const colW = camp ? 190 : 200;
    const drawList = (col, x, label, list, extra) => {
      box(x, 10, colW, 340, { border: this.col === col ? '#ffd96a' : '#8a8570' });
      txt(label, x + 14, 18, { size: 12, color: '#bfb89a' });
      const start = Math.max(0, this.cur[col] - 6);
      for (let r = 0; r < Math.min(extra, 8); r++) {
        const i = start + r, y = 44 + r * 38, c = list[i];
        if (i >= extra) break;
        const on = this.cur[col] === i && this.col === col;
        if (on) { rr(x + 6, y - 4, colW - 12, 36, 6); ctx.fillStyle = 'rgba(255,230,140,.2)'; ctx.fill(); }
        if (this.pick && this.pick.col === col && this.pick.i === i) { rr(x + 6, y - 4, colW - 12, 36, 6); ctx.strokeStyle = '#7fd0ff'; ctx.lineWidth = 2; ctx.stroke(); }
        if (!c) { txt('(あき)', x + 20, y + 6, { size: 12, color: '#777' }); continue; }
        drawCreature(c, x + 26, y + 14, 30, 1, this.t);
        txt(`${c.name}  Lv${c.level}`, x + 48, y - 1, { size: 12, color: c.hp > 0 ? '#fff' : '#e66' });
        bar(x + 48, y + 17, colW - 70, 6, c.hp / maxHp(c));
      }
    };
    drawList(0, 10, this.title || 'パーティ', S.party, this.rows(0));
    if (camp) drawList(1, 206, 'あずかり', S.box, this.rows(1));
    const cur = (this.col === 0 ? S.party : S.box)[this.cur[this.col]];
    if (camp) drawDetails(cur, 402, 10, 228, 340, this.t); else drawDetails(cur, 216, 10, 414, 340, this.t);
    const help = camp ? (this.pick ? 'Z：いれかえ先をえらぶ  X：やめる' : 'Z：えらぶ  ←→：リスト  X：もどる') : (this.mode === 'pick' ? 'Z：けってい  X：もどる' : 'X：もどる');
    txt(help, W - 12, H - 20, { size: 11, align: 'right', color: '#aaa' });
  }
}

// ----- もちもの -----
class BagScene {
  constructor() { this.sel = 0; }
  list() { return Object.keys(S.inv).filter(id => S.inv[id] > 0).sort((a, b) => ['use', 'core', 'part', 'essence'].indexOf(ITEMS[a].kind) - ['use', 'core', 'part', 'essence'].indexOf(ITEMS[b].kind)); }
  update() {
    const l = this.list();
    this.sel = clamp(nav(this.sel, l.length), 0, Math.max(0, l.length - 1));
    if (Input.edge.cancel) { sfx('back'); Scenes.pop(); return; }
    if (Input.edge.ok && l.length) {
      const id = l[this.sel], it = ITEMS[id];
      if (it.kind === 'use') {
        Scenes.push(new PartyScene('pick', i => {
          const c = S.party[i];
          if (c.hp >= maxHp(c)) { Scenes.push(new DialogScene([`${c.name}は げんきいっぱいだ。`])); return; }
          takeItem(id); c.hp = Math.min(maxHp(c), c.hp + it.heal); sfx('heal');
          Scenes.push(new DialogScene([`${c.name}の HPが かいふくした！`]));
        }, 'だれにつかう？'));
      }
    }
  }
  draw() {
    ctx.fillStyle = 'rgba(8,10,24,.75)'; ctx.fillRect(0, 0, W, H);
    const l = this.list();
    box(10, 10, 330, 340);
    txt('もちもの', 24, 18, { size: 12, color: '#bfb89a' });
    const start = Math.max(0, this.sel - 9);
    l.slice(start, start + 10).forEach((id, r) => {
      const i = start + r, y = 44 + r * 30, it = ITEMS[id];
      if (i === this.sel) { rr(16, y - 4, 318, 28, 6); ctx.fillStyle = 'rgba(255,230,140,.2)'; ctx.fill(); }
      ctx.fillStyle = it.color; ctx.fillRect(26, y + 2, 14, 14);
      txt(it.name, 50, y, { size: 14, color: rarityColor(id) });
      txt('×' + S.inv[id], 322, y, { size: 14, align: 'right' });
    });
    if (!l.length) txt('なにも もっていない', 30, 50, { color: '#888' });
    box(350, 10, 280, 150);
    if (l.length) {
      const it = ITEMS[l[this.sel]];
      txt(it.name, 364, 22, { size: 16 });
      wrap(it.desc, 250, 12).forEach((s, i) => txt(s, 364, 52 + i * 18, { size: 12, color: '#ddd' }));
      if (it.kind === 'use') txt('Z：つかう', 364, 130, { size: 11, color: '#ffd96a' });
    }
    txt('X：もどる', W - 12, H - 20, { size: 11, align: 'right', color: '#aaa' });
  }
}

// ----- レシピちょう -----
class RecipeScene {
  constructor() { this.sel = 0; }
  update() {
    this.sel = nav(this.sel, RECIPES.length);
    if (Input.edge.cancel) { sfx('back'); Scenes.pop(); }
  }
  draw() {
    ctx.fillStyle = 'rgba(8,10,24,.75)'; ctx.fillRect(0, 0, W, H);
    box(10, 10, 300, 340);
    txt('レシピちょう', 24, 18, { size: 12, color: '#bfb89a' });
    const st = Math.max(0, Math.min(this.sel - 8, RECIPES.length - 10));
    RECIPES.slice(st, st + 10).forEach((r, k) => {
      const i = st + k, y = 44 + k * 30, known = S.flags.recipes[r.id];
      if (i === this.sel) { rr(16, y - 4, 288, 30, 6); ctx.fillStyle = 'rgba(255,230,140,.2)'; ctx.fill(); }
      txt(known ? r.name : '？？？', 30, y + 2, { size: 14, color: known ? '#fff' : '#888' });
    });
    box(320, 10, 310, 340);
    const r = RECIPES[this.sel], known = S.flags.recipes[r.id];
    if (known) {
      const pv = craftPreview(r.core, r.parts);
      drawCreature({ species: pv.species, element: pv.element, parts: r.parts }, 560, 70, 80, -1, 0);
      txt(r.name, 336, 22, { size: 18 });
      chips(pv, 336, 48);
      txt('ざいりょう', 336, 82, { size: 11, color: '#bfb89a' });
      [r.core, ...r.parts].forEach((id, i) => txt('・' + ITEMS[id].name, 342, 100 + i * 18, { size: 12 }));
      txt(`のうりょく：${abilityText({ abilities: r.abilities, moves: r.moves })}`, 336, 200, { size: 12, color: '#9fe08a' });
      txt(`わざ：${r.moves.map(m => MOVES[m].name).join(' / ')}`, 336, 222, { size: 12 });
    } else {
      txt('？？？', 336, 22, { size: 18, color: '#888' });
      txt('まだ つくったことのない レシピ。', 336, 62, { size: 12, color: '#aaa' });
      txt('ヒント：', 336, 96, { size: 12, color: '#bfb89a' });
      wrap(r.hint, 280, 13).forEach((s, i) => txt(s, 336, 118 + i * 20, { size: 13, color: '#ffd96a' }));
    }
    txt('X：もどる', W - 12, H - 20, { size: 11, align: 'right', color: '#aaa' });
  }
}

// ----- 工房（合成） -----
// ----- ショップ（Wポイントで ふつうの そざいを かう）-----
const rarityColor = id => { const r = ITEMS[id].rarity; return r >= 3 ? '#ffd84a' : r === 2 ? '#9fe0ff' : '#fff'; };
class ShopScene {
  constructor(stock, title) { this.stock = stock; this.title = title || 'ショップ'; this.sel = 0; this.qty = 1; this.msg = ''; this.mt = 0; }
  update(dt) {
    this.mt -= dt;
    this.sel = nav(this.sel, this.stock.length);
    if (Input.rep.left) this.qty = Math.max(1, this.qty - 1);
    if (Input.rep.right) this.qty = Math.min(10, this.qty + 1);
    if (Input.edge.cancel) { sfx('back'); Scenes.pop(); return; }
    if (Input.edge.ok) {
      const id = this.stock[this.sel], it = ITEMS[id], cost = it.price * this.qty;
      if (S.w >= cost) { S.w -= cost; addItem(id, this.qty); sfx('get'); this.msg = `${it.name}を ${this.qty}こ かった！`; }
      else { sfx('back'); this.msg = 'Wポイントが たりない…'; }
      this.mt = 1.6;
    }
  }
  draw() {
    ctx.fillStyle = 'rgba(8,10,24,.8)'; ctx.fillRect(0, 0, W, H);
    box(10, 10, 340, 340);
    txt(this.title, 24, 18, { size: 12, color: '#bfb89a' });
    this.stock.forEach((id, i) => {
      const y = 44 + i * 32, it = ITEMS[id];
      if (i === this.sel) { rr(16, y - 4, 328, 30, 6); ctx.fillStyle = 'rgba(255,230,140,.2)'; ctx.fill(); txt('▶', 20, y + 2, { color: '#ffd96a' }); }
      ctx.fillStyle = it.color; ctx.fillRect(40, y + 4, 14, 14);
      txt(it.name, 62, y + 2, { size: 14 });
      txt(`W ${it.price}`, 336, y + 2, { size: 14, align: 'right', color: '#ffd96a' });
    });
    box(360, 10, 270, 340);
    const id = this.stock[this.sel], it = ITEMS[id];
    txt(it.name, 376, 22, { size: 16, color: rarityColor(id) });
    wrap(it.desc, 240, 12).forEach((s, i) => txt(s, 376, 52 + i * 18, { size: 12, color: '#ddd' }));
    txt(`もっている： ${itemCount(id)}`, 376, 130, { size: 12, color: '#bfb89a' });
    txt(`かう かず： ◀ ${this.qty} ▶`, 376, 170, { size: 15 });
    txt(`ごうけい： W ${it.price * this.qty}`, 376, 198, { size: 14, color: S.w >= it.price * this.qty ? '#ffd96a' : '#e66' });
    box(376, 250, 238, 30, { bg: 'rgba(30,36,64,.9)' }); txt('もちW', 392, 257, { size: 12, color: '#bfb89a' }); txt(String(S.w), 600, 257, { size: 14, align: 'right', color: '#ffd96a' });
    if (this.mt > 0) txt(this.msg, 376, 300, { size: 13, color: '#9fe08a' });
    txt('Z：かう  ←→：かず  X：やめる', 616, 326, { size: 11, align: 'right', color: '#aaa' });
  }
}

// ----- ちず（ズーム・いどうできる／行ったことのない場所は黒）-----
const MAP_ZOOMS = [1, 2, 3.5, 6];
class WorldMapScene {
  constructor() {
    this.t = 0; this.zi = 0;
    const pp = FIELD.mapId === 'world' ? [FIELD.px, FIELD.py] : (FIELD.lastWorld || [WORLD.start.x * TILE, WORLD.start.y * TILE]);
    this.pl = [pp[0] / TILE, pp[1] / TILE]; this.cx = this.pl[0]; this.cy = this.pl[1];
  }
  update(dt) {
    this.t += dt;
    if (Input.edge.cancel || Input.edge.map) { sfx('back'); Scenes.pop(); return; }
    if (Input.edge.ok) { this.zi = (this.zi + 1) % MAP_ZOOMS.length; sfx('cursor'); if (this.zi === 0) { this.cx = WORLD.w / 2; this.cy = WORLD.h / 2; } }
    const k = this.k(), sp = 150 / k * dt;
    if (Input.held.left) this.cx -= sp;
    if (Input.held.right) this.cx += sp;
    if (Input.held.up) this.cy -= sp;
    if (Input.held.down) this.cy += sp;
    this.cx = Math.max(0, Math.min(WORLD.w, this.cx)); this.cy = Math.max(0, Math.min(WORLD.h, this.cy));
  }
  k() { return Math.min((W - 16) / WORLD.w, (H - 46) / WORLD.h) * MAP_ZOOMS[this.zi]; }
  draw() {
    ctx.fillStyle = 'rgba(4,6,14,.96)'; ctx.fillRect(0, 0, W, H);
    const k = this.k(), vx = 8, vy = 8, vw = W - 16, vh = H - 46, z = MAP_ZOOMS[this.zi];
    const ox = WORLD.w * k <= vw ? vx + (vw - WORLD.w * k) / 2 : vx + vw / 2 - this.cx * k;
    const oy = WORLD.h * k <= vh ? vy + (vh - WORLD.h * k) / 2 : vy + vh / 2 - this.cy * k;
    const sx = tx => ox + tx * k, sy = ty => oy + ty * k, seen = (tx, ty) => fogSeen(tx, ty);
    ctx.save(); ctx.beginPath(); ctx.rect(vx, vy, vw, vh); ctx.clip();
    ctx.imageSmoothingEnabled = false; ctx.drawImage(FIELD.minis.world || FIELD.mini, 0, 0, WORLD.w, WORLD.h, ox, oy, WORLD.w * k, WORLD.h * k);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(fogCanvas(), 0, 0, FOG_W, FOG_H, ox, oy, WORLD.w * k, WORLD.h * k);
    const dot = (tx, ty, col, r) => { ctx.fillStyle = col; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx(tx), sy(ty), r, 0, 7); ctx.fill(); ctx.stroke(); };
    const tag = (tx, ty, s, col, bg) => { const x = sx(tx), y = sy(ty); rr(x - 8, y - 8, 16, 16, 4); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.3; ctx.stroke(); txt(s, x, y - 6, { size: 11, align: 'center', color: col }); };
    REGION_KEYS.forEach(r => { const [hx, hy] = REGIONS[r].hub; if (seen(hx, hy)) txt(REGIONS[r].name, sx(hx), sy(hy - 12), { size: 11 + (z > 2 ? 2 : 0), align: 'center', shadow: true }); });
    if (z >= 2) Object.keys(WORLD.chests || {}).forEach(key => { const c = WORLD.chests[key]; if (S.flags.chest[c.id]) return; const [x, y] = key.split(',').map(Number); if (!seen(x, y)) return; ctx.fillStyle = '#ffd84a'; ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.fillRect(sx(x + .5) - 2.5, sy(y + .5) - 2.5, 5, 5); ctx.strokeRect(sx(x + .5) - 2.5, sy(y + .5) - 2.5, 5, 5); });
    Object.keys(WORLD.warps || {}).forEach(key => { const [x, y] = key.split(',').map(Number); if (seen(x, y)) { dot(x + .5, y + .5, '#3a2a4a', 4.5); ctx.strokeStyle = '#c8b0ff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(sx(x + .5), sy(y + .5), 4.5, 0, 7); ctx.stroke(); } });
    WORLD.npcs.forEach(n => {
      const tx = n.x / TILE, ty = n.y / TILE; if (!seen(tx, ty)) return;
      if (n.type === 'trainer') { const done = S.flags.trainer[n.trainer]; if (z >= 2 || !done) dot(tx, ty, done ? '#888' : '#ff6a5a', z >= 2 ? 3.5 : 2.5); if (z >= 3.5) txt(n.name, sx(tx), sy(ty) + 5, { size: 9, align: 'center', shadow: true }); }
      else if (n.type === 'guard') { if (!S.flags.gate[n.dest]) { tag(tx, ty, '門', '#fff', '#8a5a2a'); if (z >= 2) txt(n.name, sx(tx), sy(ty) + 9, { size: 9, align: 'center', shadow: true }); } }
      else if (n.type === 'challenge') { const s = CH_SITES[n.ch], best = (S.flags.chal || {})['best_' + n.ch] || 0; tag(tx, ty, s.kind === 'tower' ? '塔' : '闘', '#fff', s.kind === 'tower' ? '#6a4ab0' : '#b03a4a'); if (z >= 2) txt(`${s.name}${best ? '  Best ' + best : ''}`, sx(tx), sy(ty) + 9, { size: 9, align: 'center', shadow: true }); }
    });
    WORLD.villages.forEach(v => { if (!seen(v.cx, v.cy)) return; dot(v.cx, v.cy, '#ffd84a', 4.5); txt(v.name, sx(v.cx), sy(v.cy) + 6, { size: 10, align: 'center', shadow: true }); });
    for (const key in WORLD.bossSpots) { if (S.flags.boss[key]) continue; const [bx, by] = WORLD.bossSpots[key]; if (seen(bx, by)) txt('★', sx(bx), sy(by) - 8, { size: 15, align: 'center', color: '#ff5a4a', shadow: true }); }
    ctx.fillStyle = Math.floor(this.t * 3) % 2 ? '#fff' : '#ff4a4a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx(this.pl[0]), sy(this.pl[1]), 5, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    txt('●むら  塔=試練の塔  闘=ボスチャレンジ  門=もんばん  ●赤=しょうぶできる人  ★=ぬし  ◎=ほら穴  ■=たからばこ', W / 2, H - 36, { size: 10, align: 'center', color: '#ccc' });
    txt(`↑↓←→：いどう   Z：ズーム（x${z}）   X：とじる   ※ いったことのない ばしょは 見えない`, W / 2, H - 20, { size: 10, align: 'center', color: '#9ab' });
  }
}
