# Astro Collapse Refinement

## Result

The dashboard Astro card now uses a high-signal, low-noise collapsed state.

## Collapsed Content

Only the following information renders:

- Fase Bulan
- Current Moon phase and sign
- Period start and end
- Next Moon phase, sign, and date
- `Lihat Detail Langit Hari Ini` button

## Removed From Collapsed State

- Tema Kolektif
- Menyentuh Dirimu
- Yang Bisa Dilakukan
- Catatan Kesadaran
- Langit Barat
- Vedic
- BaZi
- Tzolkin
- Kalender Jawa
- Gerhana

These items remain available after deliberate expansion.

## Interaction

The collapsed button opens the full Astro detail. It disappears while the detail is open so the top card remains visually quiet.

## Validation

- Focused ESLint: passed
- Diff integrity check: passed
- Component compilation: passed
- Repository-wide TypeScript remains blocked by unrelated errors in `scripts/validateCanonicalTranslator.ts`

