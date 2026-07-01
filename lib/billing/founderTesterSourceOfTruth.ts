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
  email: string;
  uid: string;
  registeredAt: string;
  activeDays: number;
  badge: FounderTesterBadge;
  sourceBadge: "Founder" | "Inti" | "Alfa" | "Penjaga Bhumi";
  membership: FounderTesterMembership;
  premiumMonths: number | null;
  trialDays: number | null;
};

export const DEFAULT_USER_POLICY_EFFECTIVE_AT = new Date("2026-07-01T00:00:00+07:00");
const POLICY_TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000;

export const FOUNDER_TESTER_SOURCE_OF_TRUTH: FounderTesterRecord[] = [
  { name: "Widhi Wedhaswara", email: "wizzare@gmail.com", uid: "vybyLLFpBxhF1L1m9liGHm5chgG2", registeredAt: "2026-06-09", activeDays: 8, badge: "Founder", sourceBadge: "Founder", membership: "LIFETIME_PREMIUM", premiumMonths: null, trialDays: null },
  { name: "diah shofina izzati", email: "diahshofina08@gmail.com", uid: "U5B09RxB5ydBzGU07RCC9NJp8o72", registeredAt: "2026-06-16", activeDays: 10, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Dwi mei", email: "meydwikumalasarii@gmail.com", uid: "zgxqB1Z3eSbbNMv8lnYEjhUr9QF2", registeredAt: "2026-06-24", activeDays: 2, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "nenty septi sugiartini", email: "sugiartininenty@gmail.com", uid: "3Nb7mVkr1jUFQgECd7PJelMUDN93", registeredAt: "2026-06-22", activeDays: 5, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Audri Imelda", email: "audryimld15@gmail.com", uid: "7KNsLv1vnqaXD4qLHNPs9YG51Hr2", registeredAt: "2026-06-18", activeDays: 11, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Nanda Viandra", email: "nandaviandra76@gmail.com", uid: "3ADL5ir0XVPXyUGY4N2O4bKH1823", registeredAt: "2026-06-21", activeDays: 5, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Nisa Maulidyani", email: "nisamaulidyani1@gmail.com", uid: "rdxahaSM2jYG3ibckmcfRDTaHJv1", registeredAt: "2026-06-21", activeDays: 9, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "uci", email: "susiastuti061@gmail.com", uid: "72IpktUlpySUMvMi5OAnMURHeIX2", registeredAt: "2026-06-21", activeDays: 5, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Aulia Puti Novandra", email: "apnovandra@gmail.com", uid: "vlqHITSFnleIu94MyyYWIZG7sK02", registeredAt: "2026-06-19", activeDays: 5, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Widya Gustina", email: "whedhea37@gmail.com", uid: "ydKZoZuehlewy93U3vrK8abIHS42", registeredAt: "2026-06-17", activeDays: 7, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Ning Tulungagung", email: "nuningeka10@gmail.com", uid: "gTWWDr2Fz5Mg3M9ZJvtBY1pEUD42", registeredAt: "2026-06-16", activeDays: 7, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Lyra Aulia Ratmaji", email: "lyraratmaji2612@gmail.com", uid: "QCvgExSjejRA6toC5bzz1T45ruF2", registeredAt: "2026-06-22", activeDays: 8, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Eva syana", email: "eyana0202@gmail.com", uid: "iTZDbTRFFQRCKLzW4XmeNEl0Rel1", registeredAt: "2026-06-13", activeDays: 10, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Natalia Dewi Setyaningsih", email: "aveyria2412@gmail.com", uid: "PkJZuRHBfCV5kxcu1LpAFmUIJJo2", registeredAt: "2026-06-16", activeDays: 12, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "nurwidia astutik", email: "nurwidia.astutik@gmail.com", uid: "ppFbXEcRQIbUpBCgXcWuCAJke0m1", registeredAt: "2026-06-16", activeDays: 9, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Dwi Apriani M", email: "dwiaprianim358@gmail.com", uid: "MB0tNE8eM8adgpB87i3KyTupIQt1", registeredAt: "2026-06-17", activeDays: 10, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Biyas Tira Rahmawati", email: "tirarahma5@gmail.com", uid: "4yv3ou84A2R8R3MASd9EdhN2PBU2", registeredAt: "2026-06-24", activeDays: 2, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Azian Meirdania", email: "meirdaniaazian@gmail.com", uid: "fk4NDdeTvnct7idrI7qTDfE956r2", registeredAt: "2026-06-16", activeDays: 12, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Rahayu Wulansari", email: "rahayuwulansari2525@gmail.com", uid: "45SQN19NYYbEtaGnhtqoroLDBQ52", registeredAt: "2026-06-23", activeDays: 1, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "fahim sadri", email: "fahim.utmic@gmail.com", uid: "6AeThtV46VZMYapAGScjQvn2y373", registeredAt: "2026-06-22", activeDays: 2, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "aku lelyana", email: "akylelyana@gmail.com", uid: "iyBryQNKWaXcyhfp5Lg2YvRay6a2", registeredAt: "2026-06-23", activeDays: 5, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Kahfi Fauzil Adhim", email: "kahfifa46@gmail.com", uid: "KYGd0K4iOzdwK5DERGzRRkghFco1", registeredAt: "2026-06-17", activeDays: 5, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Trisia Fiderosa", email: "trisiafiderosa17@gmail.com", uid: "REJXeP5BiAUodUNv3hyEMsZHINk1", registeredAt: "2026-06-21", activeDays: 12, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Tyagita Syahdilla", email: "tyagitasyahdilla46@gmail.com", uid: "VocGyUoukDPBLtk00J7QzDrWHOG3", registeredAt: "2026-06-18", activeDays: 2, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "rizka khairunnisa", email: "rizkakhairunnisa408@gmail.com", uid: "dtNi3Qy2DxcvfQVmAQhKF2Ha9eu2", registeredAt: "2026-06-21", activeDays: 7, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Pita Martina", email: "ruangra54@gmail.com", uid: "uASPHCJSp0P60g9YtcwFxmJnxOc2", registeredAt: "2026-06-22", activeDays: 6, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Duhita Rossa", email: "duhitarossa@gmail.com", uid: "npvsIGyXFhWO48BkIect8Z0qldJ2", registeredAt: "2026-06-21", activeDays: 7, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Neysia Rahma Anggraeni", email: "rahmaneysia@gmail.com", uid: "Ua7UyGR4lMOnPt8cAcSAnvST9VH3", registeredAt: "2026-06-10", activeDays: 11, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Resi Meliyanti", email: "resimeliyanti2@gmail.com", uid: "Ngmcj3WrLkMTbUmS6hQigZaf3IB3", registeredAt: "2026-06-22", activeDays: 2, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Widya Amalia", email: "widyaamalia48@gmail.com", uid: "Xd7KwAx2uPPlpWxIF7J22ub0SYI2", registeredAt: "2026-06-22", activeDays: 3, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Yudi Wahyudianto", email: "yudiwahyudianto77@gmail.com", uid: "ZjI0Rk0MnbQJubUyhJA6XTotT9u1", registeredAt: "2026-06-22", activeDays: 7, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "yuni purwanti", email: "yunip2948@gmail.com", uid: "rj6pO3xAhsPAsbyulrv4zMLWaLS2", registeredAt: "2026-06-09", activeDays: 8, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Alfina Riska Safitri", email: "alfinarizka637@gmail.com", uid: "EoYJzkLSIiagjgD71C6EORPgiky1", registeredAt: "2026-06-13", activeDays: 6, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Sheina Khazmalia", email: "alhadistrw@gmail.com", uid: "6tSRtruQfnUBxTMtD8btfHpAHxh1", registeredAt: "2026-06-16", activeDays: 7, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "vivi aina", email: "viviainadevii@gmail.com", uid: "b5UfVHwyUqYjksCdQycAA1Tv1w42", registeredAt: "2026-06-21", activeDays: 10, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Anis Kurli", email: "aniskurli2808@gmail.com", uid: "y7he1fzSi4S6tejUhdBasVcj1aA2", registeredAt: "2026-06-21", activeDays: 4, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Lutfiah Aulia Nisah", email: "lutfiahaulianisa22@gmail.com", uid: "HTRMAb099uPVQQSrj1qrWd86Yz83", registeredAt: "2026-06-17", activeDays: 5, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "umie ayiss", email: "umieayiss@gmail.com", uid: "STrtEslqotdqPEs8kfRZRQH2vyE2", registeredAt: "2026-06-20", activeDays: 7, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Riska Yulianti", email: "yuliantiriska360@gmail.com", uid: "f0uIqse1tNRKV4r5WYrwfoel56i2", registeredAt: "2026-06-21", activeDays: 4, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Reny Susanti", email: "renyaldhitya@gmail.com", uid: "qExCQCQac2OnErUFylj3OKFMg5j2", registeredAt: "2026-06-21", activeDays: 6, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Bunga", email: "zeroaka07@gmail.com", uid: "ETMNr0gfTjY7q2BYO86eGmiOWe03", registeredAt: "2026-06-16", activeDays: 6, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "Firna Firdaus", email: "wedancewiththetime@gmail.com", uid: "vHgWyMptwxW01NO9r2hqLO9Fm1q1", registeredAt: "2026-06-01", activeDays: 1, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "PURBA DANIEL HALOMOAN SINAMBELA", email: "dtiffano@gmail.com", uid: "n4Vd7g7X97QiWnC6E5z5r96DvKy1", registeredAt: "2026-06-20", activeDays: 2, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Ahmad Khudhori", email: "khudhori28@gmail.com", uid: "XTxWNiTNeHY4Qhwogif5fps3HqD3", registeredAt: "2026-06-19", activeDays: 3, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "dian puspa dewi", email: "dianpuspadewi1987@gmail.com", uid: "iqeQdvHomhbY0oxo4SZ4R19ZC2M2", registeredAt: "2026-06-20", activeDays: 1, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Henny Hendrianti", email: "hendrianti99@gmail.com", uid: "EG96uk7iQbVGcKSkXGMxZEKwASD3", registeredAt: "2026-06-18", activeDays: 6, badge: "Penjaga Bhumi Inti", sourceBadge: "Inti", membership: "PREMIUM_2_MONTHS", premiumMonths: 2, trialDays: null },
  { name: "MJ Jannah", email: "mj84japara@gmail.com", uid: "YogfEXOqmINqIcgqP6kLCPwTU252", registeredAt: "2026-06-13", activeDays: 3, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Ayeshia Annisa Dinna", email: "ayeshiaad@gmail.com", uid: "QWFSzoGdEQQkAoSWFyfM3TsvTA02", registeredAt: "2026-06-16", activeDays: 2, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Lyra Aulia ratmaji", email: "lyraauliaratmaji2025@gmail.com", uid: "afINgOWYMkSOryMR3NfitwgfK5c2", registeredAt: "2026-06-17", activeDays: 1, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Widya Amalia", email: "wedhaswarawidhi@gmail.com", uid: "kWiivJI1d7Wnwfrt3SfAUWiYv222", registeredAt: "2026-06-17", activeDays: 4, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Haninatul Izzah", email: "han.izzah.942@gmail.com", uid: "U9hvfWRW5eacyuJ3RPzZL5aDaok2", registeredAt: "2026-06-13", activeDays: 3, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Indriyani Lesles", email: "indriyanilesles@gmail.com", uid: "U5aiIabcWoQoEqVGHiqS7a24eW23", registeredAt: "2026-06-15", activeDays: 2, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
  { name: "Bayu Putra Nusantara", email: "aura2306@gmail.com", uid: "fo6iRaq2pTZn3bspcCSsByo8hEA2", registeredAt: "2026-06-12", activeDays: 2, badge: "Penjaga Bhumi Alfa", sourceBadge: "Alfa", membership: "PREMIUM_1_MONTH", premiumMonths: 1, trialDays: null },
];

export type ServerOwnedAccessGrant = {
  badge: FounderTesterBadge;
  plan: "lifetime_free" | "free_access" | "free_trial";
  membership: FounderTesterMembership;
  membershipType: "LIFETIME" | "PREMIUM" | "TRIAL";
  accessStart: string | null;
  accessUntil: string | null;
  trialStartedAt?: string;
  trialEndsAt?: string;
  subscriptionStatus: "active" | "trialing";
  isPremium: boolean;
  entitlements: {
    dashboard: true;
    premiumFeatures: boolean;
  };
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime() + POLICY_TIMEZONE_OFFSET_MS);
  next.setUTCDate(next.getUTCDate() + days);
  return new Date(next.getTime() - POLICY_TIMEZONE_OFFSET_MS);
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getTime() + POLICY_TIMEZONE_OFFSET_MS);
  next.setUTCMonth(next.getUTCMonth() + months);
  return new Date(next.getTime() - POLICY_TIMEZONE_OFFSET_MS);
}

function toAccessDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  return new Date(`${value}T00:00:00.000Z`);
}

function laterDate(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}

export function buildServerOwnedAccessGrant(
  record: FounderTesterRecord,
  now: Date = new Date(),
): ServerOwnedAccessGrant {
  if (record.badge === "Founder") {
    return {
      badge: "Founder",
      plan: "lifetime_free",
      membership: "LIFETIME_PREMIUM",
      membershipType: "LIFETIME",
      accessStart: DEFAULT_USER_POLICY_EFFECTIVE_AT.toISOString(),
      accessUntil: null,
      subscriptionStatus: "active",
      isPremium: true,
      entitlements: { dashboard: true, premiumFeatures: true },
    };
  }

  const registrationDate = toAccessDate(record.registeredAt || now);
  const baseDate = record.trialDays
    ? laterDate(registrationDate, DEFAULT_USER_POLICY_EFFECTIVE_AT)
    : DEFAULT_USER_POLICY_EFFECTIVE_AT;
  const accessUntil = record.premiumMonths
    ? addMonths(baseDate, record.premiumMonths)
    : addDays(baseDate, record.trialDays ?? 3);

  return {
    badge: record.badge,
    plan: record.trialDays ? "free_trial" : "free_access",
    membership: record.membership,
    membershipType: record.trialDays ? "TRIAL" : "PREMIUM",
    accessStart: baseDate.toISOString(),
    accessUntil: accessUntil.toISOString(),
    trialStartedAt: record.trialDays ? baseDate.toISOString() : undefined,
    trialEndsAt: record.trialDays ? accessUntil.toISOString() : undefined,
    subscriptionStatus: record.trialDays ? "trialing" : "active",
    isPremium: true,
    entitlements: { dashboard: true, premiumFeatures: true },
  };
}

export function buildDefaultNewUserAccessGrant(
  registeredAt: string | Date,
): ServerOwnedAccessGrant {
  const registrationDate = toAccessDate(registeredAt);
  const start = laterDate(registrationDate, DEFAULT_USER_POLICY_EFFECTIVE_AT);
  const end = addDays(start, 3);
  return {
    badge: "Penjaga Bhumi",
    plan: "free_trial",
    membership: "REGULAR_TRIAL",
    membershipType: "TRIAL",
    accessStart: start.toISOString(),
    accessUntil: end.toISOString(),
    trialStartedAt: start.toISOString(),
    trialEndsAt: end.toISOString(),
    subscriptionStatus: "trialing",
    isPremium: true,
    entitlements: { dashboard: true, premiumFeatures: true },
  };
}

function normalizeTesterName(value?: string | null): string {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeEmail(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

export function getFounderTesterRecord(input: {
  uid?: string | null;
  email?: string | null;
  fullName?: string | null;
  displayName?: string | null;
}): FounderTesterRecord | null {
  const uid = (input.uid || "").trim();
  const email = normalizeEmail(input.email);
  const candidates = [
    normalizeTesterName(input.fullName),
    normalizeTesterName(input.displayName),
  ].filter(Boolean);

  return FOUNDER_TESTER_SOURCE_OF_TRUTH.find((record) => {
    if (uid && record.uid === uid) return true;
    if (email && record.email === email) return true;
    return candidates.includes(normalizeTesterName(record.name));
  }) ?? null;
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
