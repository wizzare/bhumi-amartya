'use client';

import { useMemo } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { pct } from '@/lib/analytics';

function key(ms: number) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00+07:00`);
  d.setDate(d.getDate() + days);
  return key(d.getTime());
}

function mondayOf(ms: number) {
  const d = new Date(ms);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

type RetentionValue = { eligible: number; retained: number; rate: number };
type CohortRow = {
  week: string;
  users: number;
  d1: RetentionValue;
  d7: RetentionValue;
  d30: RetentionValue;
};

export function RetentionPage() {
  const { users, activities, loading, error, refresh } = useFounderData();

  const activityByUid = useMemo(() => {
    const map = new Map<string, Set<string>>();
    activities.forEach((activity) => {
      const dates = map.get(activity.uid) || new Set<string>();
      dates.add(activity.date);
      map.set(activity.uid, dates);
    });
    return map;
  }, [activities]);

  const coverage = useMemo(() => {
    const dates = activities.map((activity) => activity.date).filter(Boolean).sort();
    return {
      minDate: dates[0] || '',
      maxDate: dates[dates.length - 1] || '',
    };
  }, [activities]);

  const calculateRetention = (rows: typeof users, day: number): RetentionValue => {
    let eligible = 0;
    let retained = 0;

    rows.forEach((user) => {
      if (!user.registeredAt) return;
      const target = addDays(key(user.registeredAt), day);
      if (!coverage.minDate || target < coverage.minDate || target > coverage.maxDate) return;
      eligible += 1;
      if (activityByUid.get(user.uid)?.has(target)) retained += 1;
    });

    return { eligible, retained, rate: pct(retained, eligible) };
  };

  const retention = useMemo(() => [
    { day: 1, ...calculateRetention(users, 1) },
    { day: 7, ...calculateRetention(users, 7) },
    { day: 30, ...calculateRetention(users, 30) },
  ], [users, activityByUid, coverage.minDate, coverage.maxDate]);

  const cohorts = useMemo<CohortRow[]>(() => {
    const groups = new Map<number, typeof users>();
    users.forEach((user) => {
      if (!user.registeredAt) return;
      const week = mondayOf(user.registeredAt);
      groups.set(week, [...(groups.get(week) || []), user]);
    });

    return Array.from(groups.entries())
      .sort((a, b) => b[0] - a[0])
      .slice(0, 10)
      .map(([week, rows]) => ({
        week: key(week),
        users: rows.length,
        d1: calculateRetention(rows, 1),
        d7: calculateRetention(rows, 7),
        d30: calculateRetention(rows, 30),
      }));
  }, [users, activityByUid, coverage.minDate, coverage.maxDate]);

  const returning7 = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    return users.filter((user) => user.lastSeenAt >= cutoff).length;
  }, [users]);

  const returning30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 86400000;
    return users.filter((user) => user.lastSeenAt >= cutoff).length;
  }, [users]);

  const newestFirst = cohorts;
  const oldestFirst = [...cohorts].reverse();

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Retention</h1>
          <p>D1, D7, D30 dihitung per UID dan tanggal registrasi. Cohort di luar coverage telemetry ditampilkan N/A.</p>
        </div>
        <button className="btn" onClick={() => void refresh()}>Refresh</button>
      </div>

      {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="kpi-grid">
        {retention.map((item) => (
          <div className="kpi-card" key={item.day}>
            <div className="kpi-label">D{item.day} Retention</div>
            <div className="kpi-value">{loading ? '—' : item.eligible ? `${item.rate}%` : 'N/A'}</div>
            <div className="kpi-foot"><span>{item.retained}/{item.eligible} eligible</span></div>
          </div>
        ))}
        <div className="kpi-card">
          <div className="kpi-label">Returning ≤7D</div>
          <div className="kpi-value">{returning7}</div>
          <div className="kpi-foot"><span>{pct(returning7, users.length)}% user base</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Returning ≤30D</div>
          <div className="kpi-value">{returning30}</div>
          <div className="kpi-foot"><span>{pct(returning30, users.length)}% user base</span></div>
        </div>
      </div>

      <section className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Retention Trend by Registration Week</div>
            <span className="panel-subtitle">CSS-native trend view. N/A bukan 0%.</span>
          </div>
          <span className="source-badge">90D ACTIVITY</span>
        </div>
        <div className="panel-body">
          <div className="stat-list">
            {oldestFirst.map((cohort) => (
              <div key={cohort.week} style={{ display: 'grid', gap: 7, paddingBottom: 10, borderBottom: '1px solid #eef2ef' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                  <b>{cohort.week}</b>
                  <span>{cohort.users} new users</span>
                </div>
                {([
                  ['D1', cohort.d1],
                  ['D7', cohort.d7],
                  ['D30', cohort.d30],
                ] as const).map(([label, metric]) => (
                  <div className="stat-row" key={label}>
                    <span className="stat-name">{label}</span>
                    <div className="progress"><span style={{ width: `${Math.min(100, metric.rate)}%` }} /></div>
                    <span className="stat-value">{metric.eligible ? `${metric.rate}%` : 'N/A'}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Cohort Table</div>
            <span className="panel-subtitle">Registrasi minggu Senin–Minggu, Asia/Jakarta.</span>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Week</th><th>New Users</th><th>D1</th><th>D1 Base</th><th>D7</th><th>D7 Base</th><th>D30</th><th>D30 Base</th></tr>
            </thead>
            <tbody>
              {newestFirst.map((cohort) => (
                <tr key={cohort.week}>
                  <td><b>{cohort.week}</b></td>
                  <td>{cohort.users}</td>
                  <td>{cohort.d1.eligible ? `${cohort.d1.rate}%` : 'N/A'}</td>
                  <td>{cohort.d1.retained}/{cohort.d1.eligible}</td>
                  <td>{cohort.d7.eligible ? `${cohort.d7.rate}%` : 'N/A'}</td>
                  <td>{cohort.d7.retained}/{cohort.d7.eligible}</td>
                  <td>{cohort.d30.eligible ? `${cohort.d30.rate}%` : 'N/A'}</td>
                  <td>{cohort.d30.retained}/{cohort.d30.eligible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
