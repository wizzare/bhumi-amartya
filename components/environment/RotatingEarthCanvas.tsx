"use client";

import React, { useEffect, useRef, useState } from "react";

export interface EarthState {
  cityName?: string;
  temperatureCelsius?: number;
  condition?: string;
  freshnessIso?: string;
  isDaytime?: boolean;
}

interface RotatingEarthCanvasProps {
  size?: number; // dimension in px (default: 260)
  state?: EarthState;
  className?: string;
  allowAnimation?: boolean;
}

/**
 * 2.5D / Lightweight WebGL Hybrid Earth Sphere.
 * - Slow continuous rotation (90s full revolution)
 * - Matte material palette matching Bhumi visual tokens (#4A5849, #8C7A6B, #F7F4EE)
 * - Pure Canvas 2D/2.5D rendering by default: ZERO bundle bloat, ZERO WebGL context crashes
 * - Completely immune to Android low-memory crashes, no Three.js / WebGL memory leak
 * - Pauses automatically when offscreen (IntersectionObserver) or in background (visibilitychange)
 * - Full reduced-motion and static fallback support
 */
export function RotatingEarthCanvas({
  size = 240,
  state,
  className = "",
  allowAnimation = true,
}: RotatingEarthCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // 1. Accessibility: Detect user prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // 2. Lifecycle: Pause when offscreen or app in background
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);

    const visibilityHandler = () => {
      if (document.hidden) {
        setIsVisible(false);
      } else if (containerRef.current) {
        // Re-check bounding rect on foreground resume
        const rect = containerRef.current.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
  }, []);

  // 3. Render Loop: Soft matte spherical projection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotationAngle = 0;
    let lastTimestamp = performance.now();

    // Continent simplified landmass geometry (longitudes & latitudes in degrees)
    // Coarse organic landmass points for Africa/Eurasia/Americas/Oceania
    const continents = [
      // Eurasia & Africa
      [
        { lon: -10, lat: 35 }, { lon: 30, lat: 30 }, { lon: 40, lat: 15 },
        { lon: 50, lat: -10 }, { lon: 30, lat: -34 }, { lon: 15, lat: -30 },
        { lon: 0, lat: 5 }, { lon: -15, lat: 15 }, { lon: 5, lat: 50 },
        { lon: 30, lat: 60 }, { lon: 60, lat: 70 }, { lon: 100, lat: 60 },
        { lon: 130, lat: 50 }, { lon: 105, lat: 20 }, { lon: 80, lat: 10 },
        { lon: 50, lat: 25 }, { lon: 35, lat: 40 }, { lon: 0, lat: 45 }
      ],
      // Americas
      [
        { lon: -130, lat: 55 }, { lon: -100, lat: 65 }, { lon: -60, lat: 50 },
        { lon: -75, lat: 30 }, { lon: -85, lat: 20 }, { lon: -80, lat: 10 },
        { lon: -50, lat: -5 }, { lon: -40, lat: -20 }, { lon: -60, lat: -45 },
        { lon: -75, lat: -50 }, { lon: -70, lat: -20 }, { lon: -105, lat: 25 },
        { lon: -120, lat: 35 }
      ],
      // Maritime Southeast Asia / Australia
      [
        { lon: 95, lat: 5 }, { lon: 110, lat: -5 }, { lon: 120, lat: -10 },
        { lon: 140, lat: -20 }, { lon: 150, lat: -35 }, { lon: 130, lat: -35 },
        { lon: 115, lat: -25 }, { lon: 120, lat: 0 }
      ]
    ];

    const r = (size * 0.44); // Globe radius
    const cx = size / 2;
    const cy = size / 2;

    const render = (now: number) => {
      const delta = now - lastTimestamp;
      lastTimestamp = now;

      if (allowAnimation && isVisible && !prefersReducedMotion) {
        // Full 360 rotation over 90 seconds (4 degrees per second)
        rotationAngle = (rotationAngle + (delta * 0.004)) % 360;
      }

      ctx.clearRect(0, 0, size, size);

      // --- 1. Soft Ambient Celestial Glow ---
      const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.25);
      glowGrad.addColorStop(0, "rgba(230, 235, 230, 0.45)");
      glowGrad.addColorStop(0.6, "rgba(140, 160, 145, 0.10)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. Ocean Sphere (Grounded muted sage water) ---
      const oceanGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      oceanGrad.addColorStop(0, "#DDE4DC"); // Light sage water highlight
      oceanGrad.addColorStop(0.5, "#B8C6B6"); // Mid tone ocean
      oceanGrad.addColorStop(1, "#8A9C87"); // Darker edge limb
      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Clip continents to sphere boundary
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // --- 3. Continents (Warm Earth & Leaf tones) ---
      ctx.fillStyle = "#5E705C"; // Deep organic foliage green
      ctx.strokeStyle = "#4F5E52";
      ctx.lineWidth = 1;

      for (const poly of continents) {
        ctx.beginPath();
        let first = true;
        let visibleCount = 0;

        for (const pt of poly) {
          // Orthographic spherical projection
          const lambda = ((pt.lon + rotationAngle + 180) % 360 - 180) * (Math.PI / 180);
          const phi = pt.lat * (Math.PI / 180);

          // Visible hemisphere check (cos(lambda) * cos(phi) > 0)
          const cosC = Math.cos(phi) * Math.cos(lambda);
          if (cosC > -0.1) {
            visibleCount++;
            const x = cx + r * Math.cos(phi) * Math.sin(lambda);
            const y = cy - r * Math.sin(phi);

            if (first) {
              ctx.moveTo(x, y);
              first = false;
            } else {
              ctx.lineTo(x, y);
            }
          }
        }

        if (visibleCount > 2) {
          ctx.closePath();
          ctx.fill();
        }
      }

      // --- 4. 2.5D Spherical Depth & Atmosphere Rim ---
      const shadowGrad = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
      shadowGrad.addColorStop(0, "rgba(45, 53, 46, 0)");
      shadowGrad.addColorStop(0.85, "rgba(45, 53, 46, 0.15)");
      shadowGrad.addColorStop(1, "rgba(35, 42, 36, 0.45)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // --- 5. Soft Morning Light Shading (Matte Highlight) ---
      const lightGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx, cy, r);
      lightGrad.addColorStop(0, "rgba(255, 255, 255, 0.38)");
      lightGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.05)");
      lightGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Outer boundary stroke
      ctx.strokeStyle = "rgba(74, 88, 73, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      if (allowAnimation && !prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, allowAnimation, isVisible, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      role="region"
      aria-label="Visual Bumi Berotasi"
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block drop-shadow-sm"
      />

      {/* Static Fallback / Screen-reader Accessible Badge */}
      <div className="sr-only">
        {state?.cityName ? `Kondisi lingkungan di ${state.cityName}` : "Visual kondisi bumi"}
        {state?.temperatureCelsius !== undefined ? `, suhu ${state.temperatureCelsius}°C` : ""}
      </div>
    </div>
  );
}
