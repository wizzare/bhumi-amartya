"use client";

import { useCallback, useEffect, useState } from "react";
import { CommunicationCenterService } from "@/lib/services/communicationCenterService";
import type { CommunicationMessage } from "@/lib/types/communication";
import { useAuth } from "@/context/AuthContext";

export function AdminInboxWorkspace() {
  const auth = useAuth();
  const profile = auth?.userProfile as any;
  const allowed = profile?.guardianRole === "founder" || profile?.guardianRole === "admin" || profile?.role === "admin";
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [selected, setSelected] = useState<CommunicationMessage | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("idle");
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastState, setBroadcastState] = useState<'idle' | 'confirm' | 'sending' | 'sent' | 'error'>('idle');
  const load = useCallback(async () => { if (!allowed) return; setMessages(await CommunicationCenterService.getAllUserCommunications()); }, [allowed]);
  useEffect(() => { void load(); }, [load]);
  if (!allowed) return null;
  const sendReply = async () => { if (!selected || !reply.trim() || !auth?.user?.uid) return; setStatus("sending"); try { await CommunicationCenterService.sendAdminReply({ adminUid: auth.user.uid, targetUid: selected.ownerUserId || selected.uid, parentMessage: selected, content: reply.trim() }); setReply(""); setStatus("sent"); await load(); } catch { setStatus("error"); } };
  const sendBroadcast = async () => {
    if (!auth?.user?.uid || !broadcastTitle.trim() || !broadcastBody.trim()) return;
    if (broadcastState === 'sent') return;
    if (broadcastState !== 'confirm') { setBroadcastState('confirm'); return; }
    setBroadcastState('sending');
    try { await CommunicationCenterService.sendBroadcast({ adminUid: auth.user.uid, targetGroups: ['all'], title: broadcastTitle.trim(), content: broadcastBody.trim(), category: 'announcement', priority: 'normal' }); setBroadcastTitle(''); setBroadcastBody(''); setBroadcastState('sent'); }
    catch { setBroadcastState('error'); }
  };
  const visibleMessages = filter === 'unread' ? messages.filter((message) => !message.isRead) : messages;
  return <section className="mx-auto mt-8 max-w-7xl rounded-3xl border border-[#E3E0D7] bg-[#FBFAF6] p-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-[#344139]">Komunikasi &amp; Inbox</h2><p className="text-xs text-[#6D786F]">{messages.filter((message) => !message.isRead).length} pesan belum dibaca · {messages.length} pesan pengguna</p></div><div className="flex items-center gap-3"><select aria-label="Filter pesan" value={filter} onChange={(event) => setFilter(event.target.value as 'all' | 'unread')} className="rounded-lg border border-[#E8E9E5] bg-white px-2 py-1 text-xs"><option value="all">Semua</option><option value="unread">Belum dibaca</option></select><button type="button" onClick={() => setBroadcastOpen((value) => !value)} className="rounded-lg border border-[#E8E9E5] bg-white px-2 py-1 text-xs font-bold">{broadcastOpen ? 'Tutup Broadcast' : 'Broadcast'}</button><button type="button" onClick={() => void load()} className="text-xs font-bold text-[#526256]">Muat ulang</button></div></div>{broadcastOpen && <div className="mt-4 rounded-2xl border border-[#E8E9E5] bg-white p-4"><p className="text-sm font-bold text-[#344139]">Broadcast ke semua pengguna valid</p><input value={broadcastTitle} onChange={(event) => setBroadcastTitle(event.target.value)} maxLength={140} placeholder="Subjek" className="mt-3 w-full rounded-xl border border-[#E8E9E5] p-3 text-sm" /><textarea value={broadcastBody} onChange={(event) => setBroadcastBody(event.target.value)} maxLength={4000} rows={3} placeholder="Tulis pengumuman..." className="mt-3 w-full rounded-xl border border-[#E8E9E5] p-3 text-sm" /><button type="button" onClick={() => void sendBroadcast()} disabled={broadcastState === 'sending' || broadcastState === 'sent'} className="mt-3 rounded-xl bg-[#344139] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{broadcastState === 'confirm' ? 'Konfirmasi Kirim' : broadcastState === 'sending' ? 'Mengirim...' : broadcastState === 'sent' ? 'Terkirim' : 'Kirim Broadcast'}</button>{broadcastState === 'sent' && <p className="mt-2 text-xs text-emerald-700">Broadcast terkirim.</p>}{broadcastState === 'error' && <p className="mt-2 text-xs text-red-700">Broadcast gagal dikirim. Silakan coba lagi.</p>}</div>}<div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]"> <div className="space-y-2">{visibleMessages.length === 0 ? <p className="rounded-2xl bg-white p-5 text-sm text-[#7B8776]">Belum ada pesan pengguna.</p> : visibleMessages.map((message) => <button type="button" key={message.id} onClick={() => setSelected(message)} className={`w-full rounded-2xl border p-4 text-left ${selected?.id === message.id ? "border-[#4F5E52] bg-[#F5F1E8]" : "border-[#E8E9E5] bg-white"}`}><p className="text-sm font-bold text-[#344139]">{message.title}</p><p className="mt-1 text-xs text-[#6D786F]">{message.type} · {message.isRead ? "Dibaca" : "Baru"}</p><p className="mt-1 line-clamp-2 text-xs text-[#7B8776]">{message.summary}</p></button>)}</div>{selected && <div className="rounded-2xl border border-[#E8E9E5] bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-[#9AA394]">Thread {selected.threadId}</p><h3 className="mt-2 text-lg font-bold text-[#344139]">{selected.title}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#526256]">{selected.content}</p><textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={4} placeholder="Tulis balasan..." className="mt-5 w-full rounded-xl border border-[#E8E9E5] p-3 text-sm" /><button type="button" onClick={() => void sendReply()} disabled={status === "sending"} className="mt-3 rounded-xl bg-[#344139] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{status === "sending" ? "Mengirim..." : "Balas"}</button>{status === "sent" && <p className="mt-2 text-xs text-emerald-700">Balasan terkirim.</p>}{status === "error" && <p className="mt-2 text-xs text-red-700">Balasan gagal dikirim.</p>}</div>}</div></section>;
}
