"use client";

import { useEffect, useRef } from "react";

type SceneProps = { paused?: boolean };

export default function UniverseCanvas({ paused = false }: SceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let cancelled = false;
    let teardown = () => {};

    void import("three").then((THREE) => {
      const host = hostRef.current;
      if (cancelled || !host) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let renderer: import("three").WebGLRenderer | null = null;
      let observer: ResizeObserver | null = null;
      let scrollTarget = 0;
      let elapsed = 0;
      const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
      let seed = 0x7a31c0de;
      const random = () => {
        seed = (1664525 * seed + 1013904223) >>> 0;
        return seed / 4294967296;
      };

      try {
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030609, 0.00125);
        const camera = new THREE.PerspectiveCamera(47, 1, 0.1, 360);
        camera.position.set(0, 0, 22);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: window.devicePixelRatio <= 1.35,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.35 : 1.8));
        renderer.setSize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight), false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.domElement.setAttribute("aria-hidden", "true");
        host.appendChild(renderer.domElement);
        host.dataset.engine = "ready";

        scene.add(new THREE.AmbientLight(0x9cbdb3, 0.7));
        const mintLight = new THREE.PointLight(0x8bffcd, 105, 56, 1.5);
        mintLight.position.set(4, 3, 7);
        scene.add(mintLight);
        const blueLight = new THREE.PointLight(0x647bff, 72, 58, 1.45);
        blueLight.position.set(-7, -3, -48);
        scene.add(blueLight);
        const pearlLight = new THREE.PointLight(0xf4fff8, 28, 40, 1.7);
        pearlLight.position.set(-2, 6, -94);
        scene.add(pearlLight);

        const makeRing = (
          parent: import("three").Object3D,
          radius: number,
          tube: number,
          color: number,
          opacity: number,
          rotation: [number, number, number],
          z = 0
        ) => {
          const geometry = new THREE.TorusGeometry(radius, tube, 8, 360);
          const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          });
          const ring = new THREE.Mesh(geometry, material);
          ring.rotation.set(rotation[0], rotation[1], rotation[2]);
          ring.position.z = z;
          parent.add(ring);
          return ring;
        };

        // FIELD 01 — a metallic intelligence core surrounded by a true volumetric particle spiral.
        const universe = new THREE.Group();
        universe.position.set(2.9, 0, 0);
        scene.add(universe);
        const coreGroup = new THREE.Group();
        universe.add(coreGroup);

        const core = new THREE.Mesh(
          new THREE.SphereGeometry(2.05, 88, 88),
          new THREE.MeshPhysicalMaterial({
            color: 0x13211f,
            metalness: 0.86,
            roughness: 0.17,
            clearcoat: 1,
            clearcoatRoughness: 0.12,
            emissive: 0x063c2b,
            emissiveIntensity: 0.94
          })
        );
        coreGroup.add(core);

        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(2.18, 48, 48),
          new THREE.MeshBasicMaterial({
            color: 0xa8ffdb,
            transparent: true,
            opacity: 0.055,
            side: THREE.BackSide,
            depthWrite: false
          })
        );
        coreGroup.add(halo);

        const coreWire = new THREE.Mesh(
          new THREE.IcosahedronGeometry(2.3, 3),
          new THREE.MeshBasicMaterial({
            color: 0x80dcb8,
            wireframe: true,
            transparent: true,
            opacity: 0.16,
            depthWrite: false
          })
        );
        coreGroup.add(coreWire);

        const ringA = makeRing(coreGroup, 3.0, 0.012, 0xa7ffe0, 0.82, [1.18, 0.12, 0.36]);
        const ringB = makeRing(coreGroup, 3.82, 0.009, 0x648aff, 0.62, [0.52, 1.22, -0.44]);
        const ringC = makeRing(coreGroup, 4.5, 0.006, 0x8affd7, 0.42, [1.56, 0.38, 0.74]);
        const ringD = makeRing(coreGroup, 2.55, 0.005, 0xffffff, 0.48, [0.18, 0.78, -0.28]);

        const compact = window.innerWidth < 720;
        const particleCount = compact ? 4800 : 12500;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const phases = new Float32Array(particleCount);
        const palette = [
          new THREE.Color("#caffec"),
          new THREE.Color("#69dbb0"),
          new THREE.Color("#8398ff"),
          new THREE.Color("#d3e5ff")
        ];

        for (let i = 0; i < particleCount; i += 1) {
          const arm = Math.floor(random() * 5);
          const radius = 2.45 + Math.pow(random(), 0.62) * 9.1;
          const angle = arm * (Math.PI * 2 / 5) + radius * 0.54 + (random() - 0.5) * (0.48 + radius * 0.035);
          const idx = i * 3;
          positions[idx] = Math.cos(angle) * radius;
          positions[idx + 2] = Math.sin(angle) * radius * 0.72;
          positions[idx + 1] = (random() - 0.5) * (0.24 + radius * 0.13) + Math.sin(angle * 2.3) * 0.12;
          const shade = random();
          const tint = shade > 0.91 ? palette[2] : shade > 0.71 ? palette[3] : shade > 0.28 ? palette[0] : palette[1];
          const mixed = tint.clone().lerp(palette[2], random() * 0.19);
          colors[idx] = mixed.r;
          colors[idx + 1] = mixed.g;
          colors[idx + 2] = mixed.b;
          sizes[i] = 0.42 + random() * 1.22;
          phases[i] = random() * Math.PI * 2;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
        particleGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
        const pixelRatio = renderer.getPixelRatio();
        const particleMaterial = new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } },
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
            "  vAlpha = clamp(1.12 - (-mvPosition.z / 150.0), 0.15, 1.0);",
            "}"
          ].join("\n"),
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
          ].join("\n"),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        universe.add(new THREE.Points(particleGeometry, particleMaterial));

        // A foreground point cloud gives the main scene depth at different focal distances.
        const nearCount = compact ? 320 : 780;
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
        const nearGeometry = new THREE.BufferGeometry();
        nearGeometry.setAttribute("position", new THREE.BufferAttribute(nearPositions, 3));
        nearGeometry.setAttribute("color", new THREE.BufferAttribute(nearColors, 3));
        universe.add(new THREE.Points(nearGeometry, new THREE.PointsMaterial({
          size: 0.085,
          vertexColors: true,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.82,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })));

        // FIELD 02 — a deep portal corridor. The camera flies through these rings as the page scrolls.
        const portal = new THREE.Group();
        portal.position.set(0, 0, -31);
        scene.add(portal);
        const portalRings: import("three").Mesh[] = [];
        for (let i = 0; i < 9; i += 1) {
          const ring = makeRing(
            portal,
            5.2 + Math.sin(i * 0.68) * 0.9 + i * 0.13,
            i % 3 === 0 ? 0.017 : 0.008,
            i % 3 === 0 ? 0x9bffe0 : 0x8096ff,
            0.16 + (i % 3) * 0.065,
            [Math.sin(i * 0.6) * 0.42, Math.cos(i * 0.4) * 0.4, Math.sin(i * 0.3) * 0.22],
            12 - i * 3.15
          );
          portalRings.push(ring);
        }
        const portalCenter = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.15, 2),
          new THREE.MeshBasicMaterial({ color: 0x98ffe0, wireframe: true, transparent: true, opacity: 0.37 })
        );
        portalCenter.position.set(0, 0, -2);
        portal.add(portalCenter);

        // FIELD 03 — an interconnected, three-dimensional neural constellation.
        const network = new THREE.Group();
        network.position.set(0, 0.2, -62);
        scene.add(network);
        const nodeCount = compact ? 34 : 72;
        const nodePositions: import("three").Vector3[] = [];
        for (let i = 0; i < nodeCount; i += 1) {
          const theta = random() * Math.PI * 2;
          const phi = Math.acos(2 * random() - 1);
          const radius = 5.3 + random() * 5.0;
          nodePositions.push(new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * radius,
            Math.cos(phi) * radius * 0.72,
            Math.sin(phi) * Math.sin(theta) * radius
          ));
        }
        const nodeGeometry = new THREE.SphereGeometry(0.065, 8, 8);
        const nodeMaterials = [
          new THREE.MeshBasicMaterial({ color: 0x9bffe0 }),
          new THREE.MeshBasicMaterial({ color: 0x92a3ff }),
          new THREE.MeshBasicMaterial({ color: 0xe4fff5 })
        ];
        nodePositions.forEach((position, index) => {
          const node = new THREE.Mesh(nodeGeometry, nodeMaterials[index % nodeMaterials.length]);
          node.position.copy(position);
          network.add(node);
        });
        const linkVertices: number[] = [];
        for (let i = 0; i < nodePositions.length; i += 1) {
          const nearest = nodePositions
            .map((p, index) => ({ index, distance: p.distanceToSquared(nodePositions[i]) }))
            .filter((entry) => entry.index !== i)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 2);
          nearest.forEach(({ index }) => {
            if (index > i) {
              const a = nodePositions[i];
              const b = nodePositions[index];
              linkVertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
            }
          });
        }
        const linkGeometry = new THREE.BufferGeometry();
        linkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linkVertices, 3));
        network.add(new THREE.LineSegments(linkGeometry, new THREE.LineBasicMaterial({
          color: 0x82e8c8,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })));
        const networkHalo = new THREE.Mesh(
          new THREE.IcosahedronGeometry(8.1, 2),
          new THREE.MeshBasicMaterial({ color: 0x6c88ff, wireframe: true, transparent: true, opacity: 0.06 })
        );
        network.add(networkHalo);

        // FIELD 04 — layered geometric structures, suspended like a machine seen in deep space.
        const architecture = new THREE.Group();
        architecture.position.set(0.2, -0.2, -92);
        scene.add(architecture);
        const structureA = new THREE.Mesh(
          new THREE.IcosahedronGeometry(4.1, 1),
          new THREE.MeshBasicMaterial({ color: 0x8cffe0, wireframe: true, transparent: true, opacity: 0.32 })
        );
        const structureB = new THREE.Mesh(
          new THREE.OctahedronGeometry(2.7, 2),
          new THREE.MeshPhysicalMaterial({
            color: 0x142d2b,
            metalness: 0.7,
            roughness: 0.22,
            transparent: true,
            opacity: 0.48,
            wireframe: false,
            emissive: 0x052c37,
            emissiveIntensity: 0.45
          })
        );
        architecture.add(structureA, structureB);
        const architectureRingA = makeRing(architecture, 6.1, 0.011, 0x8effd9, 0.48, [1.04, 0.44, 0.1]);
        const architectureRingB = makeRing(architecture, 7.2, 0.008, 0x778eff, 0.45, [0.45, 1.25, 0.72]);
        const architectureRingC = makeRing(architecture, 3.4, 0.006, 0xe2fff5, 0.38, [0.1, 0.12, 1.08]);
        for (let i = 0; i < 8; i += 1) {
          const shard = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.25 + random() * 0.24, 0),
            new THREE.MeshBasicMaterial({
              color: i % 2 ? 0x7f91ff : 0x9bffe0,
              transparent: true,
              opacity: 0.65
            })
          );
          const angle = i / 8 * Math.PI * 2;
          shard.position.set(Math.cos(angle) * (5.1 + random() * 2), Math.sin(angle * 2) * 2.5, Math.sin(angle) * 5.2);
          architecture.add(shard);
        }

        // FIELD 05 — a final luminous singularity, visible as the viewer reaches the contact section.
        const singularity = new THREE.Group();
        singularity.position.set(0, 0, -123);
        scene.add(singularity);
        const singularCore = new THREE.Mesh(
          new THREE.SphereGeometry(2.45, 64, 64),
          new THREE.MeshPhysicalMaterial({
            color: 0x101b30,
            metalness: 0.6,
            roughness: 0.16,
            clearcoat: 1,
            emissive: 0x1e3976,
            emissiveIntensity: 1.1
          })
        );
        singularity.add(singularCore);
        const singularWire = new THREE.Mesh(
          new THREE.IcosahedronGeometry(3.0, 3),
          new THREE.MeshBasicMaterial({ color: 0x8da0ff, wireframe: true, transparent: true, opacity: 0.24 })
        );
        singularity.add(singularWire);
        const singularRingA = makeRing(singularity, 4.2, 0.012, 0x91a2ff, 0.58, [1.25, 0.18, 0.35]);
        const singularRingB = makeRing(singularity, 5.5, 0.008, 0x9bffe0, 0.38, [0.45, 1.2, -0.3]);
        const singularRingC = makeRing(singularity, 3.2, 0.006, 0xffffff, 0.4, [0.2, 0.7, 0.85]);

        // Stars span the full flight path, so there is always real depth behind each section.
        const starCount = compact ? 1250 : 2850;
        const starPositions = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        const starColors = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i += 1) {
          const idx = i * 3;
          starPositions[idx] = (random() - 0.5) * 170;
          starPositions[idx + 1] = (random() - 0.5) * 116;
          starPositions[idx + 2] = 34 - random() * 190;
          starSizes[i] = 0.35 + random() * 1.2;
          const tint = random() > 0.8 ? new THREE.Color("#9aabff") : new THREE.Color("#d8f6ec");
          starColors[idx] = tint.r;
          starColors[idx + 1] = tint.g;
          starColors[idx + 2] = tint.b;
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute("aSize", new THREE.BufferAttribute(starSizes, 1));
        starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
        const starMaterial = new THREE.PointsMaterial({
          size: 0.075,
          vertexColors: true,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.72,
          depthWrite: false
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        const updateScroll = () => {
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          scrollTarget = Math.max(0, Math.min(1, window.scrollY / maxScroll));
        };
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
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.35 : 1.8));
          renderer.setSize(width, height, false);
          particleMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
          updateScroll();
        };

        window.addEventListener("scroll", updateScroll, { passive: true });
        window.addEventListener("resize", updateScroll, { passive: true });
        window.addEventListener("pointermove", updatePointer, { passive: true });
        observer = new ResizeObserver(resize);
        observer.observe(host);
        updateScroll();
        const clock = new THREE.Clock();

        const frame = () => {
          if (!renderer || document.hidden || pausedRef.current) return;
          const delta = Math.min(clock.getDelta(), 0.045);
          elapsed += delta;

          // Scroll is the camera rail: every chapter is another coordinate in the 3D world.
          const progress = scrollTarget;
          const easing = 1 - Math.exp(-delta * (reducedMotion ? 1.5 : 2.9));
          const desiredZ = 22 - progress * 151;
          const desiredX = Math.sin(progress * Math.PI * 2) * 1.6 + pointer.x * (compact ? 0.55 : 1.7);
          const desiredY = Math.sin(progress * Math.PI * 3) * 1.15 - pointer.y * (compact ? 0.28 : 0.8);
          camera.position.x += (desiredX - camera.position.x) * easing;
          camera.position.y += (desiredY - camera.position.y) * easing;
          camera.position.z += (desiredZ - camera.position.z) * easing;
          camera.lookAt(
            camera.position.x * 0.22 + pointer.x * 0.3,
            camera.position.y * 0.2 - pointer.y * 0.16,
            camera.position.z - 22
          );

          const motion = reducedMotion ? 0.18 : 1;
          universe.position.x += ((compact ? 0.15 : 2.9 * (1 - Math.min(progress * 1.7, 1))) - universe.position.x) * easing;
          universe.rotation.y = elapsed * 0.075 * motion + pointer.x * 0.12 + progress * 0.85;
          universe.rotation.x = -0.12 + pointer.y * 0.055;
          coreGroup.rotation.y = -elapsed * 0.09 * motion + pointer.x * 0.04;
          coreGroup.rotation.x = Math.sin(elapsed * 0.14) * 0.045 * motion + pointer.y * 0.035;
          ringA.rotation.z += delta * 0.19 * motion;
          ringB.rotation.y += delta * 0.11 * motion;
          ringC.rotation.x += delta * 0.08 * motion;
          ringD.rotation.z -= delta * 0.12 * motion;

          portal.rotation.z = Math.sin(elapsed * 0.09 * motion) * 0.06 + pointer.x * 0.035;
          portalRings.forEach((ring, index) => {
            ring.rotation.z += delta * (index % 2 ? -0.022 : 0.028) * motion;
          });
          portalCenter.rotation.x += delta * 0.18 * motion;
          portalCenter.rotation.y -= delta * 0.13 * motion;

          network.rotation.y = elapsed * 0.035 * motion + pointer.x * 0.035;
          network.rotation.x = pointer.y * 0.04;
          networkHalo.rotation.y = -elapsed * 0.025 * motion;
          networkHalo.rotation.x = elapsed * 0.018 * motion;

          architecture.rotation.y = elapsed * 0.08 * motion + pointer.x * 0.055;
          architecture.rotation.x = Math.sin(elapsed * 0.12) * 0.08 * motion + pointer.y * 0.035;
          structureA.rotation.y = -elapsed * 0.14 * motion;
          structureA.rotation.x = elapsed * 0.08 * motion;
          structureB.rotation.y = elapsed * 0.11 * motion;
          architectureRingA.rotation.z += delta * 0.09 * motion;
          architectureRingB.rotation.x -= delta * 0.065 * motion;
          architectureRingC.rotation.y += delta * 0.11 * motion;

          singularity.rotation.y = elapsed * 0.07 * motion + pointer.x * 0.045;
          singularCore.rotation.x = elapsed * 0.035 * motion;
          singularWire.rotation.y = -elapsed * 0.13 * motion;
          singularRingA.rotation.z += delta * 0.14 * motion;
          singularRingB.rotation.x += delta * 0.08 * motion;
          singularRingC.rotation.y -= delta * 0.12 * motion;
          stars.rotation.y = elapsed * 0.0015 * motion;
          particleMaterial.uniforms.uTime.value = reducedMotion ? elapsed * 0.08 : elapsed;
          mintLight.position.x = 4 + Math.sin(elapsed * 0.28) * 1.8;
          blueLight.position.y = -3 + Math.cos(elapsed * 0.2) * 1.6;

          renderer.render(scene, camera);
        };

        renderer.setAnimationLoop(frame);
        resize();

        teardown = () => {
          observer?.disconnect();
          window.removeEventListener("scroll", updateScroll);
          window.removeEventListener("resize", updateScroll);
          window.removeEventListener("pointermove", updatePointer);
          renderer?.setAnimationLoop(null);
          scene.traverse((object) => {
            const obj = object as import("three").Object3D & {
              geometry?: import("three").BufferGeometry;
              material?: import("three").Material | import("three").Material[];
            };
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach((material) => material.dispose());
            else obj.material?.dispose();
          });
          renderer?.dispose();
          renderer?.domElement.remove();
          host.dataset.engine = "fallback";
        };
      } catch {
        renderer?.dispose();
        renderer?.domElement.remove();
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
