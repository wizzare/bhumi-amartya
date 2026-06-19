import * as Astronomy from "astronomy-engine";
import { AstroEvent, KNOWN_ECLIPSES } from "../data/astronomicalEvents";
import { calculateTzolkin } from "../tzolkin/calculateTzolkin";
import { calculateWuku } from "../weton/calculateWeton";

const JIE_LONGITUDES = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];

function searchJie(year: number, monthIndex: number): Date {
  const target = JIE_LONGITUDES[monthIndex];
  const approximateMonth = (monthIndex + 1) % 12;
  const start = new Date(Date.UTC(year, approximateMonth, 1));
  const result = (Astronomy as any).SearchSunLongitude(target, start, 12);
  if (!result) throw new Error(`Unable to calculate solar term ${target}.`);
  return result.date;
}

export interface AstroAwarenessContext {
  currentMoonPhase: {
    label: string;
    theme: string;
  };
  nextEvent: AstroEvent | null;
  countdownDays: number | null;
  activeAwarenessEvents: AstroEvent[];
  allEvents: AstroEvent[];
}

export const astroAwarenessEngine = {
  getUpcomingEvents(baseDate: Date = new Date(), limitDays: number = 30): AstroEvent[] {
    const events: AstroEvent[] = [];
    
    // 1. MOON PHASES
    const majorPhases = [0, 90, 180, 270];
    majorPhases.forEach(angle => {
      const next = (Astronomy as any).SearchMoonPhase(angle, baseDate, limitDays);
      if (next) {
        const label = angle === 0 ? "Bulan Baru" : angle === 90 ? "First Quarter Moon" : angle === 180 ? "Bulan Purnama" : "Last Quarter Moon";
        const subType = angle === 0 ? "new_moon" : angle === 180 ? "full_moon" : "quarter_moon";
        events.push({
          id: `moon_${subType}_${next.date.toISOString()}`,
          type: "moon_phase",
          subType,
          title: label,
          date: next.date.toISOString(),
          explanation: {
            id: angle === 180 
              ? "Fase bulan memasuki Purnama. Perhatikan kualitas tidur, emosi, energi tubuh, serta tema-tema yang terus muncul dalam pikiranmu."
              : angle === 0 
                ? "Siklus baru dimulai. Amati apa yang terasa selesai dan apa yang mulai meminta perhatian."
                : "Pergantian fase bulan membawa ruang untuk penyesuaian batin dan evaluasi langkah.",
            en: angle === 180 ? "Full Moon approaches. Notice sleep quality, emotions, and recurring thoughts." : "New Moon approaches. Observe what ends and what begins to grow."
          },
          severity: "medium"
        });
      }
    });

    // 2. TZOLKIN (GAP & Wavespell)
    for (let i = 0; i <= limitDays; i++) {
      const testDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
      const t = calculateTzolkin({ birthDate: testDate.toISOString().split("T")[0] });
      if (t.gap) {
        events.push({
          id: `tzolkin_gap_${testDate.toISOString().split("T")[0]}`,
          type: "tzolkin",
          subType: "gap",
          title: "Galactic Activation Portal (GAP)",
          date: testDate.toISOString(),
          explanation: {
            id: "Mungkin muncul ide, mimpi, inspirasi, atau kesadaran yang terasa berulang. Catat terlebih dahulu tanpa terburu-buru mengambil kesimpulan.",
            en: "Ideals, dreams, or recurring realizations may emerge. Note them down without rushing to conclusions."
          },
          severity: "medium"
        });
      }
      if (t.galacticTone.name.startsWith("1 ")) {
        events.push({
          id: `tzolkin_wavespell_${testDate.toISOString().split("T")[0]}`,
          type: "tzolkin",
          subType: "wavespell_start",
          title: `Awal ${t.wavespell.name}`,
          date: testDate.toISOString(),
          explanation: {
            id: `Memulai siklus 13 hari bertema ${t.wavespell.theme.toLowerCase()}. Amati bagaimana tema ini hadir dalam keseharianmu.`,
            en: `Beginning a 13-day cycle of ${t.wavespell.theme.toLowerCase()}. Observe how this theme appears.`
          },
          severity: "low"
        });
      }
    }

    // 3. BAZI (Month Change / Jie)
    const currentYear = baseDate.getUTCFullYear();
    for (let m = 0; m < 12; m++) {
       try {
         const jieDate = searchJie(currentYear, m);
         if (jieDate.getTime() > baseDate.getTime() && jieDate.getTime() < baseDate.getTime() + limitDays * 24 * 60 * 60 * 1000) {
            events.push({
              id: `bazi_jie_${m}_${jieDate.toISOString()}`,
              type: "bazi",
              subType: "month_change",
              title: "Pergantian Energi Bulanan",
              date: jieDate.toISOString(),
              explanation: {
                id: "Atmosfer energi bulanan sedang berganti. Perhatikan perubahan kecenderungan emosi dan ritme kerjamu.",
                en: "Monthly energy atmosphere is shifting. Notice changes in emotional tendencies and work rhythm."
              },
              severity: "low"
            });
         }
       } catch(e) {}
    }

    // 4. JAWA (Wuku Change)
    for (let i = 0; i <= limitDays; i++) {
       const testDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
       if (testDate.getUTCDay() === 0) { 
          const w = calculateWuku(testDate);
          events.push({
            id: `jawa_wuku_${w.name}_${testDate.toISOString().split("T")[0]}`,
            type: "jawa",
            subType: "wuku_change",
            title: `Memasuki Wuku ${w.name}`,
            date: testDate.toISOString(),
            explanation: {
              id: `Siklus mingguan dalam kalender Jawa berganti. ${w.description}. Gunakan sebagai bahan pengamatan batin.`,
              en: `Weekly Javanese cycle shifts. ${w.description}. Use for inner observation.`
            },
            severity: "low"
          });
       }
    }

    // 5. ECLIPSES
    KNOWN_ECLIPSES.forEach(e => {
       const eDate = new Date(e.date);
       if (eDate.getTime() > baseDate.getTime() && eDate.getTime() < baseDate.getTime() + limitDays * 24 * 60 * 60 * 1000) {
          events.push(e);
       }
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  getAwarenessContext(baseDate: Date = new Date()): AstroAwarenessContext {
    const allEvents = this.getUpcomingEvents(baseDate, 60); 
    const windows = [30, 14, 7, 3, 1, 0, -1, -3, -7];
    
    const activeEvents = allEvents.filter(event => {
      const eDate = new Date(event.date);
      const diffDays = Math.ceil((eDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
      return windows.includes(diffDays);
    });

    const nextEvent = allEvents.find(e => new Date(e.date).getTime() > baseDate.getTime()) || null;
    const countdownDays = nextEvent ? Math.ceil((new Date(nextEvent.date).getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

    const moonAngle = (Astronomy as any).MoonPhase(baseDate);
    const normalizedAngle = ((moonAngle % 360) + 360) % 360;
    let label = "Moon Phase";
    if (normalizedAngle < 7.5 || normalizedAngle >= 352.5) label = "New Moon";
    else if (normalizedAngle < 82.5) label = "Waxing Crescent";
    else if (normalizedAngle < 97.5) label = "First Quarter";
    else if (normalizedAngle < 172.5) label = "Waxing Gibbous";
    else if (normalizedAngle < 187.5) label = "Full Moon";
    else if (normalizedAngle < 262.5) label = "Waning Gibbous";
    else if (normalizedAngle < 277.5) label = "Last Quarter";
    else label = "Waning Crescent";

    return {
      currentMoonPhase: {
        label,
        theme: "Refleksi dan keselarasan batin."
      },
      nextEvent,
      countdownDays,
      activeAwarenessEvents: activeEvents,
      allEvents
    };
  }
};