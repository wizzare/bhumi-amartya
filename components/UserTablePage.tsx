'use client';

import { useMemo, useState } from 'react';
import { useUserTableData } from '@/hooks/useUserTableData';
import { formatDateTime, formatRelative } from '@/lib/analytics';

function statusClass(status: string) {
  return status === 'Active' ? 'green' : status === 'Cooling' ? 'gold' : status === 'At Risk' ? 'red' : 'gray';
}

export function UserTablePage() {
  const table = useUserTableData();
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('all');

  const plans = useMemo(() => Array.from(new Set(table.rows.map((user) => user.plan))).sort(), [table.rows]);
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return table.rows.filter((user) => {
      const searchHit = !needle || `${user.name} ${user.email} ${user.birthCity} ${user.environmentCity} ${user.country}`.toLowerCase().includes(needle);
      const planHit = plan === 'all' || user.plan === plan;
      return searchHit && planHit;
    });
  }, [plan, search, table.rows]);

  const newestLogin = table.rows.reduce((max, user) => Math.max(max, user.lastLoginAt), 0);
  const oldestLogin = table.rows.reduce((min, user) => {
    if (!user.lastLoginAt) return min;
    return !min ? user.lastLoginAt : Math.min(min, user.lastLoginAt);
  }, 0);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Data User</h1>
          <p>Maksimal 10 user per request. Deleted, archived, tester, dan duplikat UID/email dikeluarkan sebelum ditampilkan.</p>
        </div>
        <button className="btn" onClick={table.refresh}>Refresh Page 1</button>
      </div>

      {table.error && <div className="error-box" style={{ marginBottom: 12 }}>{table.error}</div>}

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Page</div><div className="kpi-value">{table.page}</div><div className="kpi-foot"><span>cursor pagination</span></div></div>
        <div className="kpi-card"><div className="kpi-label">User Loaded</div><div className="kpi-value">{table.loading ? '—' : table.rows.length}</div><div className="kpi-foot"><span>max {table.pageSize}</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Firestore Reads</div><div className="kpi-value">{table.loading ? '—' : table.readsThisPage}</div><div className="kpi-foot"><span>0 bila dari cache</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Newest Login</div><div className="kpi-value" style={{ fontSize: 16 }}>{newestLogin ? formatRelative(newestLogin) : '—'}</div><div className="kpi-foot"><span>halaman ini</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Oldest Login</div><div className="kpi-value" style={{ fontSize: 16 }}>{oldestLogin ? formatRelative(oldestLogin) : '—'}</div><div className="kpi-foot"><span>halaman ini</span></div></div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">User Table</div>
            <span className="panel-subtitle">Urutan latest login. Previous page memakai cache dan tidak membaca Firestore lagi.</span>
          </div>
          <span className="source-badge">10 / REQUEST</span>
        </div>
        <div className="panel-body">
          <div className="toolbar">
            <input className="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter 10 user yang sedang tampil…" />
            <select className="select" value={plan} onChange={(event) => setPlan(event.target.value)}>
              <option value="all">Semua Plan</option>
              {plans.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <span style={{ fontSize: 9, color: '#7c8a82' }}>{rows.length} ditampilkan</span>
          </div>

          <div className="notice" style={{ marginBottom: 12 }}>
            Search dan filter hanya bekerja pada 10 user yang sudah dimuat. Environment City hanya membaca field kota yang sudah tersimpan; dashboard tidak meminta GPS pengguna dan tidak membaca collection tambahan.
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Email</th><th>Tgl Daftar</th><th>First Login</th><th>Last Login</th><th>Last Seen</th><th>Login</th><th>Session</th><th>Plan</th><th>Status</th><th>App</th><th>Birth City</th><th>Environment City</th></tr></thead>
              <tbody>
                {rows.map((user) => (
                  <tr key={user.uid}>
                    <td><b>{user.name}</b></td>
                    <td>{user.email || '—'}</td>
                    <td>{formatDateTime(user.registeredAt)}</td>
                    <td>{formatDateTime(user.firstLoginAt)}</td>
                    <td title={formatDateTime(user.lastLoginAt)}>{formatRelative(user.lastLoginAt)}</td>
                    <td title={formatDateTime(user.lastSeenAt)}>{formatRelative(user.lastSeenAt)}</td>
                    <td>{user.loginCount}</td>
                    <td>{user.sessionCount}</td>
                    <td><span className={`pill ${user.plan === 'Google Play Paid' ? 'green' : user.plan === 'Founder' ? 'gold' : 'gray'}`}>{user.plan}</span></td>
                    <td><span className={`pill ${statusClass(user.status)}`}>{user.status}</span></td>
                    <td>{user.appVersion} / {user.buildNumber}</td>
                    <td>{user.birthCity || '—'}</td>
                    <td>{user.environmentCity || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!table.loading && !rows.length && <div className="empty">Tidak ada user pada halaman/filter ini.</div>}

          <div className="toolbar" style={{ justifyContent: 'flex-end', marginTop: 12, marginBottom: 0 }}>
            <button className="btn" disabled={table.loading || table.page <= 1} onClick={table.previous}>Previous</button>
            <span style={{ fontSize: 9, color: '#7c8a82' }}>Page {table.page}</span>
            <button className="btn" disabled={table.loading || !table.hasMore} onClick={table.next}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
