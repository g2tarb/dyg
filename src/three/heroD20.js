import * as THREE from 'three';

let scene, camera, renderer, d20, animationId;
let mouseX = 0, mouseY = 0;
const disposables = [];
const cardMeshes = [];

const ARCHETYPES = [
  { key: 'architect', name: 'ARCHITECTE', color: '#3B82F6', image: '/src/assets/archetypes/architect.png' },
  { key: 'shipper', name: 'SHIPPER', color: '#22C55E', image: '/src/assets/archetypes/shipper.png' },
  { key: 'artisan', name: 'ARTISAN', color: '#F5C542', image: '/src/assets/archetypes/artisan.png' },
  { key: 'creative', name: 'CRÉATIF', color: '#A855F7', image: '/src/assets/archetypes/creative.png' },
  { key: 'explorer', name: 'EXPLORATEUR', color: '#06B6D4', image: '/src/assets/archetypes/explorer.png' },
  { key: 'commando', name: 'COMMANDO', color: '#EF4444', image: '/src/assets/archetypes/commando.png' },
  { key: 'mentor', name: 'MENTOR', color: '#F97316', image: '/src/assets/archetypes/mentor.png' }
];

function initHeroD20(container) {
  // Wait for container to have dimensions
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.z = 6;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
  container.appendChild(renderer.domElement);

  // ===== D20 (Icosahedron) =====
  const geometry = new THREE.IcosahedronGeometry(1.2, 0);
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xE8620A, transparent: true, opacity: 0.6 });
  const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  const faceMaterial = new THREE.MeshPhongMaterial({ color: 0x0B1120, transparent: true, opacity: 0.3, side: THREE.DoubleSide, flatShading: true });
  const mesh = new THREE.Mesh(geometry, faceMaterial);

  d20 = new THREE.Group();
  d20.add(mesh);
  d20.add(wireframe);
  d20.position.x = -1;
  scene.add(d20);
  disposables.push(geometry, edgesGeometry, edgesMaterial, faceMaterial);

  // ===== Archetype cards slideshow =====
  const cardWidth = 0.9;
  const cardHeight = 1.35;
  const loader = new THREE.TextureLoader();

  ARCHETYPES.forEach((arch) => {
    const texture = loader.load(arch.image);
    texture.colorSpace = THREE.SRGBColorSpace;
    disposables.push(texture);

    const cardGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const cardMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    disposables.push(cardGeo, cardMat);

    const cardMesh = new THREE.Mesh(cardGeo, cardMat);

    // Border wireframe
    const borderGeo = new THREE.EdgesGeometry(cardGeo);
    const borderMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(arch.color),
      transparent: true,
      opacity: 0
    });
    disposables.push(borderGeo, borderMat);
    const border = new THREE.LineSegments(borderGeo, borderMat);
    cardMesh.add(border);

    cardMesh.position.set(1.6, 0, 0.5);
    scene.add(cardMesh);
    cardMeshes.push({ mesh: cardMesh, mat: cardMat, borderMat, color: arch.color });
  });

  // Slideshow timing
  const SLIDE_DURATION = 3;
  const FADE_RATIO = 0.2;

  // ===== Lights =====
  const mainLight = new THREE.PointLight(0xE8620A, 2.5, 20);
  mainLight.position.set(3, 2, 4);
  scene.add(mainLight);

  const accentLight = new THREE.PointLight(0xF5C542, 1.5, 20);
  accentLight.position.set(-3, -1, 3);
  scene.add(accentLight);

  scene.add(new THREE.AmbientLight(0x334455, 1));

  // ===== Particles =====
  const particleCount = 50;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({ color: 0xF5C542, size: 0.03, transparent: true, opacity: 0.5 });
  disposables.push(particleGeometry, particleMaterial);
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // ===== Events =====
  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
  }
  window.addEventListener('mousemove', onMouseMove);

  function onResize() {
    const rw = container.clientWidth || window.innerWidth;
    const rh = container.clientHeight || window.innerHeight;
    camera.aspect = rw / rh;
    camera.updateProjectionMatrix();
    renderer.setSize(rw, rh);
  }
  window.addEventListener('resize', onResize);

  // ===== Animation loop =====
  let time = 0;

  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.016;

    // D20 rotation
    d20.rotation.y += 0.003 + mouseX * 0.008;
    d20.rotation.x += 0.001 + mouseY * 0.008;

    // Slideshow
    const totalCycle = SLIDE_DURATION * ARCHETYPES.length;
    const cycleTime = time % totalCycle;
    const activeIndex = Math.floor(cycleTime / SLIDE_DURATION);
    const slideProgress = (cycleTime % SLIDE_DURATION) / SLIDE_DURATION;

    cardMeshes.forEach((card, i) => {
      let opacity = 0;

      if (i === activeIndex) {
        if (slideProgress < FADE_RATIO) {
          opacity = slideProgress / FADE_RATIO;
        } else if (slideProgress > 1 - FADE_RATIO) {
          opacity = (1 - slideProgress) / FADE_RATIO;
        } else {
          opacity = 1;
        }
        opacity = Math.max(0, Math.min(1, opacity)) * 0.85;

        // Float + subtle rotation
        card.mesh.position.y = Math.sin(time * 1.2) * 0.08;
        card.mesh.rotation.y = Math.sin(time * 0.4) * 0.1;
        card.mesh.rotation.z = Math.sin(time * 0.3) * 0.02;
      }

      card.mat.opacity = opacity;
      card.borderMat.opacity = opacity * 0.6;
    });

    particles.rotation.y += 0.0005;

    renderer.render(scene, camera);
  }
  animate();

  // ===== Cleanup =====
  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    if (animationId) cancelAnimationFrame(animationId);
    disposables.forEach(d => { if (d && d.dispose) d.dispose(); });
    disposables.length = 0;
    cardMeshes.length = 0;
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.remove();
    }
  };
}

export { initHeroD20 };
