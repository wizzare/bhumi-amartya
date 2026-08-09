export type RawUser = Record<string, any> & { id?: string };

export type NormalizedUser = {
  uid: string;
  name: string;
  email: string;
  registeredAt: number;
  firstLoginAt: number;
  lastLoginAt: number;
  lastSeenAt: number;
  loginCount: number;
  sessionCount: number;
  totalSeconds: number;
  plan: string;
  accessUntil: number;
  subscriptionStatus: string;
  status: 'Active' | 'Cooling' | 'At Risk' | 'Dormant' | 'Never Active';
  city: string;
  birthCity: string;
  environmentCity: string;
  province: string;
  country: string;
  appVersion: string;
  buildNumber: string;
  raw: RawUser;
};

export function asTime(value: any): number {
  if (!value) return 0;
  if (typeof value === 'number') return value > 1e12 ? value : value * 1000;
  if (typeof value === 'string') {
    const n = Date.parse(value);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return 0;
}

export function cleanLocationLabel(value: any): string {
  const text = String(value || '').trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  if (['unknown', 'no data', 'n/a', 'null', 'undefined', '-', '—'].includes(lower)) return '';
  return text;
}

export function isDeletedOrArchived(raw: RawUser): boolean {
  const name = `${raw.fullName || ''} ${raw.displayName || ''}`.trim().toLowerCase();
  const email = String(raw.email || '').trim().toLowerCase();
  return raw.isDeleted === true || Boolean(raw.deletedAt) || raw.archived === true || email.includes('deleted') || name.includes('deleted account');
}

export function isInternalTester(raw: RawUser): boolean {
  const name = `${raw.fullName || ''} ${raw.displayName || ''}`.trim().toLowerCase();
  const email = String(raw.email || '').trim().toLowerCase();
  return raw.excludeFromAdminAnalytics === true || raw.isInternalTester === true || raw.isTest === true || raw.isTester === true || raw.role === 'test' || name.includes('qa delete') || /(^|[+._-])(test|dummy)([+._@-]|$)/i.test(email) || /\b(test|testing|dummy)\b/i.test(name);
}

export function isIncludedRealUser(raw: RawUser): boolean {
  const hasIdentity = Boolean(String(raw.email || '').trim() || String(raw.fullName || raw.displayName || '').trim());
  return hasIdentity && !isDeletedOrArchived(raw) && !isInternalTester(raw);
}

const ID_CITIES = ['jakarta','bandung','surabaya','yogyakarta','jogja','denpasar','bogor','bekasi','depok','tangerang','semarang','malang','solo','surakarta','medan','makassar','palembang','bali'];
const MY_CITIES = ['kuala lumpur','penang','pulau pinang','johor','johor bahru','selangor','shah alam','petaling jaya','malacca','melaka','ipoh','sabah','sarawak','kuching'];

export function inferProfileCountry(countryRaw: any, cityRaw: any, provinceRaw: any): string {
  const country = cleanLocationLabel(countryRaw);
  if (country) return country;
  const haystack = `${cityRaw || ''} ${provinceRaw || ''}`.toLowerCase();
  if (ID_CITIES.some((x) => haystack.includes(x))) return 'Indonesia';
  if (MY_CITIES.some((x) => haystack.includes(x))) return 'Malaysia';
  return 'Unknown';
}

export function resolveBirthCity(raw: RawUser): string {
  return cleanLocationLabel(
    raw.birthCity || raw.birthPlace || raw.placeOfBirth || raw.birthLocation?.city || raw.profile?.birthCity || raw.city
  );
}

export function resolveEnvironmentCity(raw: RawUser): string {
  return cleanLocationLabel(
    raw.lastEnvironmentCity ||
    raw.environmentCity ||
    raw.currentCity ||
    raw.locationCity ||
    raw.lastKnownCity ||
    raw.geoCity ||
    raw.currentLocation?.city ||
    raw.lastLocation?.city ||
    raw.location?.city ||
    raw.environmentContext?.city ||
    raw.environmentContext?.location?.city ||
    raw.environment?.city
  );
}

export function classifyAccess(raw: RawUser): string {
  const email = String(raw.email || '').toLowerCase();
  const role = String(raw.role || '').toLowerCase();
  const membership = String(raw.membershipType || raw.membership || raw.plan || '').toLowerCase();
  const subscription = String(raw.subscriptionStatus || '').toLowerCase();
  const badge = `${raw.testerBadge || ''} ${raw.badge || ''} ${raw.guardianBadge || ''}`.toLowerCase();
  const entitlementSource = String(raw.entitlement?.source || raw.accessSource || '').toLowerCase();
  const loginCount = Number(raw.participationMetrics?.loginCount ?? raw.loginCount ?? 0) || 0;

  const founder = email === 'wizzare@gmail.com' || role === 'founder' || badge.includes('founder');
  const inti = badge.includes('inti') || badge.includes('core_guardian');
  const alfa = badge.includes('alfa');
  const verifiedPaid = raw.billingVerified === true || Boolean(raw.purchaseToken) || entitlementSource.includes('google_play') || entitlementSource.includes('play_billing') || (raw.isPremium === true && membership.includes('premium') && !inti && !alfa);
  const trial = subscription.includes('trial') || membership.includes('trial') || (loginCount > 0 && loginCount <= 7 && raw.isPremium === true && !verifiedPaid && !inti && !alfa);
  const unknownLegacy = raw.isPremium === true && !verifiedPaid && !inti && !alfa && !trial && !founder;

  if (founder) return 'Founder';
  if (verifiedPaid) return 'Google Play Paid';
  if (inti) return 'Penjaga Inti';
  if (alfa) return 'Penjaga Alfa';
  if (trial) return 'Trial';
  if (unknownLegacy) return 'Unknown Legacy';
  return 'Free';
}

export function normalizeUser(uid: string, raw: RawUser): NormalizedUser {
  const pm = raw.participationMetrics || {};
  const registeredCandidates = [raw.createdAt, raw.registeredAt, raw.joinedAt, raw.firstLoginAt, pm.firstLoginAt].map(asTime).filter(Boolean);
  const registeredAt = registeredCandidates.length ? Math.min(...registeredCandidates) : 0;
  const firstLoginAt = asTime(pm.firstLoginAt || raw.firstLoginAt) || registeredAt;
  const lastLoginAt = Math.max(asTime(pm.lastLoginAt), asTime(raw.lastLoginAt), asTime(raw.lastLogin), asTime(pm.lastCheckInAt));
  const lastSeenAt = Math.max(asTime(raw.lastSeen), asTime(pm.lastSeen), lastLoginAt);
  const days = lastSeenAt ? (Date.now() - lastSeenAt) / 86400000 : Infinity;
  const status: NormalizedUser['status'] = !lastSeenAt ? 'Never Active' : days <= 2 ? 'Active' : days <= 6 ? 'Cooling' : days <= 13 ? 'At Risk' : 'Dormant';
  const birthCity = resolveBirthCity(raw);
  const environmentCity = resolveEnvironmentCity(raw);
  const province = cleanLocationLabel(raw.birthProvince || raw.province || raw.state) || 'Unknown';
  const country = inferProfileCountry(raw.birthCountry || raw.country, birthCity, province);
  return {
    uid,
    name: String(raw.fullName || raw.displayName || raw.name || 'Tanpa Nama'),
    email: String(raw.email || '').toLowerCase(),
    registeredAt,
    firstLoginAt,
    lastLoginAt,
    lastSeenAt,
    loginCount: Number(pm.loginCount ?? raw.loginCount ?? 0) || 0,
    sessionCount: Number(pm.sessionCount ?? raw.sessionCount ?? 0) || 0,
    totalSeconds: Number(pm.totalSeconds ?? raw.totalSeconds ?? 0) || 0,
    plan: classifyAccess(raw),
    accessUntil: Math.max(asTime(raw.accessUntil), asTime(raw.membershipExpiryDate), asTime(raw.trialEndsAt), asTime(raw.testerExpiresAt)),
    subscriptionStatus: String(raw.subscriptionStatus || raw.entitlement?.status || '—'),
    status,
    city: birthCity || 'Unknown',
    birthCity,
    environmentCity,
    province,
    country,
    appVersion: String(pm.appVersion || raw.appVersion || raw.versionName || '—'),
    buildNumber: String(pm.buildNumber || raw.buildNumber || raw.versionCode || '—'),
    raw,
  };
}

export function pct(part: number, total: number): number {
  return total ? Math.round((part / total) * 1000) / 10 : 0;
}

export function startOfToday(): number {
  const d = new Date(); d.setHours(0,0,0,0); return d.getTime();
}

export function formatDateTime(ms: number): string {
  if (!ms) return '—';
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(ms));
}

export function formatRelative(ms: number): string {
  if (!ms) return '—';
  const diff = Math.max(0, Date.now() - ms);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min}m lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
}
