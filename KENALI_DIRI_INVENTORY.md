# Kenali Diri Inventory

## Route Scope

The navigation item labeled **Kenali Diri** opens `/wellness-assessment`.

`/profile` is a separate navigation destination labeled **Profil**. Its Profile V4 inventory is not the active Kenali Diri route audited here.

## Page Shell

| VISIBLE ITEM | TYPE | CTA / INTERACTION | SOURCE FILE |
|---|---|---|---|
| Bhumi Amartya logo/header | Widget | None | `components/ui/BhumiPageHeader.tsx` |
| Bottom application navigation | Widget | Dashboard, Kenali Diri, Innerwork, Journey, More | `components/navigation/AppNav.tsx` |
| Protected account boundary | Runtime wrapper | Redirect behavior when unauthenticated | `app/wellness-assessment/page.tsx` |

## Intro Stage

| SECTION | CARDS / WIDGETS | CTA | SOURCE FILE |
|---|---|---|---|
| Kenali Diri introduction | Sparkles icon, title, subtitle, reflection disclaimer | `Mulai Refleksi →` | `components/wellness/WellnessAssessmentFlow.tsx` |

Visible text includes:

- `Kenali Diri`
- `Mari memetakan kondisimu saat ini untuk menemukan langkah dukungan yang paling tepat.`
- `Ini bukan penilaian medis, melainkan alat bantu refleksi untuk mengenali kebutuhan batinmu.`

## Question Stage

| SECTION | CARDS / WIDGETS | CTA | SOURCE FILE |
|---|---|---|---|
| Reflection header | `Refleksi Harian`, `Pemetaan Kondisi`, progress percentage | None | `WellnessAssessmentFlow.tsx` |
| Progress indicator | Percentage and progress bar | None | `WellnessAssessmentFlow.tsx` |
| Body questions | Rest, energy, listening to body signals | Score buttons 1–5 | `WellnessAssessmentFlow.tsx` |
| Emotion questions | Emotional awareness, handling difficult emotions | Score buttons 1–5 | `WellnessAssessmentFlow.tsx` |
| Relationship question | Availability of social support | Score buttons 1–5 | `WellnessAssessmentFlow.tsx` |
| Meaning question | Meaning and value in daily activity | Score buttons 1–5 | `WellnessAssessmentFlow.tsx` |
| Spirituality question | Time for reflection or contemplation | Score buttons 1–5 | `WellnessAssessmentFlow.tsx` |
| Scale legend | `Tidak Sesuai` to `Sangat Sesuai` | None | `WellnessAssessmentFlow.tsx` |
| Submit control | Disabled until all eight questions are answered | `Lihat Hasil Refleksi →` | `WellnessAssessmentFlow.tsx` |

### Eight Visible Questions

1. Saya bangun pagi dengan perasaan segar dan cukup istirahat.
2. Saya memiliki energi yang cukup untuk menyelesaikan tugas harian.
3. Saya mendengarkan sinyal tubuh.
4. Saya menyadari apa yang saya rasakan saat menjalani hari.
5. Saya mampu menghadapi emosi sulit tanpa merasa kewalahan.
6. Saya memiliki orang-orang yang bisa saya hubungi saat butuh dukungan.
7. Saya merasa aktivitas harian saya memiliki makna dan nilai.
8. Saya meluangkan waktu untuk refleksi diri atau kontemplasi harian.

## Results Stage

| SECTION | CARDS / WIDGETS | CTA | SOURCE FILE |
|---|---|---|---|
| Results header | `Kenali Diri`, completion date | `Ulangi Refleksi` | `WellnessAssessmentFlow.tsx` |
| Tema Saat Ini | Navigator mode badge, primary action card, up to two supporting action cards | Supporting cards appear clickable but have no action handler | `WellnessNavigatorView.tsx` |
| Pola Diri | Up to four probable theme rows, dominant badge, confidence badge, probabilities and explanations | `Lihat Mengapa` expand/collapse | `WellnessMappingView.tsx` |
| Lihat Mengapa details | Five dimension driver values, optional signal boosters, accuracy score and reason | Expand/collapse | `WellnessMappingView.tsx` |
| Perhatian Ekstra | Five dimension score widgets: Tubuh, Emosi, Relasi, Makna, Spirit | None | `WellnessMapView.tsx` |
| Jalur Aman | Primary and optional secondary support cards with level, confidence, reason and resources | Resource rows can open link, phone, or show no action | `WellnessSupportPathView.tsx` |
| Dukungan Untukmu — Langkah Dasar | Journaling, Meditation, Audio, Manifestation, Innerwork hub | Five internal links | `WellnessAssessmentFlow.tsx` |
| Dukungan Untukmu — Dukungan Komunitas | Sobat Mistis Bhumi, Lingkaran Refleksi, Teman Cerita | WhatsApp link when configured; two disabled cards | `WellnessAssessmentFlow.tsx` |
| Langkah Berikutnya | Informational statement about downstream personalization | None | `WellnessAssessmentFlow.tsx` |

## Loading, Notice, and Error Widgets

- Loading theme placeholder.
- Loading patterns placeholder.
- Loading attention areas placeholder.
- Loading safe path placeholder.
- Session-not-ready error.
- Reflection-generation error.
- Save-failure notice.
- `Menganalisis...` button state.

## Totals

| INVENTORY TYPE | COUNT |
|---|---:|
| Assessment questions | 8 |
| Score controls | 40 |
| Primary result sections | 5 |
| Dimension score widgets | 5 |
| Basic-support CTA links | 5 |
| Community CTA cards | 3 |
| Disabled community CTA cards | 2 |
| Main workflow CTAs | 4 |
