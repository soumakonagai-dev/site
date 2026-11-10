'use strict';
// ===== 工房（合成：核は2つまで）・仕上げ画面（名前・見た目）=====
const ITEM_ORDER = Object.keys(ITEMS), byItemOrder = (a, b) => ITEM_ORDER.indexOf(a) - ITEM_ORDER.indexOf(b);

const CUSTOM_COLORS = [['そのまま', null], ['あか', '#e05050'], ['だいだい', '#f09040'], ['きいろ', '#f0d048'], ['みどり', '#58c060'], ['みず', '#58c8e8'], ['あお', '#4a78e0'], ['むらさき', '#9a62d8'], ['ももいろ', '#f08ab8'], ['しろ', '#f4f0ec'], ['くろ', '#4a4654'], ['きん', '#e8c040']];
const CUSTOM_PATTERNS = [['なし', null], ['しま', 'stripe'], ['みずたま', 'spot'], ['うろこ', 'scale']];
const CUSTOM_SIZES = [['ちいさい', .85], ['ふつう', 1], ['おおきい', 1.15]];
const CUSTOM_ACCS = [['なし', null], ['リボン', 'ribbon'], ['めがね', 'glasses'], ['スカーフ', 'scarf'], ['ぼうし', 'hat']];

// 名前の入力：ふつうの入力欄を画面の上に出す（日本語入力もOK）
function askName(cur, cb) {
  const r = cv.getBoundingClientRect(), inp = document.createElement('input');
  inp.type = 'text'; inp.maxLength = 8; inp.value = cur; inp.placeholder = 'なまえ（8もじまで）'; inp.setAttribute('aria-label', 'なまえ');
  inp.style.cssText = `position:fixed;left:${r.left + r.width / 2 - 140}px;top:${r.top + r.height * .42}px;width:280px;box-sizing:border-box;font:bold 22px sans-serif;text-align:center;z-index:50;padding:8px;border:3px solid #ffd96a;border-radius:8px;background:#14182c;color:#fff;outline:none`;
  document.body.appendChild(inp); inp.focus(); inp.select(); window.__naming = true;
  const done = ok => { if (!inp.parentNode) return; const v = inp.value.trim(); inp.remove(); window.__naming = false; if (ok && v) cb(v.slice(0, 8)); };
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.isComposing) return; if (e.key === 'Enter') { e.preventDefault(); done(true); } else if (e.key === 'Escape') { e.preventDefault(); done(false); } });
  inp.addEventListener('keyup', e => e.stopPropagation());
  inp.addEventListener('blur', () => setTimeout(() => done(true), 80));
}

// ----- 仕上げ：名前・色・もよう・大きさ・アクセサリー -----
class CustomizeScene {
  constructor(c, o) { this.c = c; this.o = o || {}; c.custom = c.custom || {}; this.sel = 0; this.t = 0; }
  rows() { return ['name', 'color', 'pattern', 'size', 'acc', 'ok', 'cancel']; }
  idx(list, v) { const i = list.findIndex(x => x[1] === v); return i < 0 ? (list === CUSTOM_SIZES ? 1 : 0) : i; }
  update(dt) {
    this.t += dt; if (window.__naming) return;
    const R = this.rows(); this.sel = nav(this.sel, R.length);
    const k = R[this.sel], cu = this.c.custom;
    const LIST = { color: [CUSTOM_COLORS, 'tint'], pattern: [CUSTOM_PATTERNS, 'pattern'], size: [CUSTOM_SIZES, 'size'], acc: [CUSTOM_ACCS, 'acc'] }[k];
    if (LIST) {
      const dir = (Input.rep.right ? 1 : 0) - (Input.rep.left ? 1 : 0) + (Input.edge.ok ? 1 : 0);
      if (dir) { const [list, key] = LIST, n = (this.idx(list, cu[key]) + dir + list.length) % list.length; cu[key] = list[n][1]; sfx('cursor'); }
    }
    if (Input.edge.cancel) { sfx('back'); Scenes.pop(); if (this.o.onCancel) this.o.onCancel(); return; }
    if (!Input.edge.ok) return;
    if (k === 'name') { sfx('ok'); askName(this.c.name, v => { this.c.name = v; sfx('ok'); }); }
    else if (k === 'ok') { sfx('ok'); Scenes.pop(); if (this.o.onDone) this.o.onDone(this.c); }
    else if (k === 'cancel') { sfx('back'); Scenes.pop(); if (this.o.onCancel) this.o.onCancel(); }
  }
  draw() {
    ctx.fillStyle = 'rgba(8,10,24,.88)'; ctx.fillRect(0, 0, W, H);
    const c = this.c, cu = c.custom, R = this.rows(), st = statsOf(c);
    box(10, 10, 300, 340);
    txt(this.o.create ? 'しあげ：なまえと みため' : 'なまえ・みためを かえる', 24, 18, { size: 12, color: '#bfb89a' });
    const lab = { name: 'なまえ', color: 'いろ', pattern: 'もよう', size: 'おおきさ', acc: 'アクセ' };
    const val = { name: c.name, color: CUSTOM_COLORS[this.idx(CUSTOM_COLORS, cu.tint)][0], pattern: CUSTOM_PATTERNS[this.idx(CUSTOM_PATTERNS, cu.pattern)][0], size: CUSTOM_SIZES[this.idx(CUSTOM_SIZES, cu.size)][0], acc: CUSTOM_ACCS[this.idx(CUSTOM_ACCS, cu.acc)][0] };
    R.forEach((k, i) => {
      const y = 44 + i * 40;
      if (i === this.sel) { rr(16, y - 6, 288, 36, 6); ctx.fillStyle = 'rgba(255,230,140,.2)'; ctx.fill(); txt('▶', 20, y + 2, { color: '#ffd96a' }); }
      if (k === 'ok') { txt(this.o.create ? '▶ これで つくる！' : '▶ けってい', 40, y + 3, { size: 15, color: '#ffd96a' }); return; }
      if (k === 'cancel') { txt(this.o.create ? '◀ もどる（そざいは へらない）' : '◀ もどる', 40, y + 3, { size: 14, color: '#ccc' }); return; }
      txt(lab[k], 40, y + 4, { size: 12, color: '#bfb89a' });
      if (k === 'name') { txt(val.name, 110, y + 1, { size: 17 }); txt('Zで にゅうりょく', 296, y + 6, { size: 10, align: 'right', color: '#999' }); }
      else { txt(`◀  ${val[k]}  ▶`, 110, y + 2, { size: 15 }); if (k === 'color' && cu.tint) { ctx.fillStyle = cu.tint; ctx.fillRect(272, y + 2, 20, 18); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(272, y + 2, 20, 18); } }
    });
    box(320, 10, 310, 340);
    sparkle(475, 150, this.t, 6, 80);
    drawCreature(c, 475, 150, 150, -1, this.t);
    txt(c.name, 475, 234, { size: 20, align: 'center', shadow: true });
    chips(c, 475 - (c.element2 ? 53 : 26), 262);
    txt(`Lv${c.level}  HP${st.hp} ATK${st.atk} DEF${st.def} SPD${st.spd}`, 475, 286, { size: 12, align: 'center' });
    txt(`わざ：${c.moves.map(m => MOVES[m].name).join(' / ')}`, 475, 306, { size: 11, align: 'center', color: '#ddd' });
    txt('みためだけが かわります（つよさは かわらない）', 475, 326, { size: 10, align: 'center', color: '#9fe08a' });
  }
}

// ----- 工房（合成） -----
class CraftScene {
  constructor() { this.phase = 'core'; this.core = null; this.core2 = null; this.picks = []; this.sel = 0; this.t = 0; }
  have(id) { return (S.inv[id] || 0) - (id === this.core ? 1 : 0) - this.picks.filter(p => p === id).length; }
  cores() { return Object.keys(S.inv).filter(id => ITEMS[id].kind === 'core' && S.inv[id] > 0).sort(byItemOrder); }
  parts() { return Object.keys(S.inv).filter(id => (ITEMS[id].kind === 'part' || ITEMS[id].kind === 'essence') && this.have(id) + (id === this.core2 ? 0 : 0) > 0).sort(byItemOrder); }
  rows() {
    if (this.phase === 'core') return this.cores().map(id => ({ id }));
    if (this.phase === 'core2') return [{ cmd: 'none', label: '（ふたつめの 核は つかわない）' }, ...this.cores().filter(id => (S.inv[id] || 0) - (id === this.core ? 1 : 0) > 0).map(id => ({ id }))];
    const r = this.picks.length < 3 ? this.parts().map(id => ({ id })) : [];
    r.push({ cmd: 'make', label: '▶ つくる！' }, { cmd: 'back', label: '◀ えらびなおす' });
    return r;
  }
  update(dt) {
    this.t += dt;
    const rows = this.rows();
    this.sel = clamp(nav(this.sel, rows.length), 0, Math.max(0, rows.length - 1));
    if (Input.edge.cancel) {
      sfx('back');
      if (this.phase === 'parts' && this.picks.length) this.picks.pop();
      else if (this.phase === 'parts') { this.phase = 'core2'; this.core2 = null; this.sel = 0; }
      else if (this.phase === 'core2') { this.phase = 'core'; this.core = null; this.sel = 0; }
      else Scenes.pop();
      return;
    }
    if (!Input.edge.ok || !rows.length) return;
    const r = rows[this.sel];
    if (this.phase === 'core') { this.core = r.id; this.phase = 'core2'; this.sel = 0; sfx('ok'); return; }
    if (this.phase === 'core2') { this.core2 = r.cmd ? null : r.id; this.phase = 'parts'; this.picks = []; this.sel = 0; sfx('ok'); return; }
    if (r.cmd === 'back') { this.phase = 'core'; this.core = this.core2 = null; this.picks = []; this.sel = 0; sfx('back'); return; }
    if (r.cmd === 'make') { this.make(); return; }
    this.picks.push(r.id); sfx('add');
  }
  make() {
    const core = this.core, core2 = this.core2, picks = this.picks.slice(), pv = craftPreview(core, picks, core2);
    const c = makeCreature(pv, craftLevel(), picks);
    Scenes.push(new CustomizeScene(c, { create: true, onDone: () => this.commit(c, pv, core, core2, picks) }));
  }
  commit(c, pv, core, core2, picks) {
    takeItem(core); if (core2) takeItem(core2); picks.forEach(id => takeItem(id));
    const first = pv.recipe && !S.flags.recipes[pv.recipe.id];
    if (pv.recipe) S.flags.recipes[pv.recipe.id] = true;
    let where = 'パーティに くわわった！';
    if (S.party.length < 4) S.party.push(c); else { S.box.push(c); where = '(パーティがいっぱいなので あずかりへ)'; }
    sfx('craft');
    Scenes.push(new ResultScene(c, first ? `★ レシピ発見！ ${where}` : where));
    this.phase = 'core'; this.core = this.core2 = null; this.picks = []; this.sel = 0;
  }
  draw() {
    ctx.fillStyle = 'rgba(8,10,24,.82)'; ctx.fillRect(0, 0, W, H);
    const rows = this.rows();
    box(10, 10, 250, 340);
    txt(this.phase === 'core' ? '①  核をえらぶ' : this.phase === 'core2' ? '②  ふたつめの核（なくてもOK）' : `③  そざいをえらぶ (${this.picks.length}/3)`, 24, 18, { size: 12, color: '#bfb89a' });
    const start = Math.max(0, this.sel - 8);
    rows.slice(start, start + 9).forEach((r, k) => {
      const i = start + k, y = 44 + k * 32;
      if (i === this.sel) { rr(16, y - 4, 238, 30, 6); ctx.fillStyle = 'rgba(255,230,140,.2)'; ctx.fill(); }
      if (r.cmd) { txt(r.label, 30, y + 3, { size: r.cmd === 'make' ? 14 : 12, color: r.cmd === 'make' ? '#ffd96a' : '#ccc' }); return; }
      const it = ITEMS[r.id], have = this.phase === 'core' ? S.inv[r.id] : this.phase === 'core2' ? (S.inv[r.id] - (r.id === this.core ? 1 : 0)) : this.have(r.id);
      ctx.fillStyle = it.color; ctx.fillRect(26, y + 5, 14, 14);
      txt(it.name, 48, y + 3, { size: 14, color: rarityColor(r.id) });
      txt('×' + have, 246, y + 3, { size: 14, align: 'right' });
    });
    if (this.phase === 'core' && !rows.length) txt('核がない！ てきを たおして あつめよう', 24, 50, { size: 12, color: '#e99' });
    // ---- 右：できあがり予想 ----
    box(270, 10, 360, 340);
    const hov = rows[this.sel];
    const coreId = this.phase === 'core' ? (hov && hov.id) : this.core;
    if (!coreId) return;
    const core2 = this.phase === 'core' ? null : this.phase === 'core2' ? (hov && hov.id ? hov.id : null) : this.core2;
    const picks = this.phase === 'parts' ? this.picks : [];
    const pv = craftPreview(coreId, picks, core2);
    const known = pv.recipe && S.flags.recipes[pv.recipe.id];
    const lv = craftLevel(), st = statsOf({ level: lv, base: pv.base, bonus: pv.bonus, factor: pv.factor });
    txt('ざいりょう', 284, 18, { size: 11, color: '#bfb89a' });
    [coreId, ...(core2 ? [core2] : []), ...picks].forEach((id, i) => {
      rr(284 + i * 46, 36, 40, 40, 6); ctx.fillStyle = ITEMS[id].color; ctx.fill();
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
      txt(ITEMS[id].name.slice(0, 3), 304 + i * 46, 50, { size: 10, align: 'center', color: '#222' });
    });
    for (let i = 1 + (core2 ? 1 : 0) + picks.length; i < 5; i++) { rr(284 + i * 46, 36, 40, 40, 6); ctx.strokeStyle = '#555'; ctx.lineWidth = 1.5; ctx.stroke(); }
    drawCreature({ species: pv.species, species2: pv.species2, element: pv.element, element2: pv.element2, parts: picks }, 560, 142, 110, -1, this.t);
    sparkle(560, 142, this.t, 6, 64);
    txt(known || !pv.recipe ? pv.name : '？？？', 284, 94, { size: 18 });
    chips(pv, 284, 124);
    txt((pv.species2 ? `${SPECIES[pv.species].name} × ${SPECIES[pv.species2].name}` : SPECIES[pv.species].name) + (CORE_BIAS[pv.species] ? '（' + CORE_BIAS[pv.species].role + '）' : ''), 284, 146, { size: 11, color: '#bfb89a' });
    txt(`Lv${lv}  HP${st.hp} ATK${st.atk} DEF${st.def} SPD${st.spd}`, 284, 164, { size: 12 });
    txt('わざ', 284, 208, { size: 11, color: '#bfb89a' });
    pv.moves.forEach((m, i) => {
      const mv = MOVES[m];
      const sp = (pv.combos || []).includes(m);
      txt((sp ? '★' : '') + mv.name, 292 + (i % 2) * 168, 224 + Math.floor(i / 2) * 22, { size: 13, color: sp ? '#ffd96a' : ELEMENTS[mv.element].color });
    });
    if (pv.combos && pv.combos.length) txt('★ ふたつの そざいで とくべつな わざ！', 284, 266, { size: 12, color: '#ffd96a' });
    if (pv.recipe) txt(known ? '★ レシピの なかま' : '★ なにか とくべつな よかんが する…！', 284, 288, { size: 12, color: '#ffd96a' });
    else txt(pv.species2 ? '◆ ハイブリッド！ ふたつの 種族の とくちょうを もつ' : 'じぶんで くみあわせた オリジナル', 284, 288, { size: 12, color: pv.species2 ? '#ffb86a' : '#aaa' });
    txt('Z：きめる   X：もどす', 616, 326, { size: 11, align: 'right', color: '#aaa' });
  }
}
