/* ============================================================
   scene.js — the "neural core": a sphere of light points behind
   the page. It turns toward the cursor, can be dragged, bursts
   when grabbed, and shrinks and fades as you scroll past the hero.

   Each point is drawn by a small shader, so the sphere has depth
   (near points are larger and brighter), waves of light travel
   across its surface, points near the cursor lift and glow, and
   a few amber sparks sit among the cyan. A soft halo, a slow
   outer dust shell and a wireframe core complete it.
   A veil of light is drawn behind. One canvas, one WebGL context.
   ============================================================ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !window.THREE) { return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.innerWidth < 720;
  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.autoClear = false;

  const FOV = 50;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = 7.2;
  const group = new THREE.Group();
  scene.add(group);

  function cssColor(name, fallback) {
    const c = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    return new THREE.Color(c);
  }
  let accent = cssColor('--accent', '#00d4ff');
  let signal = cssColor('--signal', '#ffb454');

  /* ---------- veil: slow ribbons of light behind everything ---------- */
  const veilScene = new THREE.Scene();
  const veilCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const veilMat = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
      uColor: { value: accent.clone() }, uScroll: { value: 0 }, uHero: { value: 0 }
    },
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: [
      'precision highp float;',
      'uniform float uTime; uniform vec2 uRes; uniform vec3 uColor; uniform float uScroll; uniform float uHero;',
      'void main(){',
      '  vec2 uv = gl_FragCoord.xy / uRes;',
      '  vec2 p = uv - 0.5; p.x *= uRes.x / uRes.y;',
      '  float t = uTime * 0.07;',
      '  vec2 q = p; q.y += uScroll;',
      '  q.x += 0.32 * sin(q.y * 1.9 + t * 2.3) + 0.12 * sin(q.y * 4.3 - t * 1.6);',
      '  q.y += 0.22 * sin(q.x * 1.5 - t * 1.9);',
      '  float a = smoothstep(0.25, 1.0, sin(q.x * 2.4 + q.y * 1.6 + t * 3.1));',
      '  float b = smoothstep(0.45, 1.0, sin(q.x * 1.2 - q.y * 2.6 - t * 2.2 + 1.7));',
      '  float mask = smoothstep(1.15, 0.05, length(p - vec2(0.38, 0.12)));',
      '  vec3 violet = vec3(0.42, 0.30, 1.0);',
      '  vec3 col = uColor * a + mix(uColor, violet, 0.75) * b * 0.8;',
      '  float inten = (a * 0.55 + b * 0.4) * mask * mix(0.26, 0.16, uHero);',
      '  inten += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 170.0;',
      '  float m = max(max(col.r, col.g), max(col.b, 0.0001));',
      '  gl_FragColor = vec4(col / m, clamp(inten, 0.0, 1.0));',
      '}'
    ].join('\n')
  });
  veilScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), veilMat));

  /* ---------- the points shader, shared by the core and the dust ---------- */
  const pointUniforms = {
    uTime: { value: 0 },
    uBurst: { value: 0 },
    uOpacity: { value: 1 },
    uScale: { value: 1 },                      // turns a world-space size into pixels
    uAspect: { value: 1 },
    uPointer: { value: new THREE.Vector2(9, 9) },
    uPointerOn: { value: 0 },
    uColor: { value: accent.clone() },
    uSignal: { value: signal.clone() }
  };
  const pointMat = new THREE.ShaderMaterial({
    uniforms: pointUniforms,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute float aRand;',
      'attribute float aSize;',
      'uniform float uTime, uBurst, uOpacity, uScale, uAspect, uPointerOn;',
      'uniform vec2 uPointer;',
      'uniform vec3 uColor, uSignal;',
      'varying vec3 vCol;',
      'varying float vAlpha;',
      'void main(){',
      '  vec3 n = normalize(position);',
      // a slow wave of "thought" rolling over the surface
      '  float w = sin(n.x * 3.1 + uTime * 0.9) * sin(n.y * 4.0 - uTime * 0.7) * sin(n.z * 2.7 + uTime * 0.5);',
      '  float crest = max(w, 0.0);',
      '  float breathe = sin(uTime * 1.3 + aRand * 12.0) * 0.03;',
      '  vec3 p = position * (1.0 + w * 0.09 + breathe + uBurst * (0.16 * aRand + 0.3 * crest + 0.05));',
      // points under the cursor lift off the surface and glow
      '  vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
      '  vec2 d = clip.xy / clip.w - uPointer; d.x *= uAspect;',
      '  float near = smoothstep(0.42, 0.0, length(d)) * uPointerOn;',
      '  p += n * near * 0.32;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_Position = projectionMatrix * mv;',
      // depth: 0 at the far side of the sphere, 1 at the near side
      '  float depth = smoothstep(-10.4, -4.4, mv.z);',
      '  float twinkle = 0.72 + 0.28 * sin(uTime * 2.1 + aRand * 43.0);',
      '  float hot = clamp(crest * 1.5 + near * 0.9 + uBurst * 0.5, 0.0, 1.0);',
      '  float spark = step(0.945, aRand);',
      // capped, because large additive points are what costs frames on integrated graphics
      '  gl_PointSize = min(aSize * (0.55 + 0.85 * depth) * (1.0 + hot * 0.9 + spark * 0.5) * uScale / -mv.z, 22.0);',
      '  vec3 base = mix(uColor, uSignal, spark);',
      '  vCol = mix(base, vec3(1.0), hot * 0.55);',
      '  vAlpha = (0.22 + 0.78 * depth) * twinkle * (0.75 + hot * 0.6) * uOpacity;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'precision mediump float;',
      'varying vec3 vCol;',
      'varying float vAlpha;',
      'void main(){',
      '  float r = length(gl_PointCoord - 0.5);',
      '  float a = smoothstep(0.5, 0.0, r);',
      '  a = a * a * (0.6 + 0.4 * a);',
      '  gl_FragColor = vec4(vCol, a * vAlpha);',
      '}'
    ].join('\n')
  });

  function buildPoints(count, place) {
    const pos = new Float32Array(count * 3), rnd = new Float32Array(count), size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const v = place(i, count);
      pos[i * 3] = v[0]; pos[i * 3 + 1] = v[1]; pos[i * 3 + 2] = v[2];
      rnd[i] = Math.random();
      size[i] = v[3];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    const pts = new THREE.Points(geo, pointMat);
    pts.frustumCulled = false;
    return pts;
  }

  // the core: an even (fibonacci) sphere in a few shells, so it has a body, not just a skin
  const R = 2.5;
  const COUNT = small ? 1800 : 2800;
  const core = buildPoints(COUNT, (i, n) => {
    const inc = Math.acos(1 - 2 * (i + 0.5) / n);
    const az = Math.PI * (1 + Math.sqrt(5)) * i;
    const shell = 0.55 + 0.45 * ((i % 7) / 6);
    const r = R * shell * (0.93 + Math.random() * 0.14);
    return [r * Math.sin(inc) * Math.cos(az), r * Math.sin(inc) * Math.sin(az), r * Math.cos(inc),
      0.03 + Math.random() * 0.032 + (shell > 0.95 ? 0.012 : 0)];
  });
  group.add(core);

  // outer dust: sparse, slow, turning the other way, for depth
  const dust = buildPoints(small ? 160 : 320, () => {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const r = R * (1.22 + Math.random() * 0.55);
    return [r * s * Math.cos(th), r * u, r * s * Math.sin(th), 0.02 + Math.random() * 0.022];
  });
  group.add(dust);

  // soft halo behind the core
  function haloTexture() {
    const s = 256, cv = document.createElement('canvas'); cv.width = cv.height = s;
    const g = cv.getContext('2d');
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(255,255,255,0.55)');
    grd.addColorStop(0.25, 'rgba(255,255,255,0.22)');
    grd.addColorStop(0.6, 'rgba(255,255,255,0.05)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(cv);
  }
  const haloMat = new THREE.SpriteMaterial({
    map: haloTexture(), color: accent, transparent: true, opacity: 0.3,
    depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(R * 3.6);
  group.add(halo);

  // wireframe core: two nested shapes turning against each other
  const icoMat = new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.14, depthWrite: false });
  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), icoMat);
  group.add(ico);
  const innerMat = new THREE.MeshBasicMaterial({ color: signal, wireframe: true, transparent: true, opacity: 0.1, depthWrite: false });
  const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 0), innerMat);
  group.add(inner);

  /* ---------- interaction ---------- */
  let rotX = -0.3, rotY = 0, velX = 0, velY = 0.0016;
  let dragging = false, lastX = 0, lastY = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, seen: false };
  let burst = 0;

  // clicks on controls belong to the page, not the core
  const UI = 'a, button, input, textarea, select, label, .ask, .proj-modal, .mobile-menu';
  function onDown(e) {
    if (e.target.closest && e.target.closest(UI)) { return; }
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    if (!reduceMotion) { burst = 1; }
    document.body.classList.add('grabbing');
  }
  function onMove(e) {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.seen = true;
    if (dragging) {
      velY = (e.clientX - lastX) * 0.00038;
      velX = (e.clientY - lastY) * 0.00038;
      lastX = e.clientX; lastY = e.clientY;
    }
  }
  function onUp() { dragging = false; document.body.classList.remove('grabbing'); }
  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointerleave', onUp);

  // the hero panel makes the core pulse while it "thinks" and "speaks"
  window.addEventListener('ask:think', () => { if (!reduceMotion) { burst = Math.max(burst, 0.6); } });
  window.addEventListener('ask:token', () => { if (!reduceMotion) { burst = Math.max(burst, 0.14); } });

  let heroProg = 0;
  function updateScroll() {
    heroProg = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
  }
  window.addEventListener('scroll', updateScroll, { passive: true });

  const bufSize = new THREE.Vector2();
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.getDrawingBufferSize(bufSize);
    veilMat.uniforms.uRes.value.copy(bufSize);
    // on phones the sphere sits behind the text, so its points are smaller and dimmer
    pointUniforms.uScale.value = (small ? 0.7 : 1) * bufSize.y / (2 * Math.tan(FOV * Math.PI / 360));
    pointUniforms.uAspect.value = w / h;
  }
  window.addEventListener('resize', resize);
  resize(); updateScroll();

  /* ---------- frame ---------- */
  const clock = new THREE.Clock();
  let elapsed = 0;

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!reduceMotion) { elapsed += dt; }
    const t = elapsed;

    if (!dragging) {
      velY += (0.0016 - velY) * 0.02;   // settle back to a gentle spin
      velX *= 0.94;
    }
    if (!reduceMotion) { rotY += velY; rotX += velX; }
    rotX = Math.max(-1.2, Math.min(1.2, rotX));
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    group.rotation.y = rotY + pointer.x * 0.25;
    group.rotation.x = rotX + pointer.y * 0.18;
    dust.rotation.y = -rotY * 1.7;
    dust.rotation.x = t * 0.03;
    ico.rotation.y -= reduceMotion ? 0 : 0.0024; ico.rotation.x += reduceMotion ? 0 : 0.0012;
    inner.rotation.y += reduceMotion ? 0 : 0.006; inner.rotation.z -= reduceMotion ? 0 : 0.003;

    burst *= 0.93;

    // scroll: shrink, lift and fade as the hero leaves
    group.scale.setScalar((small ? 0.8 : 1) * (1 - heroProg * 0.5));
    group.position.y = heroProg * 2.6;
    group.position.x = heroProg * 1.2;
    const vis = (small ? 0.5 : 1) * (1 - heroProg * 0.78);

    pointUniforms.uTime.value = t;
    pointUniforms.uBurst.value = burst;
    pointUniforms.uOpacity.value = vis;
    pointUniforms.uPointer.value.set(pointer.x, -pointer.y);
    pointUniforms.uPointerOn.value = (hoverable && pointer.seen && !reduceMotion) ? 1 : 0;
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.1);
    haloMat.opacity = (0.22 + 0.1 * pulse + burst * 0.25) * vis;
    icoMat.opacity = (0.12 + burst * 0.2) * vis;
    innerMat.opacity = (0.08 + 0.08 * pulse + burst * 0.3) * vis;
    inner.scale.setScalar(1 + 0.08 * pulse + burst * 0.5);

    veilMat.uniforms.uTime.value = t;
    veilMat.uniforms.uScroll.value = window.scrollY / Math.max(1, window.innerHeight) * 0.12;
    veilMat.uniforms.uHero.value = heroProg;

    renderer.clear();
    renderer.render(veilScene, veilCam);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  /* ---------- public: re-read the accent colours ---------- */
  window.setSceneAccent = function () {
    accent = cssColor('--accent', '#00d4ff');
    signal = cssColor('--signal', '#ffb454');
    pointUniforms.uColor.value.copy(accent);
    pointUniforms.uSignal.value.copy(signal);
    haloMat.color = accent; icoMat.color = accent; innerMat.color = signal;
    veilMat.uniforms.uColor.value.copy(accent);
  };
})();
