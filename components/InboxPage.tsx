'use client';

import { useMemo, useState } from 'react';
import { useFounderUsers } from '@/hooks/useFounderData';
import { useCommunications } from '@/hooks/useCommunications';
import { formatDateTime, formatRelative } from '@/lib/analytics';
import { sendFounderMessage } from '@/lib/communicationsWrite';

export function InboxPage() {
  const founder = useFounderUsers();
  const allowed = useMemo(() => new Set(founder.users.map((user) => user.uid)), [founder.users]);
  const comm = useCommunications(allowed);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyState, setReplyState] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientUid, setRecipientUid] = useState('');
  const [personalTitle, setPersonalTitle] = useState('');
  const [personalContent, setPersonalContent] = useState('');
  const [personalState, setPersonalState] = useState('');
  const [sendingPersonal, setSendingPersonal] = useState(false);

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
  const recipient = recipientUid ? founder.byUid.get(recipientUid) : undefined;

  const recipientMatches = useMemo(() => {
    const needle = recipientQuery.trim().toLowerCase();
    if (needle.length < 2 || recipientUid) return [];
    return founder.users
      .filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(needle))
      .sort((a, b) => b.lastLoginAt - a.lastLoginAt)
      .slice(0, 8);
  }, [founder.users, recipientQuery, recipientUid]);

  const last24Hours = comm.messages.filter((message) => message.createdAt >= Date.now() - 86400000).length;
  const uniqueUsers = new Set(comm.messages.map((message) => message.uid)).size;
  const unread = comm.messages.filter((message) => !message.isRead).length;
  const pageError = founder.error || comm.error;

  const chooseMessage = (rowId: string) => {
    setSelectedId(rowId);
    setReplyText('');
    setReplyState('');
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim() || sendingReply) return;
    const user = selectedUser;
    const recipientLabel = user?.email || user?.name || selected.uid;
    if (!window.confirm(`Kirim balasan ini ke ${recipientLabel}?`)) return;

    setSendingReply(true);
    setReplyState('');
    try {
      const title = /^re:/i.test(selected.title) ? selected.title : `Re: ${selected.title}`;
      await sendFounderMessage({
        targetUid: selected.uid,
        title,
        content: replyText,
        parentMessageId: selected.id,
        threadId: selected.threadId || selected.parentMessageId || selected.id,
      });
      setReplyText('');
      setReplyState('Balasan terkirim ke Inbox user. Tidak ada refetch Firestore otomatis.');
    } catch (error: any) {
      setReplyState(error?.message || 'Gagal mengirim balasan.');
    } finally {
      setSendingReply(false);
    }
  };

  const sendPersonal = async () => {
    if (!recipient || !personalTitle.trim() || !personalContent.trim() || sendingPersonal) return;
    const recipientLabel = recipient.email || recipient.name || recipient.uid;
    if (!window.confirm(`Kirim pesan personal ke ${recipientLabel}?`)) return;

    setSendingPersonal(true);
    setPersonalState('');
    try {
      await sendFounderMessage({
        targetUid: recipient.uid,
        title: personalTitle,
        content: personalContent,
      });
      setPersonalTitle('');
      setPersonalContent('');
      setPersonalState('Pesan personal terkirim ke Inbox user. Tidak ada refetch Firestore otomatis.');
    } catch (error: any) {
      setPersonalState(error?.message || 'Gagal mengirim pesan personal.');
    } finally {
      setSendingPersonal(false);
    }
  };

  const clearRecipient = () => {
    setRecipientUid('');
    setRecipientQuery('');
    setPersonalState('');
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Inbox</h1>
          <p>Pesan user ke Founder, reply thread, dan personal message melalui communications yang sama dengan aplikasi.</p>
        </div>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <button className="btn" onClick={() => setComposeOpen((value) => !value)}>{composeOpen ? 'Tutup Personal Message' : 'Pesan Personal'}</button>
          <button className="btn" onClick={() => void comm.refresh()}>Refresh</button>
        </div>
      </div>

      {pageError && <div className="error-box" style={{ marginBottom: 12 }}>{pageError}</div>}

      {composeOpen && (
        <section className="panel" style={{ marginBottom: 14 }}>
          <div className="panel-head">
            <div><div className="panel-title">Kirim Pesan Personal</div><span className="panel-subtitle">Satu user saja. Recipient dipilih dari user cache.</span></div>
            <span className="source-badge">1 WRITE</span>
          </div>
          <div className="panel-body">
            {!recipient && (
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <input
                  className="search"
                  style={{ maxWidth: 'none', width: '100%' }}
                  value={recipientQuery}
                  onChange={(event) => setRecipientQuery(event.target.value)}
                  placeholder="Cari nama atau email penerima…"
                />
                {!!recipientMatches.length && (
                  <div style={{ border: '1px solid var(--line)', borderRadius: 8, marginTop: 6, overflow: 'hidden' }}>
                    {recipientMatches.map((user) => (
                      <button
                        type="button"
                        key={user.uid}
                        onClick={() => { setRecipientUid(user.uid); setRecipientQuery(`${user.name} ${user.email}`.trim()); setPersonalState(''); }}
                        style={{ width: '100%', textAlign: 'left', border: 0, borderBottom: '1px solid #eef2ef', background: '#fff', padding: '9px 10px', fontSize: 10 }}
                      >
                        <b>{user.name}</b> <span style={{ color: '#87948c' }}>{user.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {recipient && (
              <div className="notice" style={{ marginBottom: 10 }}>
                <b>Penerima:</b> {recipient.name} · {recipient.email || recipient.uid}
                <button className="btn" type="button" onClick={clearRecipient} style={{ marginLeft: 10 }}>Ganti</button>
              </div>
            )}

            <input className="search" style={{ maxWidth: 'none', width: '100%', marginBottom: 10 }} value={personalTitle} onChange={(event) => setPersonalTitle(event.target.value)} placeholder="Judul pesan" maxLength={160} />
            <textarea value={personalContent} onChange={(event) => setPersonalContent(event.target.value)} placeholder="Isi pesan personal…" maxLength={5000} style={{ width: '100%', minHeight: 130, border: '1px solid var(--line)', borderRadius: 8, padding: 11, fontSize: 11, resize: 'vertical' }} />
            {personalState && <div className="notice" style={{ marginTop: 10 }}>{personalState}</div>}
            <div className="toolbar" style={{ justifyContent: 'flex-end', marginTop: 10, marginBottom: 0 }}>
              <span style={{ fontSize: 9, color: '#87948c' }}>{personalContent.length}/5000</span>
              <button className="btn primary" disabled={!recipient || !personalTitle.trim() || !personalContent.trim() || sendingPersonal} onClick={() => void sendPersonal()}>{sendingPersonal ? 'Mengirim…' : 'Kirim Personal'}</button>
            </div>
          </div>
        </section>
      )}

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Unread</div><div className="kpi-value">{comm.loading ? '—' : unread}</div><div className="kpi-foot"><span>perlu perhatian</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Pesan 24 Jam</div><div className="kpi-value">{comm.loading ? '—' : last24Hours}</div><div className="kpi-foot"><span>incoming activity</span></div></div>
        <div className="kpi-card"><div className="kpi-label">User Mengirim</div><div className="kpi-value">{comm.loading ? '—' : uniqueUsers}</div><div className="kpi-foot"><span>unique senders</span></div></div>
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
                    <tr key={rowId} onClick={() => chooseMessage(rowId)} style={{ cursor: 'pointer' }}>
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
            <div><div className="panel-title">Message Detail & Reply</div><span className="panel-subtitle">Reply ditulis ke thread user yang sama.</span></div>
          </div>
          <div className="panel-body">
            {!selected && <div className="empty">Pilih pesan untuk melihat detail dan membalas.</div>}
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
                  Thread: {selected.threadId || selected.id}<br/>
                  Parent: {selected.parentMessageId || '—'}<br/>
                  Status: {selected.status}
                </div>

                <div style={{ marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, marginBottom: 7 }}>Balas ke {selectedUser?.name || selected.uid}</div>
                  <textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Tulis balasan Founder…" maxLength={5000} style={{ width: '100%', minHeight: 120, border: '1px solid var(--line)', borderRadius: 8, padding: 11, fontSize: 11, resize: 'vertical' }} />
                  {replyState && <div className="notice" style={{ marginTop: 9 }}>{replyState}</div>}
                  <div className="toolbar" style={{ justifyContent: 'flex-end', marginTop: 9, marginBottom: 0 }}>
                    <span style={{ fontSize: 9, color: '#87948c' }}>{replyText.length}/5000</span>
                    <button className="btn primary" disabled={!replyText.trim() || sendingReply} onClick={() => void sendReply()}>{sendingReply ? 'Mengirim…' : 'Kirim Balasan'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
