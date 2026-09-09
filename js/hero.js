// Hangul — homepage hero: 3D particle network (Three.js) + rotating headline.
// Only ever runs on the homepage; fails silently if Three.js didn't load.

(function () {
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- rotating headline phrase ----------
  var phraseEl = document.getElementById("hero-phrase");
  if (phraseEl && !reducedMotion) {
    var phrases = [
      "real, everyday operations.",
      "schools and students.",
      "clinics and patients.",
      "travellers and vendors.",
      "shoppers and sellers.",
      "homes and providers."
    ];
    var idx = 0;
    setInterval(function () {
      idx = (idx + 1) % phrases.length;
      phraseEl.classList.add("phrase-out");
      setTimeout(function () {
        phraseEl.textContent = phrases[idx];
        phraseEl.classList.remove("phrase-out");
        phraseEl.classList.add("phrase-in");
        setTimeout(function () {
          phraseEl.classList.remove("phrase-in");
        }, 420);
      }, 320);
    }, 3400);
  }

  // ---------- 3D particle network background ----------
  var canvas = document.getElementById("hero-3d");
  var heroSection = document.querySelector(".hero");
  if (!canvas || !heroSection || typeof THREE === "undefined") return;

  var isSmall = window.matchMedia("(max-width: 700px)").matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return; // WebGL unavailable — the CSS gradient/blob background still covers the hero.
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  camera.position.z = isSmall ? 30 : 24;

  function sizeToHero() {
    var rect = heroSection.getBoundingClientRect();
    var w = Math.max(rect.width, 1);
    var h = Math.max(rect.height, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // Points scattered inside a sphere shell — a loose "network of nodes."
  // Normal (non-additive) blending on purpose: our hero is light, not dark like a
  // typical "cinematic" hero — additive blending washes out against a light backdrop.
  var COUNT = isSmall ? 90 : 220;
  var RADIUS = 13;
  var pts = [];
  var positions = new Float32Array(COUNT * 3);
  var colors = new Float32Array(COUNT * 3);
  var colorA = new THREE.Color(0x4f46e5); // brand indigo
  var colorB = new THREE.Color(0x0891b2); // brand teal
  for (var i = 0; i < COUNT; i++) {
    var v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
      .normalize()
      .multiplyScalar(RADIUS * (0.35 + Math.random() * 0.65));
    pts.push(v);
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
    var mixed = colorA.clone().lerp(colorB, Math.random());
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }

  var pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pointsGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  var pointsMat = new THREE.PointsMaterial({
    size: 0.3,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    vertexColors: true
  });
  var pointCloud = new THREE.Points(pointsGeo, pointsMat);

  // Connect nearby nodes — the "circuit board" look.
  var THRESH = 5.2;
  var linePositions = [];
  for (var a = 0; a < pts.length; a++) {
    for (var b = a + 1; b < pts.length; b++) {
      if (pts[a].distanceTo(pts[b]) < THRESH) {
        linePositions.push(pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z);
      }
    }
  }
  var lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  var lineMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.22 });
  var lines = new THREE.LineSegments(lineGeo, lineMat);

  var group = new THREE.Group();
  group.add(lines);
  group.add(pointCloud);
  group.rotation.x = 0.3;
  scene.add(group);

  sizeToHero();
  window.addEventListener("resize", sizeToHero);

  var mouseX = 0,
    mouseY = 0;
  window.addEventListener("mousemove", function (e) {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  });

  var inView = true;
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        inView = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(heroSection);
  }

  if (reducedMotion) {
    renderer.render(scene, camera);
    return; // single static frame — no animation loop for reduced-motion users.
  }

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!inView) return;
    group.rotation.y += 0.0016;
    group.rotation.x += (0.3 + mouseY * 0.35 - group.rotation.x) * 0.02;
    group.rotation.y += mouseX * 0.002;
    var t = clock.getElapsedTime();
    pointsMat.size = 0.3 + Math.sin(t * 0.9) * 0.05; // gentle breathing pulse
    renderer.render(scene, camera);
  }
  animate();
})();
