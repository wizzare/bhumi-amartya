'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useUserTableData } from '@/hooks/useUserTableData';
import { formatDateTime, formatRelative, NormalizedUser } from '@/lib/analytics';
import { UserDetailDrawer } from '@/components/UserDetailDrawer';

function statusClass(status: string) {
  return status === 'Active' ? 'green' : status === 'Cooling' ? 'gold' : status === 'At Risk' ? 'red' : 'gray';
}

function activeLoginDays(user: NormalizedUser): number | null {
  const raw = user.raw || {};
  const value = raw.participationMetrics?.activeDays ?? raw.activeDays;
  if (Array.isArray(value)) {
    const unique = new Set(value.map((item) => String(item || '').trim()).filter(Boolean));
    return unique.size;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  return null;
}

function historicalGuardian(user: NormalizedUser) {
  const raw = user.raw || {};
  const badge = `${raw.testerBadge || ''} ${raw.badge || ''} ${raw.guardianBadge || ''} ${raw.guardianRole || ''}`.toLowerCase();
  if (badge.includes('alfa')) return 'Penjaga Alfa';
  if (badge.includes('inti') || badge.includes('core_guardian')) return 'Penjaga Inti';
  return '';
}

function accessDisplay(user: NormalizedUser) {
  const guardian = historicalGuardian(user);
  if (user.plan === 'Founder') return { primary: 'Founder', secondary: 'Lifetime', cls: 'gold' };
  if (user.plan === 'Google Play Paid') return { primary: 'Premium', secondary: 'Aktif', cls: 'green' };
  if (user.plan === 'Trial') return { primary: 'Trial', secondary: 'Aktif', cls: 'gold' };
  if (user.plan === 'Penjaga Inti') return { primary: 'Penjaga Inti', secondary: 'Akses aktif', cls: 'green' };
  if (user.plan === 'Penjaga Alfa') return { primary: 'Penjaga Alfa', secondary: 'Akses aktif', cls: 'green' };
  if (user.plan === 'Expired Grant') return { primary: 'Free', secondary: guardian ? `${guardian} selesai` : 'Grant selesai', cls: 'gray' };
  if (user.plan === 'Expired Paid') return { primary: 'Free', secondary: 'Premium selesai', cls: 'gray' };
  if (user.plan === 'Pending Verification') return { primary: 'Pending', secondary: 'Verifikasi billing', cls: 'gold' };
  if (user.plan === 'Data Incomplete') return { primary: 'Perlu cek', secondary: 'Data entitlement', cls: 'red' };
  return { primary: 'Free', secondary: 'Trial selesai', cls: 'gray' };
}

type Props = { embedded?: boolean };

export function UserTablePage({ embedded = false }: Props) {
  const table = useUserTableData();
  const [searchInput, setSearchInput] = useState('');
  const [plan, setPlan] = useState('all');
  const [selectedUser, setSelectedUser] = useState<NormalizedUser | null>(null);

  const plans = useMemo(() => Array.from(new Set(table.rows.map((user) => user.plan))).sort(), [table.rows]);
  const rows = useMemo(() => table.rows.filter((user) => plan === 'all' || user.plan === plan), [plan, table.rows]);

  const newestLogin = table.rows.reduce((max, user) => Math.max(max, user.lastLoginAt), 0);
  const oldestLogin = table.rows.reduce((min, user) => {
    if (!user.lastLoginAt) return min;
    return !min ? user.lastLoginAt : Math.min(min, user.lastLoginAt);
  }, 0);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    void table.search(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setPlan('all');
    table.clearSearch();
  };

  const openUser = (user: NormalizedUser) => setSelectedUser(user);

  return (
    <div className={embedded ? '' : 'page'}>
      {embedded ? (
        <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="source-badge">USER TABLE · 10 / REQUEST</span>
          <button className="btn" onClick={table.refresh}>Refresh Page 1</button>
        </div>
      ) : (
        <div className="page-heading">
          <div>
            <h1>Data User</h1>
            <p>Maksimal 10 user per page/request. Klik nama, baris, atau tombol Lihat untuk membuka profil + blueprint.</p>
          </div>
          <button className="btn" onClick={table.refresh}>Refresh Page 1</button>
        </div>
      )}

      {table.error && <div className="error-box" style={{ marginBottom: 12 }}>{table.error}</div>}

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Mode</div><div className="kpi-value" style={{fontSize:16}}>{table.searchMode ? 'Search' : `Page ${table.page}`}</div><div className="kpi-foot"><span>{table.searchMode ? table.searchTerm : 'cursor pagination'}</span></div></div>
        <div className="kpi-card"><div className="kpi-label">User Loaded</div><div className="kpi-value">{table.loading ? '—' : table.rows.length}</div><div className="kpi-foot"><span>max {table.pageSize}</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Firestore Reads</div><div className="kpi-value">{table.loading ? '—' : table.readsThisPage}</div><div className="kpi-foot"><span>{table.searchSource === 'founder-cache' ? 'search dari shared cache' : '0 bila cache tersedia'}</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Newest Login</div><div className="kpi-value" style={{ fontSize: 16 }}>{newestLogin ? formatRelative(newestLogin) : '—'}</div><div className="kpi-foot"><span>{table.searchMode?'hasil search':'halaman ini'}</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Oldest Login</div><div className="kpi-value" style={{ fontSize: 16 }}>{oldestLogin ? formatRelative(oldestLogin) : '—'}</div><div className="kpi-foot"><span>{table.searchMode?'hasil search':'halaman ini'}</span></div></div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">User Table</div>
            <span className="panel-subtitle">Urutan latest login. Previous page dan hasil search yang pernah dibuka memakai session cache.</span>
          </div>
          <span className="source-badge">10 / REQUEST</span>
        </div>
        <div className="panel-body">
          <form className="toolbar" onSubmit={submitSearch}>
            <input className="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Cari nama atau email seluruh user…" />
            <button className="btn primary" type="submit" disabled={table.loading}>Cari</button>
            {table.searchMode && <button className="btn" type="button" onClick={clearSearch}>Kembali ke tabel</button>}
            <select className="select" value={plan} onChange={(event) => setPlan(event.target.value)}>
              <option value="all">Semua Status Akses</option>
              {plans.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <span style={{ fontSize: 9, color: '#7c8a82' }}>{rows.length} ditampilkan</span>
          </form>

          <div className="notice" style={{ marginBottom: 12 }}>
            Hari Login = jumlah hari aktif unik, bukan jumlah event login. Email lengkap dicari dengan exact match terlebih dahulu. Klik user tidak membaca ulang dokumen profil; blueprint hanya lazy-load sekali per UID lalu dicache selama sesi.
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Email</th><th>Tgl Daftar</th><th>First Login</th><th>Last Login</th><th>Last Seen</th><th>Hari Login</th><th>Session</th><th>Akses Saat Ini</th><th>Aktivitas</th><th>App</th><th>Birth City</th><th>Detail</th></tr></thead>
              <tbody>
                {rows.map((user) => {
                  const days = activeLoginDays(user);
                  const access = accessDisplay(user);
                  return <tr key={user.uid} onClick={() => openUser(user)} style={{cursor:'pointer'}}>
                    <td><button type="button" onClick={(event)=>{event.stopPropagation();openUser(user);}} style={{border:0,background:'transparent',padding:0,color:'#2f7555',font:'inherit',fontWeight:800,cursor:'pointer',textDecoration:'underline',textUnderlineOffset:2}}>{user.name}</button></td>
                    <td>{user.email || '—'}</td>
                    <td>{formatDateTime(user.registeredAt)}</td>
                    <td>{formatDateTime(user.firstLoginAt)}</td>
                    <td title={formatDateTime(user.lastLoginAt)}>{formatRelative(user.lastLoginAt)}</td>
                    <td title={formatDateTime(user.lastSeenAt)}>{formatRelative(user.lastSeenAt)}</td>
                    <td><b>{days ?? '—'}</b></td>
                    <td>{user.sessionCount}</td>
                    <td><span className={`pill ${access.cls}`}>{access.primary}</span><div style={{fontSize:8,color:'#87948c',marginTop:3,whiteSpace:'nowrap'}}>{access.secondary}</div></td>
                    <td><span className={`pill ${statusClass(user.status)}`}>{user.status}</span></td>
                    <td>{user.appVersion} / {user.buildNumber}</td>
                    <td>{user.birthCity || '—'}</td>
                    <td><button className="btn" type="button" onClick={(event)=>{event.stopPropagation();openUser(user);}}>Lihat</button></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>

          {!table.loading && !rows.length && <div className="empty">Tidak ada user yang cocok.</div>}

          {!table.searchMode && <div className="toolbar" style={{ justifyContent: 'flex-end', marginTop: 12, marginBottom: 0 }}>
            <button className="btn" disabled={table.loading || table.page <= 1} onClick={table.previous}>Previous</button>
            <span style={{ fontSize: 9, color: '#7c8a82' }}>Page {table.page}</span>
            <button className="btn" disabled={table.loading || !table.hasMore} onClick={table.next}>Next</button>
          </div>}
        </div>
      </section>

      <UserDetailDrawer user={selectedUser} onClose={()=>setSelectedUser(null)} />
    </div>
  );
}
