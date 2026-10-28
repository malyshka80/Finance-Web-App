import { useEffect, useRef } from "react";
import * as THREE from "three";

const colors = {
  ink: 0x102033,
  violet: 0xc9821c,
  mint: 0x23cba7,
  coral: 0xff7b5e,
  gold: 0xffd166,
  ice: 0xf8fbff,
  blue: 0x2e7bff,
};

function disposeScene(scene) {
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();

    if (object.material) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => material.dispose());
    }
  });
}

function createPanel(width, height, depth, color, opacity = 0.72) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity,
      roughness: 0.25,
      metalness: 0.08,
      clearcoat: 0.8,
      clearcoatRoughness: 0.18,
    }),
  );
}

function createGlowLine(points, color) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 72, 0.012, 8, false);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
  });

  return new THREE.Mesh(geometry, material);
}

export default function OpeningScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });
    const root = new THREE.Group();
    const dashboard = new THREE.Group();
    const orbit = new THREE.Group();
    const pointer = new THREE.Vector2(0, 0);
    const pointerTarget = new THREE.Vector2(0, 0);
    let animationFrame = 0;
    const startTime = performance.now();

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xf4f7df, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.domElement.className = "opening-scene-canvas";
    mount.appendChild(renderer.domElement);

    camera.position.set(0, 0.45, 8);
    root.rotation.set(-0.12, -0.32, 0.04);
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xffffff, 1.25));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const mintLight = new THREE.PointLight(colors.mint, 4.2, 10);
    mintLight.position.set(-3.2, 1.2, 2.6);
    scene.add(mintLight);

    const violetLight = new THREE.PointLight(colors.violet, 3.6, 9);
    violetLight.position.set(2.8, -0.4, 3.2);
    scene.add(violetLight);

    const platform = createPanel(5.4, 3.2, 0.12, colors.ice, 0.48);
    platform.position.set(0, 0, -0.16);
    dashboard.add(platform);

    const platformEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(platform.geometry),
      new THREE.LineBasicMaterial({
        color: colors.violet,
        transparent: true,
        opacity: 0.22,
      }),
    );
    platformEdges.position.copy(platform.position);
    dashboard.add(platformEdges);

    const header = createPanel(2.3, 0.2, 0.18, colors.ink, 0.82);
    header.position.set(-0.95, 1.13, 0.08);
    dashboard.add(header);

    const pill = createPanel(0.78, 0.2, 0.2, colors.mint, 0.86);
    pill.position.set(1.78, 1.13, 0.1);
    dashboard.add(pill);

    const bars = [0.54, 1.08, 0.76, 1.36, 0.92, 1.62, 1.16].map(
      (height, index) => {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, height, 0.34),
          new THREE.MeshStandardMaterial({
            color: index % 2 ? colors.mint : colors.violet,
            metalness: 0.18,
            roughness: 0.28,
            emissive: index % 2 ? colors.mint : colors.violet,
            emissiveIntensity: 0.1,
          }),
        );

        bar.position.set(-1.92 + index * 0.62, -0.78 + height / 2, 0.22);
        dashboard.add(bar);
        return bar;
      },
    );

    const progressTrack = createPanel(3.9, 0.12, 0.1, colors.ink, 0.18);
    progressTrack.position.set(-0.1, -1.22, 0.16);
    dashboard.add(progressTrack);

    const progressFill = createPanel(3.1, 0.14, 0.12, colors.mint, 0.82);
    progressFill.position.set(-0.5, -1.22, 0.24);
    dashboard.add(progressFill);

    const coinGeometry = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 42);
    const coinMaterial = new THREE.MeshStandardMaterial({
      color: colors.gold,
      metalness: 0.5,
      roughness: 0.18,
      emissive: colors.gold,
      emissiveIntensity: 0.1,
    });

    for (let index = 0; index < 7; index += 1) {
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      coin.position.set(2.1, -0.8 + index * 0.09, 0.36);
      coin.rotation.x = Math.PI / 2;
      dashboard.add(coin);
    }

    const flyingCoins = [];
    for (let index = 0; index < 12; index += 1) {
      const coin = new THREE.Mesh(coinGeometry, coinMaterial.clone());
      const angle = (index / 12) * Math.PI * 2;
      coin.position.set(Math.cos(angle) * 2.9, Math.sin(angle) * 1.55, 0.25 + Math.sin(angle) * 0.4);
      coin.rotation.x = Math.PI / 2;
      coin.scale.setScalar(0.62 + Math.random() * 0.32);
      orbit.add(coin);
      flyingCoins.push({ coin, angle, radius: 2.75 + Math.random() * 0.42, speed: 0.28 + Math.random() * 0.16 });
    }

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.035, 12, 96),
      new THREE.MeshBasicMaterial({
        color: colors.mint,
        transparent: true,
        opacity: 0.45,
      }),
    );
    ring.position.set(0.68, 0.12, -0.08);
    ring.rotation.x = Math.PI / 2.7;
    dashboard.add(ring);

    dashboard.position.set(0.12, 0.16, 0);
    dashboard.rotation.set(-0.05, -0.18, 0.02);
    root.add(dashboard);

    const orbitMaterial = new THREE.MeshStandardMaterial({
      color: colors.violet,
      metalness: 0.22,
      roughness: 0.22,
      emissive: colors.violet,
      emissiveIntensity: 0.12,
    });
    const orbitGeometry = new THREE.IcosahedronGeometry(0.16, 1);
    const orbitPositions = [
      [-2.7, 0.82, 0.58],
      [2.6, 0.66, -0.12],
      [-1.7, -1.18, 0.82],
      [2.2, -1.06, 0.7],
    ];

    orbitPositions.forEach(([x, y, z], index) => {
      const body = new THREE.Mesh(orbitGeometry, orbitMaterial.clone());
      body.material.color.setHex(
        [colors.violet, colors.mint, colors.coral, colors.blue][index],
      );
      body.position.set(x, y, z);
      orbit.add(body);
    });

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(3.25, 0.012, 8, 160),
      new THREE.MeshBasicMaterial({
        color: colors.blue,
        transparent: true,
        opacity: 0.2,
      }),
    );
    halo.rotation.x = Math.PI / 2.18;
    halo.rotation.z = -0.3;
    orbit.add(halo);
    root.add(orbit);

    root.add(
      createGlowLine(
        [
          new THREE.Vector3(-2.58, -0.6, 0.66),
          new THREE.Vector3(-1.1, 0.92, 0.92),
          new THREE.Vector3(0.6, 0.36, 0.74),
          new THREE.Vector3(2.42, 1.04, 0.52),
        ],
        colors.mint,
      ),
    );

    root.add(
      createGlowLine(
        [
          new THREE.Vector3(-2.2, 1.1, -0.1),
          new THREE.Vector3(-0.2, 1.54, 0.32),
          new THREE.Vector3(1.3, 0.94, 0.28),
          new THREE.Vector3(2.42, -0.38, 0.22),
        ],
        colors.violet,
      ),
    );

    const particleCount = 130;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.5 + Math.random() * 2.4;
      const angle = Math.random() * Math.PI * 2;
      const drift = (Math.random() - 0.5) * 2.8;

      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = drift;
      particlePositions[index * 3 + 2] = Math.sin(angle) * radius * 0.34;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: colors.violet,
        size: 0.035,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      }),
    );
    root.add(particles);

    const grid = new THREE.GridHelper(7.2, 18, colors.mint, colors.violet);
    grid.position.set(0, -1.68, -0.32);
    grid.rotation.z = -0.07;
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    root.add(grid);

    function resize() {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;

      renderer.setSize(width, height, true);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function handlePointerMove(event) {
      const rect = mount.getBoundingClientRect();
      pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerTarget.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    }

    function handlePointerLeave() {
      pointerTarget.set(0, 0);
    }

    function renderFrame() {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      pointer.lerp(pointerTarget, 0.055);
      root.rotation.y = -0.32 + pointer.x * 0.18 + Math.sin(elapsed * 0.42) * 0.035;
      root.rotation.x = -0.12 - pointer.y * 0.12 + Math.sin(elapsed * 0.34) * 0.025;
      dashboard.position.y = 0.16 + Math.sin(elapsed * 1.05) * 0.065;
      orbit.rotation.y = elapsed * 0.46;
      orbit.rotation.z = Math.sin(elapsed * 0.3) * 0.1;
      halo.rotation.z = -0.3 + elapsed * 0.12;
      ring.rotation.z = elapsed * 0.45;
      particles.rotation.y = elapsed * 0.035;
      progressFill.scale.x = 0.9 + Math.sin(elapsed * 1.4) * 0.025;

      flyingCoins.forEach(({ coin, angle, radius, speed }, index) => {
        const current = angle + elapsed * speed;
        coin.position.x = Math.cos(current) * radius;
        coin.position.y = Math.sin(current * 1.15) * 1.35;
        coin.position.z = 0.25 + Math.sin(current + index) * 0.62;
        coin.rotation.y += 0.04 + speed * 0.02;
      });

      bars.forEach((bar, index) => {
        bar.position.z = 0.22 + Math.sin(elapsed * 1.2 + index * 0.55) * 0.04;
        bar.scale.y = 0.94 + Math.sin(elapsed * 1.4 + index * 0.65) * 0.06;
      });

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(renderFrame);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();
    mount.addEventListener("pointermove", handlePointerMove);
    mount.addEventListener("pointerleave", handlePointerLeave);

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      renderFrame();
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", handlePointerMove);
      mount.removeEventListener("pointerleave", handlePointerLeave);
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="opening-scene-shell" aria-hidden="true" />;
}
