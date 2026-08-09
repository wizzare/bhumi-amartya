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

const INTI_CANONICAL_START = Date.parse('2026-06-29T00:00:00+07:00');
const INTI_CANONICAL_EXPIRY = Date.parse('2026-08-30T00:00:00+07:00');
const ALFA_CANONICAL_START = Date.parse('2026-06-29T00:00:00+07:00');
const ALFA_CANONICAL_EXPIRY = Date.parse('2026-07-30T00:00:00+07:00');
const GENERAL_TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

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

function maxTime(...values: any[]): number {
  return Math.max(0, ...values.map(asTime));
}

function rawRegisteredAt(raw: RawUser): number {
  const pm = raw.participationMetrics || {};
  const values = [raw.createdAt, raw.registeredAt, raw.joinedAt, raw.firstLoginAt, pm.firstLoginAt]
    .map(asTime)
    .filter(Boolean);
  return values.length ? Math.min(...values) : 0;
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

function badgeKind(raw: RawUser): 'inti' | 'alfa' | '' {
  const badge = `${raw.testerBadge || ''} ${raw.badge || ''} ${raw.guardianBadge || ''} ${raw.guardianRole || ''}`.toLowerCase();
  if (badge.includes('inti') || badge.includes('core_guardian')) return 'inti';
  if (badge.includes('alfa')) return 'alfa';
  return '';
}

function entitlementSource(raw: RawUser): string {
  return `${raw.entitlement?.source || ''} ${raw.accessSource || ''} ${raw.sourceBadge || ''}`.toLowerCase();
}

function resolveGrantWindow(raw: RawUser, kind: 'inti' | 'alfa') {
  const source = entitlementSource(raw);
  const dedicatedExpiry = maxTime(raw.testerExpiresAt, raw.grantExpiresAt, raw.guardianExpiresAt);
  const dedicatedStart = maxTime(raw.grantStartsAt, raw.accessStart, raw.testerStartsAt);
  const sourceExplicitlyGrant = source.includes('grant') || source.includes('tester') || source.includes('guardian') || source.includes('community');
  const sourceExpiry = sourceExplicitlyGrant ? maxTime(raw.accessUntil, raw.membershipExpiryDate) : 0;
  const sourceStart = sourceExplicitlyGrant ? maxTime(raw.accessStart, raw.grantStartsAt) : 0;

  if (kind === 'inti') {
    return {
      start: dedicatedStart || sourceStart || INTI_CANONICAL_START,
      expiry: dedicatedExpiry || sourceExpiry || INTI_CANONICAL_EXPIRY,
    };
  }

  return {
    start: dedicatedStart || sourceStart || ALFA_CANONICAL_START,
    expiry: dedicatedExpiry || sourceExpiry || ALFA_CANONICAL_EXPIRY,
  };
}

function hasVerifiedPaidProof(raw: RawUser): boolean {
  const source = entitlementSource(raw);
  return raw.billingVerified === true ||
    Boolean(raw.purchaseToken) ||
    Boolean(raw.purchaseTokenHash) ||
    source.includes('google_play') ||
    source.includes('play_billing') ||
    source.includes('billing_verifier');
}

function paidExpiry(raw: RawUser): number {
  return maxTime(
    raw.paidThrough,
    raw.gracePeriodUntil,
    raw.entitlement?.accessUntil,
    raw.entitlement?.expiresAt,
    raw.membershipExpiryDate,
    raw.accessUntil,
  );
}

function trialExpiry(raw: RawUser): number {
  const explicit = maxTime(raw.trialEndsAt, raw.entitlement?.trialEndsAt);
  if (explicit) return explicit;
  const registered = rawRegisteredAt(raw);
  return registered ? registered + GENERAL_TRIAL_MS : 0;
}

export function classifyAccess(raw: RawUser): string {
  const now = Date.now();
  const email = String(raw.email || '').toLowerCase();
  const role = String(raw.role || '').toLowerCase();
  const membership = String(raw.membershipType || raw.membership || raw.plan || '').toLowerCase();
  const subscription = String(raw.subscriptionStatus || raw.entitlement?.status || '').toLowerCase();
  const badge = `${raw.testerBadge || ''} ${raw.badge || ''} ${raw.guardianBadge || ''}`.toLowerCase();
  const kind = badgeKind(raw);

  const founder = email === 'wizzare@gmail.com' || role === 'founder' || badge.includes('founder');
  if (founder) return 'Founder';

  let expiredGrant = false;
  if (kind) {
    const grant = resolveGrantWindow(raw, kind);
    const active = grant.expiry > now && (!grant.start || grant.start <= now);
    if (active) return kind === 'inti' ? 'Penjaga Inti' : 'Penjaga Alfa';
    expiredGrant = grant.expiry > 0 && grant.expiry <= now;
  }

  const paidProof = hasVerifiedPaidProof(raw);
  const pendingPaid = paidProof && (
    subscription.includes('pending') ||
    String(raw.billingStatus || '').toLowerCase().includes('pending') ||
    String(raw.purchaseState || '').toLowerCase().includes('pending')
  );
  const paidUntil = paidExpiry(raw);
  if (paidProof && !pendingPaid && paidUntil > now) return 'Google Play Paid';

  const explicitTrial = subscription.includes('trial') || membership.includes('trial');
  const generalTrialUntil = trialExpiry(raw);
  if (!paidProof && !kind && generalTrialUntil > now) return 'Trial';
  if (explicitTrial && generalTrialUntil > now) return 'Trial';

  if (pendingPaid) return 'Pending Verification';
  if (expiredGrant) return 'Expired Grant';
  if (paidProof && paidUntil > 0 && paidUntil <= now) return 'Expired Paid';
  if (paidProof && !paidUntil) return 'Data Incomplete';

  const unverifiedPremium = raw.isPremium === true || membership.includes('premium');
  if (unverifiedPremium) return 'Data Incomplete';

  return 'Free';
}

export function resolveAccessUntil(raw: RawUser, plan: string): number {
  const kind = badgeKind(raw);
  if (plan === 'Founder') return 0;
  if ((plan === 'Penjaga Inti' || plan === 'Penjaga Alfa' || plan === 'Expired Grant') && kind) {
    return resolveGrantWindow(raw, kind).expiry;
  }
  if (plan === 'Google Play Paid' || plan === 'Expired Paid' || plan === 'Pending Verification' || plan === 'Data Incomplete') {
    return paidExpiry(raw) || maxTime(raw.accessUntil, raw.membershipExpiryDate);
  }
  if (plan === 'Trial') return trialExpiry(raw);
  return 0;
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
  const plan = classifyAccess(raw);
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
    plan,
    accessUntil: resolveAccessUntil(raw, plan),
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
