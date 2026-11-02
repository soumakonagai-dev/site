// 怪物の見た目(リグ)その4: あとから増えた怪物たち。rig-creatures.js / rig-creatures-b.js の部品を使う
//   ningyo       市松人形   小さな人形。かくかくと動き、顔が割れて口が開く
//   kubinaga     首長       首が何メートルも伸びて、頭で襲ってくる
//   mukade       百足       人の顔をした大百足。うねりながら走る
//   gashadokuro  骨の巨人   大きな骸骨。両腕を振り上げて叩き潰す
// pose: state / walk / tilt(予兆 0〜1) / jaw(弱点の開き) / ext(伸びる・振り下ろす 0〜1)
Object.assign(RigCreatures, (() => {
  const { named, add, ball, seg, segDown, cone, hitMesh, moving, fwdOf, wound } = RigCreatures.kit;
  const { skinMaterial } = RigProcedural.kit;
  const { human, head, walkPose, mat, BONE, DARK, WET } = RigCreatures._k;
  const lerp = (a, b, k) => a + (b - a) * k;

  // ===================================================================== 市松人形
  function ningyo() {
    const root = new THREE.Group(); root.name = 'Ningyo';
    const kimono = mat(0x8a1428, 0.55), obi = mat(0xd8be68, 0.4), hairM = mat(0x040404, 0.9), white = skinMaterial({ base: [238, 230, 218], wounds: 4, blood: 0.35, bruise: 1, seed: 61 });
    const body = named(new THREE.Group(), 'Body'); root.add(body);
    const prof = [[0.001, 0], [0.27, 0.0], [0.24, 0.25], [0.17, 0.55], [0.13, 0.75], [0.12, 0.85], [0.001, 0.88]].map(a => new THREE.Vector2(a[0], a[1]));
    add(body, new THREE.Mesh(new THREE.LatheGeometry(prof, 14), kimono), 0, 0.0, 0);
    add(body, new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 12), obi), 0, 0.5, 0);
    const hd = head(white, { sx: 0.19, sy: 0.23, sz: 0.2, cy: 0.18, mouthY: 0.05, mouthW: 0.1, eyeY: 0.24 });
    hd.g.position.set(0, 0.88, 0); body.add(hd.g);
    add(hd.g, ball(0.25, 1, 1.0, 1.0, hairM), 0, 0.26, -0.07);                          // おかっぱの髪
    add(hd.g, ball(0.2, 1.05, 0.28, 0.5, hairM), 0, 0.42, 0.15);                         // 前髪
    wound(hd.g, 0.08, 0.26, 0.16, 0.05, 0.4);                                            // 顔のひび割れ
    const arms = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 0.19, 0.78, 0); g.add(segDown(0.4, 0.05, 0.035, kimono)); add(g, ball(0.045, 1, 1, 1, white), 0, -0.42, 0); body.add(g); return g; });
    const hit = {
      body: hitMesh(new THREE.SphereGeometry(0.3, 8, 6), body, 0, 0.4, 0),
      head: hitMesh(new THREE.SphereGeometry(0.28, 8, 6), hd.g, 0, 0.2, 0),
      weak: hitMesh(new THREE.SphereGeometry(0.2, 8, 6), hd.g, 0, 0.12, 0.08),
    };
    root.scale.setScalar(1.35);
    let P = { state: 'wander', walk: 0, tilt: 0, jaw: 0 }, F = 0;
    function apply(p, glowOn, flash) { P = p; F = flash; }
    function update() {
      const t = performance.now() / 1000, p = P, mv = moving(p), step = Math.floor(p.walk * 0.9);
      body.position.y = mv ? (step % 2 ? 0.05 : 0) : 0;                                   // かくっかくっと、ぎこちなく動く
      body.rotation.z = mv ? (step % 2 ? 0.08 : -0.08) : 0;
      arms.forEach((a, i) => { a.rotation.x = p.state === 'tell' ? -p.tilt * 2.4 : mv ? (step % 2 ? 0.5 : -0.5) * (i ? 1 : -1) : 0.1; });
      hd.g.rotation.z = p.state === 'tell' ? p.tilt * 0.9 : Math.sin(t * 1.3) * 0.05;     // 予兆: 首が傾く
      hd.g.rotation.x = -p.tilt * 0.3;
      const open = Math.max(p.jaw, p.state === 'act' ? 0.8 : 0);
      hd.jaw.rotation.x = open * 0.9 + (p.state === 'tell' ? p.tilt * 0.5 : 0); hd.cav.visible = open > 0.15 || p.state === 'tell';
      white.emissive.setRGB(F * 0.6, 0, 0);
    }
    return { root, hit, apply, update, syncHit() {}, kind: 'ningyo', handlesDeath: false, weakForward: out => fwdOf(hd.g, 0, 0, 1, out) };
  }

  // ===================================================================== 首長(首が伸びる)
  function kubinaga() {
    const root = new THREE.Group(); root.name = 'Kubinaga';
    const skin = skinMaterial({ base: [208, 196, 184], wounds: 3, blood: 0.3, bruise: 3, seed: 71 });
    const robe = mat(0x2a2a3a, 0.9);
    const h = human(robe, { torso: 1.1, arm: 0.9 }); root.add(h.body);
    const N = 12, neck = [];
    for (let i = 0; i < N; i++) neck.push(add(root, ball(0.07 - i * 0.002, 1, 1, 1.0, skin), 0, 1.7, 0));
    const hd = head(skin, { sx: 0.15, sy: 0.2, sz: 0.17, cy: 0.16, mouthY: 0.05, mouthW: 0.14, eyeY: 0.2 }); root.add(hd.g);
    const hit = {
      body: hitMesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8), root, 0, 0.9, 0),
      head: hitMesh(new THREE.SphereGeometry(0.26, 8, 6), hd.g, 0, 0.16, 0),
      weak: hitMesh(new THREE.SphereGeometry(0.15, 8, 6), hd.g, 0, 0.08, 0.12),
    };
    let P = { state: 'wander', walk: 0, tilt: 0, jaw: 0, ext: 0 }, F = 0, ex = 0, ti = 0;
    function apply(p, glowOn, flash) { P = p; F = flash; }
    function update(dt) {
      const t = performance.now() / 1000, p = P, k = Math.min(1, (dt || 0.016) * 9);
      ex = lerp(ex, p.ext || 0, k); ti = lerp(ti, p.state === 'tell' ? p.tilt : 0, k);
      walkPose(h, p, 0.5);
      // 首の曲線: ふだんは肩の上でゆらゆら、予兆でのけぞり、攻撃でまっすぐ前へ伸びる
      const hx = Math.sin(t * 1.1) * 0.06, hy = 1.95 + ex * -0.1 + ti * 0.6, hz = 0.1 + ex * 3.4 - ti * 0.5;
      for (let i = 0; i < N; i++) {
        const u = (i + 1) / N, arch = Math.sin(u * Math.PI) * (0.35 + ti * 0.9) * (1 - ex * 0.9);
        neck[i].position.set(hx * u, 1.7 + (hy - 1.7) * u + arch, hz * u + Math.sin(u * 3 + t) * 0.03);
        neck[i].scale.setScalar(1 + ex * 0.2);
      }
      hd.g.position.set(hx, hy, hz); hd.g.rotation.x = ti * 0.7 - ex * 0.1;
      const open = Math.max(p.jaw, ex > 0.5 ? 1 : 0);
      hd.jaw.rotation.x = open * 0.9 + ti * 0.4; hd.cav.visible = open > 0.15;
      skin.emissive.setRGB(F * 0.6, 0, 0);
    }
    return { root, hit, apply, update, syncHit() {}, kind: 'kubinaga', handlesDeath: false, weakForward: out => fwdOf(hd.g, 0, 0, 1, out) };
  }

  // ===================================================================== 百足(人の顔の大百足)
  function mukade() {
    const root = new THREE.Group(); root.name = 'Mukade';
    const skin = skinMaterial({ base: [190, 150, 120], wounds: 4, blood: 0.45, bruise: 4, seed: 83 });
    const shell = mat(0x3a1a12, 0.35, { metalness: 0.3 }), legM = mat(0x24100a, 0.5);
    const N = 14, segs = [];
    for (let i = 0; i < N; i++) {
      const g = new THREE.Group(); root.add(g);
      add(g, ball(0.2 - i * 0.004, 1.05, 0.7, 0.75, i % 2 ? shell : mat(0x5a2418, 0.35)), 0, 0, 0);
      const legs = [-1, 1].map(s => { const l = new THREE.Group(); l.position.set(s * 0.17, -0.04, 0); l.add(seg(0.38, 0.018, 0.008, legM)); l.rotation.z = -s * 1.2; g.add(l); return { l, s }; });
      segs.push({ g, legs });
    }
    const hd = head(skin, { sx: 0.17, sy: 0.2, sz: 0.18, cy: 0.1, mouthY: 0.03, mouthW: 0.15, eyeY: 0.17 });
    hd.g.rotation.x = 1.15; hd.g.position.set(0, 0.04, 0.0); root.add(hd.g);
    [-1, 1].forEach(s => { const a = seg(0.45, 0.025, 0.005, legM); a.position.set(s * 0.1, 0.18, 0.18); a.rotation.set(1.3, 0, -s * 0.5); root.add(a); });   // 触角
    const hit = {
      body: hitMesh(new THREE.SphereGeometry(0.5, 8, 6), root, 0, 0.1, -0.9),
      head: hitMesh(new THREE.SphereGeometry(0.3, 8, 6), hd.g, 0, 0.12, 0),
      weak: hitMesh(new THREE.SphereGeometry(0.17, 8, 6), hd.g, 0, 0.07, 0.12),
    };
    root.scale.setScalar(1.15);
    let P = { state: 'wander', walk: 0, tilt: 0, jaw: 0 }, F = 0, rise = 0;
    function apply(p, glowOn, flash) { P = p; F = flash; }
    function update(dt) {
      const t = performance.now() / 1000, p = P, mv = moving(p), sp = mv ? 1 : 0.25, ph = p.walk * 1.4;
      rise = lerp(rise, p.state === 'tell' ? p.tilt : p.state === 'act' ? 0.6 : 0, Math.min(1, (dt || 0.016) * 7));
      segs.forEach((s, i) => {
        const u = i / (N - 1), lift = Math.max(0, 1 - u * 2.2) * rise;
        s.g.position.set(Math.sin(ph - i * 0.7) * 0.18 * sp, 0.2 + lift * 1.1, -0.18 - i * 0.3 + lift * 0.1);
        s.g.rotation.y = Math.cos(ph - i * 0.7) * 0.25 * sp;
        s.legs.forEach(({ l, s: sd }) => { l.rotation.x = Math.sin(ph * 2.5 - i * 0.9 + (sd > 0 ? 0 : 1.6)) * 0.5 * sp; });
      });
      const s0 = segs[0].g; hd.g.position.set(s0.position.x, s0.position.y + 0.02, s0.position.z + 0.2); hd.g.rotation.y = s0.rotation.y; hd.g.rotation.x = 1.15 - rise * 0.9;
      const open = Math.max(p.jaw, p.state === 'act' ? 0.9 : 0);
      hd.jaw.rotation.x = 0.2 + open * 0.8 + (mv ? Math.abs(Math.sin(t * 12)) * 0.2 : 0); hd.cav.visible = true;
      skin.emissive.setRGB(F * 0.6, 0, 0);
    }
    return { root, hit, apply, update, syncHit() {}, kind: 'mukade', handlesDeath: false, weakForward: out => fwdOf(hd.g, 0, 0, 1, out) };
  }

  // ===================================================================== 骨の巨人
  function gashadokuro() {
    const root = new THREE.Group(); root.name = 'Gashadokuro';
    const bone = mat(0xd8d0bc, 0.75);
    const h = human(bone, { torso: 1.0, arm: 1.25, armT: 1.5, leg: 1.1, legT: 1.4, shY: 1.9, hipY: 0.98 }); root.add(h.body);
    for (let i = 0; i < 6; i++) {                                                          // あばら骨
      const rr = 0.2 - Math.abs(i - 2.5) * 0.018;
      const t1 = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.014, 5, 14, Math.PI * 1.3), bone); t1.rotation.set(Math.PI / 2, 0, -0.65 + Math.PI * 0.5 - Math.PI * 0.5); t1.position.set(0, 1.0 + i * 0.1, 0); t1.scale.z = 0.8; h.body.add(t1);
    }
    add(h.body, seg(0.95, 0.025, 0.02, bone), 0, 0.95, -0.12);                              // 背骨
    const hd = head(bone, { sx: 0.2, sy: 0.24, sz: 0.22, cy: 0.2, mouthY: 0.06, mouthW: 0.16, eyeY: 0.26 }); hd.g.position.set(0, 1.98, 0.02); h.body.add(hd.g);
    [-1, 1].forEach(s => add(hd.g, ball(0.03, 1, 1, 1, mat(0xff4020, 0.3, { emissive: 0xaa2000 })), s * 0.07, 0.27, 0.15));   // 燃える眼
    const hit = {
      body: hitMesh(new THREE.CylinderGeometry(0.4, 0.4, 1.7, 8), root, 0, 1.2, 0),
      head: hitMesh(new THREE.SphereGeometry(0.3, 8, 6), hd.g, 0, 0.2, 0),
      weak: hitMesh(new THREE.SphereGeometry(0.17, 8, 6), hd.g, 0, 0.1, 0.12),
    };
    root.scale.setScalar(1.2);
    let P = { state: 'wander', walk: 0, tilt: 0, jaw: 0, ext: 0 }, F = 0, ar = 0;
    function apply(p, glowOn, flash) { P = p; F = flash; }
    function update(dt) {
      const p = P, t = performance.now() / 1000;
      walkPose(h, p, 0.5);
      const target = p.state === 'tell' ? -p.tilt * 3.1 : p.state === 'act' ? 0.5 : 0;     // 予兆: 両腕を頭の上まで振り上げる
      ar = lerp(ar, target, Math.min(1, (dt || 0.016) * (p.state === 'act' ? 22 : 7)));
      if (p.state === 'tell' || p.state === 'act') { h.armL.sh.rotation.x = ar; h.armR.sh.rotation.x = ar; }
      h.body.rotation.x = p.state === 'tell' ? -p.tilt * 0.3 : p.state === 'act' ? 0.3 : 0;
      hd.g.rotation.x = p.state === 'tell' ? -p.tilt * 0.5 : 0;
      const open = Math.max(p.jaw, p.state === 'tell' ? p.tilt : 0);
      hd.jaw.rotation.x = open * 0.8 + Math.abs(Math.sin(t * 7)) * 0.05; hd.cav.visible = open > 0.2;
      bone.emissive.setRGB(F * 0.6, 0, 0);
    }
    return { root, hit, apply, update, syncHit() {}, kind: 'gashadokuro', handlesDeath: false, weakForward: out => fwdOf(hd.g, 0, 0, 1, out) };
  }

  return { ningyo, kubinaga, mukade, gashadokuro };
})());
