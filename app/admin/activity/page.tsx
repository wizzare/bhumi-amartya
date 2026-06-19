"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ShieldAlert, Users, LogIn, Clock, Hourglass, ArrowLeft, RefreshCw, Calendar, Download } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { useAuth } from "@/context/AuthContext";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import { adminRepository } from "@/lib/repositories/adminRepository";
import { UserProfile } from "@/lib/repositories/userRepository";

interface UserActivity {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  date: string;
  loginCount: number;
  sessionCount: number;
  totalSeconds: number;
  lastLogin: any;
  lastSeen: any; // Firestore Timestamp
  lastScreen: string;
  appVersion?: string;
  buildNumber?: string;
  hasTodayActivity?: boolean;
  createdAt?: any;
  totalActiveDays?: number;
  effectiveRegistrationDate?: number;
}

type SortField = "lastSeen" | "displayName" | "loginCount" | "totalSeconds";
type SortOrder = "asc" | "desc";

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0 menit";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (h > 0) {
    if (m > 0) return `${h} jam ${m} menit`;
    return `${h} jam`;
  }
  if (m === 0 && seconds > 0) return "1 menit";
  return `${m} menit`;
}

function timestampSeconds(value: any): number {
  if (!value) return 0;
  if (typeof value.toDate === "function") return Math.floor(value.toDate().getTime() / 1000);
  if (typeof value.seconds === "number") return value.seconds;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : 0;
  }
  return 0;
}

function formatActivityTime(value: any): string {
  if (!value) return "-";
  try {
    let date: Date;
    if (typeof value.toDate === "function") {
      date = value.toDate();
    } else if (typeof value === "string") {
      date = new Date(value);
    } else {
      date = new Date((value.seconds || 0) * 1000);
    }
    if (!Number.isFinite(date.getTime())) return "-";
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
}

function formatLoginDate(value: any): string {
  if (!value) return "-";
  try {
    let date: Date;
    if (typeof value.toDate === "function") {
      date = value.toDate();
    } else if (typeof value === "string") {
      date = new Date(value);
    } else if (typeof value === "number") {
      date = new Date(value);
    } else {
      date = new Date((value.seconds || 0) * 1000);
    }
    if (!Number.isFinite(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "-";
  }
}

function formatFullDateTime(value: any): string {
  if (!value) return "Belum tersedia";
  try {
    let date: Date;
    if (typeof value.toDate === "function") {
      date = value.toDate();
    } else if (typeof value === "string") {
      date = new Date(value);
    } else {
      date = new Date((value.seconds || 0) * 1000);
    }
    if (!Number.isFinite(date.getTime())) return "Belum tersedia";
    const datePart = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    const timePart = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return `${datePart}, ${timePart}`;
  } catch {
    return "Belum tersedia";
  }
}

function getDaysSince(value: any): string {
  if (!value) return "Belum tersedia";
  let parsed: number;
  if (typeof value.toDate === "function") {
    parsed = value.toDate().getTime();
  } else if (typeof value.seconds === "number") {
    parsed = value.seconds * 1000;
  } else if (typeof value === "string") {
    parsed = Date.parse(value);
  } else if (typeof value === "number") {
    parsed = value;
  } else {
    return "Belum tersedia";
  }
  if (isNaN(parsed) || parsed === 0) return "Belum tersedia";
  const diff = Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24));
  return `${Math.max(0, diff)} hari`;
}

function getDateTime(value: any): number {
  if (!value) return 0;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value === "object" && "seconds" in value && typeof value.seconds === "number") return value.seconds * 1000;
  return 0;
}

function getLastSeenTime(user: any): number {
  const raw = user.lastSeen || user.participationMetrics?.lastSeen;
  if (!raw) return 0;
  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof raw === "object" && "toDate" in raw && typeof raw.toDate === "function") {
    return raw.toDate().getTime();
  }
  if (typeof raw === "object" && "seconds" in raw && typeof raw.seconds === "number") {
     return raw.seconds * 1000;
  }
  return 0;
}

export default function AdminActivityPage() {
  const auth = useAuth();
  const profile = auth?.userProfile;

  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserActivity | null>(null);

  const [sortBy, setSortBy] = useState<SortField>("lastSeen");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isFounder = profile?.guardianRole === "founder"
    || profile?.email?.trim().toLowerCase() === "wizzare@gmail.com";

  const fetchActivities = async (selectedDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const users = await adminRepository.getAllUsersForMonitoring();
      
      const list: UserActivity[] = [];
      
      users.forEach((rawUserData) => {
        const userData = rawUserData as any;
        const email = userData.email || "";
        const name = userData.name || userData.fullName || userData.displayName || "Jiwa";

        if (email.includes("bhumi.qa.delete") || name.includes("QA Delete Account")) {
          return;
        }

        const uid = userData.uid;
        const metrics = userData.participationMetrics || {};
        
        // Use Irina logic for totalActiveDays
        const totalActiveDays = Array.isArray(metrics.activeDays) ? metrics.activeDays.length : 0;
        
        // Last Login & Last Seen
        const lastLogin = metrics.lastLoginAt ?? userData.lastLoginAt ?? null;
        const lastSeen = metrics.lastSeen ?? userData.lastSeen ?? null;
        
        const lastSeenMs = getLastSeenTime(userData);
        const hasTodayActivity = lastSeenMs > 0 && new Date(lastSeenMs).toLocaleDateString("en-CA") === selectedDate;
        
        // Effective Registration Date
        let effectiveRegistrationDate = 0;
        const candidates = [
          getDateTime(userData.createdAt),
          getDateTime(userData.registeredAt),
          getDateTime(userData.joinedAt),
          getDateTime(metrics.firstLoginAt)
        ];
        if (Array.isArray(metrics.activeDays) && metrics.activeDays.length > 0) {
          candidates.push(getDateTime(metrics.activeDays[0]));
        }
        
        for (const candidate of candidates) {
          if (candidate > 0 && (effectiveRegistrationDate === 0 || candidate < effectiveRegistrationDate)) {
            effectiveRegistrationDate = candidate;
          }
        }
        
        // Default to createdAt if absolutely nothing works and it exists
        if (effectiveRegistrationDate === 0) {
            effectiveRegistrationDate = getDateTime(userData.createdAt);
        }

        list.push({
          id: uid,
          uid: uid,
          displayName: name,
          email: email,
          date: selectedDate,
          loginCount: metrics.loginCount || 0,
          sessionCount: 0, // Unreliable from users table
          totalSeconds: 0, // Unreliable from users table
          lastLogin: lastLogin,
          lastSeen: lastSeen,
          lastScreen: "", // Unreliable from users table
          appVersion: userData.versionName || metrics.appVersion || userData.appVersion || metrics.versionName,
          buildNumber: userData.buildNumber || metrics.buildNumber,
          hasTodayActivity,
          createdAt: userData.createdAt || null,
          totalActiveDays,
          effectiveRegistrationDate,
        });
      });
      
      setActivities(list);
    } catch (err) {
      console.error("Failed to load user activity:", err);
      setError("Gagal memuat data aktivitas. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFounder) {
      void fetchActivities(date);
    }
  }, [date, isFounder]);

  // Client-side statistics calculations
  const stats = useMemo(() => {
    const activeCount = activities.filter(a => a.hasTodayActivity).length;
    const totalLogins = activities.reduce((sum, item) => sum + (item.loginCount || 0), 0);
    const totalSeconds = activities.reduce((sum, item) => sum + (item.totalSeconds || 0), 0);
    const avgSeconds = activeCount > 0 ? Math.round(totalSeconds / activeCount) : 0;

    return {
      activeCount,
      totalLogins,
      totalSeconds,
      avgSeconds,
    };
  }, [activities]);

  // Client-side sorting
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      if (sortBy === "lastSeen") {
        const timeA = timestampSeconds(a.lastSeen);
        const timeB = timestampSeconds(b.lastSeen);
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      }
      if (sortBy === "displayName") {
        const nameA = (a.displayName || "").toLowerCase();
        const nameB = (b.displayName || "").toLowerCase();
        return sortOrder === "desc" ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
      }
      if (sortBy === "loginCount") {
        const valA = a.loginCount || 0;
        const valB = b.loginCount || 0;
        return sortOrder === "desc" ? valB - valA : valA - valB;
      }
      if (sortBy === "totalSeconds") {
        const valA = a.totalSeconds || 0;
        const valB = b.totalSeconds || 0;
        return sortOrder === "desc" ? valB - valA : valA - valB;
      }
      return 0;
    });
  }, [activities, sortBy, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedActivities, currentPage]);

  const downloadCSV = () => {
    if (activities.length === 0) return;
    
    const headers = [
      "Nama",
      "Email",
      "UID",
      "Tanggal Aktivitas",
      "Login Hari Ini",
      "Session Count",
      "Total Detik",
      "Halaman Terakhir",
      "Last Login",
      "Last Seen",
      "Tanggal Daftar",
      "Total Hari Aktif",
      "Versi App",
    ].join(",");

    const rows = sortedActivities.map(a => {
      const escape = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;
      
      return [
        escape(a.displayName),
        escape(a.email),
        escape(a.uid),
        escape(a.date),
        escape(a.loginCount),
        escape(a.sessionCount),
        escape(a.totalSeconds),
        escape(a.lastScreen),
        escape(formatFullDateTime(a.lastLogin)),
        escape(formatFullDateTime(a.lastSeen)),
        escape(formatLoginDate(a.createdAt)),
        escape(a.totalActiveDays),
        escape(a.appVersion),
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bhumi_activity_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (auth?.authLoading || auth?.profileLoading) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] flex items-center justify-center">
        <p className="text-[#7B8776] animate-pulse font-medium">Memverifikasi Akses Founder...</p>
      </main>
    );
  }

  // Access Denied
  if (!auth?.user || !isFounder) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-10 flex items-center justify-center">
        <div className="max-w-md w-full bhumi-card p-10 text-center bg-white border border-[#E8E9E5] rounded-[2rem] shadow-sm">
          <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-serif font-bold text-[#4F5E52]">Akses Ditolak</h1>
          <p className="mt-3 text-[#7B8776]">Halaman ini hanya tersedia untuk Founder Bhumi.</p>
          <Link href="/dashboard" className="bhumi-button mt-8 inline-flex px-6 py-2.5 bg-[#4F5E52] text-white rounded-xl text-xs font-bold uppercase tracking-wider">
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] text-[#4F5E52] pb-32">
      <AppNav />

      <header className="pt-12 pb-8 px-6 max-w-4xl mx-auto">
        <BhumiPageHeader className="mb-8 justify-start" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7B8776]">Observabilitas</p>
            <h1 className="text-4xl font-serif font-bold text-[#4F6658] mt-1">Founder Activity Monitor</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Date selector */}
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA394]" size={16} />
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E9E5] bg-white text-xs font-bold text-[#4F6658] focus:outline-none focus:ring-2 focus:ring-[#4F6658]/10"
              />
            </div>
            
            <button
              onClick={() => void fetchActivities(date)}
              className="p-3 rounded-xl bg-white border border-[#E8E9E5] text-[#4F6658] hover:bg-[#F5F1E8] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={downloadCSV}
              className="p-3 rounded-xl bg-white border border-[#E8E9E5] text-[#4F6658] hover:bg-[#F5F1E8] transition-colors"
              title="Download CSV"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bhumi-card p-5 bg-white border border-[#E8E9E5] rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-[#4F6658]/10 text-[#4F6658] shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-wider">Aktif Hari Ini</p>
              <p className="text-2xl font-serif font-bold text-[#4F6658] mt-1">{stats.activeCount} Jiwa</p>
            </div>
          </div>

          <div className="bhumi-card p-5 bg-white border border-[#E8E9E5] rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-[#4F6658]/10 text-[#4F6658] shrink-0">
              <LogIn size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-wider">Total Login</p>
              <p className="text-2xl font-serif font-bold text-[#4F6658] mt-1">{stats.totalLogins} Kali</p>
            </div>
          </div>

          <div className="bhumi-card p-5 bg-white border border-[#E8E9E5] rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-[#4F6658]/10 text-[#4F6658] shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-wider">Total Waktu</p>
              <p className="text-xl font-serif font-bold text-[#4F6658] mt-1.5 truncate max-w-[130px]" title={formatDuration(stats.totalSeconds)}>
                {formatDuration(stats.totalSeconds)}
              </p>
            </div>
          </div>

          <div className="bhumi-card p-5 bg-white border border-[#E8E9E5] rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-[#4F6658]/10 text-[#4F6658] shrink-0">
              <Hourglass size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-wider">Rata-rata Waktu</p>
              <p className="text-xl font-serif font-bold text-[#4F6658] mt-1.5 truncate max-w-[130px]" title={formatDuration(stats.avgSeconds)}>
                {formatDuration(stats.avgSeconds)}
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-[#7B8776] font-medium animate-pulse">
            Memuat data aktivitas...
          </div>
        ) : sortedActivities.length === 0 ? (
          <div className="py-20 text-center text-[#9AA394] italic border-2 border-dashed border-[#E8E9E5] rounded-3xl bg-white">
            Belum ada aktivitas terekam untuk tanggal ini.
          </div>
        ) : (
          /* Desktop Table / Mobile List */
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-3xl border border-[#E8E9E5] bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F1E8]/40 text-[#7B8776] text-[10px] font-bold uppercase tracking-widest border-b border-[#E8E9E5]">
                    <th className="px-6 py-4 cursor-pointer select-none" onClick={() => toggleSort("displayName")}>
                      Nama {sortBy === "displayName" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Last Login</th>
                    <th className="px-6 py-4">Total Hari Aktif</th>
                    <th className="px-6 py-4">Versi App</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {paginatedActivities.map((activity) => (
                    <tr 
                      key={activity.id} 
                      onClick={() => setSelectedUser(activity)}
                      className="hover:bg-[#FCFAF5] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-bold text-[#4F6658]">{activity.displayName}</td>
                      <td className="px-6 py-4 text-xs text-[#7B8776]">{activity.email || "-"}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{formatFullDateTime(activity.lastLogin)}</td>
                      <td className="px-6 py-4 text-sm text-[#4F6658] font-medium">{activity.totalActiveDays ? `${activity.totalActiveDays} hari` : "-"}</td>
                      <td className="px-6 py-4 text-xs font-mono text-[#7B8776]">{activity.appVersion || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-3">
              {paginatedActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  onClick={() => setSelectedUser(activity)}
                  className="p-5 rounded-2xl bg-white border border-[#E8E9E5] shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#FCFAF5]"
                >
                  <div>
                    <h4 className="font-bold text-[#4F6658]">{activity.displayName}</h4>
                    <p className="text-[10px] text-[#7B8776]">{activity.email || "-"}</p>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="text-[8px] font-bold text-[#9AA394] uppercase tracking-wider">Last Login</p>
                      <p className="text-xs font-bold text-[#4F6658]">{formatFullDateTime(activity.lastLogin)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 pb-2 border-t border-[#E8E9E5] mt-4">
                <p className="text-xs text-[#7B8776] font-medium hidden sm:block">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedActivities.length)} dari {sortedActivities.length} jiwa
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-[#E8E9E5] bg-white text-xs font-bold text-[#4F6658] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F1E8] transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs font-bold text-[#4F6658] px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-[#E8E9E5] bg-white text-xs font-bold text-[#4F6658] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F1E8] transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" 
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-white rounded-[32px] p-6 w-full max-w-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-[#4F6658]">{selectedUser.displayName}</h2>
                <p className="text-sm text-[#7B8776]">{selectedUser.email || "-"}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="w-8 h-8 flex items-center justify-center bg-[#F5F1E8] rounded-full text-[#4F6658] hover:bg-[#E8E9E5] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* Identity */}
              <div>
                <h3 className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest mb-2 px-1">Identitas</h3>
                <div className="bg-[#FCFAF5] p-4 rounded-2xl space-y-3 text-sm border border-[#F5F1E8]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">UID</span>
                    <span className="font-mono text-xs text-[#4F6658]">{selectedUser.uid}</span>
                  </div>
                  {(selectedUser.appVersion || selectedUser.buildNumber) && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#7B8776]">Versi App</span>
                      <span className="font-mono text-xs text-[#4F6658]">
                        {selectedUser.appVersion ? `v${selectedUser.appVersion}` : "v?"}{selectedUser.buildNumber ? ` (${selectedUser.buildNumber})` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration */}
              <div>
                <h3 className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest mb-2 px-1">Pendaftaran</h3>
                <div className="bg-[#FCFAF5] p-4 rounded-2xl space-y-3 text-sm border border-[#F5F1E8]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">Tanggal Daftar</span>
                    <span className="font-semibold text-[#4F6658]">{selectedUser.effectiveRegistrationDate ? formatLoginDate(selectedUser.effectiveRegistrationDate) : "Belum tersedia"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">Sudah berapa hari sejak daftar</span>
                    <span className="font-semibold text-[#4F6658]">{getDaysSince(selectedUser.effectiveRegistrationDate)}</span>
                  </div>
                </div>
              </div>

              {/* Activity Today */}
              <div>
                <h3 className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest mb-2 px-1">Aktivitas Hari Ini ({selectedUser.date})</h3>
                <div className="bg-[#FCFAF5] p-4 rounded-2xl space-y-3 text-sm border border-[#F5F1E8]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">Login Hari Ini</span>
                    <span className="font-semibold text-[#4F6658]">Belum tercatat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">Durasi Hari Ini</span>
                    <span className="font-semibold text-[#4F6658]">Belum tercatat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">Halaman Terakhir Diakses</span>
                    <span className="font-semibold text-[#4F6658]">Belum tercatat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">Last Activity</span>
                    <span className="font-semibold text-[#4F6658]">{formatFullDateTime(selectedUser.lastSeen)}</span>
                  </div>
                </div>
              </div>

              {/* Login History */}
              <div>
                <h3 className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest mb-2 px-1">Riwayat Login</h3>
                <div className="bg-[#FCFAF5] p-4 rounded-2xl space-y-3 text-sm border border-[#F5F1E8]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">Total hari login sejak daftar</span>
                    <span className="font-semibold text-[#4F6658]">{selectedUser.totalActiveDays ? `${selectedUser.totalActiveDays} hari` : "Belum tersedia"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">Last Login</span>
                    <span className="font-semibold text-[#4F6658]">{formatFullDateTime(selectedUser.lastLogin)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7B8776]">Session Count (Today)</span>
                    <span className="font-semibold text-[#4F6658]">Belum tercatat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

