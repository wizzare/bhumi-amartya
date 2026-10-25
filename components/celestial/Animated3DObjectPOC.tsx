"use client";

import React, { useEffect, useRef, useState } from "react";
import type * as Three from "three";
import { observeNativeAnimationState } from "../environment/nativeAnimationState";

interface Animated3DObjectProps {
  size?: number;
  className?: string;
  allowAnimation?: boolean;
}

export function Animated3DObjectPOC({ size = 200, className = "", allowAnimation = true }: Animated3DObjectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || fallback) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const abort = new AbortController();
    let disposed = false;
    let inViewport = false;
    let nativeActive = true;
    let frame = 0;
    let lastTime = 0;
    let renderer: Three.WebGLRenderer | undefined;
    let model: Three.Group | undefined;
    let mixer: Three.AnimationMixer | undefined;
    let scene: Three.Scene;
    let camera: Three.PerspectiveCamera;
    const disposeModel = (root: Three.Group) => {
      const geometries = new Set<Three.BufferGeometry>();
      const materials = new Set<Three.Material>();
      root.traverse((object) => {
        const mesh = object as Three.Mesh;
        if (!mesh.isMesh) return;
        geometries.add(mesh.geometry);
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
    const active = () => !disposed && nativeActive && inViewport && !document.hidden && !motion.matches;
    const tick = (now: number) => {
      frame = 0;
      if (!active() || !renderer || !mixer) return;
      if (allowAnimation && lastTime) mixer.update(Math.min((now - lastTime) / 1000, 0.1));
      lastTime = now;
      renderer.render(scene, camera);
      if (allowAnimation) frame = requestAnimationFrame(tick);
    };
    const sync = () => { stop(); if (active() && renderer && mixer) frame = requestAnimationFrame(tick); };
    const fail = () => { stop(); if (!disposed) setFallback(true); };
    const removeNativeListener = observeNativeAnimationState((active) => { nativeActive = active; sync(); }, fail);
    const onMotion = () => { if (motion.matches) fail(); };
    const onContextLost = (event: Event) => { event.preventDefault(); fail(); };
    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      sync();
    }, { threshold: 0.1 });
    observer.observe(container);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", onMotion);
    canvas.addEventListener("webglcontextlost", onContextLost);
    void (async () => {
      try {
        if (motion.matches) { fail(); return; }
        const [THREE, { GLTFLoader }] = await Promise.all([import("three"), import("three/addons/loaders/GLTFLoader.js")]);
        if (disposed) return;
        const response = await fetch(new URL("./synthetic-animation.gltf", import.meta.url), { signal: abort.signal });
        if (!response.ok) throw new Error("Fixture unavailable");
        const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), "");
        if (disposed) { disposeModel(gltf.scene); return; }
        model = gltf.scene;
        if (!gltf.animations.length) throw new Error("Fixture animation missing");
        model.traverse((object) => {
          const mesh = object as Three.Mesh;
          if (!mesh.isMesh) return;
          for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose();
          mesh.geometry.computeVertexNormals();
          mesh.material = new THREE.MeshLambertMaterial({ color: 0x8caa87 });
        });
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(size, size, false);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
        camera.position.set(0, 0.2, 2.6);
        scene.add(model, new THREE.AmbientLight(0xfffdfa, 1.5));
        const light = new THREE.DirectionalLight(0xf5ede1, 1.2);
        light.position.set(1.5, 2, 2);
        scene.add(light);
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        sync();
      } catch { fail(); }
    })();
    return () => {
      disposed = true;
      abort.abort();
      stop();
      observer.disconnect();
      removeNativeListener();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", onMotion);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      mixer?.stopAllAction();
      if (model) { mixer?.uncacheRoot(model); disposeModel(model); }
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [fallback, size, allowAnimation]);

  return (
    <div ref={containerRef} className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} role="img" aria-label={fallback ? "Objek statis" : "Animasi objek glTF"}>
      {fallback ? <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"><path d="M50 20 80 75 20 75Z" fill="#8CAA87" /></svg> : <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />}
    </div>
  );
}
