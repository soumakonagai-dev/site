'use strict';
// ===== ターン制バトル（野生・ボス・トレーナー戦） =====
class BattleScene {
  constructor(key, opt) {
    this.opaque = true; this.opt = opt; this.tr = opt.trainer || null;
    if (this.tr) {
      this.team = this.tr.team.map(([k, l, f]) => ({ k, c: makeEnemy(k, l, f) }));
      this.ei = 0; this.key = this.team[0].k; this.ec = this.team[0].c;
    } else { this.key = key; this.ec = makeEnemy(key); }
    this.def = ENEMIES[this.key]; this.boss = this.def.ai === 'boss'; this.noRun = !!this.tr || this.boss;
    this.U = {};
    this.eu = this.unit(this.ec, 'e');
    const first = S.party.find(c => c.hp > 0);
    this.pu = this.unit(first, 'p');
    this.part = new Set([first.uid]);
    this.fx = []; this.shake = 0;
    this.over = null; this.needSwap = false; this.turn = 0; this.sel = 0; this.t = 0; this.intro = .5;
    this.first = opt.preempt ? 'p' : opt.ambush ? 'e' : null;
    this.q = this.tr
      ? [`${this.tr.name}が しょうぶを しかけてきた！`, `${this.tr.name}は ${this.ec.name}を くりだした！`, `ゆけっ、${first.name}！`]
      : [opt.ambush ? `${this.def.name}の ふいうち！` : opt.preempt ? `せんせいこうげき！ ${this.def.name}が あらわれた！` : this.boss ? `${this.def.name}が あらわれた！ ものすごい プレッシャーだ！` : `${this.def.name}が あらわれた！`,
         `ゆけっ、${first.name}！`];
    this.msg = ''; this.mt = 0; this.phase = 'msg';
    this.next();
  }
  unit(c, side) { return this.U[c.uid] || (this.U[c.uid] = { c, side, en: 3, st: null, fl: 0, disp: c.hp, hold: 0, lun: null }); }
  qf(arr) { this.q.unshift(...arr); }

  // ---- メッセージ進行 ----
  next() {
    for (;;) {
      if (!this.q.length) { this.after(); return; }
      const it = this.q.shift();
      const r = typeof it === 'function' ? it.call(this) : it;
      if (r) { this.msg = r; this.mt = 0; this.phase = 'msg'; return; }
    }
  }
  after() {
    if (this.over) { this.finish(); return; }
    if (this.needSwap) { this.needSwap = false; this.phase = 'force'; this.sel = this.firstAliveIdx(); return; }
    this.phase = 'menu'; this.sel = 0; this.msg = '';
  }
  firstAliveIdx() { return Math.max(0, S.party.findIndex(c => c.hp > 0 && c !== this.pu.c)); }
  finish() { Scenes.pop(); this.opt.onEnd(this.over, this); }

  // ---- ターン ----
  startTurn(pa) {
    const ea = this.enemyChoose();
    const prio = (side, a) => {
      let p = a.type === 'move' ? (MOVES[a.id].priority || 0) : 5;
      if (this.turn === 0 && this.first === side && a.type === 'move') p += .5;
      return p;
    };
    const L = [{ side: 'p', a: pa }, { side: 'e', a: ea }];
    L.forEach(o => { o.p = prio(o.side, o.a); { const un = o.side === 'p' ? this.pu : this.eu; o.s = (statsOf(un.c).spd + Math.random() * .5) * (un.st === 'chill' ? .5 : 1); } });
    L.sort((a, b) => b.p - a.p || b.s - a.s);
    this.q = [() => this.doAct(L[0]), () => this.doAct(L[1]), () => this.endTurn()];
    this.next();
  }
  enemyChoose() {
    const e = this.eu;
    let pool = e.c.moves.filter(m => MOVES[m].en <= e.en);
    if (!pool.length) pool = [e.c.moves.find(m => MOVES[m].en === 0) || e.c.moves[0]];
    const w = pool.map(m => (MOVES[m].power || 20) * defMult(MOVES[m].element, this.pu.c) + 10);
    let r = Math.random() * w.reduce((a, b) => a + b, 0), i = 0;
    while (i < pool.length - 1 && (r -= w[i]) > 0) i++;
    return { type: 'move', id: pool[i] };
  }
  doAct(o) {
    if (this.over) return null;
    const me = o.side === 'p' ? this.pu : this.eu, foe = o.side === 'p' ? this.eu : this.pu;
    if (me.c.hp <= 0 || foe.c.hp <= 0) return null;
    const a = o.a;
    if (a.type === 'swap') {
      const old = this.pu;
      this.pu = this.unit(S.party[a.idx], 'p'); this.part.add(this.pu.c.uid); sfx('swap');
      return `${old.c.name}、もどれ！ いけっ、${this.pu.c.name}！`;
    }
    if (a.type === 'item') {
      takeItem(a.id);
      const c = this.pu.c; c.hp = Math.min(maxHp(c), c.hp + ITEMS[a.id].heal); sfx('heal');
      return `${ITEMS[a.id].name}を つかった！ ${c.name}の HPが かいふくした！`;
    }
    if (a.type === 'run') {
      if (this.noRun) return 'にげられない！';
      const ch = clamp(.5 + (statsOf(this.pu.c).spd - statsOf(this.eu.c).spd) * .03, .2, .95);
      if (Math.random() < ch) { this.q = [() => { this.over = 'run'; return null; }]; return 'うまく にげきれた！'; }
      return 'にげられなかった！';
    }
    return this.useMove(me, foe, a.id);
  }
  useMove(me, foe, id) {
    const mv = MOVES[id];
    me.en = Math.max(0, me.en - mv.en);
    const head = `${me.c.name}の ${mv.name}！`;
    if (mv.heal) {
      me.c.hp = Math.min(maxHp(me.c), me.c.hp + Math.floor(maxHp(me.c) * mv.heal)); sfx('heal');
      this.addFx(mv, me, me, 0, 1);
      return head + ' HPが かいふくした！';
    }
    const A = statsOf(me.c), D = statsOf(foe.c);
    const mult = defMult(mv.element, foe.c);
    const stab = hasType(me.c, mv.element) && mv.element !== 'none' ? 1.2 : 1;
    const crit = Math.random() < .05;
    const hits = mv.hits || 1;
    let dmg = 0; for (let i = 0; i < hits; i++) dmg += Math.max(1, Math.floor(mv.power * A.atk / D.def * .3 * mult * stab * (crit ? 1.5 : 1) * rnd(.9, 1.1)));
    foe.c.hp = Math.max(0, foe.c.hp - dmg); sfx(mult > 1.2 ? 'crit' : 'hit');
    this.addFx(mv, me, foe, dmg, mult);
    const out = [];
    if (hits > 1) out.push(`${hits}かい あたった！`);
    if (mv.drain) { me.c.hp = Math.min(maxHp(me.c), me.c.hp + Math.max(1, Math.floor(dmg * mv.drain))); out.push(`${me.c.name}は HPを すいとった！`); }
    if (crit) out.push('きゅうしょに あたった！');
    if (mult >= 2) out.push('こうかは ばつぐんだ！！');
    else if (mult > 1.2) out.push('こうかは ばつぐんだ！');
    else if (mult < .6) out.push('こうかは ほとんど ないようだ…');
    else if (mult < .9) out.push('こうかは いまひとつのようだ…');
    if (mv.burn && foe.c.hp > 0 && !foe.st && foe.c.element !== 'fire' && Math.random() < mv.burn) {
      foe.st = 'burn'; out.push(`${foe.c.name}は やけどを おった！`);
    }
    if (mv.poison && foe.c.hp > 0 && !foe.st && !hasType(foe.c, 'poison') && !hasType(foe.c, 'steel') && Math.random() < mv.poison) { foe.st = 'poison'; out.push(`${foe.c.name}は どくを あびた！`); }
    if (mv.chill && foe.c.hp > 0 && !foe.st && !hasType(foe.c, 'ice') && Math.random() < mv.chill) { foe.st = 'chill'; out.push(`${foe.c.name}は こごえて うごきが にぶった！`); }
    out.push(() => this.checkFaint(foe));
    this.qf(out);
    return head;
  }
  checkFaint(u) {
    if (u.c.hp > 0) return null;
    if (u.side === 'e') return this.winFlow();
    sfx('faint');
    if (S.party.some(c => c.hp > 0)) { this.q = [() => { this.needSwap = true; return null; }]; return `${u.c.name}は たおれた！`; }
    this.q = ['めのまえが まっくらになった…', () => { Snd.jingle('lose'); this.over = 'lose'; return null; }];
    return `${u.c.name}は たおれた！`;
  }
  winFlow() {
    const e = this.ec, rest = [];
    const gain = Math.floor(e.level * 8 * (this.boss ? 3 : 1) * (this.tr ? 1.3 : 1));
    this.part.forEach(uid => {
      const c = S.party.find(x => x.uid === uid);
      if (c && c.hp > 0) { rest.push(`${c.name}は けいけんち${gain}を えた！`); gainExp(c, gain).forEach(m => rest.push(() => { sfx('levelup'); return m; })); }
    });
    const last = !this.tr || this.ei >= this.team.length - 1;
    if (!this.tr) {
      // ドロップ：同じ敵を続けて倒すほど出やすい／先制で少し出やすい。最低でも1つは必ず落ちる
      const prev = S.streak.id === this.key ? S.streak.n : 0;
      const boost = (1 + .1 * Math.min(prev, 5)) * (this.opt.preempt ? 1.3 : 1);
      S.streak = { id: this.key, n: prev + 1 };
      let got = 0;
      const give = (id, n, star) => { got++; addItem(id, n); rest.push(`${star ? '★ めずらしい ' : ''}${ITEMS[id].name}×${n}を てにいれた！`); };
      this.def.drops.forEach(([id, p]) => {
        if (this.boss) { give(id, p, ITEMS[id].rarity >= 3); return; }
        if (Math.random() < Math.min(.95, p * 1.6 * boost)) give(id, ITEMS[id].kind === 'core' ? 1 : rint(1, 2));
      });
      if (!got) give(this.def.drops.reduce((a, b) => (b[1] > a[1] ? b : a))[0], 1);
      (this.def.rares || (this.def.rare ? [this.def.rare] : [])).forEach(r => { if (Math.random() < Math.min(.6, r[1] * 1.6 * boost)) give(r[0], 1, true); });
      const w = Math.floor(e.level * 3 + rint(0, e.level)) * (this.boss ? 8 : 1);
      S.w += w; rest.push(`Wポイントを ${w} てにいれた！`);
    }
    if (!last) {
      rest.push(() => {
        this.ei++; const n = this.team[this.ei];
        this.ec = n.c; this.key = n.k; this.def = ENEMIES[n.k]; this.eu = this.unit(this.ec, 'e');
        this.part = new Set([this.pu.c.uid]);
        return `${this.tr.name}は ${this.ec.name}を くりだした！`;
      });
    } else {
      if (this.tr) {
        const firstWin = !S.flags.trainer[this.opt.tid];
        const w = Math.floor(this.tr.reward * (firstWin ? 1 : .3));
        S.w += w;
        rest.push(`${this.tr.name}との しょうぶに かった！`, `Wポイントを ${w} てにいれた！${firstWin ? '' : '（2回目いこうは すくなめ）'}`);
      }
      rest.push(() => { Snd.jingle('win'); this.over = 'win'; return null; });
    }
    this.q = rest;
    return `${e.name}を たおした！`;
  }
  endTurn() {
    if (this.over) return null;
    const items = [];
    [this.pu, this.eu].forEach(u => {
      if ((u.st === 'burn' || u.st === 'poison') && u.c.hp > 0) items.push(() => {
        u.c.hp = Math.max(0, u.c.hp - Math.max(1, Math.floor(maxHp(u.c) / 8))); u.fl = .3; sfx('burn');
        this.qf([() => this.checkFaint(u)]);
        return u.st === 'poison' ? `${u.c.name}は どくの ダメージを うけた！` : `${u.c.name}は やけどの ダメージを うけた！`;
      });
    });
    items.push(() => { [this.pu, this.eu].forEach(u => { u.en = Math.min(5, u.en + 1); }); this.turn++; return null; });
    this.qf(items);
    return null;
  }

  // ---- 入力 ----
  update(dt) {
    this.t += dt; this.intro = Math.max(0, this.intro - dt);
    this.shake = Math.max(0, this.shake - dt * 24);
    this.fx.forEach(f => {
      f.t += dt;
      if (f.target && !f.hitDone && f.t >= f.hit) { f.hitDone = true; f.target.fl = .35; if (f.dmg) this.shake = f.big ? 10 : 5; }
    });
    this.fx = this.fx.filter(f => f.t < f.dur + .5);
    Object.values(this.U).forEach(u => {
      u.fl = Math.max(0, u.fl - dt);
      if (u.lun) { u.lun.t += dt; if (u.lun.t > .4) u.lun = null; }
      if (u.hold > 0) u.hold -= dt; else u.disp += clamp(u.c.hp - u.disp, -dt * 60, dt * 60);
    });
    if (this.intro > 0) return;
    const ph = this.phase;
    if (ph === 'msg') { this.mt += dt; if (Input.edge.ok || this.mt > 1.15) this.next(); return; }
    if (ph === 'menu') {
      if (Input.rep.left || Input.rep.right) this.sel ^= 1;
      if (Input.rep.up || Input.rep.down) this.sel ^= 2;
      if (!Input.edge.ok) return;
      sfx('ok');
      if (this.sel === 0) { this.phase = 'moves'; this.sel = 0; }
      else if (this.sel === 1) { this.phase = 'swap'; this.sel = this.firstAliveIdx(); }
      else if (this.sel === 2) { this.phase = 'bag'; this.sel = 0; }
      else this.startTurn({ type: 'run' });
      return;
    }
    if (ph === 'moves') {
      const n = this.pu.c.moves.length;
      if (Input.rep.left || Input.rep.right) this.sel = (this.sel ^ 1) < n ? this.sel ^ 1 : this.sel;
      if (Input.rep.up || Input.rep.down) this.sel = (this.sel ^ 2) < n ? this.sel ^ 2 : this.sel;
      if (Input.edge.cancel) { sfx('back'); this.phase = 'menu'; this.sel = 0; return; }
      if (Input.edge.ok) {
        const id = this.pu.c.moves[this.sel];
        if (MOVES[id].en <= this.pu.en) { this.startTurn({ type: 'move', id }); } else sfx('back');
      }
      return;
    }
    if (ph === 'swap' || ph === 'force') {
      this.sel = nav(this.sel, S.party.length);
      if (ph === 'swap' && Input.edge.cancel) { sfx('back'); this.phase = 'menu'; this.sel = 1; return; }
      if (Input.edge.ok) {
        const c = S.party[this.sel];
        if (c.hp <= 0 || c === this.pu.c) { sfx('back'); return; }
        if (ph === 'swap') this.startTurn({ type: 'swap', idx: this.sel });
        else {
          this.pu = this.unit(c, 'p'); this.part.add(c.uid);
          this.q = [`いけっ、${c.name}！`]; this.next();
        }
      }
      return;
    }
    if (ph === 'bag') {
      this.bagIds = ['potion', 'hipotion'].filter(id => itemCount(id) > 0);
      if (this.sel >= this.bagIds.length) this.sel = 0;
      this.sel = nav(this.sel, this.bagIds.length);
      if (Input.edge.cancel) { sfx('back'); this.phase = 'menu'; this.sel = 2; return; }
      if (Input.edge.ok && this.bagIds.length) this.startTurn({ type: 'item', id: this.bagIds[this.sel] }); else if (Input.edge.ok) sfx('back');
    }
  }

  // ---- 描画 ----
  draw() {
    ctx.save();
    if (this.shake > .3) ctx.translate((Math.random() - .5) * this.shake, (Math.random() - .5) * this.shake);
    this.drawBackdrop();
    const e = this.eu, p = this.pu;
    const bob = Math.sin(this.t * 3) * 3;
    const shk = u => u.fl > 0 ? Math.sin(u.fl * 80) * 6 : 0;
    const blink = u => u.fl > 0 && Math.floor(u.fl * 30) % 2 ? .4 : 1;
    const lunge = (u, dx, dy) => { if (!u.lun) return [0, 0]; const k = Math.sin(clamp(u.lun.t / .38, 0, 1) * Math.PI) * 48; return [dx * k, dy * k]; };
    const big = this.boss || this.def.shape === 'dino';
    if (e.disp > .5 || e.c.hp > 0) { const [lx, ly] = lunge(e, -.93, .37); drawCreature(e.c, 480 + shk(e) + lx, 118 + bob + ly, this.boss ? 190 : big ? 150 : 120, -1, this.t, blink(e)); }
    if (p.c.hp > 0 || p.disp > .5) { const [lx, ly] = lunge(p, .93, -.37); drawCreature(p.c, 150 + shk(p) + lx, 205 - bob + ly, p.c.species === 'dino' ? 160 : 135, 1, this.t, blink(p)); }
    this.drawFx();
    ctx.restore();

    // 情報ボックス
    const info = (u, x, y, showHp) => {
      box(x, y, 230, 58);
      txt(u.c.name, x + 12, y + 7, { size: 14 });
      txt(`Lv${u.c.level}`, x + 218, y + 8, { size: 12, align: 'right', color: '#ffd96a' });
      chips(u.c, x + 12, y + 29);
      const bx = u.c.element2 ? x + 124 : x + 70; bar(bx, y + 31, x + 220 - bx, 9, u.disp / maxHp(u.c));
      if (u.st) txt({ burn: 'やけど', poison: 'どく', chill: 'こおり' }[u.st], x + 12, y + 44, { size: 9, color: { burn: '#ff8a5a', poison: '#d08aff', chill: '#8fe0ff' }[u.st] });
      if (showHp) txt(`${Math.ceil(u.disp)}/${maxHp(u.c)}`, x + 220, y + 43, { size: 10, align: 'right' });
    };
    info(e, 16, 14, false);
    if (this.tr) txt(`${this.tr.name}  ${this.ei + 1}/${this.team.length}`, 20, 76, { size: 11, shadow: true });
    info(p, 394, 168, true);
    txt('EN', 400, 232, { size: 10, color: '#fff', shadow: true });
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i < p.en ? '#ffd24a' : 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.arc(430 + i * 16, 238, 5, 0, 7); ctx.fill(); }

    // 下ウィンドウ
    const ph = this.phase;
    if (ph === 'msg') { box(10, 266, 620, 90); wrap(this.msg, 590, 15).slice(0, 3).forEach((l, i) => txt(l, 26, 280 + i * 24, { size: 15 })); }
    else if (ph === 'menu') {
      box(10, 266, 330, 90); txt('どうする？', 26, 280, { size: 15 });
      txt(p.c.name + ' のターン', 26, 306, { size: 12, color: '#bfb89a' });
      box(346, 266, 284, 90);
      ['たたかう', 'こうたい', 'どうぐ', 'にげる'].forEach((s, i) => {
        const x = 366 + (i % 2) * 130, y = 282 + Math.floor(i / 2) * 32;
        if (this.sel === i) txt('▶', x - 16, y, { color: '#ffd96a' });
        txt(s, x, y, { size: 15, color: i === 3 && this.noRun ? '#777' : '#fff' });
      });
    } else if (ph === 'moves') {
      box(10, 266, 420, 90); box(436, 266, 194, 90);
      p.c.moves.forEach((m, i) => {
        const mv = MOVES[m], ok = mv.en <= p.en;
        const x = 40 + (i % 2) * 200, y = 282 + Math.floor(i / 2) * 32;
        if (this.sel === i) txt('▶', x - 18, y, { color: '#ffd96a' });
        txt(mv.name, x, y, { size: 14, color: ok ? ELEMENTS[mv.element].color : '#666' });
        txt('EN' + mv.en, x + 170, y + 2, { size: 11, color: ok ? '#ddd' : '#666', align: 'right' });
      });
      const mv = MOVES[p.c.moves[this.sel]];
      txt(mv.power ? `いりょく ${mv.power}` : 'かいふく', 450, 280, { size: 13 });
      chip(mv.element, 450, 302);
      if (mv.poison) txt(`どく ${Math.round(mv.poison * 100)}%`, 450, 326, { size: 11, color: '#d08aff' });
      else if (mv.chill) txt(`こおり ${Math.round(mv.chill * 100)}%`, 450, 326, { size: 11, color: '#8fe0ff' });
      else if (mv.burn) txt(`やけど ${Math.round(mv.burn * 100)}%`, 450, 326, { size: 11, color: '#ff8a5a' });
      else if (mv.priority) txt('さきに うごける', 450, 326, { size: 11, color: '#7fd0ff' });
    } else if (ph === 'swap' || ph === 'force') {
      box(10, 266, 620, 90);
      txt(ph === 'force' ? 'つぎに だすなかまを えらぼう' : 'だれと こうたいする？', 26, 272, { size: 11, color: '#bfb89a' });
      S.party.forEach((c, i) => {
        const x = 26 + (i % 2) * 300, y = 292 + Math.floor(i / 2) * 28;
        if (this.sel === i) txt('▶', x - 16, y, { color: '#ffd96a' });
        const bad = c.hp <= 0 || c === p.c;
        txt(`${c.name} Lv${c.level}`, x, y, { size: 13, color: bad ? '#777' : '#fff' });
        bar(x + 150, y + 4, 90, 8, c.hp / maxHp(c));
        txt(c === p.c ? 'バトル中' : c.hp <= 0 ? 'ひんし' : `${c.hp}`, x + 250, y + 1, { size: 11, color: '#aaa' });
      });
    } else if (ph === 'bag') {
      box(10, 266, 620, 90);
      txt('どうぐ', 26, 272, { size: 11, color: '#bfb89a' });
      const ids = ['potion', 'hipotion'].filter(id => itemCount(id) > 0);
      if (!ids.length) txt('つかえる どうぐが ない', 26, 300, { size: 14, color: '#888' });
      ids.forEach((id, i) => {
        if (this.sel === i) txt('▶', 26, 292 + i * 26, { color: '#ffd96a' });
        txt(`${ITEMS[id].name} ×${itemCount(id)}`, 46, 292 + i * 26, { size: 14 });
        txt(ITEMS[id].desc, 300, 294 + i * 26, { size: 11, color: '#bbb' });
      });
    }
    if (this.intro > 0) { ctx.fillStyle = `rgba(255,255,255,${this.intro * 2})`; ctx.fillRect(0, 0, W, H); }
  }
}
