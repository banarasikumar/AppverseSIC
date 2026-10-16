"use client";

import { useEffect, useRef } from "react";
import type * as ThreeTypes from "three";

type SceneProps = { paused?: boolean };

const skyVertex = [
  "varying vec3 vDirection;",
  "void main() {",
  "  vDirection = position;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
  "}"
].join("\n");

const skyFragment = [
  "precision highp float;",
  "uniform float uTime;",
  "uniform vec3 uLensDirection;",
  "uniform float uLensStrength;",
  "varying vec3 vDirection;",
  "float hash31(vec3 p) {",
  "  p = fract(p * 0.1031);",
  "  p += dot(p, p.yxz + 33.33);",
  "  return fract((p.x + p.y) * p.z);",
  "}",
  "float noise3(vec3 p) {",
  "  vec3 i = floor(p);",
  "  vec3 f = fract(p);",
  "  f = f * f * (3.0 - 2.0 * f);",
  "  float a = hash31(i + vec3(0.0,0.0,0.0));",
  "  float b = hash31(i + vec3(1.0,0.0,0.0));",
  "  float c = hash31(i + vec3(0.0,1.0,0.0));",
  "  float d = hash31(i + vec3(1.0,1.0,0.0));",
  "  float e = hash31(i + vec3(0.0,0.0,1.0));",
  "  float f1 = hash31(i + vec3(1.0,0.0,1.0));",
  "  float g = hash31(i + vec3(0.0,1.0,1.0));",
  "  float h = hash31(i + vec3(1.0,1.0,1.0));",
  "  return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,f1,f.x),mix(g,h,f.x),f.y),f.z);",
  "}",
  "float fbm(vec3 p) {",
  "  float sum = 0.0;",
  "  float amplitude = 0.5;",
  "  for (int i = 0; i < 4; i++) {",
  "    sum += amplitude * noise3(p);",
  "    p = p * 2.03 + vec3(17.1, 9.2, 13.4);",
  "    amplitude *= 0.5;",
  "  }",
  "  return sum;",
  "}",
  "float stars(vec3 d, float scale, float threshold) {",
  "  vec3 q = d * scale;",
  "  vec3 cell = floor(q);",
  "  vec3 local = fract(q) - 0.5;",
  "  float seed = hash31(cell);",
  "  vec3 point = vec3(hash31(cell + 8.3), hash31(cell + 21.7), hash31(cell + 46.1)) - 0.5;",
  "  float radius = length(local - point * 0.82);",
  "  float core = 1.0 - smoothstep(0.012, 0.052, radius);",
  "  float gate = smoothstep(threshold, threshold + 0.035, seed);",
  "  return core * gate * (0.4 + 2.2 * hash31(cell + 91.4));",
  "}",
  "void main() {",
  "  vec3 d = normalize(vDirection);",
  "  vec3 lens = normalize(uLensDirection);",
  "  float separation = acos(clamp(dot(d, lens), -1.0, 1.0));",
  "  vec3 tangent = d - lens * dot(d, lens);",
  "  float tangentLength = length(tangent);",
  "  if (tangentLength > 0.0001) {",
  "    float bend = uLensStrength * exp(-separation * 3.25) / max(separation, 0.065);",
  "    d = normalize(d + tangent / tangentLength * bend);",
  "  }",
  "  float latitude = d.y - 0.12 * sin(d.x * 4.2) + 0.045 * sin(d.z * 8.0);",
  "  float galacticBand = exp(-pow(latitude / 0.24, 2.0));",
  "  vec3 cloudPosition = d * 25.0 + vec3(uTime * 0.004, 0.0, -uTime * 0.002);",
  "  float cloudA = fbm(cloudPosition);",
  "  float cloudB = fbm(cloudPosition * 1.72 + vec3(5.1, 18.4, 2.7));",
  "  float dust = smoothstep(0.42, 0.79, cloudA * 0.66 + cloudB * 0.48) * galacticBand;",
  "  float violetMist = smoothstep(0.48, 0.81, fbm(d * 14.0 + vec3(8.0, 1.0, 11.0))) * galacticBand;",
  "  vec3 color = vec3(0.0018, 0.0030, 0.0080);",
  "  color += vec3(0.015, 0.035, 0.092) * dust;",
  "  color += vec3(0.075, 0.024, 0.14) * violetMist * 0.65;",
  "  color += vec3(0.012, 0.105, 0.12) * smoothstep(0.60, 0.86, cloudB) * galacticBand * 0.46;",
  "  float starA = stars(d, 420.0, 0.988);",
  "  float starB = stars(d, 880.0, 0.994);",
  "  float starC = stars(d, 150.0, 0.996);",
  "  color += vec3(0.68, 0.82, 1.0) * starA * 0.72;",
  "  color += vec3(0.93, 0.97, 1.0) * starB * 0.56;",
  "  color += vec3(0.38, 0.83, 0.9) * starC * 0.32;",
  "  gl_FragColor = vec4(color, 1.0);",
  "}"
].join("\n");

const diskVertex = [
  "varying vec3 vLocalPosition;",
  "varying vec2 vUvDisk;",
  "void main() {",
  "  vLocalPosition = position;",
  "  vUvDisk = uv;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
  "}"
].join("\n");

const diskFragment = [
  "precision highp float;",
  "uniform float uTime;",
  "uniform float uIntensity;",
  "uniform float uBlueShift;",
  "varying vec3 vLocalPosition;",
  "varying vec2 vUvDisk;",
  "float hash21(vec2 p) {",
  "  p = fract(p * vec2(123.34, 345.45));",
  "  p += dot(p, p + 34.345);",
  "  return fract(p.x * p.y);",
  "}",
  "float noise2(vec2 p) {",
  "  vec2 i = floor(p);",
  "  vec2 f = fract(p);",
  "  f = f * f * (3.0 - 2.0 * f);",
  "  return mix(mix(hash21(i), hash21(i + vec2(1.0,0.0)), f.x),",
  "             mix(hash21(i + vec2(0.0,1.0)), hash21(i + vec2(1.0,1.0)), f.x), f.y);",
  "}",
  "float turbulence(vec2 p) {",
  "  float v = 0.0;",
  "  float a = 0.5;",
  "  for (int i = 0; i < 4; i++) {",
  "    v += a * noise2(p);",
  "    p = p * 2.08 + vec2(12.7, 5.3);",
  "    a *= 0.5;",
  "  }",
  "  return v;",
  "}",
  "void main() {",
  "  float r = length(vLocalPosition.xy);",
  "  float angle = atan(vLocalPosition.y, vLocalPosition.x);",
  "  float innerEdge = smoothstep(1.86, 2.13, r);",
  "  float outerEdge = 1.0 - smoothstep(7.1, 7.86, r);",
  "  float n1 = turbulence(vec2(angle * 4.0 + uTime * 0.07, r * 2.7 - uTime * 0.19));",
  "  float n2 = turbulence(vec2(angle * 8.0 - uTime * 0.045, r * 5.3 - uTime * 0.28));",
  "  float filament = pow(max(0.0, sin(angle * 27.0 + r * 8.2 + n1 * 5.5 + uTime * 0.08)), 3.4);",
  "  float turbulenceGlow = 0.22 + 0.66 * n1 + 0.42 * n2 + 0.26 * filament;",
  "  float radialHeat = 1.0 - smoothstep(2.05, 7.2, r);",
  "  vec3 innerHot = vec3(1.8, 1.46, 1.04);",
  "  vec3 amber = vec3(1.35, 0.31, 0.075);",
  "  vec3 outerBlue = vec3(0.16, 0.36, 1.32);",
  "  vec3 tint = mix(outerBlue, amber, 1.0 - smoothstep(3.6, 7.1, r));",
  "  tint = mix(tint, innerHot, 1.0 - smoothstep(2.0, 3.25, r));",
  "  tint = mix(tint, vec3(0.54, 0.82, 1.5), uBlueShift * 0.82);",
  "  float doppler = 0.56 + 0.95 * pow(0.5 + 0.5 * cos(angle - 0.45), 2.0);",
  "  float radialRim = exp(-pow((r - 2.32) / 0.34, 2.0));",
  "  float emission = turbulenceGlow * doppler + radialRim * 2.4;",
  "  float alpha = innerEdge * outerEdge * (0.12 + 0.31 * n1 + 0.19 * filament + radialRim * 0.5) * uIntensity;",
  "  vec3 radiance = tint * emission * (0.42 + radialHeat * 0.8) * uIntensity;",
  "  gl_FragColor = vec4(radiance, alpha);",
  "}"
].join("\n");

export default function UniverseCanvas({ paused = false }: SceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    let cancelled = false;
    let teardown = () => {};

    void import("three").then((THREE) => {
      const host = hostRef.current;
      if (cancelled || !host) return;

      let renderer: ThreeTypes.WebGLRenderer | null = null;
      let scene: ThreeTypes.Scene | null = null;
      let observer: ResizeObserver | null = null;
      let skyDome: THREE.Mesh | null = null;
      let skyMaterial: THREE.ShaderMaterial | null = null;
      let scrollProgress = 0;
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const isCompact = window.innerWidth < 720;
      const weakDevice = isCompact && ((navigator.hardwareConcurrency || 4) <= 4 || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4) <= 4);
      const pixelRatioCap = weakDevice ? 0.92 : isCompact ? 1.12 : 1.42;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      try {
        scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 520);
        camera.position.set(0, 0, 22);

        renderer = new THREE.WebGLRenderer({
          alpha: false,
          antialias: !weakDevice && window.devicePixelRatio <= 1.25,
          powerPreference: "high-performance",
          depth: true,
          stencil: false
        });
        renderer.setClearColor(0x020307, 1);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
        renderer.setSize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight), false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.setAttribute("role", "presentation");
        host.appendChild(renderer.domElement);
        host.dataset.engine = "ready";

        const ambient = new THREE.AmbientLight(0x8e9abf, 0.38);
        scene.add(ambient);
        const keyLight = new THREE.PointLight(0xffc99d, 155, 64, 1.6);
        keyLight.position.set(3, 4, 7);
        scene.add(keyLight);
        const blueLight = new THREE.PointLight(0x536eff, 105, 90, 1.7);
        blueLight.position.set(-7, -2, -54);
        scene.add(blueLight);
        const tealLight = new THREE.PointLight(0x62ffd3, 78, 62, 1.7);
        tealLight.position.set(0, 3, -82);
        scene.add(tealLight);

        // A real, shader-rendered sky sphere: layered interstellar dust, star fields and a lensing distortion.
        const skyGeometry = new THREE.SphereGeometry(300, 48, 36);
        skyMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uLensDirection: { value: new THREE.Vector3(0.1, 0, -1) },
            uLensStrength: { value: 0.062 }
          },
          vertexShader: skyVertex,
          fragmentShader: skyFragment,
          side: THREE.BackSide,
          depthWrite: false,
          depthTest: false,
          toneMapped: false
        });
        skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
        skyDome.frustumCulled = false;
        scene.add(skyDome);

        const focusTargets: THREE.Object3D[] = [];

        const createBlackHole = (position: THREE.Vector3, blueShift: number, scale: number) => {
          const system = new THREE.Group();
          system.position.copy(position);
          system.scale.setScalar(scale);
          scene!.add(system);
          focusTargets.push(system);

          const haloGeometry = new THREE.SphereGeometry(2.2, 48, 40);
          const halo = new THREE.Mesh(haloGeometry, new THREE.MeshBasicMaterial({
            color: blueShift > 0.5 ? 0x425dff : 0xff9a60,
            transparent: true,
            opacity: 0.085,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false
          }));
          system.add(halo);

          const diskGeometry = new THREE.RingGeometry(1.88, 7.82, 320, 1);
          const diskMaterial = new THREE.ShaderMaterial({
            uniforms: {
              uTime: { value: 0 },
              uIntensity: { value: blueShift > 0.5 ? 0.8 : 1.0 },
              uBlueShift: { value: blueShift }
            },
            vertexShader: diskVertex,
            fragmentShader: diskFragment,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            toneMapped: false
          });
          const disk = new THREE.Mesh(diskGeometry, diskMaterial);
          disk.rotation.set(1.12, 0.03, -0.11);
          system.add(disk);

          const innerDisk = new THREE.Mesh(
            new THREE.RingGeometry(1.87, 3.35, 224, 1),
            new THREE.ShaderMaterial({
              uniforms: {
                uTime: { value: 0.8 },
                uIntensity: { value: 0.62 },
                uBlueShift: { value: blueShift }
              },
              vertexShader: diskVertex,
              fragmentShader: diskFragment,
              transparent: true,
              depthWrite: false,
              side: THREE.DoubleSide,
              blending: THREE.AdditiveBlending,
              toneMapped: false
            })
          );
          innerDisk.rotation.set(1.08, -0.02, 0.1);
          innerDisk.scale.set(1.0, 0.92, 1.0);
          system.add(innerDisk);

          // The event horizon itself is deliberately black; light bends around it rather than filling its centre.
          const horizon = new THREE.Mesh(
            new THREE.SphereGeometry(1.82, 96, 80),
            new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false })
          );
          system.add(horizon);

          const photonRing = new THREE.Mesh(
            new THREE.TorusGeometry(1.91, 0.026, 10, 280),
            new THREE.MeshBasicMaterial({
              color: blueShift > 0.5 ? 0xb5c6ff : 0xffe4c6,
              transparent: true,
              opacity: 0.91,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              toneMapped: false
            })
          );
          photonRing.rotation.copy(disk.rotation);
          system.add(photonRing);

          const photonGlow = new THREE.Mesh(
            new THREE.TorusGeometry(2.03, 0.072, 8, 240),
            new THREE.MeshBasicMaterial({
              color: blueShift > 0.5 ? 0x5269ff : 0xff8f55,
              transparent: true,
              opacity: 0.24,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              toneMapped: false
            })
          );
          photonGlow.rotation.copy(disk.rotation);
          system.add(photonGlow);

          const dustCount = weakDevice ? 280 : isCompact ? 500 : 1150;
          const dustPositions = new Float32Array(dustCount * 3);
          const dustColors = new Float32Array(dustCount * 3);
          for (let i = 0; i < dustCount; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2.4 + Math.random() * 6.6;
            dustPositions[i * 3] = Math.cos(angle) * radius;
            dustPositions[i * 3 + 1] = (Math.random() - 0.5) * (0.12 + radius * 0.075);
            dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
            const outer = radius / 9.0;
            dustColors[i * 3] = blueShift > 0.5 ? 0.18 + outer * 0.22 : 1.0;
            dustColors[i * 3 + 1] = blueShift > 0.5 ? 0.34 + outer * 0.18 : 0.43 + outer * 0.25;
            dustColors[i * 3 + 2] = blueShift > 0.5 ? 1.0 : 0.18 + outer * 0.55;
          }
          const dustGeometry = new THREE.BufferGeometry();
          dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
          dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
          const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
            size: weakDevice ? 0.055 : 0.075,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.48,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false
          }));
          dust.rotation.copy(disk.rotation);
          system.add(dust);

          return { system, diskMaterial, innerDiskMaterial: innerDisk.material as THREE.ShaderMaterial, photonRing, photonGlow, dust, horizon };
        };

        // FIELD 01 — a black hole with a hot, turbulent accretion disk, photon ring and lens-warped stars.
        const primary = createBlackHole(new THREE.Vector3(2.7, 0.15, 0), 0.0, 1.0);

        // FIELD 02 — the throat of a wormhole: overlapping translucent rings in actual 3D space.
        const portal = new THREE.Group();
        portal.position.set(0, 0, -29);
        scene.add(portal);
        focusTargets.push(portal);
        const portalRings: THREE.Mesh[] = [];
        for (let i = 0; i < (weakDevice ? 8 : 13); i += 1) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(4.5 + Math.sin(i * 0.72) * 0.72, i % 4 === 0 ? 0.025 : 0.009, 8, 240),
            new THREE.MeshBasicMaterial({
              color: i % 4 === 0 ? 0x9df5e0 : 0x637cff,
              transparent: true,
              opacity: i % 4 === 0 ? 0.34 : 0.14,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              toneMapped: false
            })
          );
          ring.position.z = 10 - i * 1.7;
          ring.rotation.set(Math.sin(i * 0.46) * 0.33, Math.cos(i * 0.37) * 0.36, i * 0.19);
          portal.add(ring);
          portalRings.push(ring);
        }
        const portalHeart = new THREE.Mesh(
          new THREE.SphereGeometry(1.05, 40, 32),
          new THREE.MeshBasicMaterial({ color: 0x16204b, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        portalHeart.position.z = -9;
        portal.add(portalHeart);

        // FIELD 03 — a 3D neural constellation, built from luminous nodes and quiet, fine connections.
        const network = new THREE.Group();
        network.position.set(0, 0.1, -55);
        scene.add(network);
        focusTargets.push(network);
        const nodeCount = weakDevice ? 25 : isCompact ? 38 : 72;
        const nodePositions: THREE.Vector3[] = [];
        const nodeGeometry = new THREE.SphereGeometry(0.055, 8, 8);
        const nodeMaterials = [
          new THREE.MeshBasicMaterial({ color: 0x9dffe2, toneMapped: false }),
          new THREE.MeshBasicMaterial({ color: 0x94a8ff, toneMapped: false }),
          new THREE.MeshBasicMaterial({ color: 0xe8f5ff, toneMapped: false })
        ];
        for (let i = 0; i < nodeCount; i += 1) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = 4.5 + Math.random() * 5.2;
          const position = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * radius,
            Math.cos(phi) * radius * 0.76,
            Math.sin(phi) * Math.sin(theta) * radius
          );
          nodePositions.push(position);
          const node = new THREE.Mesh(nodeGeometry, nodeMaterials[i % nodeMaterials.length]);
          node.position.copy(position);
          network.add(node);
        }
        const links: number[] = [];
        for (let i = 0; i < nodePositions.length; i += 1) {
          const nearest = nodePositions
            .map((position, index) => ({ index, distance: position.distanceToSquared(nodePositions[i]) }))
            .filter((entry) => entry.index > i)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 2);
          nearest.forEach(({ index }) => {
            const start = nodePositions[i];
            const end = nodePositions[index];
            links.push(start.x, start.y, start.z, end.x, end.y, end.z);
          });
        }
        const linkGeometry = new THREE.BufferGeometry();
        linkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(links, 3));
        const networkLinks = new THREE.LineSegments(linkGeometry, new THREE.LineBasicMaterial({
          color: 0x7dcfda,
          transparent: true,
          opacity: 0.19,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false
        }));
        network.add(networkLinks);
        const networkCore = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 48, 40),
          new THREE.MeshPhysicalMaterial({
            color: 0x101d2b,
            metalness: 0.55,
            roughness: 0.25,
            clearcoat: 1,
            emissive: 0x182f67,
            emissiveIntensity: 0.8
          })
        );
        network.add(networkCore);

        // FIELD 04 — an iridescent, faceted object that reads as matter, not a wireframe diagram.
        const architecture = new THREE.Group();
        architecture.position.set(0.4, -0.1, -82);
        scene.add(architecture);
        focusTargets.push(architecture);
        const crystal = new THREE.Mesh(
          new THREE.IcosahedronGeometry(4.3, 2),
          new THREE.MeshPhysicalMaterial({
            color: 0x2e465a,
            metalness: 0.72,
            roughness: 0.22,
            clearcoat: 1,
            clearcoatRoughness: 0.16,
            iridescence: 0.68,
            iridescenceIOR: 1.28,
            emissive: 0x092636,
            emissiveIntensity: 0.58
          })
        );
        architecture.add(crystal);
        const crystalInner = new THREE.Mesh(
          new THREE.OctahedronGeometry(2.05, 2),
          new THREE.MeshPhysicalMaterial({
            color: 0x172b49,
            metalness: 0.78,
            roughness: 0.16,
            clearcoat: 1,
            iridescence: 0.75,
            emissive: 0x132b64,
            emissiveIntensity: 0.9
          })
        );
        architecture.add(crystalInner);
        const architectureRings: THREE.Mesh[] = [];
        for (const [radius, tube, color, rot] of [
          [5.65, 0.012, 0x9bffe0, [1.02, 0.46, 0.12]],
          [6.4, 0.009, 0x758cff, [0.45, 1.15, 0.72]],
          [3.2, 0.007, 0xd7eeff, [0.1, 0.12, 1.08]]
        ] as const) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius, tube, 8, 280),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
          );
          ring.rotation.set(rot[0], rot[1], rot[2]);
          architecture.add(ring);
          architectureRings.push(ring);
        }

        // FIELD 05 — a cooler, blue singularity to carry the journey into the final chapter.
        const secondary = createBlackHole(new THREE.Vector3(-0.6, 0.05, -109), 1.0, 0.82);

        // Small, sharp foreground stars create genuine parallax as the camera travels through the world.
        const foregroundCount = weakDevice ? 500 : isCompact ? 850 : 1700;
        const foregroundPositions = new Float32Array(foregroundCount * 3);
        const foregroundColors = new Float32Array(foregroundCount * 3);
        const foregroundSizes = new Float32Array(foregroundCount);
        for (let i = 0; i < foregroundCount; i += 1) {
          const idx = i * 3;
          foregroundPositions[idx] = (Math.random() - 0.5) * 90;
          foregroundPositions[idx + 1] = (Math.random() - 0.5) * 60;
          foregroundPositions[idx + 2] = 35 - Math.random() * 177;
          const blue = Math.random() > 0.82;
          foregroundColors[idx] = blue ? 0.43 : 0.77 + Math.random() * 0.23;
          foregroundColors[idx + 1] = blue ? 0.58 : 0.82 + Math.random() * 0.18;
          foregroundColors[idx + 2] = blue ? 1.0 : 0.95 + Math.random() * 0.05;
          foregroundSizes[i] = 0.32 + Math.random() * 0.85;
        }
        const foregroundGeometry = new THREE.BufferGeometry();
        foregroundGeometry.setAttribute("position", new THREE.BufferAttribute(foregroundPositions, 3));
        foregroundGeometry.setAttribute("color", new THREE.BufferAttribute(foregroundColors, 3));
        foregroundGeometry.setAttribute("aSize", new THREE.BufferAttribute(foregroundSizes, 1));
        const foregroundMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.055,
          sizeAttenuation: true,
          vertexColors: true,
          transparent: true,
          opacity: 0.82,
          depthWrite: false,
          toneMapped: false
        });
        const foreground = new THREE.Points(foregroundGeometry, foregroundMaterial);
        scene.add(foreground);

        const scroll = () => {
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          scrollProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
        };
        const pointerMove = (event: PointerEvent) => {
          pointer.tx = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
          pointer.ty = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
        };
        const resize = () => {
          if (!renderer) return;
          const width = Math.max(1, host.clientWidth);
          const height = Math.max(1, host.clientHeight);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
          renderer.setSize(width, height, false);
          scroll();
        };
        window.addEventListener("scroll", scroll, { passive: true });
        window.addEventListener("resize", scroll, { passive: true });
        window.addEventListener("pointermove", pointerMove, { passive: true });
        observer = new ResizeObserver(resize);
        observer.observe(host);
        scroll();

        const clock = new THREE.Clock();
        let elapsed = 0;
        const tempDirection = new THREE.Vector3();
        const tempTarget = new THREE.Vector3();
        const frame = () => {
          if (!renderer || !scene || document.hidden || pausedRef.current) return;
          const delta = Math.min(clock.getDelta(), 0.035);
          elapsed += delta;
          const progress = scrollProgress;
          const ease = 1 - Math.exp(-delta * (reducedMotion ? 1.9 : 3.25));
          const motion = reducedMotion ? 0.16 : 1;

          pointer.x += (pointer.tx - pointer.x) * Math.min(1, delta * 4.6);
          pointer.y += (pointer.ty - pointer.y) * Math.min(1, delta * 4.6);

          // The page's scroll position moves the physical camera through consecutive 3D environments.
          const desiredZ = 22 - progress * 128;
          const desiredX = Math.sin(progress * Math.PI * 2.0) * 1.0 + pointer.x * (isCompact ? 0.28 : 1.05);
          const desiredY = Math.sin(progress * Math.PI * 2.7) * 0.7 - pointer.y * (isCompact ? 0.2 : 0.62);
          camera.position.x += (desiredX - camera.position.x) * ease;
          camera.position.y += (desiredY - camera.position.y) * ease;
          camera.position.z += (desiredZ - camera.position.z) * ease;
          camera.lookAt(
            Math.sin(progress * Math.PI * 2.0) * 0.45 + pointer.x * 0.16,
            Math.sin(progress * Math.PI * 2.7) * 0.24 - pointer.y * 0.1,
            camera.position.z - 22
          );

          if (skyDome && skyMaterial) {
            skyDome.position.copy(camera.position);
            const focusIndex = Math.min(focusTargets.length - 1, Math.floor(progress * focusTargets.length * 1.03));
            focusTargets[focusIndex].getWorldPosition(tempTarget);
            tempDirection.copy(tempTarget).sub(camera.position).normalize();
            skyMaterial.uniforms.uLensDirection.value.copy(tempDirection);
            skyMaterial.uniforms.uLensStrength.value = focusIndex === 0 || focusIndex === focusTargets.length - 1 ? 0.075 : 0.024;
            skyMaterial.uniforms.uTime.value = elapsed * motion;
          }

          primary.system.rotation.y = elapsed * 0.025 * motion + pointer.x * 0.02;
          primary.diskMaterial.uniforms.uTime.value = elapsed;
          primary.innerDiskMaterial.uniforms.uTime.value = elapsed * 1.12;
          primary.photonRing.rotation.z += delta * 0.035 * motion;
          primary.photonGlow.rotation.z -= delta * 0.027 * motion;
          primary.dust.rotation.y = -elapsed * 0.018 * motion;
          primary.dust.rotation.z = elapsed * 0.008 * motion;

          portal.rotation.z = Math.sin(elapsed * 0.11 * motion) * 0.045 + pointer.x * 0.025;
          portalRings.forEach((ring, i) => {
            ring.rotation.z += delta * (i % 2 ? -0.028 : 0.022) * motion;
            ring.rotation.x += delta * (i % 3 ? 0.004 : -0.006) * motion;
          });
          portalHeart.rotation.y += delta * 0.14 * motion;
          portalHeart.rotation.x += delta * 0.07 * motion;

          network.rotation.y = elapsed * 0.032 * motion + pointer.x * 0.025;
          network.rotation.x = pointer.y * 0.025 + Math.sin(elapsed * 0.1) * 0.018 * motion;
          networkCore.rotation.y = -elapsed * 0.09 * motion;
          networkCore.rotation.x = elapsed * 0.04 * motion;

          architecture.rotation.y = elapsed * 0.038 * motion + pointer.x * 0.03;
          architecture.rotation.x = Math.sin(elapsed * 0.08) * 0.035 * motion + pointer.y * 0.02;
          crystalInner.rotation.y = -elapsed * 0.09 * motion;
          crystalInner.rotation.z = elapsed * 0.035 * motion;
          architectureRings[0].rotation.z += delta * 0.045 * motion;
          architectureRings[1].rotation.x -= delta * 0.033 * motion;
          architectureRings[2].rotation.y += delta * 0.052 * motion;

          secondary.system.rotation.y = -elapsed * 0.022 * motion + pointer.x * 0.02;
          secondary.diskMaterial.uniforms.uTime.value = elapsed * 0.85;
          secondary.innerDiskMaterial.uniforms.uTime.value = elapsed * 0.93;
          secondary.photonRing.rotation.z -= delta * 0.028 * motion;
          secondary.photonGlow.rotation.z += delta * 0.019 * motion;
          secondary.dust.rotation.y = elapsed * 0.018 * motion;
          blueLight.position.y = -2 + Math.sin(elapsed * 0.18) * 1.1;
          keyLight.position.x = 3 + Math.sin(elapsed * 0.24) * 1.0;

          renderer.render(scene, camera);
        };
        renderer.setAnimationLoop(frame);
        resize();

        teardown = () => {
          window.removeEventListener("scroll", scroll);
          window.removeEventListener("resize", scroll);
          window.removeEventListener("pointermove", pointerMove);
          observer?.disconnect();
          renderer?.setAnimationLoop(null);
          scene?.traverse((object) => {
            const obj = object as ThreeTypes.Object3D & { geometry?: ThreeTypes.BufferGeometry; material?: ThreeTypes.Material | ThreeTypes.Material[] };
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach((material) => material.dispose());
            else obj.material?.dispose();
          });
          renderer?.dispose();
          renderer?.domElement.remove();
          host.dataset.engine = "fallback";
        };
      } catch (error) {
        console.error("AppverseSI WebGL scene failed to initialise.", error);
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
