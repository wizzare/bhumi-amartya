"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ShieldClose,
  UserCheck,
  XCircle,
  ChevronRight,
  X,
  ChevronDown,
  LoaderCircle,
  Search,
  ChevronLeft,
  ArrowUpDown,
  Filter,
  User as UserIcon,
  Shield,
  Smartphone,
  ExternalLink,
  Lock,
  Unlock,
} from "lucide-react";
import { adminRepository, type AdminHdDiagnostic } from "@/lib/repositories/adminRepository";
import { UserProfile } from "@/lib/repositories/userRepository";
import { evaluateCandidateStatus } from "@/lib/engines/qualificationEngine";
import { parseVersionCode, CURRENT_BUILD_NUMBER } from "@/lib/config/buildInfo";
import { isCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";
import { isTrialExpired } from "@/lib/billing/accessControl";

type ViewMode = "validation" | "monitoring";
type UserStatus = "Active" | "Inactive" | "Belum Login";

export function CoreGuardianValidation({ founderUid }: { founderUid: string }) {
  const [view, setView] = useState<ViewMode>("monitoring");
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [candidateData, userData] = await Promise.all([
          adminRepository.getCoreGuardianCandidates(),
          adminRepository.getAllUsersForMonitoring(),
        ]);
        setCandidates(candidateData.filter(isRealUser));
        setAllUsers(userData);
      } catch (err: unknown) {
        console.error("Failed to fetch admin data", err);
        setError("Data belum tersedia. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, []);

  const realUsers = useMemo(() => allUsers.filter(isRealUser), [allUsers]);
  const adoption = useMemo(() => calculateAdoption(realUsers, allUsers), [realUsers, allUsers]);

  const handleAction = async (targetUid: string, action: "APPROVE" | "REJECT", reason: string) => {
    const candidate = candidates.find((item) => item.uid === targetUid);
    if (!candidate) return;

    await adminRepository.processValidation(founderUid, targetUid, action, {
      previousTier: candidate.recognitionTier || "CORE_GUARDIAN_CANDIDATE",
      reason,
    });

    setCandidates((items) => items.filter((item) => item.uid !== targetUid));
    setAllUsers((users) => users.map((user) => {
      if (user.uid !== targetUid) return user;
      return {
        ...user,
        guardianCandidate: false,
        guardianApproved: action === "APPROVE",
        recognitionTier: action === "APPROVE" ? "CORE_GUARDIAN" : "GUARDIAN",
        guardianBadge: action === "APPROVE" ? "core_guardian" : "guardian",
        membershipType: action === "APPROVE" ? "PREMIUM" : "FREE",
      };
    }));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-serif font-bold text-[#4F6658]">Ringkasan Pengguna</h3>
          <p className="text-sm text-[#7B8776] mt-1">Status pengguna, akses Bhumi Inti, dan aktivitas terbaru.</p>
        </div>
        <div className="flex bg-[#FCFAF5] p-1 rounded-xl border border-[#E8E9E5]">
          <button
            type="button"
            onClick={() => setView("monitoring")}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${view === "monitoring" ? "bg-[#4F6658] text-white shadow-sm" : "text-[#7B8776]"}`}
          >
            Monitoring
          </button>
          <button
            type="button"
            onClick={() => setView("validation")}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${view === "validation" ? "bg-[#4F6658] text-white shadow-sm" : "text-[#7B8776]"}`}
          >
            Validation
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <FounderMetric label="Total Penghuni Bhumi" value={adoption.totalReal} />
        <FounderMetric label="Penghuni Bhumi aktif" value={adoption.active} />
        <FounderMetric label="Penghuni Bhumi" value={adoption.guardians} />
        <FounderMetric label="Founder" value={adoption.founders} />
        <FounderMetric label="Penghuni baru minggu ini" value={adoption.newThisWeek} />
      </div>

      {loading ? (
        <div className="p-10 text-center italic text-[#7B8776]">Memuat data...</div>
      ) : error ? (
        <div className="p-10 bhumi-card bg-red-50 border-red-100 text-center space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={40} />
          <div>
            <p className="text-red-800 font-bold">Data belum tersedia</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
          >
            Coba Lagi
          </button>
        </div>
      ) : view === "validation" ? (
        <CandidateValidation
          candidates={candidates}
          founderUid={founderUid}
          onAction={handleAction}
          onSelectUser={setSelectedUser}
        />
      ) : (
        <UserMonitoring users={allUsers} showTestAccounts={showTestAccounts} onShowTestAccounts={setShowTestAccounts} onSelectUser={setSelectedUser} />
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          founderUid={founderUid}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

function CandidateValidation({
  candidates,
  founderUid,
  onAction,
  onSelectUser,
}: {
  candidates: UserProfile[];
  founderUid: string;
  onAction: (targetUid: string, action: "APPROVE" | "REJECT", reason: string) => Promise<void>;
  onSelectUser?: (user: UserProfile) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <h4 className="text-lg font-bold text-[#4F6658]">Core Guardian Validation</h4>
        <p className="text-xs text-[#7B8776]">Kandidat &gt; Review Founder &gt; Persetujuan manual.</p>
      </div>

      {candidates.length === 0 ? (
        <div className="p-10 bg-[#FCFAF5] rounded-3xl text-center border border-dashed border-[#E8E9E5] text-[#9AA394] font-medium">
          Tidak ada kandidat untuk divalidasi saat ini.
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => {
            const status = evaluateCandidateStatus(candidate);
            const metrics = candidate.participationMetrics;

            return (
              <div
                key={candidate.uid}
                onClick={() => onSelectUser?.(candidate)}
                className="bhumi-card p-6 bg-white border border-[#E8E9E5] shadow-sm cursor-pointer hover:border-[#4F5E52]/30 transition-all"
              >
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#4F6658] text-lg truncate">{candidate.fullName || candidate.displayName || "Penghuni Bhumi"}</h4>
                    <p className="text-xs text-[#7B8776] font-medium truncate">{candidate.email || "-"}</p>
                    <p className="text-[10px] text-[#9AA394] mt-1 uppercase font-bold tracking-widest">Build: {candidate.buildNumber || metrics?.buildNumber || "N/A"}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <MetricItem label="Login" value={metrics?.loginCount || 0} icon={<Clock size={12} />} />
                  <MetricItem label="Check-In" value={metrics?.hasCompletedCheckIn ? "YA" : "TIDAK"} icon={<CheckCircle2 size={12} />} />
                  <MetricItem label="Assessment" value={metrics?.hasCompletedAssessment ? "YA" : "TIDAK"} icon={<AlertCircle size={12} />} />
                  <MetricItem label="Hari Aktif" value={metrics?.activeDays?.length || 0} icon={<Calendar size={12} />} />
                </div>

                <div className="pt-4 border-t border-[#F5F1E8] flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onAction(candidate.uid, "APPROVE", `Founder manual approval by ${founderUid}.`)}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                  >
                    <UserCheck size={14} /> Setujui Bhumi Inti
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction(candidate.uid, "REJECT", "Founder review: tetap sebagai Guardian reguler.")}
                    className="flex-1 py-3 px-4 rounded-xl bg-white border border-[#E8E9E5] text-[#7B8776] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:border-red-200 hover:text-red-600 transition-all"
                  >
                    <ShieldClose size={14} /> Keep As Guardian
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UserMonitoring({ users, showTestAccounts, onShowTestAccounts, onSelectUser }: {
  users: UserProfile[];
  showTestAccounts: boolean;
  onShowTestAccounts: (show: boolean) => void;
  onSelectUser: (user: UserProfile) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("last-seen-desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => (showTestAccounts ? isVisibleUser(user) : isRealUser(user)));

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((u) => {
        const name = `${u.fullName || ""} ${u.displayName || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        const build = (u.buildNumber || u.participationMetrics?.buildNumber || "").toLowerCase();
        const role = (u.guardianRole || u.role || "").toLowerCase();
        return name.includes(q) || email.includes(q) || build.includes(q) || role.includes(q);
      });
    }

    if (filter !== "all") {
      result = result.filter((u) => {
        const presence = getUserPresence(u);
        const hdValid = isCanonicalHumanDesign((u as any).humanDesign || (u as any).blueprint?.humanDesign);
        const isFounder = u.guardianRole === "founder" || u.recognitionTier === "FOUNDER";
        const isOldBuild = presence.buildNumber !== "-" && presence.buildNumber !== String(CURRENT_BUILD_NUMBER);

        if (filter === "founder") return isFounder;
        if (filter === "user") return !isFounder;
        if (filter === "hd-pending") return !hdValid;
        if (filter === "hd-validated") return hdValid;
        if (filter === "build-old") return isOldBuild;
        if (filter === "active-7d") return presence.status === "Active";
        if (filter === "inactive") return presence.status === "Inactive" || presence.status === "Belum Login";
        return true;
      });
    }

    result = [...result].sort((a, b) => {
      const pA = getUserPresence(a);
      const pB = getUserPresence(b);
      const timeA = getLastSeenTime(a);
      const timeB = getLastSeenTime(b);

      if (sort === "last-seen-desc") return timeB - timeA;
      if (sort === "last-seen-asc") return timeA - timeB;
      if (sort === "name-asc") return (a.fullName || a.displayName || "").localeCompare(b.fullName || b.displayName || "");
      if (sort === "build-desc") return Number(pB.buildNumber) - Number(pA.buildNumber);
      if (sort === "build-asc") return Number(pA.buildNumber) - Number(pB.buildNumber);
      if (sort === "login-desc") return (b.participationMetrics?.loginCount || 0) - (a.participationMetrics?.loginCount || 0);
      return 0;
    });

    return result;
  }, [users, showTestAccounts, search, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, filter, sort, showTestAccounts]);

  const downloadCsv = () => {
    const headers = ["Nama", "Email", "Build", "Last Seen", "Status", "Registered At", "Sheet Daily"];
    const rows = filteredUsers.map((user) => {
      const presence = getUserPresence(user);
      return [
        user.fullName || user.displayName || "Penghuni Bhumi",
        user.email || "-",
        presence.buildNumber,
        presence.lastSeenLabel,
        getCsvStatus(user),
        formatDate(user.registeredAt || user.createdAt),
        user.participationMetrics?.activeDays?.join(" | ") || "Belum ada aktivitas harian",
      ];
    });
    const csv = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `penghuni-bhumi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-1">
        <div>
          <h4 className="text-lg font-bold text-[#4F6658]">Daftar Pengguna</h4>
          <p className="text-xs text-[#7B8776]">Total {filteredUsers.length} penghuni ditemukan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#7B8776]">
            <input type="checkbox" checked={showTestAccounts} onChange={(event) => onShowTestAccounts(event.target.checked)} className="accent-[#4F6658]" />
            Akun testing
          </label>
          <button type="button" onClick={downloadCsv} disabled={filteredUsers.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-[#4F6658] px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* SEARCH, FILTER, SORT CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 px-1">
        <div className="md:col-span-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA394]" size={16} />
          <input
            type="text"
            placeholder="Search user, email, build..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8E9E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6658]/20 focus:border-[#4F6658] transition-all"
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <div className="relative flex-1">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA394]" size={14} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E9E5] bg-white text-xs font-bold text-[#4F6658] appearance-none focus:outline-none"
            >
              <option value="all">Semua User</option>
              <option value="founder">Founder & Admin</option>
              <option value="user">Penghuni Bhumi</option>
              <option value="hd-validated">HD Validated</option>
              <option value="hd-pending">HD Pending</option>
              <option value="build-old">Build Lama</option>
              <option value="active-7d">Aktif (7 Hari)</option>
              <option value="inactive">Belum Aktif</option>
            </select>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="relative">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA394]" size={14} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E9E5] bg-white text-xs font-bold text-[#4F6658] appearance-none focus:outline-none"
            >
              <option value="last-seen-desc">Terakhir Aktif</option>
              <option value="last-seen-asc">Terlama Aktif</option>
              <option value="name-asc">Nama A-Z</option>
              <option value="build-desc">Build Terbaru</option>
              <option value="login-desc">Login Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-[2.5rem] border-2 border-dashed border-[#E8E9E5] bg-white p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto text-[#9AA394]">
            <Search size={32} />
          </div>
          <div>
            <p className="font-bold text-[#4F6658]">Tidak ada hasil</p>
            <p className="text-sm text-[#7B8776]">Coba sesuaikan kata kunci atau filter pencarianmu.</p>
          </div>
          <button onClick={() => { setSearch(""); setFilter("all"); }} className="text-[#4F6658] font-bold text-xs underline underline-offset-4">Reset Pencarian</button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden lg:block overflow-hidden rounded-[2.5rem] border border-[#E8E9E5] bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F1E8]/50 text-[#7B8776] text-[10px] font-bold uppercase tracking-widest border-b border-[#E8E9E5]">
                  <th className="px-6 py-5">Penghuni</th>
                  <th className="px-6 py-5">Status / Role</th>
                  <th className="px-6 py-5">Access</th>
                  <th className="px-6 py-5">Build / Version</th>
                  <th className="px-6 py-5">HD Status</th>
                  <th className="px-6 py-5">Metrics</th>
                  <th className="px-6 py-5">Last Seen</th>
                  <th className="px-6 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F1E8]">
                {paginatedUsers.map((user) => {
                  const presence = getUserPresence(user);
                  const badge = getStatusBadgeInfo(user);
                  const hdValid = isCanonicalHumanDesign((user as any).humanDesign || (user as any).blueprint?.humanDesign);
                  const isOldBuild = presence.buildNumber !== "-" && presence.buildNumber !== String(CURRENT_BUILD_NUMBER);
                  const locked = isTrialExpired(user as any);

                  return (
                    <tr
                      key={user.uid}
                      onClick={() => onSelectUser(user)}
                      className="hover:bg-[#FCFAF5] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#4F6658] font-serif font-bold text-lg shrink-0">
                            {(user.fullName || user.displayName || "J")[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#4F6658] truncate">{user.fullName || user.displayName || "Jiwa"}</p>
                            <p className="text-[11px] text-[#7B8776] truncate">{user.email || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${badge.color} border`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {locked ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-tighter">
                            <Lock size={10} /> Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter">
                            <Unlock size={10} /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {locked ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-tighter">
                            <Lock size={10} /> Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter">
                            <Unlock size={10} /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Smartphone size={10} className="text-[#9AA394]" />
                            <p className="text-[11px] font-bold text-[#4F6658]">{presence.buildNumber}</p>
                            {isOldBuild && <span className="text-[8px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md font-bold border border-red-100">OLD</span>}
                          </div>
                          <p className="text-[9px] text-[#9AA394] ml-4 italic">{presence.platform} · {presence.versionName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         {hdValid ? (
                           <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                             <CheckCircle2 size={12} /> Validated
                           </span>
                         ) : (
                           <span className="flex items-center gap-1.5 text-amber-500 font-bold text-[10px] uppercase">
                             <Clock size={12} /> Pending
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className="text-center">
                              <p className="text-[8px] text-[#9AA394] uppercase font-bold tracking-tighter">Logins</p>
                              <p className="text-xs font-bold text-[#4F6658]">{user.participationMetrics?.loginCount || 0}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[8px] text-[#9AA394] uppercase font-bold tracking-tighter">Days</p>
                              <p className="text-xs font-bold text-[#4F6658]">{user.participationMetrics?.activeDays?.length || 0}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-[#4F6658]">{presence.lastSeenLabel}</p>
                        <p className="text-[9px] text-[#9AA394] uppercase font-bold tracking-widest">{presence.status}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <button className="p-2 rounded-xl bg-[#F5F1E8] text-[#4F6658] opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={16} />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST VIEW */}
          <div className="lg:hidden space-y-3">
            {paginatedUsers.map((user) => {
              const presence = getUserPresence(user);
              const badge = getStatusBadgeInfo(user);
              const hdValid = isCanonicalHumanDesign((user as any).humanDesign || (user as any).blueprint?.humanDesign);
              const isOldBuild = presence.buildNumber !== "-" && presence.buildNumber !== String(CURRENT_BUILD_NUMBER);

              return (
                <div
                  key={user.uid}
                  onClick={() => onSelectUser(user)}
                  className="p-5 rounded-[2rem] bg-white border border-[#E8E9E5] shadow-sm space-y-4 active:scale-[0.98] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#4F6658] font-serif font-bold text-lg">
                        {(user.fullName || user.displayName || "J")[0]}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-[#4F6658] truncate leading-tight">{user.fullName || user.displayName || "Jiwa"}</h5>
                        <p className="text-[11px] text-[#7B8776] truncate">{user.email || "-"}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${badge.color} border`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F5F1E8]">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-[#9AA394] uppercase tracking-widest">Access</p>
                      {isTrialExpired(user as any) ? (
                        <p className="text-xs font-bold text-red-600">Locked</p>
                      ) : (
                        <p className="text-xs font-bold text-emerald-600">Active</p>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-[#9AA394] uppercase tracking-widest">Build</p>
                      <div className="flex items-center gap-1.5">
                         <p className="text-xs font-bold text-[#4F6658]">{presence.buildNumber}</p>
                         {isOldBuild && <span className="text-[8px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md font-bold">OLD</span>}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-[#9AA394] uppercase tracking-widest">Human Design</p>
                      {hdValid ? (
                        <p className="text-xs font-bold text-emerald-600">Validated</p>
                      ) : (
                        <p className="text-xs font-bold text-amber-500">Pending</p>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-[#9AA394] uppercase tracking-widest">Last Seen</p>
                      <p className="text-xs font-bold text-[#4F6658]">{presence.lastSeenLabel} <span className="text-[9px] text-[#9AA394] font-medium tracking-tight">({presence.status})</span></p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-[#9AA394] uppercase tracking-widest">Logins</p>
                      <p className="text-xs font-bold text-[#4F6658]">{user.participationMetrics?.loginCount || 0} times</p>
                    </div>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-[#F5F1E8] text-[#4F6658] text-[10px] font-bold uppercase tracking-widest">
                    Lihat Detail Lengkap
                  </button>
                </div>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 pt-4 pb-10">
            <p className="text-xs text-[#7B8776] font-medium order-2 sm:order-1">
              Menampilkan <span className="text-[#4F6658] font-bold">{Math.min(filteredUsers.length, (page - 1) * pageSize + 1)}-{Math.min(filteredUsers.length, page * pageSize)}</span> dari <span className="text-[#4F6658] font-bold">{filteredUsers.length}</span> Penghuni
            </p>

            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-[#E8E9E5] bg-white text-[#7B8776] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F5F1E8] transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center px-4 h-10 rounded-xl border border-[#E8E9E5] bg-white text-xs font-bold text-[#4F6658]">
                Page {page} of {totalPages}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-[#E8E9E5] bg-white text-[#7B8776] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F5F1E8] transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserDetailModal({ user, founderUid, onClose }: { user: UserProfile; founderUid: string; onClose: () => void }) {
  const presence = getUserPresence(user);
  const badge = getStatusBadgeInfo(user);
  const [hdOpen, setHdOpen] = useState(false);
  const [hdDiagnostic, setHdDiagnostic] = useState<AdminHdDiagnostic | null>(null);
  const [hdLoading, setHdLoading] = useState(false);
  const [hdMessage, setHdMessage] = useState<string | null>(null);

  const loadHdDiagnostic = async () => {
    setHdLoading(true);
    setHdMessage(null);
    try {
      setHdDiagnostic(await adminRepository.getHdDiagnostic(user));
    } catch {
      setHdMessage("Diagnostic Human Design belum dapat dimuat.");
    } finally {
      setHdLoading(false);
    }
  };

  const toggleHd = () => {
    const next = !hdOpen;
    setHdOpen(next);
    if (next && !hdDiagnostic && !hdLoading) void loadHdDiagnostic();
  };

  const runHdAction = async (action: "audit" | "clear" | "migration") => {
    setHdLoading(true);
    setHdMessage(null);
    try {
      if (action === "audit") await adminRepository.rerunHdAudit(founderUid, user);
      if (action === "clear") await adminRepository.clearHdCache(founderUid, user);
      if (action === "migration") await adminRepository.rerunGaiaMigration(founderUid, user);
      setHdDiagnostic(await adminRepository.getHdDiagnostic(user));
      setHdMessage(action === "audit" ? "HD audit selesai dijalankan." : action === "clear" ? "HD cache telah dibersihkan." : "Migrasi Gaia selesai dijalankan ulang.");
    } catch (error) {
      setHdMessage(error instanceof Error ? error.message : "Action belum dapat diselesaikan.");
    } finally {
      setHdLoading(false);
    }
  };

  const registeredAt = formatDate(user.registeredAt);
  const lastLogin = formatDate(user.participationMetrics?.lastLoginAt || user.participationMetrics?.lastCheckInAt);
  const lastSeenFull = user.lastSeen || user.participationMetrics?.lastSeen
    ? new Date(getLastSeenTime(user)).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-y-auto border border-white/20 animate-in fade-in zoom-in duration-200">
        <header className="p-8 bg-[#F5F1E8]/50 flex justify-between items-start">
          <div className="min-w-0">
            <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-3 ${badge.color}`}>
              {badge.label}
            </span>
            <h3 className="text-2xl font-serif font-bold text-[#4F6658] truncate">{user.fullName || user.displayName || "Jiwa"}</h3>
            <p className="text-sm text-[#7B8776] mt-1 truncate">{user.email || "-"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/50 transition-colors">
            <X size={20} className="text-[#7B8776]" />
          </button>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-y-6">
            <DetailItem label="Version Name" value={presence.versionName} />
            <DetailItem label="Version Code" value={presence.versionCode.toString()} />
            <DetailItem label="Build Number" value={presence.buildNumber} />
            <DetailItem label="Platform" value={presence.platform} />
            <DetailItem label="Profile Version" value={user.profileVersion || "-"} />
            <DetailItem label="Engine Version" value={user.engineVersion || "-"} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-[#F5F1E8]">
            <MetricItem label="Login" value={user.participationMetrics?.loginCount || 0} icon={<Clock size={12} />} />
            <MetricItem label="Check-In" value={user.participationMetrics?.hasCompletedCheckIn ? "YA" : "TIDAK"} icon={<CheckCircle2 size={12} />} />
            <MetricItem label="Assessment" value={user.participationMetrics?.hasCompletedAssessment ? "YA" : "TIDAK"} icon={<AlertCircle size={12} />} />
            <MetricItem label="Hari Aktif" value={user.participationMetrics?.activeDays?.length || 0} icon={<Calendar size={12} />} />
          </div>

          <div className="space-y-4 pt-6 border-t border-[#F5F1E8]">
            <DetailItem label="Registered At" value={registeredAt} fullWidth />
            <DetailItem label="Last Login" value={lastLogin} fullWidth />
            <DetailItem label="Last Seen" value={lastSeenFull} fullWidth />
          </div>

          <section className="pt-6 border-t border-[#F5F1E8]">
            <button type="button" onClick={toggleHd} className="flex w-full items-center justify-between text-left">
              <div><p className="text-sm font-bold text-[#4F6658]">Human Design</p><p className="mt-1 text-[10px] text-[#9AA394]">Diagnostic Founder</p></div>
              <ChevronDown size={18} className={`text-[#7B8776] transition-transform ${hdOpen ? "rotate-180" : ""}`} />
            </button>
            {hdOpen && <div className="mt-5 space-y-5">
              {hdLoading && !hdDiagnostic ? <div className="flex items-center gap-2 text-xs text-[#7B8776]"><LoaderCircle size={14} className="animate-spin" />Memuat diagnostic...</div> : hdDiagnostic && <div className="grid grid-cols-2 gap-y-5">
                <DetailItem label="HD Status" value={hdDiagnostic.status} />
                <DetailItem label="HD Type" value={hdDiagnostic.type} />
                <DetailItem label="HD Source" value={hdDiagnostic.source} />
                <DetailItem label="HD Engine Version" value={hdDiagnostic.engineVersion} />
                <DetailItem label="Raw HD Type" value={hdDiagnostic.rawType} />
                <DetailItem label="Raw HD Status" value={hdDiagnostic.rawStatus} />
                <DetailItem label="Raw HD Source" value={hdDiagnostic.rawSource} />
                <DetailItem label="Raw Calculation Quality" value={hdDiagnostic.rawCalculationQuality} />
                <DetailItem label="Raw HD Engine Version" value={hdDiagnostic.rawEngineVersion} />
                <DetailItem label="Canonical Failure Reason" value={hdDiagnostic.canonicalFailureReason} />
                <DetailItem label="Last HD Calculation" value={hdDiagnostic.lastCalculation} fullWidth />
                <DetailItem label="Birth Date Normalized" value={hdDiagnostic.normalizedBirthDate} />
                <DetailItem label="Birth Time" value={hdDiagnostic.birthTime} />
                <DetailItem label="Timezone" value={hdDiagnostic.timezone} />
                <DetailItem label="City / Country" value={hdDiagnostic.cityCountry} />
                <DetailItem label="UTC Datetime" value={hdDiagnostic.utcDateTime} fullWidth />
                <DetailItem label="Cache Key" value={hdDiagnostic.cacheKey} fullWidth />
              </div>}
              <div className="grid gap-2">
                <button disabled={hdLoading} onClick={() => void runHdAction("audit")} className="rounded-xl bg-[#4F6658] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Re-run HD Audit</button>
                <button disabled={hdLoading} onClick={() => void runHdAction("clear")} className="rounded-xl border border-[#E8E9E5] px-4 py-2.5 text-xs font-bold text-[#7B8776] disabled:opacity-50">Clear HD Cache</button>
                <button disabled={hdLoading} onClick={() => void runHdAction("migration")} className="rounded-xl border border-[#E8E9E5] px-4 py-2.5 text-xs font-bold text-[#7B8776] disabled:opacity-50">Re-run Gaia Migration</button>
              </div>
              {hdMessage && <p className="rounded-xl bg-[#F5F1E8] p-3 text-xs leading-5 text-[#4F6658]">{hdMessage}</p>}
            </div>}
          </section>
        </div>

        <footer className="p-6 bg-[#FCFAF5] border-t border-[#F5F1E8] flex justify-center">
           <button
             onClick={onClose}
             className="px-8 py-3 rounded-full bg-[#4F5E52] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#3D4A3F] transition-all"
           >
             Tutup Detail
           </button>
        </footer>
      </div>
    </div>
  );
}

function DetailItem({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-[#4F6658]">{value}</p>
    </div>
  );
}

function formatDate(val: unknown): string {
  if (!val) return "-";
  try {
    let date: Date;
    if (typeof val === "string") date = new Date(val);
    else if (typeof val === "object" && "toDate" in val && typeof val.toDate === "function") date = val.toDate();
    else return "-";

    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "-";
  }
}

function getCsvStatus(user: UserProfile): string {
  const lastSeen = getLastSeenTime(user);
  if (lastSeen) return getUserPresence(user).status;
  const registered = getDateTime(user.registeredAt || user.createdAt);
  if (!registered) return "Belum login";
  const days = Math.max(0, Math.floor((Date.now() - registered) / 86_400_000));
  return `Belum login ${days} hari`;
}

function escapeCsvValue(value: string | number): string {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function getStatusBadgeInfo(user: UserProfile): { label: string; color: string } {
  if (user.guardianRole === "founder" || user.recognitionTier === "FOUNDER") {
    return { label: "Founder Bhumi", color: "bg-amber-100 text-amber-800 border-amber-200" };
  }
  return { label: "Penghuni Bhumi", color: "bg-[#F5F1E8] text-[#7B8776] border-[#E8E9E5]" };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; color: string }> = {
    QUALIFIED: { icon: <CheckCircle2 size={12} />, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    "REVIEW REQUIRED": { icon: <AlertCircle size={12} />, color: "bg-amber-50 text-amber-700 border-amber-100" },
    "NOT QUALIFIED": { icon: <XCircle size={12} />, color: "bg-red-50 text-red-700 border-red-100" },
  };
  const item = config[status] || config["NOT QUALIFIED"];

  return (
    <div className={`px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${item.color}`}>
      {item.icon} {status}
    </div>
  );
}

function MetricItem({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="bg-[#FCFAF5] p-3 rounded-2xl border border-[#E8E9E5]/50">
      <p className="text-[8px] font-bold text-[#9AA394] uppercase tracking-widest mb-1 flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="text-sm font-bold text-[#4F6658]">{value}</p>
    </div>
  );
}

function MonitorStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[7px] font-bold text-[#9AA394] uppercase tracking-tighter mb-0.5">{label}</p>
      <p className="text-[10px] font-bold text-[#4F6658]">{value}</p>
    </div>
  );
}

function FounderMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-4 border border-[#E8E9E5] shadow-sm">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[#7B8776]">{label}</p>
      <p className="mt-2 text-2xl font-serif font-bold text-[#4F6658]">{value}</p>
    </div>
  );
}

type AdminUserRecord = UserProfile & Record<string, unknown>;

function isVisibleUser(user: UserProfile): boolean {
  const record = user as AdminUserRecord;
  const name = `${user.fullName || ""} ${user.displayName || ""}`.trim().toLowerCase();
  const email = (user.email || "").trim().toLowerCase();
  const hasIdentity = Boolean(name || email);
  const isDeleted = record.isDeleted === true || Boolean(record.deletedAt) || email.includes("deleted") || name.includes("deleted account");
  const isArchived = record.archived === true;
  return hasIdentity && !isDeleted && !isArchived;
}

function isTestUser(user: UserProfile): boolean {
  const record = user as AdminUserRecord;
  const name = `${user.fullName || ""} ${user.displayName || ""}`.trim().toLowerCase();
  const email = (user.email || "").trim().toLowerCase();
  return record.isTest === true
    || record.isTester === true
    || user.role === "test"
    || name.includes("qa delete")
    || /(^|[+._-])(test|dummy)([+._@-]|$)/i.test(email)
    || /\b(test|testing|dummy)\b/i.test(name);
}

function isRealUser(user: UserProfile): boolean {
  return isVisibleUser(user) && !isTestUser(user);
}

function calculateAdoption(users: UserProfile[], allUsers: UserProfile[]) {
  const metrics = users.reduce(
    (acc, user) => {
      const presence = getUserPresence(user);
      acc.totalReal += 1;
      if (presence.status === "Active") acc.active += 1;
      if (user.guardianRole === "founder" || user.recognitionTier === "FOUNDER") acc.founders += 1;
      else acc.guardians += 1;
      const registered = getDateTime(user.registeredAt || user.createdAt);
      if (registered && Date.now() - registered <= 7 * 24 * 60 * 60 * 1000) acc.newThisWeek += 1;
      return acc;
    },
    { totalReal: 0, active: 0, guardians: 0, founders: 0, newThisWeek: 0 },
  );
  void allUsers;
  return metrics;
}

function getDateTime(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value === "object" && "seconds" in value && typeof value.seconds === "number") return value.seconds * 1000;
  return 0;
}

function sortUsersByLastSeen(users: UserProfile[]) {
  return [...users].sort((a, b) => getLastSeenTime(b) - getLastSeenTime(a));
}

function getUserPresence(user: UserProfile): {
  status: UserStatus;
  versionCode: number;
  versionName: string;
  buildNumber: string;
  platform: string;
  lastSeenLabel: string;
} {
  const lastSeenTime = getLastSeenTime(user);
  const loginCount = user.participationMetrics?.loginCount || 0;
  const hasEverLoggedIn = loginCount > 0 || lastSeenTime > 0;

  const daysSinceSeen = lastSeenTime ? (Date.now() - lastSeenTime) / (1000 * 60 * 60 * 24) : Number.POSITIVE_INFINITY;
  const status: UserStatus = !hasEverLoggedIn ? "Belum Login" : daysSinceSeen <= 7 ? "Active" : "Inactive";

  const buildNumber = user.buildNumber || user.participationMetrics?.buildNumber || "-";
  const versionCode = Number(user.versionCode ?? user.participationMetrics?.versionCode ?? parseVersionCode(buildNumber) ?? 0);
  const versionName = user.versionName || user.participationMetrics?.versionName || user.participationMetrics?.appVersion || "-";
  const platform = user.platform || user.participationMetrics?.platform || "-";

  return {
    status,
    versionCode,
    versionName,
    buildNumber,
    platform,
    lastSeenLabel: lastSeenTime
      ? new Date(lastSeenTime).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
      : "Belum Login",
  };
}

function getLastSeenTime(user: UserProfile): number {
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
