"use client";

import { useEffect, useRef } from "react";

export default function UniverseCanvas({ paused = false }: { paused?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    let cancelled = false;
    let teardown = () => {};
    void import("three").then((THREE) => {
      const host = hostRef.current;
      if (cancelled || !host) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let renderer: import("three").WebGLRenderer | null = null;
      const disposables: Array<{ dispose: () => void }> = [];
      const own = <T extends { dispose: () => void }>(resource: T): T => {
        disposables.push(resource);
        return resource;
      };

      try {
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030609, 0.0025);
        const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 320);
        camera.position.set(0, 0, 22);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: window.devicePixelRatio <= 1.5,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.5 : 2));
        renderer.setSize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight), false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;
        renderer.domElement.setAttribute("aria-hidden", "true");
        host.appendChild(renderer.domElement);
        host.dataset.engine = "ready";

        scene.add(new THREE.AmbientLight(0x9cbdb3, 0.62));
        const keyLight = new THREE.PointLight(0x8bffcd, 90, 38, 1.7);
        keyLight.position.set(5, 3, 7);
        scene.add(keyLight);
        const rimLight = new THREE.PointLight(0x647bff, 54, 42, 1.7);
        rimLight.position.set(-6, -3, -2);
        scene.add(rimLight);
        const pearlLight = new THREE.PointLight(0xf4fff8, 18, 22, 2);
        pearlLight.position.set(-2, 6, 8);
        scene.add(pearlLight);

        const universe = new THREE.Group();
        scene.add(universe);
        const coreGroup = new THREE.Group();
        universe.add(coreGroup);

        const coreGeometry = own(new THREE.SphereGeometry(2.02, 96, 96));
        const coreMaterial = own(new THREE.MeshPhysicalMaterial({
          color: 0x13211f,
          metalness: 0.83,
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.14,
          emissive: 0x063c2b,
          emissiveIntensity: 0.8
        }));
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        coreGroup.add(core);

        const shellGeometry = own(new THREE.SphereGeometry(2.16, 64, 64));
        const shellMaterial = own(new THREE.MeshBasicMaterial({
          color: 0xa8ffdb,
          transparent: true,
          opacity: 0.055,
          side: THREE.BackSide,
          depthWrite: false
        }));
        coreGroup.add(new THREE.Mesh(shellGeometry, shellMaterial));

        const wireGeometry = own(new THREE.IcosahedronGeometry(2.25, 3));
        const wireMaterial = own(new THREE.MeshBasicMaterial({
          color: 0x80dcb8,
          wireframe: true,
          transparent: true,
          opacity: 0.115,
          depthWrite: false
        }));
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        coreGroup.add(wire);

        const makeRing = (radius: number, tube: number, color: number, opacity: number, rotation: [number, number, number]) => {
          const geometry = own(new THREE.TorusGeometry(radius, tube, 8, 480));
          const material = own(new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          }));
          const ring = new THREE.Mesh(geometry, material);
          ring.rotation.set(rotation[0], rotation[1], rotation[2]);
          coreGroup.add(ring);
          return ring;
        };
        const ringA = makeRing(3.0, 0.012, 0xa7ffe0, 0.77, [1.18, 0.12, 0.36]);
        const ringB = makeRing(3.82, 0.008, 0x648aff, 0.52, [0.52, 1.22, -0.44]);
        const ringC = makeRing(4.5, 0.006, 0x8affd7, 0.35, [1.56, 0.38, 0.74]);
        const ringD = makeRing(2.55, 0.005, 0xffffff, 0.42, [0.18, 0.78, -0.28]);

        // The main spiral is a genuine GPU point-cloud: each point is a shader-driven particle.
        const isCompact = window.innerWidth < 720;
        const particleCount = isCompact ? 7200 : 16800;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const phases = new Float32Array(particleCount);
        let seed = 0x7a31c0de;
        const random = () => {
          seed = (1664525 * seed + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        const palette = [
          new THREE.Color("#caffec"),
          new THREE.Color("#69dbb0"),
          new THREE.Color("#8398ff"),
          new THREE.Color("#b7d3ff")
        ];
        for (let i = 0; i < particleCount; i += 1) {
          const arm = Math.floor(random() * 5);
          const radius = 2.45 + Math.pow(random(), 0.62) * 9.1;
          const angle = arm * (Math.PI * 2 / 5) + radius * 0.54 + (random() - 0.5) * (0.48 + radius * 0.035);
          const index = i * 3;
          positions[index] = Math.cos(angle) * radius;
          positions[index + 2] = Math.sin(angle) * radius * 0.72;
          positions[index + 1] = (random() - 0.5) * (0.24 + radius * 0.13) + Math.sin(angle * 2.3) * 0.12;
          const shade = random();
          const tint = shade > 0.91 ? palette[2] : shade > 0.71 ? palette[3] : shade > 0.28 ? palette[0] : palette[1];
          const mixed = tint.clone().lerp(palette[2], random() * 0.19);
          colors[index] = mixed.r;
          colors[index + 1] = mixed.g;
          colors[index + 2] = mixed.b;
          sizes[i] = 0.42 + random() * 1.22;
          phases[i] = random() * Math.PI * 2;
        }
        const particleGeometry = own(new THREE.BufferGeometry());
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
        particleGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
        const particleMaterial = own(new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
          vertexShader: [
            "uniform float uTime;",
            "uniform float uPixelRatio;",
            "attribute vec3 color;",
            "attribute float aSize;",
            "attribute float aPhase;",
            "varying vec3 vColor;",
            "varying float vAlpha;",
            "void main() {",
            "  vec3 p = position;",
            "  p.y += sin(uTime * 0.42 + aPhase) * 0.034;",
            "  p.x += cos(uTime * 0.22 + aPhase) * 0.022;",
            "  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);",
            "  gl_Position = projectionMatrix * mvPosition;",
            "  gl_PointSize = aSize * uPixelRatio * (72.0 / max(1.0, -mvPosition.z));",
            "  vColor = color;",
            "  vAlpha = clamp(1.12 - (-mvPosition.z / 100.0), 0.15, 1.0);",
            "}"
          ].join("\\n"),
          fragmentShader: [
            "precision highp float;",
            "varying vec3 vColor;",
            "varying float vAlpha;",
            "void main() {",
            "  float d = length(gl_PointCoord - vec2(0.5));",
            "  float halo = exp(-d * d * 32.0);",
            "  float nucleus = 1.0 - smoothstep(0.03, 0.39, d);",
            "  float alpha = (halo * 0.35 + nucleus * 0.66) * vAlpha;",
            "  if (alpha < 0.012) discard;",
            "  gl_FragColor = vec4(vColor, alpha);",
            "}"
          ].join("\\n"),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        }));
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        universe.add(particles);

        // A far star layer gives the scene parallax and a real sense of depth.
        const starCount = isCompact ? 1150 : 2700;
        const starPositions = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        for (let i = 0; i < starCount; i += 1) {
          starPositions[i * 3] = (random() - 0.5) * 150;
          starPositions[i * 3 + 1] = (random() - 0.5) * 94;
          starPositions[i * 3 + 2] = -28 - random() * 105;
          starSizes[i] = 0.35 + random() * 1.1;
        }
        const starGeometry = own(new THREE.BufferGeometry());
        starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute("aSize", new THREE.BufferAttribute(starSizes, 1));
        const starMaterial = own(new THREE.PointsMaterial({
          color: 0xd8f6ec,
          size: 0.074,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.7,
          depthWrite: false
        }));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Sparse near-field points make the particle system feel volumetric, not like a flat wallpaper.
        const nearCount = isCompact ? 380 : 920;
        const nearPositions = new Float32Array(nearCount * 3);
        const nearColors = new Float32Array(nearCount * 3);
        const nearPalette = [new THREE.Color("#e2fff2"), new THREE.Color("#8b9dff"), new THREE.Color("#60e8b8")];
        for (let i = 0; i < nearCount; i += 1) {
          const radius = 3.7 + random() * 8.2;
          const theta = random() * Math.PI * 2;
          nearPositions[i * 3] = Math.cos(theta) * radius;
          nearPositions[i * 3 + 1] = (random() - 0.5) * 10;
          nearPositions[i * 3 + 2] = Math.sin(theta) * radius * 0.76;
          const color = nearPalette[Math.floor(random() * nearPalette.length)];
          nearColors[i * 3] = color.r;
          nearColors[i * 3 + 1] = color.g;
          nearColors[i * 3 + 2] = color.b;
        }
        const nearGeometry = own(new THREE.BufferGeometry());
        nearGeometry.setAttribute("position", new THREE.BufferAttribute(nearPositions, 3));
        nearGeometry.setAttribute("color", new THREE.BufferAttribute(nearColors, 3));
        const nearMaterial = own(new THREE.PointsMaterial({
          size: 0.09,
          vertexColors: true,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.78,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        }));
        const nearParticles = new THREE.Points(nearGeometry, nearMaterial);
        universe.add(nearParticles);

        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
        const updatePointer = (event: PointerEvent) => {
          pointer.targetX = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
          pointer.targetY = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
        };
        const resize = () => {
          if (!renderer) return;
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.5 : 2));
          renderer.setSize(width, height, false);
          particleMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
        };
        window.addEventListener("pointermove", updatePointer, { passive: true });
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        const clock = new THREE.Clock();
        const frame = () => {
          if (!renderer) return;
          if (document.hidden || pausedRef.current) return;
          const t = clock.getElapsedTime();
          pointer.x += (pointer.targetX - pointer.x) * 0.035;
          pointer.y += (pointer.targetY - pointer.y) * 0.035;
          universe.position.x += ((window.innerWidth < 720 ? 0.1 : 3.05) - universe.position.x) * 0.012;
          universe.rotation.y = t * (reducedMotion ? 0.018 : 0.075) + pointer.x * 0.13;
          universe.rotation.x = -0.12 + pointer.y * 0.055;
          coreGroup.rotation.y = -t * (reducedMotion ? 0.022 : 0.09) + pointer.x * 0.04;
          coreGroup.rotation.x = Math.sin(t * 0.14) * (reducedMotion ? 0.01 : 0.045) + pointer.y * 0.035;
          ringA.rotation.z += reducedMotion ? 0.00012 : 0.00055;
          ringB.rotation.y += reducedMotion ? 0.00008 : 0.00032;
          ringC.rotation.x += reducedMotion ? 0.00006 : 0.00022;
          ringD.rotation.z -= reducedMotion ? 0.0001 : 0.00036;
          stars.rotation.y = t * 0.0018;
          particleMaterial.uniforms.uTime.value = reducedMotion ? 0 : t;
          if (renderer) renderer.render(scene, camera);
        };
        renderer.setAnimationLoop(frame);
        resize();

        teardown = () => {
          observer.disconnect();
          window.removeEventListener("pointermove", updatePointer);
          renderer?.setAnimationLoop(null);
          scene.traverse((object) => {
            const obj = object as import("three").Object3D & { geometry?: import("three").BufferGeometry; material?: import("three").Material | import("three").Material[] };
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach((material) => material.dispose());
            else obj.material?.dispose();
          });
          disposables.forEach((resource) => resource.dispose());
          renderer?.dispose();
          renderer?.domElement.remove();
          host.dataset.engine = "fallback";
        };
      } catch {
        host.dataset.engine = "fallback";
      }
    }).catch(() => {
      if (hostRef.current) hostRef.current.dataset.engine = "fallback";
    });

    return () => {
      cancelled = true;
      teardown();
    };
  }, []);

  return <div className="universe-canvas" ref={hostRef} aria-hidden="true" data-engine="loading" />;
}
