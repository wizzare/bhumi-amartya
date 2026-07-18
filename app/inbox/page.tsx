"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Map,
  Heart,
  Trophy,
  Megaphone,
  Package,
  Star,
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCheck,
  Filter,
  CheckCircle2,
  Circle
} from "lucide-react";
import { DateTime } from "luxon";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { useAuth } from "@/context/AuthContext";
import { CommunicationCenterService } from "@/lib/services/communicationCenterService";
import { CommunicationMessage, CommunicationType } from "@/lib/types/communication";

const SUPPORT_CATEGORIES = [
  ["SUGGESTION", "Saran Pengembangan"],
  ["BUG_REPORT", "Error atau Bug"],
  ["GENERAL_FEEDBACK", "Masukan Umum"],
  ["ACCOUNT_SUPPORT", "Bantuan Akun atau Aplikasi"],
] as const;

export default function InboxPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const auth = useAuth();
  const uid = auth?.user?.uid;

  // Note: We'll add 'inbox' to translations later, using fallbacks for now
  const t = (translations[language] as any);
  const it = t.inbox || {
    title: "Inbox",
    subtitle: "Pesan dan wawasan untuk perjalananmu.",
    empty: "Belum ada pesan. Teruskan melangkah!",
    markAllRead: "Tandai semua dibaca",
    filters: {
      all: "Semua",
      unread: "Belum Dibaca",
    },
    groups: {
      today: "Hari Ini",
      yesterday: "Kemarin",
      last7Days: "7 Hari Terakhir",
      thisMonth: "Bulan Ini",
      older: "Lebih Lama",
    }
  };

  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [offline, setOffline] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [category, setCategory] = useState<(typeof SUPPORT_CATEGORIES)[number][0]>("SUGGESTION");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const loadInbox = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    setLoadError(false);
    if (typeof navigator !== "undefined" && !navigator.onLine) { setOffline(true); setLoading(false); return; }
    try {
      const data = await CommunicationCenterService.getInbox(uid!);
      setMessages(data);
      setOffline(false);
    } catch (error) {
      console.error("[Inbox] Failed to load messages:", error);
      const code = (error as { code?: string })?.code;
      setOffline(code === "unavailable" || code === "failed-precondition" || (typeof navigator !== "undefined" && !navigator.onLine));
      setLoadError(!(code === "unavailable" || code === "failed-precondition" || (typeof navigator !== "undefined" && !navigator.onLine)));
    } finally {
      setLoading(false);
    }
  }, [uid]);

  const handleMarkAllAsRead = async () => {
    if (!uid) return;
    await CommunicationCenterService.markAllAsRead(uid);
    await loadInbox();
  };

  useEffect(() => { void loadInbox(); }, [loadInbox]);
  useEffect(() => {
    const onOnline = () => { setOffline(false); void loadInbox(); };
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, [loadInbox]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uid || !subject.trim() || !body.trim() || offline) return;
    setSendState("sending");
    try {
      await CommunicationCenterService.submitUserSupportMessage({ authenticatedUid: uid, userName: auth?.user?.displayName || "Sahabat Bhumi", category, subject: subject.trim(), content: body.trim() });
      setSubject(""); setBody(""); setSendState("sent"); setComposeOpen(false); await loadInbox();
    } catch { setSendState("error"); }
  };

  const handleMessageClick = async (msg: CommunicationMessage) => {
    if (!uid) return;

    // 1. Mark as Read
    if (!msg.isRead) {
      await CommunicationCenterService.updateState(uid, msg.id, 'opened');
      // Update local state for immediate feedback
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }

    // 2. Follow Deep Link
    if (msg.deepLink) {
      router.push(msg.deepLink);
    }
  };

  const filteredMessages = useMemo(() => {
    if (activeFilter === "all") return messages;
    if (activeFilter === "unread") return messages.filter(m => !m.isRead);
    return messages.filter(m => m.type === activeFilter);
  }, [messages, activeFilter]);

  const groupedMessages = useMemo(() => {
    const now = DateTime.now();
    const groups: Array<{ label: string, items: CommunicationMessage[] }> = [
      { label: it.groups.today, items: [] },
      { label: it.groups.yesterday, items: [] },
      { label: it.groups.last7Days, items: [] },
      { label: it.groups.thisMonth, items: [] },
      { label: it.groups.older, items: [] },
    ];

    filteredMessages.forEach(msg => {
      const dt = DateTime.fromISO(msg.createdAt);
      if (dt.hasSame(now, 'day')) {
        groups[0].items.push(msg);
      } else if (dt.hasSame(now.minus({ days: 1 }), 'day')) {
        groups[1].items.push(msg);
      } else if (dt > now.minus({ days: 7 })) {
        groups[2].items.push(msg);
      } else if (dt.hasSame(now, 'month')) {
        groups[3].items.push(msg);
      } else {
        groups[4].items.push(msg);
      }
    });

    return groups.filter(g => g.items.length > 0);
  }, [filteredMessages, it]);

  const getIcon = (type: CommunicationType) => {
    switch (type) {
      case 'daily-insight': return <Sparkles className="text-amber-500" size={20} />;
      case 'mirror': return <MessageSquare className="text-blue-500" size={20} />;
      case 'journey-milestone': return <Map className="text-emerald-500" size={20} />;
      case 'healing-reminder': return <Heart className="text-rose-500" size={20} />;
      case 'growth-achievement': return <Trophy className="text-yellow-500" size={20} />;
      case 'system-announcement': return <Megaphone className="text-indigo-500" size={20} />;
      case 'product-update': return <Package className="text-slate-500" size={20} />;
      case 'review-request': return <Star className="text-purple-500" size={20} />;
      default: return <MessageSquare className="text-slate-400" size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      default: return 'bg-transparent';
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-28">
      <AppNav />
      <div className="mx-auto max-w-3xl space-y-6">
        <BhumiPageHeader />

        <header className="bhumi-card p-6 flex justify-between items-center bg-gradient-to-br from-[#FCFAF5] to-[#F5F1E8]">
          <div>
            <h1 className="text-2xl font-bold text-[#4F5E52]">{it.title}</h1>
            <p className="text-sm text-[#7B8776] mt-1">{it.subtitle}</p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="p-2 text-[#7B8776] hover:bg-white rounded-full transition"
            title={it.markAllRead}
          >
            <CheckCheck size={20} />
          </button>
        </header>

        <section className="bhumi-card p-5">
          <button type="button" onClick={() => setComposeOpen((value) => !value)} className="w-full text-left text-sm font-bold text-[#4F5E52]">{composeOpen ? "Tutup Kirim Pesan" : "Kirim Pesan ke Bhumi"}</button>
          {composeOpen && <form onSubmit={handleSend} className="mt-4 space-y-3">
            <label className="block text-xs font-bold text-[#7B8776]">Kategori<select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="mt-1 w-full rounded-xl border border-[#E8E9E5] bg-white p-3 text-sm">{SUPPORT_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="block text-xs font-bold text-[#7B8776]">Subjek<input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={140} className="mt-1 w-full rounded-xl border border-[#E8E9E5] bg-white p-3 text-sm" required /></label>
            <label className="block text-xs font-bold text-[#7B8776]">Pesan<textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} rows={5} className="mt-1 w-full rounded-xl border border-[#E8E9E5] bg-white p-3 text-sm" required /></label>
            <button disabled={sendState === "sending"} className="rounded-xl bg-[#4F5E52] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{sendState === "sending" ? "Mengirim..." : "Kirim"}</button>
            {sendState === "sent" && <p className="text-xs text-emerald-700">Pesan terkirim.</p>}
            {sendState === "error" && <p className="text-xs text-red-700">Pesan gagal dikirim. Silakan coba lagi.</p>}
          </form>}
        </section>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
          <FilterButton
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          >
            {it.filters.all}
          </FilterButton>
          <FilterButton
            active={activeFilter === "unread"}
            onClick={() => setActiveFilter("unread")}
          >
            {it.filters.unread}
          </FilterButton>
          {/* Add more type filters as needed */}
        </div>

        {offline && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-medium">Koneksi sedang offline.</p><p className="mt-1">Pesan yang sudah tampil tetap tersedia. Hubungkan kembali untuk memuat atau mengirim pesan.</p><button type="button" onClick={() => void loadInbox()} className="mt-3 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold">Coba lagi</button></div>}
        {loading ? (
          <div className="py-20 text-center text-[#7B8776]">Memuat pesan...</div>
        ) : loadError ? (
          <div className="bhumi-card p-12 text-center space-y-3"><p className="text-[#4F5E52] font-medium">Inbox tidak dapat dimuat.</p><button type="button" onClick={() => void loadInbox()} className="rounded-xl border border-[#E8E9E5] bg-white px-4 py-2 text-xs font-bold text-[#4F5E52]">Coba lagi</button></div>
        ) : groupedMessages.length === 0 ? (
          <div className="bhumi-card p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center">
              <MessageSquare className="text-[#9AA394]" size={32} />
            </div>
            <p className="text-[#4F5E52] font-medium">{it.empty}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedMessages.map((group) => (
              <div key={group.label} className="space-y-3">
                <h2 className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest ml-1">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.items.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => handleMessageClick(msg)}
                      className={`w-full text-left bhumi-card p-5 transition hover:shadow-md border-l-4 ${
                        msg.isRead ? 'border-transparent opacity-80' : 'border-[#4F5E52] shadow-sm'
                      } flex gap-4 items-start relative`}
                    >
                      <div className="p-3 rounded-2xl bg-white shadow-sm shrink-0">
                        {getIcon(msg.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base font-bold truncate ${msg.isRead ? 'text-[#7B8776]' : 'text-[#4F5E52]'}`}>
                            {msg.title}
                          </h3>
                          {msg.priority !== 'normal' && msg.priority !== 'low' && (
                            <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(msg.priority)}`} />
                          )}
                        </div>
                        <p className="text-sm text-[#7B8776] line-clamp-2 mt-0.5 leading-relaxed">
                          {msg.summary}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[10px] text-[#9AA394] flex items-center gap-1">
                            <Clock size={10} />
                            {DateTime.fromISO(msg.createdAt).toRelative()}
                          </span>
                          {msg.deepLink && (
                            <span className="text-[10px] font-bold text-[#4F5E52] flex items-center gap-1">
                              {msg.action || "Detail"} <ArrowRight size={10} />
                            </span>
                          )}
                        </div>
                      </div>
                      {!msg.isRead && (
                        <div className="absolute top-5 right-5">
                          <Circle size={8} fill="currentColor" className="text-[#4F5E52]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${
        active
          ? 'bg-[#4F5E52] text-white border-[#4F5E52]'
          : 'bg-white text-[#7B8776] border-[#E8E9E5] hover:bg-[#F5F1E8]'
      }`}
    >
      {children}
    </button>
  );
}
