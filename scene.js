/* ============================================================
   scene.js — the "neural core": a draggable WebGL particle
   object that lives behind the page, spins to your cursor,
   and shrinks/fades as you scroll past the hero.
   ============================================================ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) { return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 7.2;

  const group = new THREE.Group();
  scene.add(group);

  // ---- accent color helper ----
  function accentColor() {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#C6FF3A';
    return new THREE.Color(c);
  }
  let accent = accentColor();

  // ---- build the core: fibonacci-sphere of points + a few orbiting shells ----
  const COUNT = 2600;
  const positions = new Float32Array(COUNT * 3);
  const base = new Float32Array(COUNT * 3);       // resting positions
  const rand = new Float32Array(COUNT);
  const R = 2.5;
  for (let i = 0; i < COUNT; i++) {
    const t = i / COUNT;
    const inc = Math.acos(1 - 2 * t);
    const az = Math.PI * (1 + Math.sqrt(5)) * i;
    // multi-shell: push some points inward for depth
    const shell = 0.55 + 0.45 * ((i % 7) / 6);
    const r = R * shell * (0.92 + Math.random() * 0.16);
    const x = r * Math.sin(inc) * Math.cos(az);
    const y = r * Math.sin(inc) * Math.sin(az);
    const z = r * Math.cos(inc);
    base[i*3] = x; base[i*3+1] = y; base[i*3+2] = z;
    positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
    rand[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // round soft sprite for each point
  function makeSprite() {
    const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
    const g = cv.getContext('2d');
    const grd = g.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.8)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0,0,s,s);
    const tex = new THREE.CanvasTexture(cv); return tex;
  }
  const sprite = makeSprite();

  const mat = new THREE.PointsMaterial({
    size: 0.058, map: sprite, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, color: accent, opacity: 0.9
  });
  const points = new THREE.Points(geo, mat);
  group.add(points);

  // wireframe icosahedron core (faint structure)
  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.5, 1),
    new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.12 })
  );
  group.add(ico);

  // a dim inner sphere glow
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 24, 24),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.06 })
  );
  group.add(glow);

  // bright nucleus point
  const nucleusMat = new THREE.PointsMaterial({ size: 0.5, map: sprite, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, color: accent, opacity: 0.8 });
  const nucleus = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]),3)), nucleusMat);
  group.add(nucleus);

  // ---- interaction state ----
  let rotX = -0.3, rotY = 0, velX = 0, velY = 0.0016;
  let dragging = false, lastX = 0, lastY = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let burst = 0; // explode-on-grab energy

  function onDown(e) {
    dragging = true;
    const p = e.touches ? e.touches[0] : e;
    lastX = p.clientX; lastY = p.clientY;
    burst = 1;
    document.body.classList.add('grabbing');
  }
  function onMove(e) {
    const p = e.touches ? e.touches[0] : e;
    pointer.tx = (p.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (p.clientY / window.innerHeight) * 2 - 1;
    if (dragging) {
      const dx = p.clientX - lastX, dy = p.clientY - lastY;
      velY = dx * 0.00038;
      velX = dy * 0.00038;
      lastX = p.clientX; lastY = p.clientY;
    }
  }
  function onUp() { dragging = false; document.body.classList.remove('grabbing'); }

  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointerleave', onUp);

  // ---- scroll-driven transform ----
  let heroProg = 0; // 0 at top, 1 when hero scrolled away
  function updateScroll() {
    const h = window.innerHeight;
    heroProg = Math.min(1, Math.max(0, window.scrollY / (h * 0.9)));
  }
  window.addEventListener('scroll', updateScroll, { passive: true });

  // ---- resize ----
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize(); updateScroll();

  // ---- animation loop ----
  const clock = new THREE.Clock();
  const pos = geo.attributes.position.array;

  function tick() {
    const t = clock.getElapsedTime();

    // inertia / auto-spin
    if (!dragging) {
      velY += (0.0016 - velY) * 0.02; // settle to gentle auto-rotate
      velX *= 0.94;
    }
    rotY += velY; rotX += velX;
    rotX = Math.max(-1.2, Math.min(1.2, rotX));

    // pointer parallax (subtle)
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    group.rotation.y = rotY + pointer.x * 0.25;
    group.rotation.x = rotX + pointer.y * 0.18;

    // breathing + burst displacement of particles
    burst *= 0.93;
    const amp = 0.06 + burst * 0.5;
    for (let i = 0; i < COUNT; i++) {
      const bx = base[i*3], by = base[i*3+1], bz = base[i*3+2];
      const n = Math.sin(t * 1.3 + rand[i] * 12.0) * amp;
      const k = 1 + n * 0.12 + burst * 0.18 * rand[i];
      pos[i*3] = bx * k;
      pos[i*3+1] = by * k;
      pos[i*3+2] = bz * k;
    }
    geo.attributes.position.needsUpdate = true;
    ico.rotation.y -= 0.0024; ico.rotation.x += 0.0012;

    // scroll: shrink, lift, fade as hero leaves
    const s = 1 - heroProg * 0.5;
    group.scale.setScalar(s);
    group.position.y = heroProg * 2.6;
    group.position.x = heroProg * 1.2;
    const vis = 1 - heroProg * 0.78;
    mat.opacity = 0.9 * vis;
    nucleusMat.opacity = 0.8 * vis;
    ico.material.opacity = 0.12 * vis;
    glow.material.opacity = 0.06 * vis;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  // intro handled by the per-frame scroll transform; nothing to animate here.

  // ---- public: change accent ----
  window.setSceneAccent = function () {
    accent = accentColor();
    mat.color = accent; nucleusMat.color = accent;
    ico.material.color = accent; glow.material.color = accent;
  };
  // ---- public: positions hero offset for layout (not used externally now) ----
})();
