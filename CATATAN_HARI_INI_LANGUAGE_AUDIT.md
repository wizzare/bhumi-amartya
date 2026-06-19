# Catatan Hari Ini Language Audit

## Visible Field Inventory

The component renders the same four data fields for up to nine categories. The category title labels are fixed UI copy.

| FIELD | CURRENT TEXT SOURCE | LANGUAGE QUALITY | STATUS |
|---|---|---|---|
| Section title | Fixed `Catatan Hari Ini` in `DailyNoteV2.tsx` | Clear natural UI copy | HUMAN_READY |
| Section subtitle | Fixed `Membaca jiwamu bersama kondisi langit.` | Understandable, but frames the section through astrology | HUMAN_READY |
| Category labels | Fixed labels in `CATEGORY_CONFIG` | Clear and ordinary language | HUMAN_READY |
| `insight` — AI branch | Gemini category output generated from raw Blueprint, unified synthesis, current sky, houses and memory | Prompt asks for human language, but no architectural translation guarantee exists | PARTIAL_TRANSLATION |
| `reason` — AI branch | Gemini category output driven by transit and house activation | Prompt permits visible planet names and translated life areas; raw source payload remains available to generation | PARTIAL_TRANSLATION |
| `reflection` — AI branch | Gemini-generated questions, then one fixed question appended by `withDailyCategoryAngle` | Usually understandable; generated portion has no Human Meaning boundary | PARTIAL_TRANSLATION |
| `advice` — AI branch | Gemini advice, then normalized or replaced when invalid | Usually practical; final quality depends on AI compliance and narrow sanitizer rules | PARTIAL_TRANSLATION |
| Appended reason angle | One of four fixed `Tema Saat Ini`, `Kemungkinan Pola`, `Perhatian Ekstra`, or `Jalur Aman` sentences | Clear generic language; not generated from Canonical or Human Meaning | HUMAN_READY |
| Appended reflection question | One of four fixed practical questions | Clear generic language; not personalized meaning | HUMAN_READY |
| Empty section state | `Informasi sedang dipersiapkan...` | Explicit placeholder/fallback text | LEGACY_OUTPUT |
| Normalizer emergency text | `Hari ini, pilih satu langkah kecil yang paling ramah untuk tubuh dan batinmu...` | Human-readable but generic fallback content | LEGACY_OUTPUT |

## Server Fallback Content

| CATEGORY / FIELD | CURRENT TEXT SOURCE | LANGUAGE QUALITY | STATUS |
|---|---|---|---|
| Kondisi Umum — insight | `Energi yang stabil untuk refleksi.` | Generic and understandable | LEGACY_OUTPUT |
| Kondisi Umum — reason | `Berdasarkan posisi Matahari dan Bulan hari ini yang selaras dengan jalurnya.` | Exposes astrology labels and makes an unexplained alignment claim | LEGACY_OUTPUT |
| Kondisi Umum — reflection | `Apa satu hal yang kamu syukuri dari dirimu hari ini?` plus appended UI question | Human-readable but generic | LEGACY_OUTPUT |
| Kondisi Umum — advice | Original fixed grounding sentence is rejected; normalizer generates seeded fixed advice | Human-readable fallback, not Human Meaning | LEGACY_OUTPUT |
| Mental | Not created | Missing from this branch | LEGACY_OUTPUT |
| Keuangan | Not created | Missing from this branch | LEGACY_OUTPUT |
| Percintaan | Not created | Missing from this branch | LEGACY_OUTPUT |
| Relasi & Keluarga | Not created | Missing from this branch | LEGACY_OUTPUT |
| Spiritual | Not created | Missing from this branch | LEGACY_OUTPUT |
| Tantangan | Not created | Missing from this branch | LEGACY_OUTPUT |
| Peluang | Not created | Missing from this branch | LEGACY_OUTPUT |
| Saran Bhumi | Not created | Missing from this branch | LEGACY_OUTPUT |

## Client Local Fallback Content

| CATEGORY | INSIGHT SOURCE / QUALITY | REASON SOURCE / QUALITY | REFLECTION SOURCE / QUALITY | ADVICE SOURCE / QUALITY | STATUS |
|---|---|---|---|---|---|
| Kondisi Umum | Fixed generic prose | Fixed Sun/Moon statement | Empty source plus appended generic question | State, sky, wellness and raw differentiators mixed with fixed prose | LEGACY_OUTPUT |
| Mental | Fixed `Fokus pada kejernihan.` | Fixed visible Merkurius statement | Empty source plus appended generic question | State, sky, wellness and raw differentiators mixed with fixed prose | LEGACY_OUTPUT |
| Keuangan | Fixed generic prose | Empty and replaced by generic normalizer fallback | Empty source plus appended generic question | State, sky, wellness and raw differentiators mixed with fixed prose | LEGACY_OUTPUT |
| Percintaan | Fixed generic prose | Empty and replaced by generic normalizer fallback | Empty source plus appended generic question | State, sky, wellness and raw differentiators mixed with fixed prose | LEGACY_OUTPUT |
| Relasi & Keluarga | Fixed generic prose | Empty and replaced by generic normalizer fallback | Empty source plus appended generic question | State, sky, wellness and raw differentiators mixed with fixed prose | LEGACY_OUTPUT |
| Spiritual | Fixed generic prose | Empty and replaced by generic normalizer fallback | Empty source plus appended generic question | State, sky, wellness and raw differentiators mixed with fixed prose | LEGACY_OUTPUT |
| Tantangan | Fixed generic prose | Empty and replaced by generic normalizer fallback | Empty source plus appended generic question | State, sky, wellness and raw differentiators mixed with fixed prose | LEGACY_OUTPUT |
| Peluang | Fixed generic prose | Empty and replaced by generic normalizer fallback | Empty source plus appended generic question | State, sky, wellness and raw differentiators mixed with fixed prose | LEGACY_OUTPUT |
| Saran Bhumi | Fixed generic prose | Empty and replaced by generic normalizer fallback | Empty source plus appended generic question | State, sky, wellness and raw differentiators mixed with fixed prose | LEGACY_OUTPUT |

## Leak Checks

| CHECK | FINDING | STATUS |
|---|---|---|
| Astrology labels | Fixed fallback visibly uses Matahari, Bulan and Merkurius. AI reasons are explicitly astrology/house driven. | LEGACY_OUTPUT |
| Matrix numbers | Prompt forbids them and normalizer removes some numeric-list lines, but raw matrix data reaches AI and local synthesis. Prevention is incomplete. | PARTIAL_TRANSLATION |
| Human Design terminology | Prompt forbids common terms, but raw Human Design is supplied. Local advice may expose raw unified differentiators. | PARTIAL_TRANSLATION |
| Chakra metrics | Full health-chart chakra data is supplied to AI synthesis. The normalizer has no general chakra-name or metric filter. | PARTIAL_TRANSLATION |
| Internal variables | Raw Blueprint and unified structures are supplied. The normalizer does not detect arbitrary internal field names. | PARTIAL_TRANSLATION |
| Engine dumps | No fixed dump is rendered by the component, but generated/cached category strings are not protected by a comprehensive engine-output validator. | PARTIAL_TRANSLATION |
| Fallback text | Present in UI, normalizer, server fallback and client fallback. | LEGACY_OUTPUT |
| Cached legacy content | Valid localStorage or Firestore categories are rendered after limited normalization. Provenance is not re-established through Human Meaning. | LEGACY_OUTPUT |

## Classification Conclusion

The fixed UI labels and client-added questions are human-readable. The actual personalized category content is not guaranteed `HUMAN_READY` because it bypasses Canonical and Human Meaning. AI content is `PARTIAL_TRANSLATION`; deterministic and local fallback content is `LEGACY_OUTPUT`. The local fallback also permits a direct raw-engine leak through visible unified Blueprint differentiators.
