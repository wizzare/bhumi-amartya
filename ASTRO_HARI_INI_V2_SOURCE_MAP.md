# Astro Hari Ini V2: Source Mapping

## 1. Technical Data Sources

| Section | Data Item | Logic Engine | UI Component |
| :--- | :--- | :--- | :--- |
| **Collapsed** | Current Phase | `lib/astrology/calculateCurrentSky.ts` | `AstroTodayCard` |
| **Collapsed** | Next Major Event | (NEW) `lib/engines/astroAwarenessEngine.ts` | `AstroTodayCard` |
| **Section 1** | Langit Barat | `lib/astrology/calculateCurrentSky.ts` | `AstroTodayCard > Detail` |
| **Section 2** | Vedic | `lib/vedic/calculateVedic.ts` | `AstroTodayCard > Detail` |
| **Section 3** | BaZi | `lib/bazi/calculateBazi.ts` | `AstroTodayCard > Detail` |
| **Section 4** | Tzolkin Maya | `lib/tzolkin/calculateTzolkin.ts` | `AstroTodayCard > Detail` |
| **Section 5** | Kalender Jawa | `lib/weton/calculateWeton.ts` | `AstroTodayCard > Detail` |
| **Section 6** | Eclipses | (NEW) `lib/data/astronomicalEvents.ts` | `AstroTodayCard > Detail` |

## 2. Notification/Reminder Templates

| Event Type | Timing | Language Template (Bahasa Indonesia) |
| :--- | :--- | :--- |
| **Full Moon** | -3 Days | "Dalam beberapa hari ke depan fase bulan akan memasuki Purnama. Gunakan waktu ini untuk memperhatikan kualitas tidur..." |
| **New Moon** | -3 Days | "Beberapa hari ke depan menandai penutupan satu siklus. Cukup amati apa yang terasa selesai..." |
| **GAP** | -3 Days | "Dalam beberapa hari ke depan mungkin muncul ide, mimpi, atau kesadaran yang terasa berulang. Catat terlebih dahulu." |
| **Eclipse** | -7 Days | "Musim gerhana sedang mendekat. Gunakan periode ini sebagai ruang observasi terhadap perubahan pola..." |

## 3. Dependency Hierarchy
1.  **Astronomical Clock:** Precise timestamps for celestial boundaries.
2.  **Awareness Orchestrator:** Maps "Approaching Rhythms" to the correct window and template.
3.  **Synthesis Layer:** Injects these rhythms into the Dashboard Mirror and Catatan Hari Ini.
