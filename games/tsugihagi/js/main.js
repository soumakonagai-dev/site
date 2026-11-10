'use strict';
// ===== 入力・シーン管理・起動 =====
const KEYMAP = {
  ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
  z: 'ok', Z: 'ok', Enter: 'ok', ' ': 'ok', x: 'cancel', X: 'cancel', Escape: 'cancel', Backspace: 'cancel', m: 'map', M: 'map',
};
const Input = {
  held: {}, edge: {}, rep: {}, t: {}, nr: {},
  set(n, v) {
    if (v && !this.held[n]) { this.edge[n] = true; this.rep[n] = true; this.t[n] = 0; this.nr[n] = .35; }
    this.held[n] = v;
  },
  tick(dt) {
    for (const n in this.held) if (this.held[n] && !this.edge[n]) {
      this.t[n] += dt;
      if (this.t[n] >= this.nr[n]) { this.rep[n] = true; this.nr[n] = this.t[n] + .1; }
    }
  },
  endFrame() { this.edge = {}; this.rep = {}; },
};
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  const n = KEYMAP[e.key]; if (!n) return;
  e.preventDefault(); audioInit(); Input.set(n, true);
});
addEventListener('keydown', e => { if (e.key === 'n' || e.key === 'N') { Snd.setMuted(!Snd.isMuted()); } });
addEventListener('keyup', e => { const n = KEYMAP[e.key]; if (n) Input.set(n, false); });
addEventListener('blur', () => { for (const n in Input.held) Input.held[n] = false; });
document.querySelectorAll('[data-k]').forEach(b => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', e => { e.preventDefault(); audioInit(); Input.set(k, true); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, () => Input.set(k, false)));
});

// ----- シーンスタック -----
const Scenes = {
  stack: [],
  push(s) { this.stack.push(s); },
  pop() { this.stack.pop(); },
  replace(s) { this.stack = [s]; },
  top() { return this.stack[this.stack.length - 1]; },
};

class TitleScene {
  constructor() {
    this.opaque = true; this.t = 0; this.sel = 0;
    this.items = [{ label: 'はじめから', fn: () => this.start() }];
    if (hasSave()) this.items.push({ label: 'つづきから', fn: () => { if (loadGame()) this.go(); } });
  }
  start() {
    newGame(); this.go();
    Scenes.push(new DialogScene([
      'ツギハギの森へ ようこそ！',
      'てきを たおすと「そざい」が おちる。そざいを くみあわせて、あたらしい なかまを つくろう。',
      'まずは むらの たからばこを あけて、キャンプ(テント)で ごうせい してみよう。タウンの 人と しょうぶすると Wポイントが もらえるよ。',
      '【そうさ】 いどう：矢印/WASD　Z：しらべる/けってい　X：メニュー/もどる',
    ]));
  }
  go() { Scenes.replace(new FieldScene()); }
  update(dt) {
    this.t += dt;
    if (!Snd.ready() || !this.armed) { if (Input.edge.ok || Input.edge.cancel || Input.edge.up || Input.edge.down) { this.armed = true; audioInit(); } if (!this.armed) return; if (Snd.ready()) { this.armed = true; return; } }
    this.sel = nav(this.sel, this.items.length);
    if (Input.edge.ok) { sfx('ok'); this.items[this.sel].fn(); }
  }
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#16301f'); g.addColorStop(1, '#4c7a4a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) { ctx.fillStyle = `rgba(255,240,150,${.3 + .3 * Math.sin(this.t * 2 + i)})`; ctx.beginPath(); ctx.arc((i * 97) % W, (i * 53 + this.t * 8) % 200, 2, 0, 7); ctx.fill(); }
    drawCreature({ species: 'beast', element: 'fire', parts: ['fang', 'ess_fire'] }, 150, 270, 110, 1, this.t);
    drawCreature({ species: 'bird', element: 'none', parts: ['wing', 'hotaru'] }, 500, 250, 110, -1, this.t);
    drawCreature({ species: 'fish', element: 'water', parts: ['mizukaki', 'ess_water'] }, 330, 300, 90, 1, this.t);
    txt('ツギハギの森', W / 2, 52, { size: 46, align: 'center', shadow: true });
    txt('〜 たおして、あつめて、つくる 〜', W / 2, 112, { size: 14, align: 'center', color: '#ffe9a8', shadow: true });
    if (!this.armed) { if (Math.sin(this.t * 4) > -.3) txt('なにかキーを おしてね', W / 2, 176, { size: 18, align: 'center', shadow: true }); txt('♪ おとが でます（N：おと ON/OFF）', W / 2, 206, { size: 11, align: 'center', color: '#ddd' }); return txt('v0.2 試作', W - 10, H - 18, { size: 10, align: 'right', color: '#ccc' }); }
    this.items.forEach((it, i) => {
      const y = 170 + i * 34;
      if (this.sel === i) txt('▶', W / 2 - 64, y, { size: 18, color: '#ffd96a' });
      txt(it.label, W / 2 - 40, y, { size: 18, shadow: true });
    });
    txt('v1.0', W - 10, H - 18, { size: 10, align: 'right', color: '#ccc' });
  }
}

let last = 0;
function frame(ts) {
  const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
  Input.tick(dt);
  const top = Scenes.top();
  if (top) top.update(dt);
  Snd.sync();
  let i = Scenes.stack.length - 1;
  while (i > 0 && !Scenes.stack[i].opaque) i--;
  ctx.clearRect(0, 0, W, H);
  for (; i < Scenes.stack.length; i++) Scenes.stack[i].draw();
  Input.endFrame();
  requestAnimationFrame(frame);
}
Scenes.push(new TitleScene());
requestAnimationFrame(frame);
