import {
  DAY_INTERPRETATIONS,
  DAY_NEPTU,
  NEPTU_INTERPRETATIONS,
  PASARAN_INTERPRETATIONS,
  PASARAN_NEPTU,
  PRANATA_MANGSA_DATA,
  WUKU_DATA,
} from "./dictionaries";
import type {
  JavaneseDay,
  Pasaran,
  PranataMangsaResult,
  WetonBlueprint,
  WetonInput,
  WukuResult,
} from "./types";

const DAY_MS = 86_400_000;
const JAVANESE_DAY_BOUNDARY_HOUR = 18;
const PAWUKON_EPOCH_UTC = Date.UTC(2020, 6, 5);
const DAYS: JavaneseDay[] = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const PASARAN_FROM_EPOCH: Pasaran[] = ["Pahing", "Pon", "Wage", "Kliwon", "Legi"];

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function parseBirthDate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error("Birth date must use YYYY-MM-DD format.");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));

  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    throw new Error("Birth date is not a valid Gregorian date.");
  }

  return { year, month, day };
}

function parseHour(value?: string | null): number {
  if (!value) return 12;
  const trimmed = value.trim();
  const match = /^(\d{1,2})\s*[:.]\s*(\d{2})(?:\s*(AM|PM|am|pm))?/.exec(trimmed);
  if (!match) return 12;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const ampm = match[3]?.toUpperCase();

  if (hour > 23 || minute > 59) return 12;

  if (ampm) {
    if (ampm === "PM" && hour < 12) {
      hour += 12;
    } else if (ampm === "AM" && hour === 12) {
      hour = 0;
    }
  }

  return hour + minute / 60;
}

export function getEffectiveJavaneseDate(input: WetonInput): Date {
  const { year, month, day } = parseBirthDate(input.birthDate);
  const civilDate = Date.UTC(year, month - 1, day);
  const afterBoundary = parseHour(input.birthTime) >= JAVANESE_DAY_BOUNDARY_HOUR;
  return new Date(civilDate + (afterBoundary ? DAY_MS : 0));
}

export function calculateWuku(effectiveDate: Date): WukuResult {
  const dayOffset = Math.floor((effectiveDate.getTime() - PAWUKON_EPOCH_UTC) / DAY_MS);
  const cycleDay = positiveModulo(dayOffset, 210);
  const index = Math.floor(cycleDay / 7) + 1;
  const [name, description] = WUKU_DATA[index - 1];
  return { name, index, description };
}

export function calculatePranataMangsa(effectiveDate: Date): PranataMangsaResult {
  const month = effectiveDate.getUTCMonth() + 1;
  const day = effectiveDate.getUTCDate();
  const key = month * 100 + day;
  let selected: (typeof PRANATA_MANGSA_DATA)[number] = PRANATA_MANGSA_DATA[6];

  for (const mangsa of PRANATA_MANGSA_DATA) {
    const startKey = mangsa.start[0] * 100 + mangsa.start[1];
    if (key >= startKey) selected = mangsa;
  }

  if (key < 204) selected = PRANATA_MANGSA_DATA[6];
  return { name: selected.name, description: selected.description };
}

export function calculateWeton(input: WetonInput): WetonBlueprint {
  const effectiveDate = getEffectiveJavaneseDate(input);
  const day = DAYS[effectiveDate.getUTCDay()];
  const dayOffset = Math.floor((effectiveDate.getTime() - PAWUKON_EPOCH_UTC) / DAY_MS);
  const pasaran = PASARAN_FROM_EPOCH[positiveModulo(dayOffset, 5)];
  const neptuDay = DAY_NEPTU[day];
  const neptuPasaran = PASARAN_NEPTU[pasaran];
  const totalNeptu = neptuDay + neptuPasaran;
  const wuku = calculateWuku(effectiveDate);
  const pranataMangsa = calculatePranataMangsa(effectiveDate);
  const dayMeaning = DAY_INTERPRETATIONS[day];
  const pasaranMeaning = PASARAN_INTERPRETATIONS[pasaran];
  const neptuMeaning = NEPTU_INTERPRETATIONS[totalNeptu];

  return {
    day,
    pasaran,
    weton: `${day} ${pasaran}`,
    neptuDay,
    neptuPasaran,
    totalNeptu,
    wuku,
    pranataMangsa,
    watak: `${day} membentuk dasar sifat yang ${dayMeaning.watak}, sedangkan ${pasaran} menghadirkan lapisan ${pasaranMeaning.watak.replace(/^membawa\s+/i, "")}. Total perpaduan ini menggambarkan pribadi yang ${neptuMeaning.watak}.`,
    strengths: [
      dayMeaning.strength,
      pasaranMeaning.strength,
      `Membawa pelajaran tentang ${wuku.description.charAt(0).toLowerCase()}${wuku.description.slice(1)}`,
      neptuMeaning.strength,
    ],
    challenges: [
      dayMeaning.challenge,
      pasaranMeaning.challenge,
      neptuMeaning.challenge,
    ],
    lifeMission: `${neptuMeaning.mission}. Arah ini dikuatkan oleh tema ${wuku.name} yang menekankan ${wuku.description.charAt(0).toLowerCase()}${wuku.description.slice(1)}`,
    relationshipStyle: pasaranMeaning.relationship,
    workStyle: `${dayMeaning.work}. Pengaruh ${wuku.name} mempertegas kecenderungan untuk ${wuku.description.charAt(0).toLowerCase()}${wuku.description.slice(1)}`,
    moneyStyle: pasaranMeaning.money,
  };
}

export function generateWetonSummary(weton: WetonBlueprint): string[] {
  return [
    `Kelahiranmu berada pada ${weton.weton}. Ritme ini memperlihatkan dasar pribadi yang tumbuh dari perpaduan sifat harian dan cara kamu merespons lingkungan terdekat. Gambaran umumnya terasa ${weton.watak.charAt(0).toLowerCase()}${weton.watak.slice(1)}`,
    `Kekuatan utamamu tampak pada kemampuan untuk ${weton.strengths.slice(0, 2).join(" serta ")}. Pada saat yang sama, ruang belajarmu muncul ketika kamu perlu ${weton.challenges.slice(0, 2).join(" dan ")}. Kombinasi ini menunjukkan pribadi yang bisa berkembang jauh ketika keseimbangan batin tetap dijaga.`,
    `Arah hidupmu cenderung bergerak melalui tema ${weton.wuku.name}, yang menonjolkan ${weton.wuku.description.charAt(0).toLowerCase()}${weton.wuku.description.slice(1)}. Dalam pekerjaan, kecenderungan ini biasanya terlihat saat kamu ${weton.workStyle.charAt(0).toLowerCase()}${weton.workStyle.slice(1)}`,
    `Dalam relasi, kamu cenderung ${weton.relationshipStyle.toLowerCase()}. Dalam urusan rezeki, pola yang terasa lebih kuat adalah bahwa ${weton.moneyStyle.toLowerCase()}. Keduanya menekankan pentingnya kejelasan sikap sekaligus kestabilan langkah.`,
    `Arah pertumbuhanmu adalah ${weton.lifeMission.charAt(0).toLowerCase()}${weton.lifeMission.slice(1)}. Jika dijalani dengan sadar, pola ini membantumu memakai kekuatan pribadi secara lebih matang, membumi, dan bermanfaat bagi hidupmu maupun orang-orang di sekitarmu.`,
  ];
}
