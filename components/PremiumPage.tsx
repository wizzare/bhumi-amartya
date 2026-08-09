'use client';

import { useMemo } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { formatDateTime, pct } from '@/lib/analytics';

const accessOrder = ['Google Play Paid', 'Trial', 'Penjaga Inti', 'Penjaga Alfa', 'Founder', 'Unknown Legacy', 'Free'];

type CountRow = { name: string; value: number };

export function PremiumPage() {
  const { users, loading, error, refresh } = useFounderData();

  const counts = useMemo<CountRow[]>(() => {
    const map = new Map<string, number>();
    accessOrder.forEach((name) => map.set(name, 0));
    users.forEach((user) => map.set(user.plan, (map.get(user.plan) || 0) + 1));
    return accessOrder.map((name) => ({ name, value: map.get(name) || 0 }));
  }, [users]);

  const count = (name: string) => counts.find((row) => row.name === name)?.value || 0;
  const paid = count('Google Play Paid');
  const founder = count('Founder');
  const trial = count('Trial');
  const free = count('Free');
  const paidConversion = pct(paid, Math.max(0, users.length - founder));
  const accessUsers = paid + count('Penjaga Inti') + count('Penjaga Alfa') + founder + count('Unknown Legacy');

  const statusRows = useMemo<CountRow[]>(() => {
    const map = new Map<string, number>();
    users.forEach((user) => {
      const status = user.subscriptionStatus || '—';
      map.set(status, (map.get(status) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [users]);

  const expiring = useMemo(() => (
    users
      .filter((user) => user.accessUntil > 0)
      .sort((a, b) => a.accessUntil - b.accessUntil)
      .slice(0, 30)
  ), [users]);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Premium & Trial</h1>
          <p>Source segmentation: Google Play Paid, Trial, Inti, Alfa, Founder, legacy, dan Free.</p>
        </div>
        <button className="btn" onClick={() => void refresh()}>Refresh</button>
      </div>

      {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Google Play Paid</div><div className="kpi-value">{loading ? '—' : paid}</div><div className="kpi-foot"><span>verified/source-backed</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Paid Conversion</div><div className="kpi-value">{paidConversion}%</div><div className="kpi-foot"><span>Paid / non-Founder base</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Trial</div><div className="kpi-value">{trial}</div><div className="kpi-foot"><span>trial source only</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Premium Access</div><div className="kpi-value">{accessUsers}</div><div className="kpi-foot"><span>Paid + grants + Founder</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Free</div><div className="kpi-value">{free}</div><div className="kpi-foot"><span>{pct(free, users.length)}% real users</span></div></div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">Access Source Distribution</div><span className="panel-subtitle">Mutually exclusive per UID.</span></div><span className="source-badge">BHUMI DB</span></div>
          <div className="panel-body">
            <div className="stat-list">
              {counts.map((row) => (
                <div className="stat-row" key={row.name}>
                  <span className="stat-name">{row.name}</span>
                  <div className="progress"><span style={{ width: `${Math.min(100, pct(row.value, users.length))}%` }} /></div>
                  <span className="stat-value">{row.value} · {pct(row.value, users.length)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">Subscription Status Fields</div><span className="panel-subtitle">Raw status dari user documents.</span></div><span className="source-badge warn">DIAGNOSTIC</span></div>
          <div className="panel-body">
            <div className="stat-list">
              {statusRows.slice(0, 12).map((row) => (
                <div className="stat-row" key={row.name}>
                  <span className="stat-name">{row.name}</span>
                  <div className="progress"><span style={{ width: `${Math.min(100, pct(row.value, users.length))}%` }} /></div>
                  <span className="stat-value">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="notice" style={{ marginTop: 14 }}>
              Billing API belum menjadi source of truth. Status Firestore ditampilkan sebagai diagnostic sampai connector server-side Google Play aktif.
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Access Expiry Monitor</div><span className="panel-subtitle">Expiry kosong tidak dianggap Lifetime; Founder saja yang lifetime.</span></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Source</th><th>Subscription Status</th><th>Access Until</th></tr></thead>
            <tbody>
              {expiring.map((user) => (
                <tr key={user.uid}>
                  <td><b>{user.name}</b><br/><span style={{ color: '#87948c' }}>{user.email}</span></td>
                  <td>{user.plan}</td>
                  <td>{user.subscriptionStatus}</td>
                  <td>{formatDateTime(user.accessUntil)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!expiring.length && <div className="empty">Belum ada expiry timestamp yang bisa ditampilkan.</div>}
      </section>
    </div>
  );
}
