// 怪物の見た目(リグ)その5
//   chochin    提灯お化け  宙に浮く提灯。大きな一つ目と、長い舌
//   karakasa   唐傘小僧    一本足で跳ねる古い傘。一つ目で、長い舌を出す
//   futakuchi  二口女      背中にもう一つの口があり、髪が何本も伸びて襲う
//   yamauba    山姥        腰の曲がった老婆。大きな包丁を振り下ろす
// pose: state / walk / tilt(予兆 0〜1) / jaw(弱点の開き) / ext(舌・髪が伸びる、振り下ろす 0〜1)
Object.assign(RigCreatures, (() => {
  const { named, add, ball, seg, segDown, hitMesh, moving, fwdOf, wound } = RigCreatures.kit;
  const { skinMaterial } = RigProcedural.kit;
  const { human, head, walkPose, mat, DARK, WET } = RigCreatures._k;
  const lerp = (a, b, k) => a + (b - a) * k;
  const TONGUE = mat(0xb03a48, 0.3);

  // 長い舌: 根元から前へ伸びて、先が垂れる。n 個の玉でつくる
  function tongue(parent, n) {
    const out = []; for (let i = 0; i < n; i++) out.push(add(parent, ball(0.05 - i * 0.002, 1, 1, 1, TONGUE), 0, 0, 0)); return out;
  }
  function placeTongue(arr, ox, oy, oz, len, sag, t) {
    arr.forEach((b, i) => { const u = (i + 1) / arr.length; b.position.set(ox + Math.sin(t * 3 + i) * 0.03 * u, oy - sag * u * u * u - 0.05 * u, oz + len * u); b.visible = len > 0.08; });
  }

  // ===================================================================== 提灯お化け
  function chochin() {
    const root = new THREE.Group(); root.name = 'Chochin';
    const paper = mat(0xe0662a, 0.5, { emissive: 0x7a2a08 }), rib = mat(0x2a120a, 0.8), white = mat(0xf0ece0, 0.3), iris = mat(0xaa1010, 0.4, { emissive: 0x200000 });
    const body = named(new THREE.Group(), 'Body'); body.position.y = 0.2; root.add(body);
    add(body, ball(0.38, 1, 1.25, 1, paper));
    for (let i = -3; i <= 3; i++) { const r = 0.38 * Math.sqrt(Math.max(0.05, 1 - Math.pow(i / 3.4, 2))); const t = new THREE.Mesh(new THREE.TorusGeometry(r * 1.0, 0.012, 5, 18), rib); t.rotation.x = Math.PI / 2; t.position.y = i * 0.14; body.add(t); }
    add(body, new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 10), rib), 0, 0.5, 0); add(body, new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 10), rib), 0, -0.5, 0);
    const eye = named(new THREE.Group(), 'Eye'); eye.position.set(0, 0.1, 0.34); body.add(eye);
    add(eye, ball(0.17, 1, 1, 0.6, white)); add(eye, ball(0.08, 1, 1, 0.5, iris), 0, 0, 0.07); add(eye, ball(0.035, 1, 1, 0.5, DARK), 0, 0, 0.11);
    const mouth = named(new THREE.Group(), 'Mouth'); mouth.position.set(0, -0.2, 0.33); body.add(mouth);
    const lip = add(mouth, ball(0.15, 1.2, 0.35, 0.5, WET), 0, 0, 0);
    const tg = tongue(body, 10);
    [-1, 1].forEach(s => add(body, seg(0.5, 0.01, 0.01, rib), s * 0.12, 0.45, 0));                    // 吊るす紐
    const hit = {
      body: hitMesh(new THREE.SphereGeometry(0.5, 8, 6), body, 0, 0, 0),
      head: hitMesh(new THREE.SphereGeometry(0.4, 8, 6), body, 0, 0.05, 0.05),
      weak: hitMesh(new THREE.SphereGeometry(0.2, 8, 6), eye, 0, 0, 0.05),
    };
    root.scale.setScalar(1.3);
    let P = { state: 'wander', walk: 0, tilt: 0, jaw: 0, ext: 0 }, F = 0, ex = 0;
    function apply(p, glowOn, flash) { P = p; F = flash; }
    function update(dt) {
      const t = performance.now() / 1000, p = P, k = Math.min(1, (dt || 0.016) * 9);
      ex = lerp(ex, p.ext || 0, k);
      body.rotation.z = Math.sin(t * 1.7) * 0.08 + (moving(p) ? Math.sin(p.walk) * 0.1 : 0); body.rotation.x = p.state === 'tell' ? -p.tilt * 0.5 : 0;
      body.scale.set(1 + (p.state === 'tell' ? p.tilt * 0.15 : 0), 1 + (p.state === 'tell' ? p.tilt * 0.1 : 0), 1);
      lip.scale.y = 0.35 + (Math.max(p.jaw, ex) * 0.9) + (p.state === 'tell' ? p.tilt * 0.4 : 0);
      placeTongue(tg, 0, -0.22, 0.3, ex * 3.8, 0.35 * (1 - ex * 0.6), t);
      paper.emissive.setRGB(0.48 + Math.sin(t * 9) * 0.04 + F * 0.5, 0.17, 0.03);                   // 灯がゆれる
      eye.scale.setScalar(1 + (p.state === 'tell' ? p.tilt * 0.3 : 0));
    }
    return { root, hit, apply, update, syncHit() {}, kind: 'chochin', handlesDeath: false, weakForward: out => fwdOf(eye, 0, 0, 1, out) };
  }

  // ===================================================================== 唐傘小僧
  function karakasa() {
    const root = new THREE.Group(); root.name = 'Karakasa';
    const paper = mat(0x8a5a38, 0.7), rib = mat(0x2a1a0e, 0.8), white = mat(0xf0ece0, 0.3), iris = mat(0xaa1010, 0.4, { emissive: 0x200000 });
    const skin = skinMaterial({ base: [150, 140, 120], wounds: 3, blood: 0.2, bruise: 2, seed: 91 });
    const body = named(new THREE.Group(), 'Body'); root.add(body);
    const canopy = named(new THREE.Group(), 'Canopy'); canopy.position.y = 1.15; body.add(canopy);
    const cg = new THREE.ConeGeometry(0.62, 0.55, 12, 1, true); cg.translate(0, 0.2, 0);
    add(canopy, new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: 0x8a5a38, roughness: 0.8, side: THREE.DoubleSide, emissive: 0x000000 })), 0, 0, 0);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = seg(0.7, 0.012, 0.008, rib); r.position.y = 0.45; r.rotation.set(0, -a, 1.0); canopy.add(r); }   // 骨
    add(body, seg(1.15, 0.025, 0.025, rib), 0, 0.2, 0);                                                      // 柄
    const eye = named(new THREE.Group(), 'Eye'); eye.position.set(0, 0.28, 0.4); canopy.add(eye); eye.rotation.x = -0.5;
    add(eye, ball(0.14, 1, 1, 0.6, white)); add(eye, ball(0.07, 1, 1, 0.5, iris), 0, 0, 0.06); add(eye, ball(0.03, 1, 1, 0.5, DARK), 0, 0, 0.1);
    const mouth = add(canopy, ball(0.16, 1.3, 0.4, 0.5, WET), 0, 0.05, 0.5); mouth.rotation.x = -0.5;
    const tg = tongue(canopy, 9);
    const leg = named(new THREE.Group(), 'Leg'); leg.position.set(0.04, 0.75, 0); body.add(leg);
    leg.add(segDown(0.62, 0.05, 0.04, skin)); add(leg, new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.3), rib), 0, -0.64, 0.05);   // 一本足と下駄
    const arm = named(new THREE.Group(), 'Arm'); arm.position.set(-0.05, 0.9, 0); body.add(arm); arm.add(segDown(0.45, 0.03, 0.02, skin));
    const hit = {
      body: hitMesh(new THREE.CylinderGeometry(0.5, 0.2, 1.4, 8), body, 0, 0.8, 0),
      head: hitMesh(new THREE.SphereGeometry(0.5, 8, 6), canopy, 0, 0.15, 0.1),
      weak: hitMesh(new THREE.SphereGeometry(0.2, 8, 6), eye, 0, 0, 0.05),
    };
    root.scale.setScalar(1.25);
    let P = { state: 'wander', walk: 0, tilt: 0, jaw: 0, ext: 0 }, F = 0, ex = 0;
    function apply(p, glowOn, flash) { P = p; F = flash; }
    function update(dt) {
      const t = performance.now() / 1000, p = P, mv = moving(p), k = Math.min(1, (dt || 0.016) * 9);
      ex = lerp(ex, p.ext || 0, k);
      const hop = mv ? Math.abs(Math.sin(p.walk * 0.8)) : 0;                                        // ぴょん、ぴょんと跳ねる
      body.position.y = hop * 0.35; body.rotation.z = mv ? Math.sin(p.walk * 0.8) * 0.12 : Math.sin(t * 2) * 0.03;
      canopy.rotation.x = p.state === 'tell' ? -p.tilt * 0.5 : 0; canopy.scale.setScalar(1 + (p.state === 'tell' ? p.tilt * 0.2 : 0));
      leg.rotation.x = mv ? -hop * 0.5 : 0; arm.rotation.z = mv ? Math.sin(p.walk * 0.8) * 0.6 : 0.2;
      const open = Math.max(p.jaw, ex); mouth.scale.y = 0.4 + open * 1.1;
      placeTongue(tg, 0, 0.0, 0.5, (p.state === 'tell' ? p.tilt * 0.4 : 0) * 1.5 + ex * 1.8, 0.5 * (1 - ex * 0.5), t);
      skin.emissive.setRGB(F * 0.6, 0, 0);
    }
    return { root, hit, apply, update, syncHit() {}, kind: 'karakasa', handlesDeath: false, weakForward: out => fwdOf(eye, 0, 0, 1, out) };
  }

  // ===================================================================== 二口女
  function futakuchi() {
    const root = new THREE.Group(); root.name = 'Futakuchi';
    const skin = skinMaterial({ base: [214, 202, 190], wounds: 4, blood: 0.4, bruise: 3, seed: 97 }), kimono = mat(0x30303c, 0.85), hairM = mat(0x050505, 1);
    const h = human(kimono, { torso: 1.1, arm: 0.95 }); root.add(h.body);
    const hd = head(skin, { sx: 0.15, sy: 0.22, sz: 0.17, cy: 0.18, mouthY: 0.05, mouthW: 0.1, eyeY: 0.22 }); hd.g.position.set(0, 1.86, 0.02); h.body.add(hd.g);
    add(hd.g, ball(0.2, 1.05, 1.25, 1.05, hairM), 0, 0.25, -0.02);                                            // 顔にかぶさる長い髪
    for (let i = 0; i < 5; i++) add(hd.g, seg(0.55, 0.012, 0.004, hairM), (i - 2) * 0.06, 0.05, 0.16).rotation.x = Math.PI;
    // 背中の口
    const back = named(new THREE.Group(), 'BackMouth'); back.position.set(0, 1.5, -0.2); back.rotation.y = Math.PI; h.body.add(back);
    add(back, ball(0.13, 1.2, 0.9, 0.5, skin)); const bm = add(back, ball(0.1, 1.2, 0.8, 0.5, WET), 0, -0.01, 0.04);
    for (let i = -2; i <= 2; i++) add(back, new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.04, 4), mat(0xd9d2bd, 0.6)), i * 0.035, 0.03, 0.08).rotation.x = Math.PI;
    const strands = []; for (let i = 0; i < 8; i++) { const g = new THREE.Group(); g.position.set((i - 3.5) * 0.04, 1.55, -0.22); const s = seg(1.0, 0.014, 0.004, hairM); g.add(s); h.body.add(g); strands.push({ g, s, i }); }
    const hit = {
      body: hitMesh(new THREE.CylinderGeometry(0.3, 0.3, 1.7, 8), root, 0, 0.9, 0),
      head: hitMesh(new THREE.SphereGeometry(0.25, 8, 6), hd.g, 0, 0.18, 0),
      weak: hitMesh(new THREE.SphereGeometry(0.18, 8, 6), back, 0, 0, 0.1),
    };
    root.scale.setScalar(1.1);
    let P = { state: 'wander', walk: 0, tilt: 0, jaw: 0, ext: 0 }, F = 0, ex = 0;
    function apply(p, glowOn, flash) { P = p; F = flash; }
    function update(dt) {
      const t = performance.now() / 1000, p = P, k = Math.min(1, (dt || 0.016) * 8);
      ex = lerp(ex, p.ext || 0, k); walkPose(h, p, 0.5);
      h.body.rotation.x = p.state === 'tell' ? p.tilt * 0.35 : 0;                                          // 予兆: 前かがみになって、背中を見せる
      bm.scale.y = 0.8 + Math.max(p.jaw, ex) * 1.1 + Math.abs(Math.sin(t * 6)) * 0.1;
      strands.forEach(({ g, s, i }) => {
        const sp = 0.3 + ex * 1.1, sw = Math.sin(t * (3 + ex * 9) + i * 1.7) * (0.15 + ex * 0.5);
        g.rotation.set(2.6 - ex * 0.6 + Math.cos(t * 4 + i) * 0.1 * ex, (i - 3.5) * 0.18 * sp, sw); s.scale.y = 0.8 + ex * 2.2;
      });
      hd.jaw.rotation.x = Math.max(p.jaw, 0) * 0.5; skin.emissive.setRGB(F * 0.6, 0, 0);
    }
    return { root, hit, apply, update, syncHit() {}, kind: 'futakuchi', handlesDeath: false, weakForward: out => fwdOf(back, 0, 0, 1, out) };
  }

  // ===================================================================== 山姥
  function yamauba() {
    const root = new THREE.Group(); root.name = 'Yamauba';
    const skin = skinMaterial({ base: [178, 160, 138], wounds: 5, blood: 0.35, bruise: 4, seed: 103 }), rags = mat(0x4a4234, 0.95), hairM = mat(0xe4e0d8, 0.9), steel = mat(0x8a9098, 0.35, { metalness: 0.7 });
    const h = human(rags, { torso: 1.0, arm: 1.1, armT: 1.1 }); root.add(h.body); h.body.scale.setScalar(0.95);
    const hd = head(skin, { sx: 0.16, sy: 0.22, sz: 0.17, cy: 0.18, mouthY: 0.05, mouthW: 0.15, eyeY: 0.22 }); hd.g.position.set(0, 1.78, 0.12); h.body.add(hd.g);
    for (let i = 0; i < 18; i++) { const s = seg(0.6 + (i % 5) * 0.12, 0.012, 0.004, hairM); s.position.set((i - 9) * 0.017, 0.32, -0.04); s.rotation.x = Math.PI - 0.15 + (i % 3) * 0.05; hd.g.add(s); }   // 白髪
    wound(hd.g, -0.06, 0.2, 0.15, 0.04, -0.3);
    const knife = named(new THREE.Group(), 'Knife'); h.armR.el.add(knife); knife.position.set(0, -0.8, 0);
    add(knife, seg(0.1, 0.02, 0.02, mat(0x3a2a1a, 0.9)), 0, -0.04, 0);
    const blade = add(knife, new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.55, 0.16), steel), 0, -0.4, 0.04); blade.rotation.x = 0.1;
    const hit = {
      body: hitMesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8), root, 0, 0.9, 0),
      head: hitMesh(new THREE.SphereGeometry(0.26, 8, 6), hd.g, 0, 0.18, 0),
      weak: hitMesh(new THREE.SphereGeometry(0.15, 8, 6), hd.g, 0, 0.06, 0.12),
    };
    root.scale.setScalar(1.15);
    let P = { state: 'wander', walk: 0, tilt: 0, jaw: 0, ext: 0 }, F = 0, ar = 0;
    function apply(p, glowOn, flash) { P = p; F = flash; }
    function update(dt) {
      const t = performance.now() / 1000, p = P;
      walkPose(h, p, 0.4); h.body.rotation.x = 0.35 + (p.state === 'tell' ? -p.tilt * 0.5 : p.state === 'act' ? 0.3 : 0);   // 腰が曲がっている
      const target = p.state === 'tell' ? -p.tilt * 3.0 : p.state === 'act' ? 0.9 : p.state === 'recover' ? 0.5 : null;
      if (target != null) { ar = lerp(ar, target, Math.min(1, (dt || 0.016) * (p.state === 'act' ? 24 : 7))); h.armR.sh.rotation.x = ar; }
      hd.g.rotation.x = -0.3 + Math.sin(t * 1.5) * 0.04; hd.jaw.rotation.x = 0.15 + Math.max(p.jaw, p.state === 'tell' ? p.tilt : 0) * 0.8; hd.cav.visible = true;
      skin.emissive.setRGB(F * 0.6, 0, 0);
    }
    return { root, hit, apply, update, syncHit() {}, kind: 'yamauba', handlesDeath: false, weakForward: out => fwdOf(hd.g, 0, 0, 1, out) };
  }

  return { chochin, karakasa, futakuchi, yamauba };
})());
