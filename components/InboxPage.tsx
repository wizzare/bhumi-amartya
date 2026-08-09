'use client';

import { useMemo, useState } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { useCommunications } from '@/hooks/useCommunications';
import { formatDateTime, formatRelative } from '@/lib/analytics';

export function InboxPage() {
  const founder = useFounderData();
  const allowed = useMemo(() => new Set(founder.users.map((user) => user.uid)), [founder.users]);
  const comm = useCommunications(allowed);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return comm.messages;
    return comm.messages.filter((message) => {
      const user = founder.byUid.get(message.uid);
      const haystack = `${message.title} ${message.content} ${message.summary} ${user?.name || ''} ${user?.email || ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [comm.messages, founder.byUid, query]);

  const selected = useMemo(
    () => comm.messages.find((message) => `${message.uid}-${message.id}` === selectedId) || null,
    [comm.messages, selectedId]
  );
  const selectedUser = selected ? founder.byUid.get(selected.uid) : undefined;

  const last24Hours = comm.messages.filter((message) => message.createdAt >= Date.now() - 86400000).length;
  const threadCount = new Set(comm.messages.map((message) => message.threadId || message.parentMessageId || message.id)).size;
  const uniqueUsers = new Set(comm.messages.map((message) => message.uid)).size;
  const unread = comm.messages.filter((message) => !message.isRead).length;
  const pageError = founder.error || comm.error;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Inbox</h1>
          <p>Monitoring pesan user ke admin dari communications. Read-only sampai server-side reply safeguard selesai.</p>
        </div>
        <button className="btn" onClick={() => void comm.refresh()}>Refresh</button>
      </div>

      {pageError && <div className="error-box" style={{ marginBottom: 12 }}>{pageError}</div>}

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Messages</div><div className="kpi-value">{comm.loading ? '—' : comm.messages.length}</div><div className="kpi-foot"><span>real users only</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Last 24 Hours</div><div className="kpi-value">{last24Hours}</div><div className="kpi-foot"><span>incoming activity</span></div></div>
        <div className="kpi-card"><div className="kpi-label">User Threads</div><div className="kpi-value">{threadCount}</div><div className="kpi-foot"><span>thread grouping</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Unique Users</div><div className="kpi-value">{uniqueUsers}</div><div className="kpi-foot"><span>senders</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Unread Flag</div><div className="kpi-value">{unread}</div><div className="kpi-foot"><span>raw flag</span></div></div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head">
            <div><div className="panel-title">Incoming Messages</div><span className="panel-subtitle">Newest first. Deleted/test users excluded.</span></div>
            <span className="source-badge">COMMUNICATIONS</span>
          </div>
          <div className="panel-body">
            <div className="toolbar">
              <input className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari user, email, judul, isi…" />
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Message</th><th>Time</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {rows.slice(0, 100).map((message) => {
                  const user = founder.byUid.get(message.uid);
                  const rowId = `${message.uid}-${message.id}`;
                  return (
                    <tr key={rowId} onClick={() => setSelectedId(rowId)} style={{ cursor: 'pointer' }}>
                      <td><b>{user?.name || 'Unknown User'}</b><br/><span style={{ color: '#87948c' }}>{user?.email || message.uid}</span></td>
                      <td><b>{message.title}</b><br/><span style={{ color: '#87948c' }}>{(message.summary || message.content).slice(0, 90)}</span></td>
                      <td title={formatDateTime(message.createdAt)}>{formatRelative(message.createdAt)}</td>
                      <td>{message.type}</td>
                      <td><span className={`pill ${message.isRead ? 'gray' : 'gold'}`}>{message.isRead ? 'read flag' : 'unread flag'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!comm.loading && !rows.length && <div className="empty">Tidak ada pesan.</div>}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div><div className="panel-title">Message Detail</div><span className="panel-subtitle">Read-only monitoring</span></div>
          </div>
          <div className="panel-body">
            {!selected && <div className="empty">Pilih pesan untuk melihat detail.</div>}
            {selected && (
              <div>
                <div className="notice">
                  <b>{selectedUser?.name || 'Unknown User'}</b><br/>
                  {selectedUser?.email || selected.uid}<br/>
                  {formatDateTime(selected.createdAt)}
                </div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontWeight: 500 }}>{selected.title}</h3>
                <div style={{ fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.content || selected.summary || '—'}</div>
                <div className="notice" style={{ marginTop: 14 }}>
                  Thread: {selected.threadId || '—'}<br/>
                  Parent: {selected.parentMessageId || '—'}<br/>
                  Status: {selected.status}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
