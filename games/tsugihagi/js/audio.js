'use strict';
// ===== おんがく・こうかおん（WebAudio）=====
// 楽器：サンプル（audio/ のクラリネット・ホルン・トランペット・バイオリン・フルート・ハープ・シロフォン）
//       ＋ 合成（ギター/ウード=Karplus-Strong、太鼓、ベル、パッド…）。サンプルが読めないときは合成音で代用する。
// 曲：地域ごとに旋法・拍子・楽器を変えて、その場で作曲（固定シード）して流す。
const Snd = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ac = null, master, comp, musicBus, sfxBus, wet, noiseBuf, muted = false;
  try { muted = localStorage.getItem('tsugihagi_mute') === '1'; } catch (e) { /* 無視 */ }
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const rng = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

  function build(c) {
    ac = c;
    comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .2;
    master = c.createGain(); master.gain.value = muted ? 0 : .9; comp.connect(master); master.connect(c.destination);
    musicBus = c.createGain(); musicBus.gain.value = .5; musicBus.connect(comp);
    sfxBus = c.createGain(); sfxBus.gain.value = .85; sfxBus.connect(comp);
    const len = Math.floor(c.sampleRate * 2.2), buf = c.createBuffer(2, len, c.sampleRate), r = rng(7);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 2.5); }
    const conv = c.createConvolver(); conv.buffer = buf; wet = c.createGain(); wet.connect(conv);
    const wg = c.createGain(); wg.gain.value = .4; conv.connect(wg); wg.connect(comp);
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const nd = noiseBuf.getChannelData(0), r2 = rng(99); for (let i = 0; i < nd.length; i++) nd[i] = r2() * 2 - 1;
  }
  function init() {
    if (!AC) return null;
    if (!ac) { try { build(new AC()); } catch (e) { ac = null; return null; } }
    if (ac.state === 'suspended' && ac.resume) ac.resume();
    return ac;
  }
  const ready = () => !AC || !!ac;

  // ---------- 基本の音 ----------
  const conn = (node, bus, send) => { node.connect(bus || sfxBus); if (send) { const s = ac.createGain(); s.gain.value = send; node.connect(s); s.connect(wet); } };
  function adsr(g, t, vol, atk, dur, rel) {
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + atk);
    g.gain.setValueAtTime(vol, t + Math.max(atk, dur)); g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(atk, dur) + rel);
  }
  function tone(t, f, dur, type, vol, o = {}) {
    const osc = ac.createOscillator(), g = ac.createGain(); osc.type = type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
    if (o.detune) osc.detune.value = o.detune;
    adsr(g, t, vol, o.atk || .005, dur, o.rel || .06);
    let out = g;
    if (o.cut) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.cut; osc.connect(fl); fl.connect(g); } else osc.connect(g);
    conn(out, o.bus, o.send); osc.start(t); osc.stop(t + dur + (o.rel || .06) + .05);
  }
  function noise(t, dur, vol, o = {}) {
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; s.loop = true; fl.type = o.type || 'lowpass'; fl.Q.value = o.q || 1;
    fl.frequency.setValueAtTime(o.f0 || 1000, t); if (o.f1) fl.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1), t + dur);
    adsr(g, t, vol, o.atk || .004, dur, o.rel || .05);
    s.connect(fl); fl.connect(g); conn(g, o.bus, o.send); s.start(t, Math.random()); s.stop(t + dur + (o.rel || .05) + .05);
  }

  // ---------- ドラム・打楽器 ----------
  const DRUM = {
    kick: (t, v, b) => { tone(t, 135, .26, 'sine', .95 * v, { slide: 42, atk: .002, bus: b }); noise(t, .03, .25 * v, { f0: 3000, f1: 700, bus: b }); },
    snare: (t, v, b) => { noise(t, .16, .45 * v, { type: 'bandpass', f0: 2200, q: .8, bus: b, send: .15 }); tone(t, 200, .1, 'triangle', .35 * v, { slide: 120, bus: b }); },
    hat: (t, v, b) => noise(t, .04, .22 * v, { type: 'highpass', f0: 7000, bus: b }),
    shaker: (t, v, b) => noise(t, .07, .16 * v, { type: 'highpass', f0: 5500, atk: .012, bus: b }),
    tom: (t, v, b) => { tone(t, 190, .3, 'sine', .8 * v, { slide: 80, bus: b, send: .15 }); noise(t, .04, .15 * v, { f0: 2000, f1: 500, bus: b }); },
    taiko: (t, v, b) => { tone(t, 150, .6, 'sine', 1 * v, { slide: 48, atk: .003, rel: .15, bus: b, send: .3 }); noise(t, .14, .4 * v, { f0: 1400, f1: 200, bus: b, send: .2 }); },
    dum: (t, v, b) => { tone(t, 160, .22, 'sine', .85 * v, { slide: 70, bus: b, send: .1 }); },
    tek: (t, v, b) => { noise(t, .06, .3 * v, { type: 'highpass', f0: 3500, bus: b }); tone(t, 900, .05, 'triangle', .18 * v, { slide: 600, bus: b }); },
    conga: (t, v, b) => { tone(t, 340, .16, 'sine', .55 * v, { slide: 230, bus: b, send: .1 }); noise(t, .02, .12 * v, { type: 'bandpass', f0: 1800, bus: b }); },
    clap: (t, v, b) => { for (let i = 0; i < 3; i++) noise(t + i * .012, .06, .3 * v, { type: 'bandpass', f0: 1500, q: 1, bus: b, send: .15 }); },
    wood: (t, v, b) => tone(t, 880, .05, 'square', .12 * v, { cut: 2500, bus: b }),
  };

  // ---------- 楽器サンプル ----------
  const SAMPLE_DEF = {
    clarinet: { dir: 'clarinet', notes: 'D3 As3 D4 F4 As4 D5', vol: 1, atk: .05, rel: .2 },
    horn:     { dir: 'french-horn', notes: 'C2 G2 D3 A3 C4 D5', vol: 1, atk: .07, rel: .3 },
    trumpet:  { dir: 'trumpet', notes: 'A3 C4 F4 G4 D5 F5 A5', vol: .95, atk: .04, rel: .2 },
    violin:   { dir: 'violin', notes: 'G3 C4 G4 C5 G5', vol: .9, atk: .06, rel: .22 },
    flute:    { dir: 'flute', notes: 'C4 C5 A5 E6', vol: 1, atk: .05, rel: .22 },
    harp:     { dir: 'harp', notes: 'C3 E3 A4 C5 E5 G5', vol: 1, perc: true, atk: .003, rel: .7 },
    xylo:     { dir: 'xylophone', notes: 'C5 G5 C6 G6 C7', vol: .85, perc: true, atk: .002, rel: .35 },
  };
  const FALLBACK = { clarinet: 'reed', horn: 'brass', trumpet: 'brass', violin: 'string', flute: 'whistle', harp: 'pluckH', xylo: 'bell' };
  const SAMPLES = {};
  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const noteMidi = n => { const m = /^([A-G])(s?)(\d)$/.exec(n); return PC[m[1]] + (m[2] ? 1 : 0) + (+m[3] + 1) * 12; };
  function loadInst(name) {
    const def = SAMPLE_DEF[name]; if (!def || !ac) return Promise.resolve();
    if (SAMPLES[name]) return SAMPLES[name].p;
    const S = SAMPLES[name] = { bufs: [], ready: false };
    S.p = Promise.all(def.notes.split(' ').map(n =>
      fetch(`audio/${def.dir}/${n}.mp3`).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(b => new Promise((res, rej) => ac.decodeAudioData(b, res, rej))).then(buf => S.bufs.push({ m: noteMidi(n), buf })).catch(() => { })
    )).then(() => { S.ready = S.bufs.length > 0; });
    return S.p;
  }
  function playSample(name, midi, t, dur, vel, o) {
    const S = SAMPLES[name], def = SAMPLE_DEF[name];
    let best = S.bufs[0]; for (const b of S.bufs) if (Math.abs(b.m - midi) < Math.abs(best.m - midi)) best = b;
    const src = ac.createBufferSource(), g = ac.createGain();
    src.buffer = best.buf; src.playbackRate.value = Math.pow(2, (midi - best.m) / 12);
    const atk = o.atk != null ? o.atk : def.atk, rel = o.rel != null ? o.rel : def.rel, d = def.perc ? Math.min(dur, .15) : dur;
    adsr(g, t, vel * def.vol * (o.vol || 1), atk, d, rel + (def.perc ? Math.max(0, dur - .15) : 0));
    src.connect(g); conn(g, o.bus || musicBus, o.send != null ? o.send : .25);
    src.start(t); src.stop(t + d + rel + (def.perc ? dur : 0) + .1);
  }

  // ---------- 合成の楽器 ----------
  const ksCache = {};
  function ksBuf(midi, kind) {
    const key = kind + midi; if (ksCache[key]) return ksCache[key];
    const f = mtof(midi), sr = ac.sampleRate, n = Math.floor(sr * (kind === 'oud' ? 1.6 : 2)), N = Math.max(2, Math.round(sr / f - .5));
    const buf = ac.createBuffer(1, n, sr), d = buf.getChannelData(0), line = new Float32Array(N), r = rng(midi * 31 + 5);
    let lp = 0; for (let i = 0; i < N; i++) { const x = r() * 2 - 1; lp = kind === 'guitar' ? lp * .6 + x * .4 : x; line[i] = lp; }
    const dec = kind === 'oud' ? .9955 : kind === 'pluckH' ? .997 : .9985; let p = 0, pk = 0;
    for (let i = 0; i < n; i++) { const cur = line[p]; line[p] = (cur + line[(p + 1) % N]) * .5 * dec; d[i] = cur; p = (p + 1) % N; if (Math.abs(cur) > pk) pk = Math.abs(cur); }
    for (let i = 0; i < n; i++) d[i] *= .9 / (pk || 1);
    return (ksCache[key] = { buf, f0: sr / (N + .5) });
  }
  function playKS(kind, midi, t, dur, vel, o) {
    const k = ksBuf(midi, kind), src = ac.createBufferSource(), g = ac.createGain();
    src.buffer = k.buf; src.playbackRate.value = mtof(midi) / k.f0;
    adsr(g, t, vel * (kind === 'oud' ? .8 : .7), .002, Math.max(.2, dur), .25);
    src.connect(g); conn(g, o.bus || musicBus, o.send != null ? o.send : .22); src.start(t); src.stop(t + Math.max(.2, dur) + .4);
  }
  function voice(t, f, dur, vel, o) {
    const g = ac.createGain(), fl = ac.createBiquadFilter(); fl.type = 'lowpass';
    fl.frequency.setValueAtTime(o.cut0 || o.cut || 2000, t); if (o.cut0) fl.frequency.exponentialRampToValueAtTime(o.cut, t + (o.sweep || .15));
    adsr(g, t, vel * (o.vol || .3), o.atk || .04, dur, o.rel || .15);
    const dets = o.dets || [0];
    dets.forEach(dt => {
      const osc = ac.createOscillator(); osc.type = o.wave || 'sawtooth'; osc.frequency.value = f; osc.detune.value = dt; osc.connect(fl);
      if (o.vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.2; lg.gain.value = o.vib; l.connect(lg); lg.connect(osc.detune); l.start(t); l.stop(t + dur + (o.rel || .15) + .1); }
      osc.start(t); osc.stop(t + dur + (o.rel || .15) + .1);
    });
    fl.connect(g); conn(g, o.bus || musicBus, o.send != null ? o.send : .25);
  }
  const SYN = {
    reed:   (m, t, d, v, o) => voice(t, mtof(m), d, v, { wave: 'square', cut: 1500, vib: 8, atk: .05, vol: .16, dets: [0, 4], ...o }),
    brass:  (m, t, d, v, o) => voice(t, mtof(m), d, v, { wave: 'sawtooth', cut0: 500, cut: 2400, sweep: .12, atk: .05, vol: .2, ...o }),
    string: (m, t, d, v, o) => voice(t, mtof(m), d, v, { wave: 'sawtooth', cut: 2600, atk: .1, rel: .25, vol: .13, vib: 6, dets: [-7, 7], ...o }),
    whistle:(m, t, d, v, o) => voice(t, mtof(m), d, v, { wave: 'sine', cut: 4000, atk: .06, vol: .4, vib: 10, ...o }),
    pad:    (m, t, d, v, o) => voice(t, mtof(m), d, v, { wave: 'sawtooth', cut: 1100, atk: .5, rel: .9, vol: .1, dets: [-10, 0, 10], send: .45, ...o }),
    organS: (m, t, d, v, o) => voice(t, mtof(m), d, v, { wave: 'square', cut: 1800, atk: .03, rel: .1, vol: .1, dets: [0, 3], ...o }),
    sub:    (m, t, d, v, o) => { tone(t, mtof(m), d * .9, 'sine', v * .55, { atk: .012, rel: .12, bus: musicBus }); tone(t, mtof(m) * 2, d * .5, 'triangle', v * .12, { bus: musicBus }); },
    bell:   (m, t, d, v, o) => { const f = mtof(m); tone(t, f, 1.3, 'sine', v * .3, { atk: .002, rel: .6, bus: musicBus, send: .45 }); tone(t, f * 3.5, .5, 'sine', v * .08, { atk: .002, rel: .2, bus: musicBus, send: .45 }); },
    pluck:  (m, t, d, v, o) => playKS('guitar', m, t, d, v, o),
    oud:    (m, t, d, v, o) => playKS('oud', m, t, d, v, o),
    pluckH: (m, t, d, v, o) => playKS('pluckH', m, t, d, v, o),
  };
  function note(inst, midi, t, dur, vel, o = {}) {
    if (SAMPLES[inst] && SAMPLES[inst].ready) playSample(inst, midi, t, dur, vel, o);
    else (SYN[FALLBACK[inst] || inst] || SYN.pluck)(midi, t, dur, vel, o);
  }

  // ---------- 曲：旋法・拍子・リズム ----------
  const SC = { major: [0, 2, 4, 5, 7, 9, 11], lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10], dorian: [0, 2, 3, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], harmonicMinor: [0, 2, 3, 5, 7, 8, 11], phrygian: [0, 1, 3, 5, 7, 8, 10], phrygianDom: [0, 1, 4, 5, 7, 8, 10] };
  const METER = { '4/4': { n: 8, strong: [0, 4] }, '3/4': { n: 6, strong: [0] }, '6/8': { n: 6, strong: [0, 3] } };
  const RHY = {
    '4/4': [[2, 1, 1, 2, 2], [3, 1, 2, 2], [1, 1, 2, 2, 2], [2, 2, 1, 1, 2], [4, 2, 2], [2, 1, 1, 1, 1, 2], [1, 1, 1, 1, 2, 2], [3, 1, 1, 1, 2]],
    '3/4': [[2, 2, 2], [3, 1, 2], [2, 1, 1, 2], [4, 2], [1, 1, 2, 2], [3, 3]],
    '6/8': [[3, 3], [2, 1, 3], [3, 2, 1], [1, 1, 1, 3], [2, 1, 2, 1], [1, 2, 3], [3, 1, 1, 1]],
  };
  const pitchOf = (sp, s) => sp.root + SC[sp.scale][((s % 7) + 7) % 7] + 12 * Math.floor(s / 7);

  function genMelody(sp, prog, seed) {
    const M = METER[sp.meter], rnd = rng(seed), bars = prog.length, out = [];
    const pool = RHY[sp.meter].filter((_, i) => !sp.rhy || sp.rhy.includes(i));
    const pick = () => pool[Math.floor(rnd() * pool.length)];
    const R1 = pick(), R2 = pick(), R3 = pick();
    const lo = sp.lo, hi = sp.hi, center = (lo + hi) / 2; let cur = sp.start;
    for (let b = 0; b < bars; b++) {
      const ph = b % 4, R = ph === 0 ? R1 : ph === 1 ? R2 : ph === 2 ? R1 : R3, d0 = prog[b] - 1, tones = [];
      for (let k = -1; k <= 3; k++) tones.push(d0 + 7 * k, d0 + 2 + 7 * k, d0 + 4 + 7 * k);
      const near = x => tones.filter(s => s >= lo && s <= hi).sort((a, c) => Math.abs(a - x) - Math.abs(c - x));
      let pos = 0;
      R.forEach((d, i) => {
        const last = i === R.length - 1, strong = M.strong.includes(pos); let s;
        if (last && ph === 3) {
          if (b === bars - 1) s = [0, 7, 14].filter(x => x >= lo && x <= hi).sort((a, c) => Math.abs(a - cur) - Math.abs(c - cur))[0];
          else { const n = near(cur).slice(0, 2); s = n[rnd() < .6 ? 0 : 1] || n[0]; }
        } else if (strong || i === 0) { const n = near(cur).slice(0, 3); s = n[Math.min(n.length - 1, Math.floor(rnd() * rnd() * 3))]; }
        else {
          const r = rnd(), st = r < .62 ? 1 : r < .82 ? 2 : 0, dir = rnd() < .55 ? (Math.sign(center - cur) || 1) : (rnd() < .5 ? 1 : -1);
          s = clampN(cur + dir * st, lo, hi);
        }
        const rest = !strong && !last && d <= 1 && rnd() < (sp.rest != null ? sp.rest : .08);
        if (!rest) out.push({ bar: b, pos, dur: d, step: s });
        cur = s; pos += d;
      });
    }
    return out;
  }

  // ドラムパターン（x=強 o=弱）。sub=1拍(8分)あたりのステップ数
  const DPAT = {
    folk44:   { sub: 1, kick: 'x...x...', conga: '..o...ox', shaker: 'ooooooo.' },
    jig68:    { sub: 1, kick: 'x..o..', conga: '..o.o.', shaker: 'ooooox' },
    waltz34:  { sub: 1, kick: 'x.....', wood: '..o.o.', shaker: '..o.o.' },
    darbuka44:{ sub: 1, dum: 'x...x...', tek: '..oo..o.', shaker: 'o.o.o.o.' },
    taiko44:  { sub: 1, taiko: 'x..x..x.', kick: 'x...x...', tom: '....o.oo' },
    epic44:   { sub: 1, taiko: 'x.......', tom: '....o...' },
    ruins:    { sub: 1, taiko: 'x.......' },
    frame68:  { sub: 1, conga: 'x..o..' },
    battle:   { sub: 2, kick: 'x..x..x.x..x..x.', snare: '....x.......x...', hat: 'o.o.o.o.o.o.o.o.', tom: '..............oo' },
    trainer:  { sub: 2, kick: 'x...x.x.x...x.x.', snare: '....x.......x..o', hat: 'oxoxoxoxoxoxoxox' },
    boss:     { sub: 2, kick: 'x.x...x.x.x...x.', taiko: 'x.......x.......', snare: '....x.......x...', hat: 'o.o.o.o.o.o.o.o.' },
  };

  // ---------- 曲の定義 ----------
  const TRACKS = {
    title: { vol: 0.9, scale: 'lydian', root: 50, meter: '4/4', bpm: 76, lo: 5, hi: 14, start: 7, form: ['A', 'B', 'A', 'B'],
      A: { prog: [1, 2, 1, 5, 6, 2, 5, 1], seed: 21 }, B: { prog: [6, 5, 2, 1, 6, 5, 2, 5], seed: 22 },
      lead: { inst: 'horn', vel: .85, B: { inst: 'violin' } }, rhy: [0, 1, 4, 7], rest: .04,
      layers: [{ sty: 'arp', inst: 'harp', vel: .5, pat: [0, 1, 2, 3, 2, 1, 2, 1] }, { sty: 'pad', inst: 'pad', vel: .6 }, { sty: 'bass', kind: 'root', inst: 'sub', vel: .6 }, { sty: 'bells', inst: 'bell', p: .3, vel: .5 }], drums: 'epic44', dvol: .7 },
    meadow: { scale: 'mixolydian', root: 55, meter: '4/4', bpm: 116, lo: 3, hi: 12, start: 7, form: ['A', 'A', 'B', 'A'],
      A: { prog: [1, 4, 1, 7, 1, 4, 7, 1], seed: 11 }, B: { prog: [4, 1, 7, 4, 4, 1, 7, 1], seed: 12 },
      lead: { inst: 'clarinet', vel: .85, B: { inst: 'flute' } },
      layers: [{ sty: 'strum', inst: 'pluck', vel: .55 }, { sty: 'bass', kind: 'root', inst: 'sub', vel: .6 }, { sty: 'bells', inst: 'xylo', p: .3, vel: .4 }], drums: 'folk44', dvol: .7 },
    forest: { scale: 'dorian', root: 52, meter: '6/8', bpm: 78, lo: 4, hi: 13, start: 7, form: ['A', 'A', 'B', 'A'], rest: .12,
      A: { prog: [1, 7, 4, 1, 1, 3, 7, 1], seed: 31 }, B: { prog: [4, 7, 1, 5, 4, 7, 1, 1], seed: 32 },
      lead: { inst: 'flute', vel: .8 },
      layers: [{ sty: 'arp', inst: 'harp', vel: .5, pat: [0, 1, 2, 3, 2, 1] }, { sty: 'pad', inst: 'string', vel: .5 }, { sty: 'bass', kind: 'pedal', inst: 'sub', vel: .5 }], drums: 'frame68', dvol: .5 },
    seaside: { scale: 'major', root: 48, meter: '3/4', bpm: 126, lo: 5, hi: 14, start: 7, form: ['A', 'A', 'B', 'A'],
      A: { prog: [1, 6, 4, 5, 1, 3, 4, 5], seed: 41 }, B: { prog: [4, 5, 3, 6, 4, 5, 1, 1], seed: 42 },
      lead: { inst: 'violin', vel: .8, B: { inst: 'clarinet' } },
      layers: [{ sty: 'arp', inst: 'harp', vel: .45, pat: [0, 1, 2, 1, 2, 1] }, { sty: 'strum', inst: 'pluck', vel: .4 }, { sty: 'bass', kind: 'root', inst: 'sub', vel: .55 }, { sty: 'bells', inst: 'xylo', p: .25, vel: .35 }, { sty: 'wave' }], drums: 'waltz34', dvol: .5 },
    desert: { scale: 'phrygianDom', root: 50, meter: '4/4', bpm: 100, lo: 3, hi: 12, start: 7, form: ['A', 'A', 'B', 'A'],
      A: { prog: [1, 2, 1, 2, 4, 2, 1, 1], seed: 51 }, B: { prog: [4, 1, 2, 1, 7, 2, 1, 1], seed: 52 },
      lead: { inst: 'clarinet', vel: .85 },
      layers: [{ sty: 'arp', inst: 'oud', vel: .6, pat: [0, 2, 1, 2, 0, 1, 2, 1] }, { sty: 'drone', inst: 'organS', vel: .5 }, { sty: 'bass', kind: 'root', inst: 'sub', vel: .5 }], drums: 'darbuka44', dvol: .8 },
    volcano: { vol: 0.65, scale: 'phrygian', root: 45, meter: '4/4', bpm: 128, lo: 7, hi: 15, start: 9, form: ['A', 'A', 'B', 'A'], rhy: [0, 2, 3, 5, 6],
      A: { prog: [1, 1, 2, 1, 6, 7, 2, 1], seed: 61 }, B: { prog: [6, 7, 1, 1, 6, 7, 2, 1], seed: 62 },
      lead: { inst: 'horn', vel: .9, B: { inst: 'trumpet' } },
      layers: [{ sty: 'ostinato', inst: 'string', vel: .5, hits: [[0, 0], [1, 0], [3, 4], [4, 0], [6, 4], [7, 0]] }, { sty: 'stab', inst: 'organS', vel: .5, hits: [0, 3, 6] }, { sty: 'bass', kind: 'drive', inst: 'sub', vel: .65 }], drums: 'taiko44', dvol: .95 },
    ruins: { scale: 'harmonicMinor', root: 47, meter: '4/4', bpm: 72, lo: 7, hi: 15, start: 9, form: ['A', 'B', 'A', 'B'], rhy: [0, 1, 4, 7], rest: .1,
      A: { prog: [1, 6, 4, 5, 1, 6, 5, 1], seed: 71 }, B: { prog: [4, 5, 1, 6, 4, 5, 5, 1], seed: 72 },
      lead: { inst: 'violin', vel: .7 },
      layers: [{ sty: 'pad', inst: 'pad', vel: .7 }, { sty: 'arp', inst: 'harp', vel: .4, pat: [0, -1, 1, -1, 2, -1, 1, -1] }, { sty: 'drone', inst: 'sub', vel: .5 }, { sty: 'bells', inst: 'bell', p: .45, vel: .5 }], drums: 'ruins', dvol: .8 },
    village: { vol: 0.85, scale: 'major', root: 53, meter: '6/8', bpm: 112, lo: 4, hi: 13, start: 7, form: ['A', 'A', 'B', 'A'],
      A: { prog: [1, 5, 6, 4, 1, 5, 4, 1], seed: 81 }, B: { prog: [4, 1, 5, 6, 4, 5, 1, 1], seed: 82 },
      lead: { inst: 'clarinet', vel: .8, double: 'xylo' },
      layers: [{ sty: 'strum', inst: 'pluck', vel: .55 }, { sty: 'bass', kind: 'root', inst: 'sub', vel: .55 }], drums: 'jig68', dvol: .65 },
    workshop: { scale: 'lydian', root: 55, meter: '3/4', bpm: 96, lo: 7, hi: 15, start: 9, form: ['A', 'B'], rest: .1, rhy: [0, 1, 3, 5],
      A: { prog: [1, 2, 1, 5, 6, 2, 5, 1], seed: 91 }, B: { prog: [6, 5, 2, 1, 6, 2, 5, 1], seed: 92 },
      lead: { inst: 'bell', vel: .7 },
      layers: [{ sty: 'arp', inst: 'harp', vel: .4, pat: [0, 1, 2, 1, 2, 1] }, { sty: 'pad', inst: 'string', vel: .4 }], drums: null },
    snow: { vol: 0.9, scale: 'major', root: 57, meter: '6/8', bpm: 72, lo: 7, hi: 15, start: 9, form: ['A', 'A', 'B', 'A'], rest: .1,
      A: { prog: [1, 6, 4, 5, 1, 6, 4, 5], seed: 141 }, B: { prog: [4, 5, 3, 6, 4, 5, 1, 1], seed: 142 },
      lead: { inst: 'xylo', vel: .8, B: { inst: 'flute' } },
      layers: [{ sty: 'arp', inst: 'harp', vel: .45, pat: [0, 1, 2, 3, 2, 1] }, { sty: 'pad', inst: 'string', vel: .4 }, { sty: 'bells', inst: 'bell', p: .5, vel: .5 }, { sty: 'bass', kind: 'pedal', inst: 'sub', vel: .45 }], drums: 'frame68', dvol: .4 },
    swamp: { vol: 0.9, scale: 'phrygian', root: 38, meter: '3/4', bpm: 84, lo: 7, hi: 13, start: 9, form: ['A', 'B'], rest: .2, rhy: [0, 1, 3],
      A: { prog: [1, 2, 1, 7, 1, 2, 6, 1], seed: 151 }, B: { prog: [6, 7, 1, 1, 2, 1, 7, 1], seed: 152 },
      lead: { inst: 'clarinet', vel: .7 },
      layers: [{ sty: 'drone', inst: 'organS', vel: .4 }, { sty: 'bells', inst: 'bell', p: .3, vel: .45 }, { sty: 'arp', inst: 'oud', vel: .45, pat: [0, -1, 1, -1, 2, -1] }, { sty: 'bass', kind: 'pedal', inst: 'sub', vel: .5 }], drums: 'waltz34', dvol: .4 },
    mine: { vol: 0.6, scale: 'aeolian', root: 43, meter: '4/4', bpm: 112, lo: 7, hi: 15, start: 9, form: ['A', 'A', 'B', 'A'], rhy: [0, 2, 3, 5],
      A: { prog: [1, 1, 7, 6, 1, 1, 4, 5], seed: 161 }, B: { prog: [6, 7, 1, 1, 6, 5, 4, 5], seed: 162 },
      lead: { inst: 'horn', vel: .9, B: { inst: 'trumpet' } },
      layers: [{ sty: 'ostinato', inst: 'string', vel: .45, hits: [[0, 0], [2, 0], [4, 0], [6, 4]] }, { sty: 'stab', inst: 'organS', vel: .5, hits: [0, 4] }, { sty: 'bass', kind: 'drive', inst: 'sub', vel: .6 }], drums: 'taiko44', dvol: .85 },
    sky: { vol: 0.9, scale: 'lydian', root: 55, meter: '4/4', bpm: 132, lo: 6, hi: 15, start: 8, form: ['A', 'A', 'B', 'A'], rhy: [0, 1, 3, 5], rest: .06,
      A: { prog: [1, 2, 1, 5, 6, 2, 5, 1], seed: 171 }, B: { prog: [6, 5, 2, 1, 6, 5, 2, 5], seed: 172 },
      lead: { inst: 'flute', vel: .85, B: { inst: 'violin' } },
      layers: [{ sty: 'arp', inst: 'harp', vel: .5, pat: [0, 1, 2, 3, 2, 1, 2, 1] }, { sty: 'pad', inst: 'string', vel: .4 }, { sty: 'bells', inst: 'xylo', p: .35, vel: .4 }, { sty: 'bass', kind: 'root', inst: 'sub', vel: .5 }], drums: 'epic44', dvol: .55 },
    cave: { vol: 0.9, scale: 'phrygian', root: 40, meter: '4/4', bpm: 60, lo: 7, hi: 14, start: 9, form: ['A', 'B'], rest: .25, rhy: [0, 1, 4],
      A: { prog: [1, 2, 1, 6, 1, 7, 2, 1], seed: 131 }, B: { prog: [6, 7, 1, 1, 2, 1, 7, 1], seed: 132 },
      lead: { inst: 'flute', vel: .55 },
      layers: [{ sty: 'pad', inst: 'pad', vel: .6 }, { sty: 'drone', inst: 'sub', vel: .5 }, { sty: 'bells', inst: 'bell', p: .35, vel: .45 }, { sty: 'arp', inst: 'harp', vel: .3, pat: [0, -1, -1, -1, 2, -1, -1, -1] }], drums: null },
    battle: { vol: 0.7, scale: 'aeolian', root: 45, meter: '4/4', bpm: 156, lo: 7, hi: 16, start: 9, form: ['A', 'A', 'B', 'A'], rhy: [1, 3, 5, 6, 7], rest: .05,
      A: { prog: [1, 6, 3, 7, 1, 6, 7, 1], seed: 101 }, B: { prog: [4, 1, 5, 1, 4, 1, 5, 5], seed: 102 },
      lead: { inst: 'violin', vel: .85, len: .7, B: { inst: 'trumpet' } },
      layers: [{ sty: 'ostinato', inst: 'string', vel: .4, hits: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 4]] }, { sty: 'stab', inst: 'horn', vel: .6, hits: [0, 4] }, { sty: 'bass', kind: 'drive', inst: 'sub', vel: .65 }], drums: 'battle', dvol: .85 },
    trainer: { vol: 0.7, scale: 'dorian', root: 50, meter: '4/4', bpm: 164, lo: 7, hi: 16, start: 9, form: ['A', 'A', 'B', 'A'], rhy: [0, 3, 5, 6, 7], rest: .05,
      A: { prog: [1, 4, 1, 7, 1, 4, 7, 1], seed: 111 }, B: { prog: [4, 5, 1, 1, 4, 5, 7, 1], seed: 112 },
      lead: { inst: 'trumpet', vel: .85, len: .8, B: { inst: 'violin' } },
      layers: [{ sty: 'arp', inst: 'violin', vel: .4, pat: [0, 1, 2, 3, 2, 1, 2, 3] }, { sty: 'stab', inst: 'horn', vel: .55, hits: [0, 3, 6] }, { sty: 'bass', kind: 'drive', inst: 'sub', vel: .65 }], drums: 'trainer', dvol: .85 },
    boss: { vol: 0.62, scale: 'harmonicMinor', root: 43, meter: '4/4', bpm: 144, lo: 7, hi: 15, start: 9, form: ['A', 'A', 'B', 'A'], rhy: [0, 2, 4, 5],
      A: { prog: [1, 1, 6, 5, 1, 4, 5, 1], seed: 121 }, B: { prog: [6, 5, 1, 1, 6, 4, 5, 5], seed: 122 },
      lead: { inst: 'horn', vel: .95, B: { inst: 'trumpet' } },
      layers: [{ sty: 'pad', inst: 'pad', vel: .8 }, { sty: 'ostinato', inst: 'string', vel: .5, hits: [[0, 0], [1, 0], [2, 0], [3, 4], [4, 0], [5, 0], [6, 4], [7, 0]] }, { sty: 'stab', inst: 'horn', vel: .7, hits: [0, 3, 6] }, { sty: 'bass', kind: 'drive', inst: 'sub', vel: .7 }], drums: 'boss', dvol: 1 },
  };
  // 短いファンファーレ（秒）。[音, 開始, 長さ]
  const JINGLES = {
    win: { len: 3.4, parts: [['trumpet', .9, [[67, 0, .14], [67, .16, .14], [67, .32, .14], [72, .5, .5], [71, 1.05, .22], [72, 1.3, .22], [76, 1.55, 1.3]]], ['horn', .7, [[60, 1.55, 1.5], [64, 1.55, 1.5], [67, 1.55, 1.5]]], ['harp', .7, [[72, 0, .3], [76, .12, .3], [79, .24, .3], [84, 1.55, .6], [88, 1.75, .6]]]] },
    lose: { len: 3.4, parts: [['horn', .8, [[64, 0, .7], [62, .8, .7], [60, 1.6, .7], [57, 2.4, 1.3]]], ['violin', .6, [[52, 0, .7], [50, .8, .7], [48, 1.6, .7], [45, 2.4, 1.3]]]] },
  };

  // ---------- 作曲 ----------
  function compose(sp) {
    const M = METER[sp.meter], e = sp.meter === '6/8' ? 20 / sp.bpm : 30 / sp.bpm, barSec = M.n * e;
    const sec = {};
    for (const k of new Set(sp.form)) { sec[k] = { prog: sp[k].prog, mel: genMelody(sp, sp[k].prog, sp[k].seed), k }; }
    const bars = [];
    sp.form.forEach((k, si) => {
      const S = sec[k], isB = k === 'B';
      S.prog.forEach((deg, b) => {
        const ev = [], d0 = deg - 1, rnd = rng(sp.A.seed * 7 + si * 13 + b);
        const chord = [d0, d0 + 2, d0 + 4], P = s => pitchOf(sp, s);
        const dv = (isB ? 1.08 : 1);
        // メロディ
        const L = isB && sp.lead.B ? { ...sp.lead, ...sp.lead.B } : sp.lead;
        S.mel.filter(n => n.bar === b).forEach(n => {
          const t = n.pos * e, d = n.dur * e * (L.len || .95), m = P(n.step);
          ev.push({ t, inst: L.inst, midi: m, dur: d, vel: L.vel * dv * (M.strong.includes(n.pos) ? 1 : .88), send: .3 });
          if (L.double) ev.push({ t, inst: L.double, midi: m + 12, dur: d, vel: .45 });
        });
        // 伴奏
        sp.layers.forEach(ly => {
          const v = ly.vel * dv;
          switch (ly.sty) {
            case 'arp': {
              const tones = [d0, d0 + 2, d0 + 4, d0 + 7], pat = ly.pat;
              for (let i = 0; i < M.n; i++) { const ix = pat[i % pat.length]; if (ix < 0) continue; ev.push({ t: i * e, inst: ly.inst, midi: P(tones[ix] + 7 * (ly.oct != null ? ly.oct : 0)), dur: e * 2, vel: v * (i % 4 === 0 ? 1 : .75) }); }
              break;
            }
            case 'strum': {
              const boom = M.strong, chick = sp.meter === '4/4' ? [2, 6, 7] : sp.meter === '6/8' ? [2, 5] : [2, 4];
              boom.forEach((p, i) => ev.push({ t: p * e, inst: ly.inst, midi: P(d0 - 7 + (i % 2 ? 4 : 0)), dur: e * 2, vel: v }));
              chick.forEach(p => chord.forEach((c, i) => ev.push({ t: p * e + i * .012, inst: ly.inst, midi: P(c), dur: e, vel: v * .6 })));
              break;
            }
            case 'pad': chord.forEach((c, i) => ev.push({ t: 0, inst: ly.inst, midi: P(c + (i ? 0 : 7)), dur: barSec * .98, vel: v * .8, atk: .35, rel: .6 })); break;
            case 'bass': {
              const r = P(d0 - 7);
              if (ly.kind === 'pedal') ev.push({ t: 0, inst: ly.inst, midi: r, dur: barSec * .95, vel: v });
              else if (ly.kind === 'drive') for (let i = 0; i < M.n; i++) ev.push({ t: i * e, inst: ly.inst, midi: r + (i % 4 === 3 ? 12 : 0), dur: e * .8, vel: v * (i % 2 ? .7 : 1) });
              else { M.strong.concat(sp.meter === '4/4' ? [] : []).forEach((p, i) => ev.push({ t: p * e, inst: ly.inst, midi: r + (i % 2 ? 7 : 0), dur: e * 3, vel: v })); if (sp.meter === '4/4') ev.push({ t: 6 * e, inst: ly.inst, midi: P(d0 - 7 + 4), dur: e * 1.5, vel: v * .7 }); }
              break;
            }
            case 'ostinato': ly.hits.forEach(([p, off]) => ev.push({ t: p * e, inst: ly.inst, midi: P(d0 + off), dur: e * .7, vel: v * (p % 2 ? .7 : 1) })); break;
            case 'stab': ly.hits.forEach(p => chord.forEach(c => ev.push({ t: p * e, inst: ly.inst, midi: P(c), dur: e * 1.2, vel: v * .8 }))); break;
            case 'drone': ev.push({ t: 0, inst: ly.inst, midi: P(d0 - 7), dur: barSec, vel: v }, { t: 0, inst: ly.inst, midi: P(d0 - 3), dur: barSec, vel: v * .6 }); break;
            case 'bells': for (let i = 1; i < M.n; i += 2) if (rnd() < ly.p) ev.push({ t: i * e, inst: ly.inst, midi: P(chord[Math.floor(rnd() * 3)] + 14), dur: e * 2, vel: v }); break;
            case 'wave': if (b % 2 === 0) ev.push({ t: 0, wave: true, dur: barSec * 2 }); break;
          }
        });
        // ドラム
        const dp = sp.drums && DPAT[sp.drums];
        if (dp) for (const inst of Object.keys(dp)) {
          if (inst === 'sub') continue; const str = dp[inst]; if (typeof str !== 'string') continue;
          for (let i = 0; i < str.length; i++) { const c = str[i]; if (c === 'x' || c === 'o') ev.push({ t: i * e / dp.sub, drum: inst, vel: (c === 'x' ? 1 : .55) * (sp.dvol || .8) }); }
        }
        bars.push({ ev });
      });
    });
    return { bars, barSec };
  }

  function instrumentsOf(sp) {
    const s = new Set(); const add = i => { if (i && SAMPLE_DEF[i]) s.add(i); };
    add(sp.lead.inst); if (sp.lead.B) add(sp.lead.B.inst); add(sp.lead.double); sp.layers.forEach(l => add(l.inst)); return [...s];
  }

  // ---------- 再生 ----------
  let cur = null, fading = [], wanted = null, holdUntil = 0, token = 0, timer = 0;
  function playEvents(T, bar, t0) {
    bar.ev.forEach(x => {
      const t = t0 + x.t;
      if (x.drum) DRUM[x.drum](t, x.vel, T.gain);
      else if (x.wave) noise(t, x.dur, .09, { type: 'lowpass', f0: 500, f1: 1800, atk: x.dur * .45, rel: x.dur * .5, bus: T.gain, send: .2 });
      else note(x.inst, x.midi, t, x.dur, x.vel, { bus: T.gain, atk: x.atk, rel: x.rel, send: x.send });
    });
  }
  function tick() {
    if (!ac) return;
    const now = ac.currentTime;
    [cur, ...fading].forEach(T => {
      if (!T || T.stopped) return;
      while (T.next < now + .5) { playEvents(T, T.song.bars[T.idx % T.song.bars.length], T.next); T.next += T.song.barSec; T.idx++; }
    });
    fading = fading.filter(T => now < T.endAt);
  }
  function startTrack(name) {
    const sp = TRACKS[name], T = { name, song: compose(sp), idx: 0, gain: ac.createGain(), stopped: false };
    T.gain.gain.setValueAtTime(.0001, ac.currentTime); T.gain.gain.linearRampToValueAtTime(sp.vol || 1, ac.currentTime + .7);
    T.gain.connect(musicBus); T.next = ac.currentTime + .08;
    if (cur) fadeOut(cur, .8);
    cur = T; if (!timer) timer = setInterval(tick, 80); tick();
  }
  function fadeOut(T, s) {
    const t = ac.currentTime; T.gain.gain.cancelScheduledValues(t); T.gain.gain.setValueAtTime(T.gain.gain.value, t); T.gain.gain.linearRampToValueAtTime(.0001, t + s);
    T.stopped = true; T.endAt = t + s + 2; fading.push(T);
  }
  function play(name) {
    if (!ac || !TRACKS[name]) return;
    if (cur && cur.name === name && !cur.stopped) return;
    const my = ++token;
    Promise.race([Promise.all(instrumentsOf(TRACKS[name]).map(loadInst)), new Promise(r => setTimeout(r, 2500))]).then(() => { if (my === token && ac) startTrack(name); });
  }
  function stop() { token++; if (cur) { fadeOut(cur, .5); cur = null; } }
  function jingle(name) {
    if (!ac) return; const J = JINGLES[name]; if (!J) return;
    if (cur) { fadeOut(cur, .25); cur = null; } token++;
    const t = ac.currentTime + .1; holdUntil = performance.now() + J.len * 1000;
    const tryPlay = () => J.parts.forEach(([inst, vel, notes]) => notes.forEach(([m, s, d]) => note(inst, m, t + s, d, vel, { bus: musicBus, send: .35 })));
    Promise.all(J.parts.map(p => loadInst(p[0]))).then(tryPlay);
  }
  // 今のシーンにあう曲を選ぶ（毎フレーム呼ぶ）
  function desired() {
    const st = Scenes.stack, top = st[st.length - 1];
    const b = st.find(s => s instanceof BattleScene);
    if (b) return b.boss ? 'boss' : b.tr ? 'trainer' : 'battle';
    if (top instanceof CraftScene) return 'workshop';
    if (top instanceof TitleScene) return 'title';
    if (FIELD && st.includes(FIELD)) return FIELD.village ? 'village' : ({ seaside: 'seaside' }[FIELD.region] || FIELD.region);
    return null;
  }
  function sync() {
    if (!ac || performance.now() < holdUntil) return;
    const d = desired(); if (!d || d === wanted) return; wanted = d; play(d);
  }

  // ---------- 効果音 ----------
  const SFXD = {
    ok:     t => { tone(t, 660, .07, 'triangle', .22); tone(t + .06, 990, .1, 'triangle', .2); },
    back:   t => tone(t, 400, .09, 'triangle', .2, { slide: 250 }),
    cursor: t => tone(t, 880, .03, 'square', .07, { cut: 3000 }),
    error:  t => { tone(t, 160, .12, 'sawtooth', .18, { cut: 800 }); tone(t + .09, 130, .14, 'sawtooth', .18, { cut: 800 }); },
    get:    t => [660, 880, 1100, 1320].forEach((f, i) => tone(t + i * .06, f, .16, 'triangle', .2, { send: .3 })),
    chest:  t => { noise(t, .12, .3, { f0: 600, f1: 200 }); tone(t + .1, 300, .15, 'square', .12, { slide: 500, cut: 2000 }); [784, 988, 1175, 1568].forEach((f, i) => tone(t + .25 + i * .07, f, .25, 'triangle', .22, { send: .4 })); },
    levelup:t => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => { tone(t + i * .07, f, .3, 'triangle', .2, { send: .4 }); tone(t + i * .07, f * 2, .2, 'sine', .08, { send: .4 }); }),
    craft:  t => { noise(t, .5, .15, { type: 'bandpass', f0: 400, f1: 4000, atk: .3 }); [392, 523, 659, 784, 1047].forEach((f, i) => tone(t + .45 + i * .09, f, .5, 'triangle', .22, { send: .5 })); tone(t + .9, 1568, .9, 'sine', .15, { send: .6 }); },
    add:    t => { tone(t, 1400, .06, 'sine', .15, { slide: 1800, send: .3 }); },
    buy:    t => { tone(t, 988, .08, 'square', .1, { cut: 3000 }); tone(t + .07, 1318, .22, 'square', .1, { cut: 3000, send: .2 }); },
    heal:   t => [523, 659, 784, 1047].forEach((f, i) => tone(t + i * .07, f, .35, 'sine', .22, { send: .5 })),
    cut:    t => { noise(t, .1, .35, { type: 'bandpass', f0: 5000, f1: 1500, q: 1.5 }); noise(t + .06, .2, .2, { type: 'highpass', f0: 3000 }); },
    smash:  t => { tone(t, 120, .35, 'sine', .9, { slide: 40 }); noise(t, .3, .6, { f0: 1500, f1: 150 }); noise(t + .1, .35, .3, { type: 'highpass', f0: 800, f1: 300 }); },
    splash: t => { noise(t, .25, .3, { type: 'bandpass', f0: 1200, f1: 400, q: .6 }); tone(t + .05, 600, .1, 'sine', .15, { slide: 300 }); },
    whoosh: t => noise(t, .5, .25, { type: 'bandpass', f0: 300, f1: 2500, q: .7, atk: .2 }),
    lava:   t => { tone(t, 90, .2, 'sine', .3, { slide: 160 }); noise(t, .15, .15, { f0: 600, f1: 200 }); },
    battle: t => { noise(t, .25, .35, { type: 'bandpass', f0: 3000, f1: 600 }); [220, 330, 440].forEach((f, i) => tone(t + i * .07, f, .16, 'sawtooth', .16, { cut: 1500 })); tone(t + .2, 55, .5, 'sine', .7, { slide: 40 }); },
    faint:  t => { tone(t, 400, .6, 'triangle', .25, { slide: 90 }); noise(t, .3, .12, { f0: 800, f1: 200 }); },
    run:    t => { noise(t, .4, .22, { type: 'bandpass', f0: 800, f1: 3000 }); },
    swap:   t => { tone(t, 500, .1, 'triangle', .18, { slide: 900, send: .3 }); },
    burn:   t => { noise(t, .35, .25, { type: 'bandpass', f0: 1500, f1: 400 }); },
    warp:   t => { tone(t, 440, .08, 'sine', .2); tone(t + .08, 330, .12, 'sine', .2); },
    win:    t => [523, 659, 784].forEach((f, i) => tone(t + i * .1, f, .25, 'triangle', .15)),
    step_grass:  t => noise(t, .05, .09, { type: 'bandpass', f0: 1800, q: .7 }),
    step_sand:   t => noise(t, .07, .07, { type: 'lowpass', f0: 900 }),
    step_stone:  t => { noise(t, .03, .1, { type: 'bandpass', f0: 2600, q: 1 }); tone(t, 700, .03, 'square', .03, { cut: 1500 }); },
    step_wood:   t => { tone(t, 300, .05, 'triangle', .1, { slide: 180 }); noise(t, .03, .06, { f0: 1500 }); },
    step_water:  t => noise(t, .12, .1, { type: 'bandpass', f0: 900, f1: 500, q: .6 }),
  };
  // 攻撃エフェクトにあわせた音（ふつうの技／属性ごと）。f = fxの情報
  function fxSound(f) {
    if (!ac) return; const t0 = ac.currentTime + .02, h = t0 + f.hit, big = f.big, el = f.el;
    // はじまりの音
    switch (f.type) {
      case 'slash': noise(t0 + f.hit - .1, .18, .35, { type: 'bandpass', f0: 2500, f1: 7000, q: 1.2 }); break;
      case 'whip': noise(t0 + f.hit - .05, .1, .4, { type: 'highpass', f0: 3500 }); tone(t0, 300, .2, 'sine', .08, { slide: 600 }); break;
      case 'proj': noise(t0 + .05, .45, .2, { type: 'bandpass', f0: el === 'fire' ? 500 : 1500, f1: 2500, q: .8 }); if (el === 'water') [700, 900, 800].forEach((x, i) => tone(t0 + .05 + i * .08, x, .1, 'sine', .12, { slide: x * 1.5 })); if (el === 'thunder') tone(t0, 200, .4, 'sawtooth', .1, { slide: 1500, cut: 3000 }); break;
      case 'beam': tone(t0, 200, .4, 'sawtooth', .12, { slide: 900, cut: 2500, send: .3 }); tone(t0 + .2, 900, .5, 'sine', .15, { send: .3 }); break;
      case 'breath': noise(t0, .7, .35, { type: 'bandpass', f0: 400, f1: 1800, q: .6, atk: .2 }); break;
      case 'wave': noise(t0, .7, .4, { type: 'lowpass', f0: 300, f1: 2500, atk: .35 }); break;
      case 'bolt': tone(t0 + f.hit - .2, 1200, .2, 'sawtooth', .08, { slide: 200, cut: 3000 }); break;
      case 'rocks': tone(t0 + .05, 1400, .35, 'sine', .06, { slide: 300 }); break;
      case 'swirl': tone(t0, 500, .7, 'sawtooth', .08, { slide: 90, cut: 1200, send: .5 }); tone(t0, 507, .7, 'sawtooth', .08, { slide: 92, cut: 1200, send: .5 }); break;
      case 'explosion': tone(t0, 100, .25, 'sawtooth', .1, { slide: 600, cut: 2000 }); break;
      case 'heal': SFXD.heal(t0); return;
      case 'impact': noise(t0 + .05, .12, .2, { type: 'bandpass', f0: 700, f1: 2000 }); break;
    }
    // 当たった音
    const v = f.mult < .9 ? .6 : 1;
    const thud = (a, fr) => { tone(h, fr, .22, 'sine', a * v, { slide: 45 }); noise(h, .1, .3 * a * v, { f0: 2000, f1: 300 }); };
    if (f.type === 'quake') { tone(h, 70, .9, 'sine', 1, { slide: 28, rel: .2 }); noise(h, .8, .5, { f0: 500, f1: 80 }); noise(h + .15, .5, .2, { type: 'highpass', f0: 1500, f1: 500 }); }
    else if (f.type === 'explosion') { tone(h, 90, .9, 'sine', 1, { slide: 28 }); noise(h, .8, .7, { f0: 3500, f1: 120 }); noise(h + .05, .5, .3, { type: 'highpass', f0: 2500, f1: 600 }); }
    else if (f.type === 'bolt') { noise(h, .35, .8, { f0: 9000, f1: 300 }); tone(h, 90, .6, 'sawtooth', .35, { slide: 40, cut: 600 }); if (big) { noise(h + .15, .5, .4, { f0: 3000, f1: 150 }); } [2400, 3100, 1800].forEach((x, i) => tone(h + i * .03, x, .06, 'square', .05, { cut: 5000 })); }
    else if (f.type === 'wave') { noise(h, .5, .5, { type: 'bandpass', f0: 1500, f1: 400, q: .5 }); thud(.5, 110); }
    else {
      thud(big ? 1 : .7, big ? 100 : 150);
      switch (el) {
        case 'fire': noise(h, .4, .3, { type: 'bandpass', f0: 2500, f1: 500, q: .8 }); for (let i = 0; i < 4; i++) tone(h + .05 + i * .06, 300 + i * 90, .05, 'square', .05, { cut: 2500 }); break;
        case 'water': noise(h, .3, .3, { type: 'bandpass', f0: 1800, f1: 600, q: .6 }); [900, 1200, 1500].forEach((x, i) => tone(h + .04 + i * .05, x, .08, 'sine', .1, { slide: x * .6 })); break;
        case 'grass': noise(h, .18, .35, { type: 'highpass', f0: 4500 }); tone(h, 700, .1, 'triangle', .1, { slide: 1100 }); break;
        case 'earth': noise(h, .45, .45, { f0: 600, f1: 120 }); tone(h + .05, 55, .4, 'sine', .5, { slide: 35 }); break;
        case 'light': [1568, 2093, 2637, 3136].forEach((x, i) => tone(h + i * .04, x, .35, 'sine', .1, { send: .5 })); break;
        case 'dark': tone(h, 160, .6, 'sawtooth', .22, { slide: 45, cut: 700, send: .5 }); noise(h, .5, .2, { type: 'bandpass', f0: 600, f1: 150 }); break;
        case 'ice': [2093, 2637, 3136].forEach((x, i) => tone(h + i * .035, x, .3, 'triangle', .1, { send: .5 })); noise(h, .2, .25, { type: 'highpass', f0: 5000, f1: 3000 }); break;
        case 'poison': noise(h, .5, .3, { type: 'lowpass', f0: 500, f1: 150 }); [220, 180, 260].forEach((x, i) => tone(h + i * .08, x, .15, 'sine', .15, { slide: x * 2 })); break;
        case 'steel': tone(h, 1568, .5, 'triangle', .2, { send: .4 }); tone(h, 2349, .4, 'triangle', .12, { send: .4 }); noise(h, .1, .35, { type: 'bandpass', f0: 4000, q: 2 }); break;
        case 'wind': noise(h, .5, .35, { type: 'bandpass', f0: 800, f1: 3500, q: .7, atk: .15 }); break;
        default: tone(h, 900, .06, 'square', .08, { cut: 3000 });
      }
    }
    if (f.mult > 1.2) { tone(h + .05, 1318, .12, 'triangle', .22, { send: .3 }); tone(h + .12, 1760, .25, 'triangle', .22, { send: .4 }); }
  }

  function sfx(name, delay) {
    if (!ac || muted) return;
    let fn = SFXD[name]; if (!fn) return;
    fn(ac.currentTime + (delay || 0) + .005);
  }
  function setMuted(m) { muted = m; try { localStorage.setItem('tsugihagi_mute', m ? '1' : '0'); } catch (e) { /* 無視 */ } if (master) master.gain.value = m ? 0 : .9; }

  // 書き出しテスト用：曲をオフラインで鳴らして音量を調べる
  async function renderTest(name, secs) {
    const live = { ac, master, comp, musicBus, sfxBus, wet, noiseBuf }, sp = TRACKS[name];
    await Promise.all(instrumentsOf(sp).map(loadInst));
    const off = new OfflineAudioContext(2, 44100 * secs, 44100); build(off);
    const song = compose(sp), T = { gain: musicBus }; let t = 0, i = 0;
    while (t < secs) { playEvents(T, song.bars[i % song.bars.length], t); t += song.barSec; i++; }
    const out = await off.startRendering(), d = out.getChannelData(0); let pk = 0, sum = 0, nan = 0;
    const seg = []; const N = Math.floor(d.length / 10);
    for (let s = 0; s < 10; s++) { let e = 0; for (let k = s * N; k < (s + 1) * N; k++) e += d[k] * d[k]; seg.push(+Math.sqrt(e / N).toFixed(3)); }
    for (let k = 0; k < d.length; k++) { const a = d[k]; if (a !== a) nan++; else { pk = Math.max(pk, Math.abs(a)); sum += a * a; } }
    ({ ac, master, comp, musicBus, sfxBus, wet, noiseBuf } = live);
    return { name, bars: song.bars.length, barSec: +song.barSec.toFixed(2), peak: +pk.toFixed(3), rms: +Math.sqrt(sum / d.length).toFixed(3), nan, seg };
  }

  return { current: () => (cur && cur.name) || null, init, ready, sfx, fxSound, play, stop, jingle, sync, setMuted, isMuted: () => muted, TRACKS, renderTest, compose };
})();

function audioInit() { Snd.init(); }
function sfx(name, delay) { Snd.sfx(name, delay); }
