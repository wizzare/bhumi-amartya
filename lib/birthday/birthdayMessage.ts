import { isEnlEdition } from "@/lib/config/edition";

export type BirthdayProfile = {
  uid: string;
  birthDate?: string | null;
  timezone?: string | null;
  displayName?: string | null;
  fullName?: string | null;
  language?: string | null;
};

export function isValidBirthDate(value?: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function localDateKey(now: Date, timezone?: string | null): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  }
}

export function birthdayYearKey(profile: BirthdayProfile, now = new Date()): string | null {
  if (!isValidBirthDate(profile.birthDate)) return null;
  const current = localDateKey(now, profile.timezone);
  const [, birthMonth, birthDay] = profile.birthDate.split('-');
  const [year, month, day] = current.split('-');
  const leapDayMatch = birthMonth === '02' && birthDay === '29' && month === '02' && day === '28' && !isLeapYear(Number(year));
  return birthMonth === month && (birthDay === day || leapDayMatch) ? year : null;
}

export function isLeapYear(year: number): boolean { return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0); }

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function buildBirthdayMessage(profile: BirthdayProfile, year: string, languageOverride?: "id" | "en") {
  const isEn = isEnlEdition();
  const defaultName = isEn ? "Friend" : "Sahabat Bhumi";
  const firstName = String(profile.displayName || profile.fullName || defaultName).trim().split(/\s+/)[0];
  const birthYear = Number(profile.birthDate?.slice(0, 4));
  const age = Number.isFinite(birthYear) ? Math.max(0, Number(year) - birthYear) : null;

  if (isEn) {
    const ageOrdinal = age ? getOrdinal(age) : "";
    return {
      id: `birthday:${profile.uid}:${year}`,
      title: `Happy Birthday, ${firstName}`,
      content: [
        `Today marks a new cycle in your journey${age ? `—your ${ageOrdinal} year` : ""}.`,
        "Bhumi wishes you a happy birthday, and hopes this new year brings peace, courage, health, and expansive space to know yourself even more deeply.",
        "Thank you for being part of the Bhumi Amartya journey.",
        "Warm hugs from Bhumi.",
      ].join("\n\n"),
    };
  }

  return {
    id: `birthday:${profile.uid}:${year}`,
    title: `Selamat Ulang Tahun, ${firstName}`,
    content: [
      `Hari ini adalah satu putaran baru dalam perjalanan hidupmu${age ? ` yang ke-${age}` : ''}.`,
      'Bhumi mengucapkan selamat ulang tahun dan mendoakan agar usia yang baru membawa ketenangan, keberanian, kesehatan, serta ruang yang semakin luas untuk mengenali dirimu.',
      'Terima kasih telah menjadi bagian dari perjalanan Bhumi Amartya.',
      'Peluk hangat dari Bhumi.',
    ].join('\n\n'),
  };
}
