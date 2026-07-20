"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Heart,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { collection, doc, getDoc, getDocs, limit as firestoreLimit, query, where } from "firebase/firestore";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/firebase";
import { adminRepository } from "@/lib/repositories/adminRepository";
import { AdminInboxWorkspace } from "@/components/admin/AdminInboxWorkspace";
import { CommunicationCenterService } from "@/lib/services/communicationCenterService";
import { shouldIncludeInAdminAnalytics, getExcludedUids } from "@/lib/admin/adminAnalyticsFilter";

type DateRangeKey = "today" | "yesterday" | "7d" | "30d" | "custom";
type SortField = "name" | "registered" | "activeDays" | "lastLogin" | "status";
type SortOrder = "asc" | "desc";

type ActivityDoc = {
  id: string;
  uid: string;
  date: string;
  displayName?: string;
  email?: string;
  loginCount?: number;
  sessionCount?: number;
  totalSeconds?: number;
  lastLogin?: unknown;
  lastSeen?: unknown;
  lastScreen?: string;
  appVersion?: string;
  buildNumber?: string;
};

type AnalyticsDoc = {
  id: string;
  uid?: string | null;
  activeUid?: string | null;
  eventName?: string;
  date?: string;
  timestamp?: unknown;
};

type DataSourceStatus = {
  users: string;
  activity: string;
  analytics: string;
};

type FounderUser = {
  uid: string;
  displayName: string;
  email: string;
  registeredAt: number;
  activeDays: string[];
  lastLogin: unknown;
  lastSeen: unknown;
  lastSeenMs: number;
  appVersion: string;
  status: string;
  blueprint: string;
  country: string;
  province: string;
  city: string;
  timezone: string;
  isPremium: boolean;
  lastScreen: string;
  rawUser: any;
};

type BlueprintSummary = {
  lifePath: string;
  arcana: string;
  humanDesign: string;
  sun: string;
  weton: string;
  tzolkin: string;
};

type UserDetailData = {
  activity: ActivityDoc | null;
  dailyState: Record<string, unknown> | null;
  journeyRecord: Record<string, unknown> | null;
  wellnessAssessmentsToday: number;
  journalEntriesToday: number;
  meditationEntriesToday: number;
  audioHealingEntriesToday: number;
  sourceNotes: string[];
};

type AlertItem = {
  level: "critical" | "warning" | "info";
  title: string;
  detail: string;
};

const FEATURE_EVENTS: Array<{ label: string; events: string[]; screens: string[] }> = [
  { label: "Dashboard", events: ["dashboard_view", "open_dashboard"], screens: ["dashboard", "home"] },
  { label: "Journey", events: ["open_journey", "practice_completed", "daily_completion_reached"], screens: ["journey"] },
  { label: "Wellness", events: ["wellness_checkin_completed", "wellness_assessment_completed", "open_innerwork"], screens: ["wellness", "wellness-assessment", "kenali_diri", "innerwork"] },
  { label: "Profile", events: ["profile_view"], screens: ["profile", "settings"] },
  { label: "Manifestasi", events: ["open_manifestasi", "complete_manifestasi"], screens: ["manifestasi", "manifestation"] },
  { label: "Meditasi", events: ["meditation_open", "meditation_completed", "complete_meditation"], screens: ["meditation", "meditasi"] },
  { label: "Journaling", events: ["journal_open", "journal_saved", "complete_journaling"], screens: ["journal", "journaling"] },
  { label: "Workout", events: ["open_workout", "complete_workout", "complete_workout_item"], screens: ["workout"] },
  { label: "Audio Healing", events: ["audio_open", "audio_completed", "complete_audio"], screens: ["audio", "audio-healing", "healing"] },
  { label: "Healthy Food", events: ["open_healthy_food", "complete_healthy_food", "complete_healthy_food_item"], screens: ["healthy-food", "healthy_food", "herbal"] },
];

const FUNNEL_STEPS: Array<{ label: string; events: string[]; source?: "users" | "activity" }> = [
  { label: "New Install", events: [], source: "users" },
  { label: "First Login", events: ["login_success", "app_open"], source: "activity" },
  { label: "Complete Onboarding", events: ["setup_completed"] },
  { label: "Open Dashboard", events: ["dashboard_view", "open_dashboard"] },
  { label: "Open Wellness", events: ["wellness_checkin_completed", "wellness_assessment_completed", "open_innerwork"] },
  { label: "Open Journey", events: ["open_journey"] },
  { label: "Finish Daily Practice", events: ["practice_completed", "daily_completion_reached"] },
];

const DATE_RANGE_OPTIONS: Array<{ key: DateRangeKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "custom", label: "Custom" },
];

const USER_TABLE_PAGE_SIZE = 10;

function dateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

function formatDateKey(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  if (!Number.isFinite(d.getTime())) return key || "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function toDateMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "number") return value > 10_000_000_000 ? value : value * 1000;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object" && value) {
    const maybeDate = value as { toDate?: () => Date; seconds?: number };
    if (typeof maybeDate.toDate === "function") return maybeDate.toDate().getTime();
    if (typeof maybeDate.seconds === "number") return maybeDate.seconds * 1000;
  }
  return 0;
}

function formatDateTime(value: unknown): string {
  const ms = toDateMs(value);
  if (!ms) return "-";
  const d = new Date(ms);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) + ", " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function daysSince(ms: number): number | null {
  if (!ms) return null;
  return Math.max(0, Math.floor((Date.now() - ms) / 86_400_000));
}

function pct(part: number, total: number): number | null {
  if (!total) return null;
  return Math.round((part / total) * 100);
}

function signedPct(value: number | null): string {
  if (value === null) return "No data";
  if (value === 0) return "0%";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function trendLabel(value: number | null): string {
  if (value === null) return "No comparison";
  if (value === 0) return "Stable";
  return `${value > 0 ? "▲" : "▼"} ${signedPct(value)}`;
}

function sparklinePoints(values: number[], width = 112, height = 30): string {
  if (!values.length) return "";
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  return values.map((value, index) => {
    const x = values.length === 1 ? width : (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function heatmapClass(value: number | null): string {
  if (value === null) return "bg-[#F4F0E7] text-[#9A9388]";
  if (value >= 60) return "bg-[#496B58] text-white";
  if (value >= 35) return "bg-[#B9C9A8] text-[#26352D]";
  if (value >= 15) return "bg-[#E0C47B] text-[#3D3219]";
  return "bg-[#DFA49A] text-[#4B211C]";
}

function alertRank(level: AlertItem["level"]): number {
  if (level === "critical") return 0;
  if (level === "warning") return 1;
  return 2;
}


function pickFirst(source: any, keys: string[]): string {
  for (const key of keys) {
    const value = source?.[key] ?? source?.profile?.[key] ?? source?.profile?.blueprintInput?.[key] ?? source?.participationMetrics?.[key];
    if (value !== undefined && value !== null && value !== "") return String(value);
  }
  return "";
}

function csvEscape(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function xmlEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function uniqueUid(event: AnalyticsDoc): string {
  return String(event.uid || event.activeUid || "");
}

function readDateKey(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const ms = toDateMs(value);
  return ms ? dateKey(new Date(ms)) : "";
}

function recordDateKey(record: any): string {
  return readDateKey(
    record?.date ||
    record?.dateKey ||
    record?.appDate ||
    record?.createdAt ||
    record?.dateCreated ||
    record?.updatedAt,
  );
}

function countRecordsOnDate(records: any[], date: string): number {
  return records.filter((record) => recordDateKey(record) === date).length;
}

function lastLoginSortMs(user: FounderUser): number {
  return toDateMs(user.lastLogin) || toDateMs(user.lastSeen) || user.lastSeenMs || 0;
}

function isDateInRange(date: string, start: string, end: string): boolean {
  return !!date && date >= start && date <= end;
}

function hasMeaningfulRecord(record: Record<string, unknown> | null | undefined): boolean {
  if (!record) return false;
  return Object.keys(record).some((key) => !["createdAt", "updatedAt", "uid", "date", "dateKey"].includes(key));
}

async function getDocData(pathParts: string[]): Promise<Record<string, unknown> | null> {
  const snapshot = pathParts.length === 2
    ? await getDoc(doc(db, pathParts[0], pathParts[1]))
    : await getDoc(doc(db, pathParts[0], pathParts[1], pathParts[2], pathParts[3]));
  return snapshot.exists() ? snapshot.data() : null;
}

async function getCollectionRows(pathParts: string[]): Promise<any[]> {
  const ref = pathParts.length === 1
    ? collection(db, pathParts[0])
    : collection(db, pathParts[0], pathParts[1], pathParts[2]);
  const snapshot = await getDocs(query(ref, firestoreLimit(80)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

async function getUidRows(collectionName: string, uid: string): Promise<any[]> {
  const snapshot = await getDocs(query(collection(db, collectionName), where("uid", "==", uid), firestoreLimit(80)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

function normalizeUser(rawUserData: any): FounderUser | null {
  const email = String(rawUserData.email || "");
  const displayName = String(rawUserData.name || rawUserData.fullName || rawUserData.displayName || "Jiwa");
  if (email.includes("bhumi.qa.delete") || displayName.includes("QA Delete Account")) return null;

  const metrics = rawUserData.participationMetrics || {};
  const activeDays: string[] = Array.isArray(metrics.activeDays)
    ? metrics.activeDays.map((d: unknown) => {
        if (typeof d === "string") return d.slice(0, 10);
        const ms = toDateMs(d);
        return ms ? dateKey(new Date(ms)) : "";
      }).filter(Boolean)
    : [];
  const registeredCandidates = [
    toDateMs(rawUserData.createdAt),
    toDateMs(rawUserData.registeredAt),
    toDateMs(rawUserData.joinedAt),
    toDateMs(metrics.firstLoginAt),
    activeDays[0] ? toDateMs(`${activeDays[0]}T00:00:00`) : 0,
  ].filter((n) => n > 0);
  const lastLogin = metrics.lastLoginAt ?? rawUserData.lastLoginAt ?? null;
  const lastSeen = metrics.lastSeen ?? rawUserData.lastSeen ?? lastLogin;
  const membership = String(rawUserData.membershipType || rawUserData.membershipStatus || rawUserData.subscriptionStatus || "").toLowerCase();
  const badge = String(rawUserData.testerBadge || rawUserData.guardianBadge || rawUserData.badge || rawUserData.recognitionTier || "");
  const isPremium = rawUserData.isPremium === true
    || membership.includes("premium")
    || membership.includes("inti")
    || badge === "Founder"
    || badge.includes("Inti")
    || badge.includes("Alfa");

  return {
    uid: String(rawUserData.uid || rawUserData.id || ""),
    displayName,
    email,
    registeredAt: registeredCandidates.length ? Math.min(...registeredCandidates) : 0,
    activeDays: Array.from(new Set(activeDays)),
    lastLogin,
    lastSeen,
    lastSeenMs: toDateMs(lastSeen),
    appVersion: pickFirst(rawUserData, ["versionName", "appVersion", "buildNumber"]) || "-",
    status: isPremium ? "Premium" : "Free",
    blueprint: pickFirst(rawUserData, ["blueprintStatus", "profileVersion", "engineVersion"]) || "No data",
    country: pickFirst(rawUserData, ["country", "birthCountry"]) || "No data",
    province: pickFirst(rawUserData, ["province", "region", "state"]) || "No data",
    city: pickFirst(rawUserData, ["city", "birthCity", "birthPlace"]) || "No data",
    timezone: pickFirst(rawUserData, ["timezone"]) || "No data",
    isPremium,
    lastScreen: pickFirst(rawUserData, ["lastScreen", "currentScreen", "lastRoute", "lastPage", "screenName"]) || "",
    rawUser: rawUserData,
  };
}

function makeWorkbookXml(rows: string[][]): string {
  const body = rows.map((row, rIndex) => {
    const cells = row.map((cell, cIndex) => {
      const col = String.fromCharCode(65 + cIndex);
      return `<c r="${col}${rIndex + 1}" t="inlineStr"><is><t>${xmlEscape(cell)}</t></is></c>`;
    }).join("");
    return `<row r="${rIndex + 1}">${cells}</row>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

function crc32(input: Uint8Array): number {
  let crc = -1;
  for (const byte of input) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function createZip(files: Array<{ name: string; content: string }>): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const write16 = (view: DataView, pos: number, value: number) => view.setUint16(pos, value, true);
  const write32 = (view: DataView, pos: number, value: number) => view.setUint32(pos, value, true);

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const content = encoder.encode(file.content);
    const crc = crc32(content);
    const local = new Uint8Array(30 + name.length + content.length);
    const localView = new DataView(local.buffer);
    write32(localView, 0, 0x04034b50);
    write16(localView, 4, 20);
    write16(localView, 8, 0);
    write32(localView, 14, crc);
    write32(localView, 18, content.length);
    write32(localView, 22, content.length);
    write16(localView, 26, name.length);
    local.set(name, 30);
    local.set(content, 30 + name.length);
    chunks.push(local);

    const entry = new Uint8Array(46 + name.length);
    const entryView = new DataView(entry.buffer);
    write32(entryView, 0, 0x02014b50);
    write16(entryView, 4, 20);
    write16(entryView, 6, 20);
    write32(entryView, 16, crc);
    write32(entryView, 20, content.length);
    write32(entryView, 24, content.length);
    write16(entryView, 28, name.length);
    write32(entryView, 42, offset);
    entry.set(name, 46);
    central.push(entry);
    offset += local.length;
  });

  const centralSize = central.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  write32(endView, 0, 0x06054b50);
  write16(endView, 8, files.length);
  write16(endView, 10, files.length);
  write32(endView, 12, centralSize);
  write32(endView, 16, offset);
  const blobParts = [...chunks, ...central, end].map((part) => part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength) as ArrayBuffer);
  return new Blob(blobParts, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildXlsx(rows: string[][]): Blob {
  return createZip([
    { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>` },
    { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", content: `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Founder Dashboard" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", content: `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>` },
    { name: "xl/worksheets/sheet1.xml", content: makeWorkbookXml(rows) },
  ]);
}

export default function AdminActivityPage() {
  const auth = useAuth();
  const profile = auth?.userProfile;
  const today = useMemo(() => dateKey(new Date()), []);
  const [range, setRange] = useState<DateRangeKey>("today");
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);
  const [users, setUsers] = useState<FounderUser[]>([]);
  const [activities, setActivities] = useState<ActivityDoc[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDoc[]>([]);
  const [selectedUser, setSelectedUser] = useState<FounderUser | null>(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState<BlueprintSummary | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<UserDetailData | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "premium" | "free">("all");
  const [sortBy, setSortBy] = useState<SortField>("lastLogin");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [userPage, setUserPage] = useState(1);
  const [personalSubject, setPersonalSubject] = useState("");
  const [personalBody, setPersonalBody] = useState("");
  const [personalState, setPersonalState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceStatus, setSourceStatus] = useState<DataSourceStatus>({
    users: "Not loaded",
    activity: "Not loaded",
    analytics: "Not loaded",
  });

  const isFounder = profile?.guardianRole === "founder" || profile?.guardianRole === "admin" || profile?.role === "admin" || profile?.email?.trim().toLowerCase() === "wizzare@gmail.com";

  const sendPersonalMessage = async () => {
    if (!selectedUser || !auth?.user?.uid || !personalSubject.trim() || !personalBody.trim()) return;
    setPersonalState("sending");
    try {
      await CommunicationCenterService.sendPersonalMessage({ adminUid: auth.user.uid, targetUid: selectedUser.uid, title: personalSubject.trim(), content: personalBody.trim(), priority: "normal" });
      setPersonalSubject("");
      setPersonalBody("");
      setPersonalState("sent");
    } catch {
      setPersonalState("error");
    }
  };

  const rangeDates = useMemo(() => {
    const end = new Date(`${today}T00:00:00`);
    const start = new Date(end);
    if (range === "yesterday") {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    } else if (range === "7d") {
      start.setDate(start.getDate() - 6);
    } else if (range === "30d") {
      start.setDate(start.getDate() - 29);
    } else if (range === "custom") {
      return { start: customStart, end: customEnd };
    }
    return { start: dateKey(start), end: dateKey(end) };
  }, [customEnd, customStart, range, today]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const userRows = await adminRepository.getAllUsersForMonitoring();
      const normalized = userRows.map(normalizeUser).filter(Boolean) as FounderUser[];
      const excludedUids = getExcludedUids(userRows);
      const analyticsFiltered = normalized.filter((u) => !excludedUids.has(u.uid));
      const [activityResult, analyticsResult] = await Promise.allSettled([
        getDocs(query(collection(db, "user_activity"), where("date", ">=", rangeDates.start), where("date", "<=", rangeDates.end))),
        getDocs(query(collection(db, "analytics"), where("date", ">=", rangeDates.start), where("date", "<=", rangeDates.end))),
      ]);
      const activityDocs = activityResult.status === "fulfilled"
        ? activityResult.value.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityDoc)).filter((a) => a.uid && !excludedUids.has(a.uid))
        : [];
      const analyticsDocs = analyticsResult.status === "fulfilled"
        ? analyticsResult.value.docs.map((d) => ({ id: d.id, ...d.data() } as AnalyticsDoc)).filter((a) => {
            const uid = uniqueUid(a);
            return !uid || !excludedUids.has(uid);
          })
        : [];
      setUsers(analyticsFiltered);
      setActivities(activityDocs);
      setAnalytics(analyticsDocs);
      setSourceStatus({
        users: `${normalized.length} users`,
        activity: activityResult.status === "fulfilled" ? `${activityDocs.length} rows` : "No data: Firestore read failed",
        analytics: analyticsResult.status === "fulfilled" ? `${analyticsDocs.length} events` : "No data: Firestore read failed",
      });
      if (activityResult.status === "rejected" || analyticsResult.status === "rejected") {
        console.warn("Founder Dashboard partial Firestore load", {
          userActivity: activityResult.status === "rejected" ? activityResult.reason : "ok",
          analytics: analyticsResult.status === "rejected" ? analyticsResult.reason : "ok",
        });
      }
    } catch (err) {
      console.error("Failed to load Founder Dashboard:", err);
      setUsers([]);
      setActivities([]);
      setAnalytics([]);
      setSourceStatus({
        users: "No data: Firestore read failed",
        activity: "No data",
        analytics: "No data",
      });
      setError("Gagal memuat data users dari Firestore. Dashboard tidak dapat menghitung total user tanpa koleksi users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFounder) void loadDashboard();
  }, [isFounder, rangeDates.start, rangeDates.end]);

  useEffect(() => {
    const run = async () => {
      if (!selectedUser) {
        setSelectedBlueprint(null);
        setSelectedDetail(null);
        return;
      }
      setBlueprintLoading(true);
      try {
        const [
          blueprintResult,
          activityResult,
          dailyStateResult,
          journeyRecordResult,
          wellnessResult,
          nestedJournalResult,
          legacyJournalResult,
          nestedMeditationResult,
          legacyMeditationResult,
          nestedAudioResult,
          legacyAudioResult,
        ] = await Promise.allSettled([
          getDocData(["blueprints", selectedUser.uid]),
          getDocData(["user_activity", `${selectedUser.uid}_${rangeDates.end}`]),
          getDocData(["dailyStates", selectedUser.uid, "entries", rangeDates.end]),
          getDocData(["journeyDailyRecords", selectedUser.uid, "entries", rangeDates.end]),
          getUidRows("wellnessAssessments", selectedUser.uid),
          getCollectionRows(["journals", selectedUser.uid, "entries"]),
          getUidRows("journalEntries", selectedUser.uid),
          getCollectionRows(["meditations", selectedUser.uid, "entries"]),
          getUidRows("meditationEntries", selectedUser.uid),
          getCollectionRows(["audioHealing", selectedUser.uid, "entries"]),
          getUidRows("audioHealingEntries", selectedUser.uid),
        ]);

        const data = blueprintResult.status === "fulfilled" ? blueprintResult.value : null;
        setSelectedBlueprint(data ? {
          lifePath: String((data as any).lifePath?.display || (data as any).lifePath?.number || "-"),
          arcana: String((data as any).destinyMatrix?.center || (data as any).arcana?.name || "-"),
          humanDesign: String((data as any).humanDesign?.type || "-"),
          sun: String((data as any).astrology?.sunSign || (data as any).natalChart?.sunSign || "-"),
          weton: String((data as any).weton?.weton || (data as any).weton?.name || "-"),
          tzolkin: String((data as any).tzolkin?.kinName || "-"),
        } : null);

        const readRows = (result: PromiseSettledResult<any[]>): any[] => result.status === "fulfilled" ? result.value : [];
        const notes = [
          activityResult.status === "rejected" ? "user_activity tidak terbaca" : "",
          dailyStateResult.status === "rejected" ? "dailyStates tidak terbaca" : "",
          journeyRecordResult.status === "rejected" ? "journeyDailyRecords tidak terbaca" : "",
          wellnessResult.status === "rejected" ? "wellnessAssessments tidak terbaca" : "",
          nestedMeditationResult.status === "rejected" ? "meditations nested tidak terbaca" : "",
          nestedAudioResult.status === "rejected" ? "audioHealing nested tidak terbaca" : "",
        ].filter(Boolean);

        setSelectedDetail({
          activity: activityResult.status === "fulfilled" ? activityResult.value as ActivityDoc | null : null,
          dailyState: dailyStateResult.status === "fulfilled" ? dailyStateResult.value : null,
          journeyRecord: journeyRecordResult.status === "fulfilled" ? journeyRecordResult.value : null,
          wellnessAssessmentsToday: countRecordsOnDate(readRows(wellnessResult), rangeDates.end),
          journalEntriesToday: countRecordsOnDate([...readRows(nestedJournalResult), ...readRows(legacyJournalResult)], rangeDates.end),
          meditationEntriesToday: countRecordsOnDate([...readRows(nestedMeditationResult), ...readRows(legacyMeditationResult)], rangeDates.end),
          audioHealingEntriesToday: countRecordsOnDate([...readRows(nestedAudioResult), ...readRows(legacyAudioResult)], rangeDates.end),
          sourceNotes: notes,
        });
      } catch {
        setSelectedBlueprint(null);
        setSelectedDetail(null);
      } finally {
        setBlueprintLoading(false);
      }
    };
    void run();
  }, [rangeDates.end, selectedUser]);

  const metrics = useMemo(() => {
    const eventDatesByUid = new Map<string, Set<string>>();
    analytics.forEach((event) => {
      const uid = uniqueUid(event);
      const date = event.date || (toDateMs(event.timestamp) ? dateKey(new Date(toDateMs(event.timestamp))) : "");
      if (!uid || !date) return;
      const dates = eventDatesByUid.get(uid) ?? new Set<string>();
      dates.add(date);
      eventDatesByUid.set(uid, dates);
    });
    activities.forEach((activity) => {
      if (!activity.uid || !activity.date) return;
      const dates = eventDatesByUid.get(activity.uid) ?? new Set<string>();
      dates.add(activity.date);
      eventDatesByUid.set(activity.uid, dates);
    });
    users.forEach((user) => {
      const dates = eventDatesByUid.get(user.uid) ?? new Set<string>();
      user.activeDays.forEach((d) => dates.add(d));
      if (dates.size) eventDatesByUid.set(user.uid, dates);
    });

    const selectedDay = rangeDates.end;
    const todayActive = new Set<string>();
    const yesterdayActive = new Set<string>();
    const mau = new Set<string>();
    const dailyActiveSeries = Array.from({ length: 7 }, (_, index) => addDays(selectedDay, -6 + index)).map((day) => {
      let count = 0;
      eventDatesByUid.forEach((dates) => {
        if (dates.has(day)) count += 1;
      });
      return { day, count };
    });
    eventDatesByUid.forEach((dates, uid) => {
      if (dates.has(selectedDay)) todayActive.add(uid);
      if (dates.has(addDays(selectedDay, -1))) yesterdayActive.add(uid);
      dates.forEach((d) => {
        if (d >= addDays(selectedDay, -29) && d <= selectedDay) mau.add(uid);
      });
    });

    const retentionFor = (day: number) => {
      let eligible = 0;
      let retained = 0;
      eventDatesByUid.forEach((dates) => {
        const first = [...dates].sort()[0];
        if (!first || addDays(first, day) > selectedDay) return;
        eligible += 1;
        if (dates.has(addDays(first, day))) retained += 1;
      });
      return { eligible, retained, value: pct(retained, eligible) };
    };

    const funnel = FUNNEL_STEPS.map((step, index) => {
      let count = 0;
      if (step.source === "users") {
        count = users.filter((user) => user.registeredAt && dateKey(new Date(user.registeredAt)) === selectedDay).length;
      } else if (step.source === "activity") {
        count = new Set(activities.filter((item) => item.date === selectedDay && item.uid).map((item) => item.uid)).size;
      } else {
        count = new Set(analytics.filter((event) => event.date === selectedDay && step.events.includes(String(event.eventName))).map(uniqueUid).filter(Boolean)).size;
      }
      const previous = index === 0 ? count : 0;
      return { ...step, count, previous };
    }).map((step, index, all) => {
      const previous = index === 0 ? step.count : all[index - 1].count;
      const conversion = index === 0 ? null : pct(step.count, previous);
      return { label: step.label, count: step.count, conversion, drop: conversion === null ? null : Math.max(0, 100 - conversion) };
    });

    const cohorts = Array.from({ length: 7 }, (_, i) => addDays(selectedDay, -6 + i)).reverse().map((cohort) => {
      const cohortUsers = [...eventDatesByUid.entries()].filter(([, dates]) => [...dates].sort()[0] === cohort);
      const value = (day: number) => {
        if (!cohortUsers.length || addDays(cohort, day) > selectedDay) return null;
        return pct(cohortUsers.filter(([, dates]) => dates.has(addDays(cohort, day))).length, cohortUsers.length);
      };
      return { cohort, users: cohortUsers.length, d1: value(1), d3: value(3), d7: value(7), d14: value(14), d30: value(30) };
    });

    const churn = [1, 3, 7, 14, 30].map((day) => ({
      day,
      count: users.filter((user) => {
        const inactive = daysSince(user.lastSeenMs);
        return inactive !== null && inactive >= day;
      }).length,
    }));

    const locationRows = users.reduce<Record<string, { country: string; province: string; city: string; timezone: string; count: number }>>((acc, user) => {
      if (user.city === "No data" && user.country === "No data" && user.timezone === "No data") return acc;
      const key = [user.country, user.province, user.city, user.timezone].join("|");
      acc[key] = acc[key] || { country: user.country, province: user.province, city: user.city, timezone: user.timezone, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {});

    const topFeatures = FEATURE_EVENTS.map((feature) => {
      const matchedEvents = analytics
        .filter((event) => isDateInRange(String(event.date || ""), rangeDates.start, rangeDates.end) && feature.events.includes(String(event.eventName)));
      const matchedScreens = activities
        .filter((activity) => isDateInRange(activity.date, rangeDates.start, rangeDates.end) && textHasAny(activity.lastScreen, feature.screens));
      const matchedUsers = users
        .filter((user) => isDateInRange(readDateKey(user.lastSeen) || readDateKey(user.lastLogin), rangeDates.start, rangeDates.end) && textHasAny(user.lastScreen, feature.screens));
      const userSet = new Set([
        ...matchedEvents.map(uniqueUid).filter(Boolean),
        ...matchedScreens.map((activity) => activity.uid).filter(Boolean),
        ...matchedUsers.map((user) => user.uid),
      ]);
      const completionSignals = matchedEvents.filter((event) => String(event.eventName || "").toLowerCase().includes("complete")).length;
      const totalSeconds = matchedScreens.reduce((sum, activity) => sum + (Number(activity.totalSeconds) || 0), 0);
      const avgDuration = matchedScreens.length ? Math.round(totalSeconds / matchedScreens.length) : 0;
      const completion = pct(completionSignals, Math.max(1, matchedEvents.length));
      return {
        label: feature.label,
        users: userSet.size,
        count: userSet.size,
        avgDuration,
        completion,
        bounce: completion === null ? null : Math.max(0, 100 - completion),
      };
    }).sort((a, b) => b.count - a.count);

    const d1 = retentionFor(1);
    const d7 = retentionFor(7);
    const dashboardUsers = funnel.find((f) => f.label === "Open Dashboard")?.count ?? 0;
    const wellnessUsers = funnel.find((f) => f.label === "Open Wellness")?.count ?? 0;
    const journeyUsers = funnel.find((f) => f.label === "Open Journey")?.count ?? 0;
    const onboardingUsers = funnel.find((f) => f.label === "Complete Onboarding")?.count ?? 0;
    const firstLoginUsers = funnel.find((f) => f.label === "First Login")?.count ?? 0;
    const journeyErrors = analytics.filter((event) => event.date === selectedDay && String(event.eventName).toLowerCase().includes("journey") && String(event.eventName).toLowerCase().includes("error")).length;
    const alerts: AlertItem[] = [];
    if (journeyErrors > 0) alerts.push({ level: "critical", title: "Journey error", detail: `Journey error tercatat ${journeyErrors} kali.` });
    if (todayActive.size < yesterdayActive.size) alerts.push({ level: "warning", title: "DAU turun", detail: `DAU turun dibanding kemarin (${yesterdayActive.size} ke ${todayActive.size}).` });
    if (d1.value !== null && d1.value < 50) alerts.push({ level: "warning", title: "Retention D1", detail: `Retention D1 rendah: ${d1.value}%.` });
    if (firstLoginUsers > onboardingUsers) alerts.push({ level: "warning", title: "Onboarding", detail: `${firstLoginUsers - onboardingUsers} user belum complete onboarding.` });
    if (dashboardUsers > wellnessUsers) alerts.push({ level: "warning", title: "Dashboard → Wellness", detail: `${dashboardUsers - wellnessUsers} user berhenti sebelum Wellness.` });
    if ((topFeatures.find((f) => f.label === "Journaling")?.count ?? 0) === 0 && analytics.some((event) => event.date === selectedDay)) alerts.push({ level: "info", title: "Refleksi Jiwa", detail: "Refleksi/Journaling tidak tercatat dibaca hari ini." });
    if (users.filter((u) => u.isPremium).length > 0) alerts.push({ level: "info", title: "Premium", detail: `${users.filter((u) => u.isPremium).length} premium member terdeteksi.` });

    const insightParts = [
      `Hari ini terdapat ${todayActive.size} pengguna aktif dari ${users.length} total user.`,
      d1.value === null ? "Retention D1 belum punya data cohort matang." : `Retention D1 berada di ${d1.value}% (${d1.retained}/${d1.eligible}).`,
      dashboardUsers > wellnessUsers ? `${dashboardUsers - wellnessUsers} pengguna berhenti setelah Dashboard.` : "Drop-off Dashboard ke Wellness tidak terlihat dari data hari ini.",
      journeyUsers > 0 ? `${journeyUsers} pengguna membuka Journey.` : "Belum ada aktivitas Journey tercatat hari ini.",
      churn.find((item) => item.day === 3)?.count ? `Disarankan mengirim reminder kepada ${churn.find((item) => item.day === 3)?.count} pengguna yang belum kembali selama 3 hari.` : "Reminder 3 hari belum memiliki target dari data aktif.",
    ];

    return {
      totalUsers: users.length,
      dau: todayActive.size,
      mau: mau.size,
      premium: users.filter((u) => u.isPremium).length,
      d1,
      d7,
      dauTrend: pct(todayActive.size - yesterdayActive.size, Math.max(1, yesterdayActive.size)),
      totalUserTrend: pct(users.filter((user) => isDateInRange(readDateKey(user.registeredAt), addDays(selectedDay, -6), selectedDay)).length, Math.max(1, users.length)),
      premiumShare: pct(users.filter((u) => u.isPremium).length, users.length),
      sparkline: dailyActiveSeries.map((item) => item.count),
      conversion: pct(users.filter((u) => u.isPremium).length, users.length),
      funnel,
      cohorts,
      churn,
      alerts: alerts.sort((a, b) => alertRank(a.level) - alertRank(b.level)),
      insight: insightParts.join(" "),
      topLocations: Object.values(locationRows).sort((a, b) => b.count - a.count).slice(0, 8),
      topFeatures,
    };
  }, [activities, analytics, rangeDates.end, users]);

  const visibleUsers = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    return users
      .filter((user) => {
        if (statusFilter === "premium" && !user.isPremium) return false;
        if (statusFilter === "free" && user.isPremium) return false;
        if (!needle) return true;
        return [user.displayName, user.email, user.uid, user.blueprint].some((value) => value.toLowerCase().includes(needle));
      })
      .sort((a, b) => {
        const direction = sortOrder === "asc" ? 1 : -1;
        if (sortBy === "name") return a.displayName.localeCompare(b.displayName) * direction;
        if (sortBy === "registered") return (a.registeredAt - b.registeredAt) * direction;
        if (sortBy === "activeDays") return (a.activeDays.length - b.activeDays.length) * direction;
        if (sortBy === "status") return a.status.localeCompare(b.status) * direction;
        return (lastLoginSortMs(a) - lastLoginSortMs(b)) * direction;
      });
  }, [searchText, sortBy, sortOrder, statusFilter, users]);

  const totalUserPages = Math.max(1, Math.ceil(visibleUsers.length / USER_TABLE_PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * USER_TABLE_PAGE_SIZE;
    return visibleUsers.slice(start, start + USER_TABLE_PAGE_SIZE);
  }, [userPage, visibleUsers]);

  useEffect(() => {
    setUserPage(1);
  }, [searchText, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    setUserPage((page) => Math.min(page, totalUserPages));
  }, [totalUserPages]);

  const exportRows = useMemo(() => [
    ["Nama", "Email", "UID", "Hari Daftar", "Hari Aktif", "Last Login", "Versi App", "Status", "Blueprint", "Country", "Province", "City", "Timezone"],
    ...visibleUsers.map((user) => [
      user.displayName,
      user.email,
      user.uid,
      user.registeredAt ? formatDateTime(user.registeredAt) : "-",
      String(user.activeDays.length),
      formatDateTime(user.lastLogin || user.lastSeen),
      user.appVersion,
      user.status,
      user.blueprint,
      user.country,
      user.province,
      user.city,
      user.timezone,
    ]),
  ], [visibleUsers]);

  const exportCSV = () => {
    downloadBlob(new Blob([exportRows.map((row) => row.map(csvEscape).join(",")).join("\n")], { type: "text/csv;charset=utf-8;" }), `bhumi_founder_dashboard_${rangeDates.start}_${rangeDates.end}.csv`);
  };

  const exportXLSX = () => {
    downloadBlob(buildXlsx(exportRows), `bhumi_founder_dashboard_${rangeDates.start}_${rangeDates.end}.xlsx`);
  };

  const exportPDF = () => {
    const rows = exportRows.slice(0, 80).map((row) => `<tr>${row.map((cell) => `<td>${xmlEscape(cell)}</td>`).join("")}</tr>`).join("");
    const html = `<html><head><title>Bhumi Founder Dashboard</title><style>body{font-family:Arial,sans-serif;color:#243229;padding:24px}table{border-collapse:collapse;width:100%;font-size:11px}td{border:1px solid #d8ddd5;padding:6px}h1{font-size:20px}</style></head><body><h1>Bhumi Founder Dashboard</h1><p>${rangeDates.start} to ${rangeDates.end}</p><table>${rows}</table><script>window.print()</script></body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const setSort = (field: SortField) => {
    if (sortBy === field) setSortOrder((value) => value === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (auth?.authLoading || auth?.profileLoading) {
    return <main className="min-h-screen bg-[#F7F4ED] flex items-center justify-center text-[#526256]">Memverifikasi Akses Founder...</main>;
  }

  if (!auth?.user || !isFounder) {
    return (
      <main className="min-h-screen bg-[#F7F4ED] px-5 py-10 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#E3E0D7] rounded-lg p-8 text-center shadow-sm">
          <ShieldAlert size={44} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-serif font-bold text-[#344139]">Akses Ditolak</h1>
          <p className="mt-3 text-[#6D786F]">Halaman ini hanya tersedia untuk Founder Bhumi.</p>
          <Link href="/dashboard" className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#344139] px-5 py-2.5 text-sm font-semibold text-white">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="bhumi-founder-dashboard-wrapper" className="min-h-screen bg-[#F7F4ED] pb-24 text-[#2F3C34]">
      <AppNav />
      <header className="border-b border-[#E3E0D7] bg-[#FBFAF6] px-5 py-7 shadow-[0_12px_40px_rgba(61,54,43,0.05)]">
        <div className="mx-auto max-w-7xl">
          <BhumiPageHeader className="mb-5 justify-start" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6D786F]">Founder Operating Dashboard</p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-[#2F3C34] md:text-5xl">Bhumi Amartya Growth Room</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6D786F]">Product health, retention, funnel, and user journeys from existing Firestore analytics.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={range} onChange={(e) => setRange(e.target.value as DateRangeKey)} className="h-10 rounded-md border border-[#D9D6CC] bg-white px-3 text-sm font-semibold">
                {DATE_RANGE_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
              </select>
              {range === "custom" && (
                <>
                  <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="h-10 rounded-md border border-[#D9D6CC] bg-white px-3 text-sm" />
                  <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="h-10 rounded-md border border-[#D9D6CC] bg-white px-3 text-sm" />
                </>
              )}
              <button onClick={loadDashboard} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#D9D6CC] bg-white px-3 text-sm font-semibold">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
              <button onClick={exportXLSX} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#2F3C34] px-3 text-sm font-semibold text-white">
                <FileSpreadsheet size={16} /> XLSX
              </button>
              <button onClick={exportCSV} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#D9D6CC] bg-white px-3 text-sm font-semibold">
                <Download size={16} /> CSV
              </button>
              <button onClick={exportPDF} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#D9D6CC] bg-white px-3 text-sm font-semibold">
                <FileText size={16} /> PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="grid gap-2 text-xs md:grid-cols-3">
          <div className="rounded-md border border-[#E3E0D7] bg-white px-3 py-2"><span className="font-bold text-[#2F3C34]">users</span>: {sourceStatus.users}</div>
          <div className="rounded-md border border-[#E3E0D7] bg-white px-3 py-2"><span className="font-bold text-[#2F3C34]">user_activity</span>: {sourceStatus.activity}</div>
          <div className="rounded-md border border-[#E3E0D7] bg-white px-3 py-2"><span className="font-bold text-[#2F3C34]">analytics</span>: {sourceStatus.analytics}</div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<Users size={18} />} label="Total User" value={metrics.totalUsers} sub="+ user base" comparison={`${signedPct(metrics.totalUserTrend)} minggu ini`} trend={trendLabel(metrics.totalUserTrend)} sparkline={metrics.sparkline} tone="gold" />
          <MetricCard icon={<CheckCircle2 size={18} />} label="DAU" value={metrics.dau} sub={formatDateKey(rangeDates.end)} comparison={`kemarin ${metrics.dau - Math.round((metrics.dauTrend ?? 0) / 100)}`} trend={trendLabel(metrics.dauTrend)} sparkline={metrics.sparkline} tone="sage" />
          <MetricCard icon={<Calendar size={18} />} label="MAU" value={metrics.mau} sub="last 30 days" comparison={`${pct(metrics.mau, Math.max(1, metrics.totalUsers)) ?? 0}% base`} trend="30d active" sparkline={metrics.sparkline} tone="cream" />
          <MetricCard icon={<TrendingUp size={18} />} label="Retention D1" value={metrics.d1.value === null ? "No data" : `${metrics.d1.value}%`} sub={`${metrics.d1.retained}/${metrics.d1.eligible} retained`} comparison="cohort day 1" trend={metrics.d1.value === null ? "No data" : metrics.d1.value >= 50 ? "▲ Stable" : "▼ Watch"} sparkline={[metrics.d1.retained, metrics.d1.eligible]} tone="sage" />
          <MetricCard icon={<TrendingDown size={18} />} label="Retention D7" value={metrics.d7.value === null ? "No data" : `${metrics.d7.value}%`} sub={`${metrics.d7.retained}/${metrics.d7.eligible} retained`} comparison="cohort day 7" trend={metrics.d7.value === null ? "No data" : metrics.d7.value >= 25 ? "▲ Healthy" : "▼ Watch"} sparkline={[metrics.d7.retained, metrics.d7.eligible]} tone="gold" />
          <MetricCard icon={<Star size={18} />} label="Premium Member" value={metrics.premium} sub={`${metrics.premiumShare ?? 0}% of users`} comparison="server-owned plan" trend={metrics.premium > 0 ? "▲ Live" : "No data"} sparkline={[metrics.premium, metrics.totalUsers]} tone="cream" />
          <MetricCard icon={<Heart size={18} />} label="Conversion" value={metrics.conversion === null ? "No data" : `${metrics.conversion}%`} sub="Free to Premium" comparison="existing plan fields" trend={metrics.conversion ? "▲ tracked" : "No data"} sparkline={[metrics.premium, metrics.totalUsers]} tone="sage" />
          <MetricCard icon={<Star size={18} />} label="Play Store Rating" value="No data" sub="future-ready" comparison="No rating collection" trend="Prepared" sparkline={[0, 0, 0]} tone="gold" />
        </section>

        <Panel title="Founder Insight" action="executive summary">
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <p className="text-base leading-8 text-[#405047]">{analytics.length || activities.length || users.length ? metrics.insight : "No data"}</p>
            <div className="rounded-[8px] border border-[#E3E0D7] bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6D786F]">Prioritas hari ini</p>
              <div className="space-y-2 text-sm text-[#405047]">
                <p>• Kirim reminder kepada {metrics.churn.find((item) => item.day === 3)?.count ?? 0} pengguna.</p>
                <p>• Pantau CTA Dashboard → Wellness.</p>
                <p>• Evaluasi Refleksi Jiwa build terbaru.</p>
              </div>
            </div>
          </div>
        </Panel>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Visual Funnel" action={`${rangeDates.end}`}>
            <div className="space-y-4">
              {metrics.funnel.map((step, index) => {
                const max = Math.max(1, metrics.funnel[0]?.count || Math.max(...metrics.funnel.map((item) => item.count), 1));
                const width = Math.max(8, Math.round((step.count / max) * 100));
                return (
                  <div key={step.label}>
                    <div className="grid gap-3 sm:grid-cols-[150px_1fr_120px] sm:items-center">
                      <span className="text-sm font-semibold">{step.label}</span>
                      <div className="h-5 overflow-hidden rounded-full bg-[#E8E1D5]">
                        <div className="h-full rounded-full bg-[#557264]" style={{ width: `${width}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-[#2F3C34]">{step.count} · {step.conversion === null ? "100%" : `${step.conversion}%`}</span>
                    </div>
                    {step.drop !== null && <p className="mt-1 text-xs text-[#8B5F4D]">Drop {step.drop}% dari tahap sebelumnya</p>}
                    {index < metrics.funnel.length - 1 && <ArrowDown size={16} className="mx-auto my-1 text-[#A2AA9F]" />}
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Founder Alert" action="real data only">
            {metrics.alerts.length ? (
              <div className="space-y-3">
                {metrics.alerts.map((alert) => (
                  <AlertCard key={`${alert.level}-${alert.title}`} alert={alert} />
                ))}
              </div>
            ) : (
              <NoData label={analytics.length || activities.length ? "Tidak ada alert dari data range ini." : "No data"} />
            )}
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel title="Cohort Retention" action="daily cohort">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-separate border-spacing-1 text-left text-sm">
                <thead className="text-xs uppercase text-[#6D786F]">
                  <tr><th className="py-2">Registration</th><th>Users</th><th>D1</th><th>D3</th><th>D7</th><th>D14</th><th>D30</th></tr>
                </thead>
                <tbody>
                  {metrics.cohorts.map((row) => (
                    <tr key={row.cohort}>
                      <td className="py-3 font-semibold">{formatDateKey(row.cohort)}</td>
                      <td>{row.users}</td>
                      {[row.d1, row.d3, row.d7, row.d14, row.d30].map((value, index) => (
                        <td key={`${row.cohort}-${index}`}>
                          <span className={`inline-flex min-w-14 justify-center rounded-[6px] px-2 py-1.5 text-xs font-bold ${heatmapClass(value)}`}>
                            {value === null ? "-" : `${value}%`}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Churn Dashboard" action="inactive users">
            <div className="space-y-3">
              {metrics.churn.map((row) => (
                <div key={row.day} className={row.count === Math.max(...metrics.churn.map((item) => item.count)) && row.count > 0 ? "rounded-[8px] border border-[#D8C7A1] bg-[#FFF8E8] p-3" : ""}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{row.day} day{row.day > 1 ? "s" : ""} inactive</span>
                    <span className="font-semibold">{row.count} · {pct(row.count, metrics.totalUsers) ?? 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#E3E0D7]"><div className="h-2 rounded-full bg-[#8B5F4D]" style={{ width: `${Math.min(100, pct(row.count, metrics.totalUsers) ?? 0)}%` }} /></div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Location Analytics" action="aggregated only">
            {metrics.topLocations.length ? (
              <div className="grid gap-3">
                {metrics.topLocations.map((row) => (
                  <div key={`${row.country}-${row.province}-${row.city}-${row.timezone}`} className="rounded-[8px] border border-[#E3E0D7] bg-white p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex items-center gap-2 font-semibold"><MapPin size={15} /> {row.city}</span>
                      <span className="text-[#6D786F]">{row.count} users</span>
                    </div>
                    <p className="mt-1 text-xs text-[#6D786F]">{row.province}, {row.country} · {row.timezone}</p>
                  </div>
                ))}
              </div>
            ) : <NoData label="No data" />}
          </Panel>

          <Panel title="Top Features" action={formatDateKey(rangeDates.end)}>
            <div className="grid gap-3 sm:grid-cols-2">
              {metrics.topFeatures.map((feature) => (
                <div key={feature.label} className="rounded-[8px] border border-[#E3E0D7] bg-white p-3">
                  <div className="flex items-center justify-between text-sm"><span className="font-semibold">{feature.label}</span><span>{feature.users} users</span></div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[#6D786F]">
                    <span>Avg {feature.avgDuration ? `${Math.round(feature.avgDuration / 60)}m` : "-"}</span>
                    <span>Done {feature.completion ?? 0}%</span>
                    <span>Bounce {feature.bounce ?? 0}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#E3E0D7]"><div className="h-1.5 rounded-full bg-[#557264]" style={{ width: `${Math.min(100, pct(feature.count, Math.max(1, metrics.topFeatures[0]?.count || 1)) ?? 0)}%` }} /></div>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <Panel title="User Table" action={`${visibleUsers.length} rows · ${USER_TABLE_PAGE_SIZE}/page`}>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E988D]" />
              <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search nama, email, UID, blueprint" className="h-10 w-full rounded-md border border-[#D9D6CC] bg-white pl-9 pr-3 text-sm outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[#6D786F]" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="h-10 rounded-md border border-[#D9D6CC] bg-white px-3 text-sm">
                <option value="all">All Status</option>
                <option value="premium">Premium</option>
                <option value="free">Free</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-xs uppercase text-[#6D786F]">
                <tr>
                  <SortableTh label="Nama" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort} />
                  <th className="py-2 pr-4">Email</th>
                  <SortableTh label="Tgl Daftar" field="registered" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort} />
                  <SortableTh label="Hari Aktif" field="activeDays" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort} />
                  <SortableTh label="Last Login" field="lastLogin" sortBy={sortBy} sortOrder={sortOrder} onSort={setSort} />
                  <th className="py-2">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.uid} className="border-t border-[#ECE8DF] hover:bg-[#F7F4ED]">
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="font-semibold text-[#2F3C34] hover:underline text-left"
                      >
                        {user.displayName}
                      </button>
                    </td>
                    <td className="py-3 pr-4 max-w-[220px] truncate text-[#6D786F]">{user.email}</td>
                    <td className="py-3 pr-4 text-[#6D786F]">{user.registeredAt ? formatDateTime(user.registeredAt) : "-"}</td>
                    <td className="py-3 pr-4 font-semibold">{user.activeDays.length}</td>
                    <td className="py-3 pr-4 text-[#6D786F]">{formatDateTime(user.lastLogin || user.lastSeen)}</td>
                    <td className="py-3 text-[#6D786F]">{formatDateTime(user.lastSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-[#ECE8DF] pt-4 text-sm text-[#6D786F] sm:flex-row sm:items-center sm:justify-between">
            <span>
              Menampilkan {visibleUsers.length === 0 ? 0 : (userPage - 1) * USER_TABLE_PAGE_SIZE + 1}
              {"-"}
              {Math.min(userPage * USER_TABLE_PAGE_SIZE, visibleUsers.length)} dari {visibleUsers.length} user
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserPage((page) => Math.max(1, page - 1))}
                disabled={userPage <= 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#D9D6CC] bg-white text-[#2F3C34] disabled:cursor-not-allowed disabled:opacity-40"
                title="Halaman sebelumnya"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-16 rounded-md bg-white px-3 py-2 text-center font-semibold text-[#2F3C34]">
                {userPage}/{totalUserPages}
              </span>
              <button
                type="button"
                onClick={() => setUserPage((page) => Math.min(totalUserPages, page + 1))}
                disabled={userPage >= totalUserPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#D9D6CC] bg-white text-[#2F3C34] disabled:cursor-not-allowed disabled:opacity-40"
                title="Halaman berikutnya"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Panel>
        <AdminInboxWorkspace />
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedUser(null)}>
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[8px] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D786F]">User Detail</p>
                <h2 className="font-serif text-2xl font-bold text-[#2F3C34]">{selectedUser.displayName}</h2>
                <p className="text-sm text-[#6D786F]">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-md border border-[#D9D6CC] px-3 py-2 text-sm font-semibold hover:bg-[#F7F4ED]">Close</button>
            </div>

            <section className="mb-6 rounded-[8px] border border-[#E3E0D7] bg-[#FBFAF6] p-4">
              <h3 className="text-sm font-bold text-[#344139]">Kirim Pesan Personal</h3>
              <p className="mt-1 text-xs text-[#6D786F]">Penerima: {selectedUser.displayName}</p>
              <div className="mt-3 grid gap-3">
                <input value={personalSubject} onChange={(event) => setPersonalSubject(event.target.value)} maxLength={140} placeholder="Subjek" className="rounded-md border border-[#D9D6CC] bg-white p-3 text-sm" />
                <textarea value={personalBody} onChange={(event) => setPersonalBody(event.target.value)} maxLength={4000} rows={4} placeholder="Tulis pesan..." className="rounded-md border border-[#D9D6CC] bg-white p-3 text-sm" />
                <button type="button" onClick={() => void sendPersonalMessage()} disabled={personalState === "sending"} className="w-fit rounded-md bg-[#344139] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{personalState === "sending" ? "Mengirim..." : "Kirim Pesan Personal"}</button>
                {personalState === "sent" && <p className="text-xs text-emerald-700">Pesan terkirim.</p>}
                {personalState === "error" && <p className="text-xs text-red-700">Pesan gagal dikirim. Silakan coba lagi.</p>}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* IDENTITY */}
              <DetailBox title="Identity" rows={[
                ["Nama", selectedUser.displayName],
                ["Email", selectedUser.email],
                ["UID", selectedUser.uid],
                ["Tanggal Lahir", pickFirst(selectedUser.rawUser, ["birthDate", "dateOfBirth", "tanggalLahir"]) || "No data"],
                ["Jam Lahir", pickFirst(selectedUser.rawUser, ["birthTime", "timeOfBirth", "jamLahir"]) || "No data"],
                ["Kota Lahir", pickFirst(selectedUser.rawUser, ["birthCity", "birthPlace", "city", "kotaLahir"]) || "No data"],
                ["Device", pickFirst(selectedUser.rawUser, ["deviceModel", "device", "androidVersion", "osVersion"]) || "No data"],
                ["Versi App", selectedUser.appVersion],
              ]} />

              {/* ACTIVITY */}
              <DetailBox title="Activity" rows={[
                ["Tgl Daftar", selectedUser.registeredAt ? formatDateTime(selectedUser.registeredAt) : "-"],
                ["Hari Aktif", `${selectedUser.activeDays.length}`],
                ["Last Login", formatDateTime(selectedUser.lastLogin)],
                ["Last Seen", formatDateTime(selectedUser.lastSeen)],
                ["Durasi Login Terakhir", selectedDetail?.activity?.totalSeconds ? `${Math.round((selectedDetail.activity.totalSeconds || 0) / 60)} menit` : "No data"],
                ["Last Page", selectedDetail?.activity?.lastScreen || selectedUser.lastScreen || "No data"],
                ["Navigation History", buildFlowRows(selectedUser, selectedDetail, analytics, rangeDates.end).map(([label, value]) => `${label}: ${value}`).join(" · ")],
              ]} />

              {/* JOURNEY */}
              <DetailBox title="Journey" rows={[
                ["Check-in", userJourneyValue(selectedUser, selectedDetail, analytics, rangeDates.end, "checkin")],
                ["Journey Progress", userJourneyValue(selectedUser, selectedDetail, analytics, rangeDates.end, "journey")],
                ["Wellness Progress", userJourneyValue(selectedUser, selectedDetail, analytics, rangeDates.end, "wellness")],
                ["Today's Practice", userCompletion(selectedUser, selectedDetail, analytics, rangeDates.end)],
                ["Last Activity", buildTimelineRows(selectedUser, selectedDetail, analytics, rangeDates.end).filter(([, value]) => value !== "No data").at(-1)?.[0] || "No data"],
              ]} />

              {/* BLUEPRINT */}
              <DetailBox title="Blueprint" rows={blueprintLoading ? [["Status", "Loading..."]] : [
                ["Life Path", selectedBlueprint?.lifePath || "-"],
                ["Arcana", selectedBlueprint?.arcana || "-"],
                ["Human Design", selectedBlueprint?.humanDesign || "-"],
                ["Weton", selectedBlueprint?.weton || "-"],
                ["Tzolkin", selectedBlueprint?.tzolkin || "-"],
                ["Sun Sign", selectedBlueprint?.sun || "-"],
              ]} />

              {/* MEMBERSHIP */}
              <div className="lg:col-span-2">
                <DetailBox title="Membership" rows={[
                  ["Badge", pickFirst(selectedUser.rawUser, ["testerBadge", "guardianBadge", "badge", "recognitionTier"]) || "No data"],
                  ["Plan", selectedUser.isPremium ? "Premium" : "Free"],
                  ["Access Until", formatDateTime(selectedUser.rawUser?.accessUntil ?? selectedUser.rawUser?.expiresAt ?? selectedUser.rawUser?.subscriptionExpiresAt)],
                  ["Subscription Status", String(selectedUser.rawUser?.subscriptionStatus ?? selectedUser.rawUser?.membershipStatus ?? selectedUser.rawUser?.membershipType ?? "-")],
                  ["Entitlement", String(selectedUser.rawUser?.entitlement ?? selectedUser.rawUser?.entitlements ?? "-")],
                ]} />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function userHasEvent(uid: string, events: AnalyticsDoc[], date: string, names: string[]): boolean {
  return events.some((event) => uniqueUid(event) === uid && event.date === date && names.includes(String(event.eventName)));
}

function textHasAny(value: unknown, needles: string[]): boolean {
  const haystack = String(value || "").toLowerCase();
  return needles.some((needle) => haystack.includes(needle));
}

function recordHasAny(record: Record<string, unknown> | null | undefined, needles: string[]): boolean {
  if (!record) return false;
  return textHasAny(JSON.stringify(record).toLowerCase(), needles);
}

function activeToday(user: FounderUser, detail: UserDetailData | null, date: string): boolean {
  return user.activeDays.includes(date)
    || readDateKey(user.lastSeen) === date
    || readDateKey(user.lastLogin) === date
    || !!detail?.activity
    || hasMeaningfulRecord(detail?.dailyState)
    || hasMeaningfulRecord(detail?.journeyRecord);
}

function yesNo(value: boolean): string {
  return value ? "Yes" : "No data";
}

function countLabel(count: number, unit: string): string {
  return count > 0 ? `${count} ${unit}` : "No data";
}

function userJourneyValue(
  user: FounderUser,
  detail: UserDetailData | null,
  events: AnalyticsDoc[],
  date: string,
  key: "checkin" | "wellness" | "journey" | "meditation" | "journaling" | "workout" | "yoga" | "manifestation" | "healthyFood" | "audio",
): string {
  const lastScreen = detail?.activity?.lastScreen || "";
  const dailyState = detail?.dailyState;
  const journeyRecord = detail?.journeyRecord;

  if (key === "checkin") {
    return yesNo(
      userHasEvent(user.uid, events, date, ["wellness_checkin_completed"]) ||
      activeToday(user, detail, date) ||
      recordHasAny(dailyState, ["checkin", "check_in", "check in"]),
    );
  }
  if (key === "wellness") {
    return detail?.wellnessAssessmentsToday
      ? `${detail.wellnessAssessmentsToday} assessment`
      : yesNo(
          userHasEvent(user.uid, events, date, ["wellness_checkin_completed", "wellness_assessment_completed", "open_innerwork"]) ||
          recordHasAny(dailyState, ["wellness", "innerwork"]) ||
          textHasAny(lastScreen, ["wellness", "innerwork"]),
        );
  }
  if (key === "journey") {
    return yesNo(
      userHasEvent(user.uid, events, date, ["open_journey", "practice_completed", "daily_completion_reached"]) ||
      hasMeaningfulRecord(journeyRecord) ||
      textHasAny(lastScreen, ["journey"]),
    );
  }
  if (key === "meditation") {
    return detail?.meditationEntriesToday
      ? countLabel(detail.meditationEntriesToday, "entry")
      : yesNo(userHasEvent(user.uid, events, date, ["meditation_open", "meditation_completed", "complete_meditation"]) || recordHasAny(dailyState, ["meditation", "meditasi"]));
  }
  if (key === "journaling") {
    return detail?.journalEntriesToday
      ? countLabel(detail.journalEntriesToday, "entry")
      : yesNo(userHasEvent(user.uid, events, date, ["journal_open", "journal_saved", "complete_journaling"]) || recordHasAny(dailyState, ["journal", "journaling", "refleksi"]));
  }
  if (key === "audio") {
    return detail?.audioHealingEntriesToday
      ? countLabel(detail.audioHealingEntriesToday, "entry")
      : yesNo(userHasEvent(user.uid, events, date, ["audio_open", "audio_completed", "complete_audio"]) || recordHasAny(dailyState, ["audio"]));
  }
  if (key === "workout") {
    return yesNo(userHasEvent(user.uid, events, date, ["open_workout", "complete_workout", "complete_workout_item"]) || recordHasAny(dailyState, ["workout"]));
  }
  if (key === "yoga") {
    return yesNo(userHasEvent(user.uid, events, date, ["open_yoga", "complete_yoga", "complete_yoga_item"]) || recordHasAny(dailyState, ["yoga"]));
  }
  if (key === "manifestation") {
    return yesNo(userHasEvent(user.uid, events, date, ["open_manifestasi", "complete_manifestasi"]) || recordHasAny(dailyState, ["manifest", "manifestasi"]));
  }
  return yesNo(userHasEvent(user.uid, events, date, ["open_healthy_food", "complete_healthy_food", "complete_healthy_food_item"]) || recordHasAny(dailyState, ["healthy", "food", "herbal"]));
}

function userCompletion(user: FounderUser, detail: UserDetailData | null, events: AnalyticsDoc[], date: string): string {
  const checks = [
    userJourneyValue(user, detail, events, date, "checkin") !== "No data",
    userJourneyValue(user, detail, events, date, "wellness") !== "No data",
    userJourneyValue(user, detail, events, date, "journey") !== "No data",
    userJourneyValue(user, detail, events, date, "journaling") !== "No data",
    userJourneyValue(user, detail, events, date, "meditation") !== "No data",
    userJourneyValue(user, detail, events, date, "audio") !== "No data",
  ];
  return `${Math.round((checks.filter(Boolean).length / checks.length) * 100)}%`;
}

function buildFlowRows(user: FounderUser, detail: UserDetailData | null, events: AnalyticsDoc[], date: string): string[][] {
  const dashboard = activeToday(user, detail, date) || userHasEvent(user.uid, events, date, ["dashboard_view", "open_dashboard"]);
  const profile = userHasEvent(user.uid, events, date, ["profile_view"]) || textHasAny(detail?.activity?.lastScreen, ["profile"]);
  const wellness = userJourneyValue(user, detail, events, date, "wellness") !== "No data";
  const journey = userJourneyValue(user, detail, events, date, "journey") !== "No data";
  const lastScreen = detail?.activity?.lastScreen || "";
  const rows = [
    ["Dashboard", dashboard ? "Yes" : "No data"],
    ["Profile", profile ? "Yes" : "No data"],
    ["Wellness", wellness ? "Yes" : "No data"],
    ["Journey", journey ? "Yes" : "No data"],
    ["Exit", lastScreen ? `Last screen: ${lastScreen}` : formatDateTime(user.lastSeen)],
  ];
  const firstDrop = rows.find(([label, value]) => !["Exit"].includes(label) && value === "No data")?.[0] || "No data";
  return [...rows, ["Drop-off Point", firstDrop]];
}

function buildTimelineRows(user: FounderUser, detail: UserDetailData | null, events: AnalyticsDoc[], date: string): string[][] {
  return [
    ["Login", activeToday(user, detail, date) ? formatDateTime(user.lastLogin || user.lastSeen) : "No data"],
    ["Dashboard", yesNo(activeToday(user, detail, date) || userHasEvent(user.uid, events, date, ["dashboard_view", "open_dashboard"]))],
    ["Reflection", userJourneyValue(user, detail, events, date, "journaling")],
    ["Wellness", userJourneyValue(user, detail, events, date, "wellness")],
    ["Journey", userJourneyValue(user, detail, events, date, "journey")],
    ["Manifestation", userJourneyValue(user, detail, events, date, "manifestation")],
    ["Logout", detail?.activity?.lastSeen ? formatDateTime(detail.activity.lastSeen) : formatDateTime(user.lastSeen)],
  ];
}

function buildUserAISummaryRows(user: FounderUser, detail: UserDetailData | null, events: AnalyticsDoc[], date: string): string[][] {
  const active = activeToday(user, detail, date);
  const wellness = userJourneyValue(user, detail, events, date, "wellness") !== "No data";
  const journey = userJourneyValue(user, detail, events, date, "journey") !== "No data";
  const inactiveDays = daysSince(user.lastSeenMs);
  const lastPage = detail?.activity?.lastScreen || user.lastScreen || "No data";
  const needsReminder = !wellness || (inactiveDays !== null && inactiveDays >= 3);

  return [
    ["Executive Read", active ? "User aktif pada range terpilih." : "Belum ada aktivitas baru pada range terpilih."],
    ["Wellness Signal", wellness ? "Wellness tersentuh dari data aktivitas." : "Belum kembali ke Wellness pada tanggal ini."],
    ["Journey Signal", journey ? "Journey tersentuh dari data aktivitas." : "Journey belum terlihat pada tanggal ini."],
    ["Last Page", lastPage],
    ["Reminder", needsReminder ? "Kemungkinan membutuhkan reminder." : "Belum perlu reminder dari sinyal yang ada."],
  ];
}

function MetricCard({ icon, label, value, sub, comparison, trend, sparkline, tone = "sage" }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; comparison?: string; trend?: string; sparkline?: number[]; tone?: "sage" | "gold" | "cream" }) {
  const toneClass = tone === "gold" ? "bg-[#FFF3D8] text-[#8A610D]" : tone === "cream" ? "bg-[#F4F0E7] text-[#5E5A4D]" : "bg-[#E4EFE7] text-[#31523F]";
  return (
    <div className="rounded-[8px] border border-[#E3E0D7] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-[8px] ${toneClass}`}>{icon}</div>
        {sparkline && (
          <svg width="112" height="30" viewBox="0 0 112 30" className="mt-1 overflow-visible">
            <polyline fill="none" stroke="#557264" strokeWidth="2" points={sparklinePoints(sparkline)} />
          </svg>
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6D786F]">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold text-[#2F3C34]">{value}</p>
        {trend && <span className="rounded-full bg-[#F7F4ED] px-2 py-1 text-[11px] font-bold text-[#557264]">{trend}</span>}
      </div>
      <p className="mt-2 text-xs text-[#7C857B]">{comparison || sub}</p>
      <p className="mt-1 text-xs text-[#A08B63]">{sub}</p>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-[#E3E0D7] bg-[#FBFAF6] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-bold text-[#2F3C34]">{title}</h2>
        {action && <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#6D786F]">{action}</span>}
      </div>
      {children}
    </section>
  );
}

function AlertCard({ alert }: { alert: AlertItem }) {
  const tone = alert.level === "critical"
    ? "border-[#E8B9B0] bg-[#FFF1EF] text-[#8A352B]"
    : alert.level === "warning"
      ? "border-[#EBD09B] bg-[#FFF8E8] text-[#76520D]"
      : "border-[#C9D8C4] bg-[#F1F7EF] text-[#31523F]";
  const label = alert.level === "critical" ? "Critical" : alert.level === "warning" ? "Warning" : "Info";

  return (
    <div className={`rounded-[8px] border p-3 ${tone}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em]">{label}</p>
          <p className="mt-1 font-semibold">{alert.title}</p>
          <p className="mt-1 text-sm opacity-90">{alert.detail}</p>
        </div>
      </div>
    </div>
  );
}

function NoData({ label }: { label: string }) {
  return <div className="rounded-md border border-dashed border-[#D9D6CC] bg-white px-4 py-6 text-center text-sm text-[#6D786F]">{label}</div>;
}

function SortableTh({ label, field, sortBy, sortOrder, onSort }: { label: string; field: SortField; sortBy: SortField; sortOrder: SortOrder; onSort: (field: SortField) => void }) {
  return (
    <th>
      <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 py-2 font-bold uppercase">
        {label}
        <ChevronDown size={14} className={sortBy === field && sortOrder === "asc" ? "rotate-180" : ""} />
      </button>
    </th>
  );
}

function DetailBox({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="rounded-lg border border-[#E3E0D7] bg-[#FBFAF6] p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6D786F]">{title}</h3>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={`${title}-${label}`} className="flex justify-between gap-4 border-b border-[#ECE8DF] pb-2 text-sm last:border-b-0">
            <span className="text-[#6D786F]">{label}</span>
            <span className="max-w-[58%] break-words text-right font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
