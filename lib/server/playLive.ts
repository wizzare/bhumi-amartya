import { inflateRawSync } from 'node:zlib';
import { playCountryHistory, playCountryLatest, playSnapshot } from '@/lib/playSnapshot';
import { getGoogleAccessToken, googlePlayCredentialStatus } from '@/lib/server/googleServiceAccount';

const PACKAGE_NAME = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.bhumiamartya.app';
const REPORT_BUCKET = process.env.GOOGLE_PLAY_REPORT_BUCKET || 'pubsite_prod_4753825950500775050';

type CsvRow = Record<string, string>;
type CountryRow = { country: string; users: number; pct: number };
type HistoryRow = { date: string; total: number; Indonesia?: number };
type RevenueSource = 'earnings' | 'estimated_sales';
type RevenueData = { amount: number; currency: string; month: string; source: RevenueSource };

export type PlayDashboardData = {
  mode: 'live' | 'partial' | 'snapshot';
  fetchedAt: number;
  dataDate: string;
  overview: {
    installs: number; activeDevices: number; audience: number; firstOpens: number;
    dau: number; mau: number; revenueUsd: number; revenueCurrency: string; revenuePeriod: string; revenueSource: RevenueSource | 'snapshot'; rating: number;
    crashRate: number | null; anrRate: number | null;
  };
  acquisition: {
    storeVisitorsAvg: number; storeAcquisitionsAvg: number; storeConversion: number;
    userAcquisitionsAvg: number; userLossAvg: number;
  };
  countries: CountryRow[];
  history: HistoryRow[];
  liveFields: string[];
  snapshotFields: string[];
  sources: { reports: boolean; financial: boolean; vitals: boolean; reportBucketConfigured: boolean; serviceAccountConfigured: boolean };
  warnings: string[];
};

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, '').trim();
}

function parseCsv(text: string): CsvRow[] {
  const source = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).filter((r) => r.some((v) => v.trim())).map((r) => Object.fromEntries(headers.map((h, index) => [h, String(r[index] || '').trim()])));
}

function decodeReport(input: ArrayBuffer | Uint8Array) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const utf16 = bytes.length >= 2 && ((bytes[0] === 0xff && bytes[1] === 0xfe) || bytes.filter((_, i) => i % 2 === 1 && bytes[i] === 0).length > Math.min(20, bytes.length / 8));
  return new TextDecoder(utf16 ? 'utf-16le' : 'utf-8').decode(bytes).replace(/^\uFEFF/, '');
}

function num(value: unknown) {
  const parsed = Number(String(value ?? '').replace(/[%,$]/g, '').replace(/\s/g, '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function field(row: CsvRow, names: string[]) {
  for (const name of names) {
    if (row[name] !== undefined) return row[name];
    const found = Object.keys(row).find((key) => key.toLowerCase() === name.toLowerCase());
    if (found) return row[found];
  }
  return '';
}

function sum(rows: CsvRow[], names: string[]) {
  return rows.reduce((total, row) => total + num(field(row, names)), 0);
}

function monthKeys(count = 2) {
  const result: string[] = [];
  const d = new Date();
  for (let i = 0; i < count; i += 1) {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    result.push(`${x.getUTCFullYear()}${String(x.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

function reportBucket() {
  return String(REPORT_BUCKET).trim().replace(/^gs:\/\//, '').replace(/\/$/, '');
}

async function fetchGcsBytes(token: string, objectName: string, errorCode = 'GCS_REPORT') {
  const bucket = reportBucket();
  if (!bucket) return null;
  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectName)}?alt=media`;
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).replace(/\s+/g, ' ').trim();
    throw new Error(`${errorCode}_${response.status}${detail ? `: ${detail.slice(0, 320)}` : ''}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function fetchGcsObject(token: string, objectName: string) {
  const bytes = await fetchGcsBytes(token, objectName);
  return bytes ? decodeReport(bytes) : null;
}

async function latestMonthlyReport(token: string, makeName: (month: string) => string) {
  for (const month of monthKeys()) {
    const text = await fetchGcsObject(token, makeName(month));
    if (text) return parseCsv(text);
  }
  return [];
}

function unzipFirstCsv(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const minEocd = Math.max(0, bytes.byteLength - 65557);
  let eocd = -1;
  for (let i = bytes.byteLength - 22; i >= minEocd; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('PLAY_FINANCIAL_ZIP_INVALID');

  const centralSize = view.getUint32(eocd + 12, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  const centralEnd = Math.min(bytes.byteLength, centralOffset + centralSize);
  const decoder = new TextDecoder('utf-8');

  for (let p = centralOffset; p + 46 <= centralEnd;) {
    if (view.getUint32(p, true) !== 0x02014b50) break;
    const compression = view.getUint16(p + 10, true);
    const compressedSize = view.getUint32(p + 20, true);
    const nameLength = view.getUint16(p + 28, true);
    const extraLength = view.getUint16(p + 30, true);
    const commentLength = view.getUint16(p + 32, true);
    const localOffset = view.getUint32(p + 42, true);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLength));

    if (name.toLowerCase().endsWith('.csv')) {
      if (localOffset + 30 > bytes.byteLength || view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('PLAY_FINANCIAL_ZIP_ENTRY_INVALID');
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const dataEnd = dataStart + compressedSize;
      if (dataEnd > bytes.byteLength) throw new Error('PLAY_FINANCIAL_ZIP_ENTRY_TRUNCATED');
      const compressed = bytes.subarray(dataStart, dataEnd);
      if (compression === 0) return decodeReport(compressed);
      if (compression === 8) return decodeReport(inflateRawSync(compressed));
      throw new Error(`PLAY_FINANCIAL_ZIP_COMPRESSION_${compression}`);
    }
    p += 46 + nameLength + extraLength + commentLength;
  }
  return null;
}

async function latestEarningsReport(token: string) {
  for (const month of monthKeys(3)) {
    const bytes = await fetchGcsBytes(token, `earnings/earnings_${month}.zip`, 'GCS_FINANCIAL');
    if (!bytes) continue;
    const text = unzipFirstCsv(bytes);
    if (text) return { rows: parseCsv(text), month };
  }
  return null;
}

async function latestSalesReport(token: string) {
  for (const month of monthKeys(2)) {
    const bytes = await fetchGcsBytes(token, `sales/salesreport_${month}.zip`, 'GCS_SALES');
    if (!bytes) continue;
    const text = unzipFirstCsv(bytes);
    if (text) return { rows: parseCsv(text), month };
  }
  return null;
}

function earningsMetrics(rows: CsvRow[], month: string): RevenueData | null {
  const appRows = rows.filter((row) => field(row, ['Package ID']).trim() === PACKAGE_NAME);
  const currencyTotals = new Map<string, number>();
  appRows.forEach((row) => {
    const transactionType = field(row, ['Transaction Type']).trim().toLowerCase();
    if (transactionType !== 'charge' && transactionType !== 'charge refund') return;
    const currency = field(row, ['Merchant Currency']).trim().toUpperCase();
    if (!currency) return;
    const amount = num(field(row, ['Amount (Merchant Currency)']));
    currencyTotals.set(currency, (currencyTotals.get(currency) || 0) + amount);
  });

  const nonEmpty = [...currencyTotals.entries()].filter(([, amount]) => Number.isFinite(amount));
  if (nonEmpty.length !== 1) return null;
  const [currency, amount] = nonEmpty[0];
  return { amount: Math.round(amount * 100) / 100, currency, month, source: 'earnings' };
}

function salesMetrics(rows: CsvRow[], month: string): RevenueData | null {
  const appRows = rows.filter((row) => field(row, ['Package ID']).trim() === PACKAGE_NAME);
  const currencyTotals = new Map<string, number>();
  appRows.forEach((row) => {
    const financialStatus = field(row, ['Financial Status']).trim().toLowerCase();
    const isCharge = financialStatus === 'charged';
    const isRefund = financialStatus === 'refund' || financialStatus === 'partial refund' || financialStatus.includes('refund');
    if (!isCharge && !isRefund) return;
    const currency = field(row, ['Currency of Sale', 'Sale Currency']).trim().toUpperCase();
    if (!currency) return;
    const rawAmount = Math.abs(num(field(row, ['Charged Amount', 'Amount Charged'])));
    const signedAmount = isRefund ? -rawAmount : rawAmount;
    currencyTotals.set(currency, (currencyTotals.get(currency) || 0) + signedAmount);
  });

  const nonEmpty = [...currencyTotals.entries()].filter(([, amount]) => Number.isFinite(amount));
  if (nonEmpty.length !== 1) return null;
  const [currency, amount] = nonEmpty[0];
  return { amount: Math.round(amount * 100) / 100, currency, month, source: 'estimated_sales' };
}

function countryName(value: string) {
  const raw = value.trim();
  if (!raw) return 'Unknown';
  if (/^[A-Z]{2}$/i.test(raw)) {
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(raw.toUpperCase()) || raw; } catch { return raw; }
  }
  return raw;
}

function rowsByDate(rows: CsvRow[]) {
  const map = new Map<string, CsvRow[]>();
  rows.forEach((row) => {
    const date = field(row, ['Date']);
    if (!date) return;
    map.set(date, [...(map.get(date) || []), row]);
  });
  return map;
}

function avgRecent(map: Map<string, CsvRow[]>, names: string[], days = 7) {
  const dates = [...map.keys()].sort().slice(-days);
  if (!dates.length) return 0;
  return dates.reduce((total, date) => total + sum(map.get(date) || [], names), 0) / dates.length;
}

function installMetrics(rows: CsvRow[]) {
  const byDate = rowsByDate(rows);
  const dates = [...byDate.keys()].sort();
  const latestDate = dates.at(-1) || '';
  const latest = byDate.get(latestDate) || [];
  const audienceField = ['Current User Installs'];
  const audience = sum(latest, audienceField);
  const countryValues = latest.map((row) => ({
    country: countryName(field(row, ['Country'])),
    users: num(field(row, audienceField)),
  })).filter((row) => row.country !== 'Unknown' && row.users > 0).sort((a, b) => b.users - a.users);
  const totalCountry = countryValues.reduce((s, row) => s + row.users, 0);
  const countries = countryValues.slice(0, 30).map((row) => ({ ...row, pct: totalCountry ? Math.round(row.users / totalCountry * 10000) / 100 : 0 }));
  const history = dates.slice(-30).map((date) => {
    const dateRows = byDate.get(date) || [];
    const total = sum(dateRows, audienceField);
    const indonesia = dateRows.filter((row) => ['ID', 'Indonesia'].includes(field(row, ['Country']))).reduce((s, row) => s + num(field(row, audienceField)), 0);
    return { date, total, ...(indonesia ? { Indonesia: indonesia } : {}) };
  });
  return {
    dataDate: latestDate,
    installs: sum(latest, ['Total User Installs']),
    activeDevices: sum(latest, ['Installs on active devices', 'Current Device Installs']),
    audience,
    userAcquisitionsAvg: avgRecent(byDate, ['Daily User Installs']),
    userLossAvg: avgRecent(byDate, ['Daily User Uninstalls']),
    countries,
    history,
  };
}

function storeMetrics(rows: CsvRow[]) {
  const byDate = rowsByDate(rows);
  const dates = [...byDate.keys()].sort().slice(-7);
  if (!dates.length) return null;
  const visitors = dates.map((date) => sum(byDate.get(date) || [], ['Store listing visitors']));
  const acquisitions = dates.map((date) => sum(byDate.get(date) || [], ['Store listing acquisitions']));
  const totalVisitors = visitors.reduce((a, b) => a + b, 0);
  const totalAcquisitions = acquisitions.reduce((a, b) => a + b, 0);
  return {
    storeVisitorsAvg: totalVisitors / dates.length,
    storeAcquisitionsAvg: totalAcquisitions / dates.length,
    storeConversion: totalVisitors ? totalAcquisitions / totalVisitors * 100 : 0,
  };
}

function datePart(date: Date) {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate(), timeZone: { id: 'America/Los_Angeles' } };
}

function recursiveMetric(value: unknown, metric: string): number | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  if (obj[metric] !== undefined) {
    const candidate = obj[metric];
    if (typeof candidate === 'number' || typeof candidate === 'string') return num(candidate);
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      if (nested.decimalValue !== undefined) {
        const d = nested.decimalValue as Record<string, unknown> | string | number;
        if (typeof d === 'object' && d && 'value' in d) return num(d.value);
        return num(d);
      }
      if (nested.value !== undefined) return num(nested.value);
    }
  }
  for (const child of Object.values(obj)) {
    const found = recursiveMetric(child, metric);
    if (found !== null) return found;
  }
  return null;
}

async function vital(token: string, set: 'crashRateMetricSet' | 'anrRateMetricSet', metric: 'crashRate7dUserWeighted' | 'anrRate7dUserWeighted') {
  const end = new Date(); end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 14);
  const response = await fetch(`https://playdeveloperreporting.googleapis.com/v1beta1/apps/${PACKAGE_NAME}/${set}:query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      timelineSpec: { aggregationPeriod: 'DAILY', startTime: datePart(start), endTime: datePart(end) },
      metrics: [metric],
      pageSize: 100,
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`PLAY_VITAL_${response.status}`);
  const data = await response.json() as { rows?: unknown[] };
  const values = (data.rows || []).map((row) => recursiveMetric(row, metric)).filter((v): v is number => v !== null);
  return values.at(-1) ?? null;
}

export async function loadPlayDashboardData(): Promise<PlayDashboardData> {
  const status = googlePlayCredentialStatus();
  const warnings: string[] = [];
  const liveFields: string[] = [];
  const snapshotFields = new Set(['firstOpens', 'dau', 'mau', 'rating']);
  let installsData: ReturnType<typeof installMetrics> | null = null;
  let storeData: ReturnType<typeof storeMetrics> = null;
  let revenueData: RevenueData | null = null;
  let crashRate: number | null = null;
  let anrRate: number | null = null;
  let reports = false;
  let financial = false;
  let vitals = false;

  if (status.serviceAccount) {
    try {
      const token = await getGoogleAccessToken();
      if (status.reportBucket) {
        try {
          const installRows = await latestMonthlyReport(token, (month) => `stats/installs/installs_${PACKAGE_NAME}_${month}_country.csv`);
          if (installRows.length) { installsData = installMetrics(installRows); reports = true; ['installs','activeDevices','audience','userAcquisitionsAvg','userLossAvg','countries','history'].forEach((x) => liveFields.push(x)); }
          else warnings.push('Play installs report belum ditemukan pada bulan berjalan/sebelumnya.');
          const storeRows = await latestMonthlyReport(token, (month) => `stats/store_performance/store_performance_${PACKAGE_NAME}_${month}_country.csv`);
          if (storeRows.length) { storeData = storeMetrics(storeRows); reports = true; ['storeVisitorsAvg','storeAcquisitionsAvg','storeConversion'].forEach((x) => liveFields.push(x)); }
          else warnings.push('Store performance report belum ditemukan.');
        } catch (error) { warnings.push(error instanceof Error ? error.message : 'PLAY_REPORT_FAILED'); }

        try {
          const salesReport = await latestSalesReport(token);
          if (salesReport) {
            revenueData = salesMetrics(salesReport.rows, salesReport.month);
            if (!revenueData) warnings.push('Estimated sales report ditemukan, tetapi revenue Bhumi tidak dapat diringkas menjadi satu sale currency.');
          }
        } catch (error) { warnings.push(error instanceof Error ? error.message : 'PLAY_SALES_FAILED'); }

        if (!revenueData) {
          try {
            const earningsReport = await latestEarningsReport(token);
            if (earningsReport) {
              revenueData = earningsMetrics(earningsReport.rows, earningsReport.month);
              if (!revenueData) warnings.push('Earnings report ditemukan, tetapi revenue Bhumi tidak dapat diringkas menjadi satu merchant currency.');
            }
          } catch (error) { warnings.push(error instanceof Error ? error.message : 'PLAY_FINANCIAL_FAILED'); }
        }

        if (revenueData) {
          financial = true;
          liveFields.push('revenueUsd');
        } else {
          warnings.push('Financial report belum tersedia; Revenue masih memakai snapshot fallback.');
        }
      } else warnings.push('GOOGLE_PLAY_REPORT_BUCKET belum dikonfigurasi.');

      try {
        [crashRate, anrRate] = await Promise.all([
          vital(token, 'crashRateMetricSet', 'crashRate7dUserWeighted'),
          vital(token, 'anrRateMetricSet', 'anrRate7dUserWeighted'),
        ]);
        if (crashRate !== null || anrRate !== null) { vitals = true; if (crashRate !== null) liveFields.push('crashRate'); if (anrRate !== null) liveFields.push('anrRate'); }
      } catch (error) { warnings.push(error instanceof Error ? error.message : 'PLAY_VITALS_FAILED'); }
    } catch (error) { warnings.push(error instanceof Error ? error.message : 'GOOGLE_AUTH_FAILED'); }
  } else warnings.push('Google Play service account belum dikonfigurasi.');

  const overview = {
    installs: installsData?.installs || playSnapshot.installs,
    activeDevices: installsData?.activeDevices || playSnapshot.activeDevices,
    audience: installsData?.audience || playSnapshot.audience,
    firstOpens: playSnapshot.firstOpens,
    dau: playSnapshot.dau,
    mau: playSnapshot.mau,
    revenueUsd: revenueData?.amount ?? playSnapshot.revenueUsd,
    revenueCurrency: revenueData?.currency || 'USD',
    revenuePeriod: revenueData?.month || playSnapshot.kpiDate,
    revenueSource: revenueData?.source || 'snapshot',
    rating: playSnapshot.rating,
    crashRate,
    anrRate,
  };
  const acquisition = {
    storeVisitorsAvg: storeData?.storeVisitorsAvg || playSnapshot.storeVisitorsAvg,
    storeAcquisitionsAvg: storeData?.storeAcquisitionsAvg || playSnapshot.storeAcquisitionsAvg,
    storeConversion: storeData?.storeConversion || playSnapshot.storeConversion,
    userAcquisitionsAvg: installsData?.userAcquisitionsAvg || playSnapshot.userAcquisitionsAvg,
    userLossAvg: installsData?.userLossAvg || playSnapshot.userLossAvg,
  };
  if (!installsData) ['installs','activeDevices','audience','userAcquisitionsAvg','userLossAvg','countries','history'].forEach((x) => snapshotFields.add(x));
  if (!storeData) ['storeVisitorsAvg','storeAcquisitionsAvg','storeConversion'].forEach((x) => snapshotFields.add(x));
  if (!revenueData) snapshotFields.add('revenueUsd');
  if (crashRate === null) snapshotFields.add('crashRate');
  if (anrRate === null) snapshotFields.add('anrRate');

  const live = reports || financial || vitals;
  const mode: PlayDashboardData['mode'] = live ? (snapshotFields.size ? 'partial' : 'live') : 'snapshot';
  return {
    mode,
    fetchedAt: Date.now(),
    dataDate: installsData?.dataDate || playSnapshot.kpiDate,
    overview,
    acquisition,
    countries: installsData?.countries || playCountryLatest,
    history: installsData?.history || playCountryHistory,
    liveFields,
    snapshotFields: [...snapshotFields],
    sources: { reports, financial, vitals, reportBucketConfigured: status.reportBucket, serviceAccountConfigured: status.serviceAccount },
    warnings,
  };
}
