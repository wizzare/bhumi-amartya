"use client";

import React, { useEffect, useRef, useState } from "react";
import type * as Three from "three";
import { observeNativeAnimationState } from "./nativeAnimationState";
import type { EarthState } from "./RotatingEarthCanvas";

interface Real3DEarthProps {
  size?: number;
  state?: EarthState;
  className?: string;
  allowAnimation?: boolean;
}

export function Real3DEarth({ size = 240, state, className = "", allowAnimation = true }: Real3DEarthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || fallback) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let inViewport = false;
    let nativeActive = true;
    let frame = 0;
    let lastTime = 0;
    let renderer: Three.WebGLRenderer | undefined;
    let geometry: Three.SphereGeometry | undefined;
    let material: Three.MeshLambertMaterial | undefined;
    let texture: Three.CanvasTexture | undefined;
    let scene: Three.Scene;
    let camera: Three.PerspectiveCamera;
    let globe: Three.Mesh;

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };
    const active = () => !disposed && nativeActive && inViewport && !document.hidden && !motion.matches;
    const tick = (now: number) => {
      frame = 0;
      if (!active() || !renderer) return;
      if (allowAnimation && lastTime) globe.rotation.y += Math.min((now - lastTime) / 1000, 0.1) * Math.PI * 2 / 90;
      lastTime = now;
      renderer.render(scene, camera);
      if (allowAnimation) frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      stop();
      if (active() && renderer) frame = requestAnimationFrame(tick);
    };
    const fail = () => {
      stop();
      if (!disposed) setFallback(true);
    };
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
        const THREE = await import("three");
        if (disposed) return;
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(size, size, false);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.z = 3.2;
        const map = document.createElement("canvas");
        map.width = 1024;
        map.height = 512;
        const ctx = map.getContext("2d");
        if (!ctx) throw new Error("Texture canvas unavailable");
        ctx.fillStyle = "#A8BCA6";
        ctx.fillRect(0, 0, 1024, 512);
        ctx.fillStyle = "#4A5849";
        for (const [x, y, rx, ry, angle] of [[540, 230, 240, 140, 0], [250, 260, 140, 200, 0.2], [820, 360, 70, 50, 0]]) {
          ctx.beginPath();
          ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        texture = new THREE.CanvasTexture(map);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        geometry = new THREE.SphereGeometry(1, 48, 48);
        material = new THREE.MeshLambertMaterial({ map: texture, color: 0xffffff });
        globe = new THREE.Mesh(geometry, material);
        globe.rotation.z = 23.4 * Math.PI / 180;
        scene.add(globe, new THREE.AmbientLight(0xf7f4ee, 1.4));
        const sunlight = new THREE.DirectionalLight(0xfffdf7, 1.6);
        sunlight.position.set(-2, 1.5, 2.5);
        scene.add(sunlight);
        sync();
      } catch { fail(); }
    })();

    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      removeNativeListener();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", onMotion);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry?.dispose();
      material?.dispose();
      texture?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [fallback, size, allowAnimation]);

  return (
    <div ref={containerRef} className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} role="img" aria-label="Visual Bumi 3D">
      {fallback ? <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={state?.cityName ? `Visual Bumi statis — ${state.cityName}` : "Visual Bumi statis"}><circle cx="50" cy="50" r="44" fill="#B8C6B6" /><path d="M35 10 55 12 72 27 63 38 53 36 58 52 47 74 37 67 34 48 20 38 18 25Z" fill="#4A5849" /><path d="M72 61 86 65 88 75 77 83 68 74Z" fill="#5E705C" /><circle cx="50" cy="50" r="44" fill="none" stroke="#8C7A6B" /></svg> : <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} className="block" />}
    </div>
  );
}
