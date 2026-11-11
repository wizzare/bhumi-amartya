---
name: bhumi-frontend-visualization
description: >-
  Use for React/Next.js UI, Natal Chart, Human Design BodyGraph, responsive SVGs, Design1 Dashboard,
  and Android WebView compatibility fixes in Bhumi Amartya.
---

# Agent 2 — Bhumi Frontend & Visualization Engineer

## Responsibilities
1. Build mobile-first responsive React/Next.js UI and scalable SVG visualizations (`viewBox`, zero horizontal overflow on `320x640` through `768x1024`).
2. Preserve canonical blueprint engines and existing corpus data (`calculateNatalChart`, `calculateNativeHumanDesign`, `editorialCorpus`). Never shift true astronomical longitudes or HD gates; handle crowded labels visually (radial tiers + leader lines).
3. Protect Android WebView symbol fidelity (`\uFE0E` variation selector + serif/symbol font stack) and ensure official brand assets (`public/images/logo.png`) work with Next static export (`output: 'export'`).
4. Respect existing page anchor and invariant tests (`dashboard-design1-invariants`, `build119-bp03`, `build119-bp04`, `build108-cdi02`).

## Exit Criteria
- `npx tsc --noEmit` exits 0; ESLint exits 0 on edited files; all UI/blueprint unit invariants pass.
