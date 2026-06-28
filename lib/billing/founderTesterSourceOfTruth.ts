export type FounderTesterBadge =
  | "Founder"
  | "Penjaga Bhumi Inti"
  | "Penjaga Bhumi Alfa"
  | "Penjaga Bhumi";

export type FounderTesterMembership =
  | "LIFETIME_PREMIUM"
  | "PREMIUM_2_MONTHS"
  | "PREMIUM_1_MONTH"
  | "REGULAR_TRIAL";

export type FounderTesterRecord = {
  name: string;
  badge: FounderTesterBadge;
  membership: FounderTesterMembership;
  premiumMonths: number | null;
  trialDays: number | null;
};

export const DEFAULT_USER_POLICY_EFFECTIVE_AT = new Date("2026-07-01T00:00:00+07:00");

export const FOUNDER_TESTER_SOURCE_OF_TRUTH: FounderTesterRecord[] = [
  { name: "Widhi Wedhaswara", badge: "Founder", membership: "LIFETIME_PREMIUM", premiumMonths: null, trialDays: null },
  { name: "Kahfi Fauzil Adhim", badge: "Founder", membership: "LIFETIME_PREMIUM", premiumMonths: null, trialDays: null },

  { name: "diah shofina izzati", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Audri Imelda", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Nisa Maulidyani", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Widya Gustina", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Ning Tulungagung", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Lyra Aulia Ratmaji", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Eva syana", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Natalia Dewi Setyaningsih", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "nurwidia astutik", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Dwi Apriani M", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Azian Meirdania", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Trisia Fiderosa", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "rizka khairunnisa", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Duhita Rossa", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Neysia Rahma Anggraeni", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Widya Amalia", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Yudi Wahyudianto", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "yuni purwanti", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Alfina Riska Safitri", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Sheina Khazmalia", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "vivi aina", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Lutfiah Aulia Nisah", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "umie ayiss", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Bunga", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Ahmad Khudhori", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Henny Hendrianti", badge: "Penjaga Bhumi Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },

  { name: "Dwi mei", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "nenty septi sugiartini", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Nanda Viandra", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "uci", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Aulia Puti Novandra", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Biyas Tira Rahmawati", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Rahayu Wulansari", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "fahim sadri", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "aku lelyana", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Tyagita Syahdilla", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Pita Martina", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Resi Meliyanti", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Anis Kurli", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Riska Yulianti", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Reny Susanti", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Firna Firdaus", badge: "Penjaga Bhumi Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },

  { name: "PURBA DANIEL HALOMOAN SINAMBELA", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "dian puspa dewi", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "MJ Jannah", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "Ayeshia Annisa Dinna", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "Haninatul Izzah", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "Indriyani Lesles", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "Bayu Putra Nusantara", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "Neni Ananda", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "Nuraini", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "Tanti Sulastri", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
  { name: "Siti Nurhaliza", badge: "Penjaga Bhumi", membership: "REGULAR_TRIAL", premiumMonths: null, trialDays: 3 },
];

function normalizeTesterName(value?: string | null): string {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function getFounderTesterRecord(input: {
  fullName?: string | null;
  displayName?: string | null;
}): FounderTesterRecord | null {
  const candidates = [
    normalizeTesterName(input.fullName),
    normalizeTesterName(input.displayName),
  ].filter(Boolean);

  return FOUNDER_TESTER_SOURCE_OF_TRUTH.find((record) =>
    candidates.includes(normalizeTesterName(record.name))
  ) ?? null;
}

export function toPolicyDate(value?: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  return null;
}

export function shouldApplyDefaultRegistrationPolicy(createdAt?: unknown): boolean {
  const createdDate = toPolicyDate(createdAt);
  return Boolean(createdDate && createdDate.getTime() >= DEFAULT_USER_POLICY_EFFECTIVE_AT.getTime());
}
