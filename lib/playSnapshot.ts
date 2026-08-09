export const playSnapshot = {
  kpiDate: '2026-08-10',
  installs: 331,
  activeDevices: 182,
  audience: 176,
  userAcquisitionsAvg: 5.21,
  userLossAvg: 3.71,
  firstOpens: 92,
  dau: 36.9,
  mau: 188,
  storeVisitorsAvg: 7.57,
  storeAcquisitionsAvg: 3.96,
  storeConversion: 50.8,
  revenueUsd: 12.30,
  rating: 5.0,
  crashRate: null as number | null,
  anrRate: null as number | null,
};

// User-provided Play Console installed-audience country table.
// Columns visible in screenshot are preserved; the remainder is shown only as derived "Other / not shown".
export const playCountryHistory = [
  { date:'2026-08-03', total:211, Indonesia:202, Malaysia:4, 'United Arab Emirates':1, Japan:1, other:3 },
  { date:'2026-08-04', total:203, Indonesia:195, Malaysia:4, 'United Arab Emirates':1, Japan:1, other:2 },
  { date:'2026-08-05', total:213, Indonesia:205, Malaysia:4, 'United Arab Emirates':1, Japan:1, other:2 },
];

export const playCountryLatest = [
  { country:'Indonesia', users:205, pct:96.24 },
  { country:'Malaysia', users:4, pct:1.88 },
  { country:'United Arab Emirates', users:1, pct:0.47 },
  { country:'Japan', users:1, pct:0.47 },
  { country:'Other / not shown', users:2, pct:0.94 },
];
