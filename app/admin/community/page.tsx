"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/navigation/AppNav";
import { useAuth } from "@/context/AuthContext";
import { APP_MODE } from "@/lib/config/appMode";
import { getLocalUserSession } from "@/lib/auth/getLocalUserSession";
import { getUserRole } from "@/lib/auth/getUserRole";
import { safeJsonParse } from "@/lib/storage/safeJson";
import { getWorkshopRecommendations } from "@/lib/community/getWorkshopRecommendations";

type UnknownRecord = Record<string, unknown>;

type CommunityMember = {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  plan: string;
  lastActivity: string;
  journeyStage: string;
};

type WorkshopType = "Zoom" | "Offline" | "Healing Circle" | "Webinar";
type WorkshopStatus = "draft" | "open" | "closed" | "completed";

type Workshop = {
  id: string;
  title: string;
  description: string;
  type: WorkshopType;
  date: string;
  maxParticipants: number;
  status: WorkshopStatus;
};

type WorkshopParticipant = {
  id: string;
  workshopId: string;
  memberId: string;
  registered: boolean;
  attended: boolean;
  completed: boolean;
};

const COMMUNITY_MEMBERS_KEY = "bhumiCommunityMembers";
const WORKSHOPS_KEY = "bhumiWorkshops";
const WORKSHOP_PARTICIPANTS_KEY = "bhumiWorkshopParticipants";

function getString(record: UnknownRecord | null | undefined, path: string[]): string | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readMembers(): CommunityMember[] {
  const parsed = safeJsonParse<CommunityMember[] | null>(window.localStorage.getItem(COMMUNITY_MEMBERS_KEY), null);
  return Array.isArray(parsed) ? parsed : [];
}

function readWorkshops(): Workshop[] {
  const parsed = safeJsonParse<Workshop[] | null>(window.localStorage.getItem(WORKSHOPS_KEY), null);
  return Array.isArray(parsed) ? parsed : [];
}

function readParticipants(): WorkshopParticipant[] {
  const parsed = safeJsonParse<WorkshopParticipant[] | null>(window.localStorage.getItem(WORKSHOP_PARTICIPANTS_KEY), null);
  return Array.isArray(parsed) ? parsed : [];
}

function buildSeedMember(): CommunityMember | null {
  const profile = safeJsonParse<UnknownRecord | null>(window.localStorage.getItem("bhumiUserProfile"), null);
  const journey = safeJsonParse<UnknownRecord | null>(window.localStorage.getItem("bhumiJourneyData"), null);
  const lastActivity = safeJsonParse<UnknownRecord | null>(window.localStorage.getItem("bhumiLastActivity"), null);

  const email = getString(profile, ["email"]);
  const name = getString(profile, ["fullName"]) ?? getString(profile, ["displayName"]);
  if (!email || !name) return null;

  return {
    id: email.toLowerCase(),
    name,
    email,
    joinDate: getString(profile, ["createdAt"]) ?? new Date().toISOString(),
    plan: getString(profile, ["plan"]) ?? "free",
    lastActivity: getString(lastActivity, ["lastActivityDate"]) ?? "Belum tersedia",
    journeyStage: getString(journey, ["currentStage", "stage"]) ?? "Awareness",
  };
}

export default function AdminCommunityPage() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [participants, setParticipants] = useState<WorkshopParticipant[]>([]);
  const [dominantTheme, setDominantTheme] = useState<string | null>(null);
  const [journeyStage, setJourneyStage] = useState<string | null>(null);
  const [weeklyTheme, setWeeklyTheme] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    joinDate: new Date().toISOString().slice(0, 10),
    plan: "free",
    lastActivity: "",
    journeyStage: "Awareness",
  });
  const [workshopForm, setWorkshopForm] = useState({
    title: "",
    description: "",
    type: "Zoom" as WorkshopType,
    date: new Date().toISOString().slice(0, 16),
    maxParticipants: 20,
    status: "draft" as WorkshopStatus,
  });
  const [participantForm, setParticipantForm] = useState({
    workshopId: "",
    memberId: "",
    registered: true,
    attended: false,
    completed: false,
  });

  const currentProfile = useMemo(() => {
    if (APP_MODE === "local-first") return getLocalUserSession().profile;
    return auth?.userProfile ?? null;
  }, [auth?.userProfile]);

  const role = getUserRole(currentProfile ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existingMembers = readMembers();
    const seed = buildSeedMember();
    const nextMembers = existingMembers.length === 0 && seed ? [seed] : existingMembers;
    setMembers(nextMembers);
    setWorkshops(readWorkshops());
    setParticipants(readParticipants());
    setDominantTheme(getString(
      safeJsonParse<UnknownRecord | null>(window.localStorage.getItem("bhumiCompiledInnerwork"), null),
      ["dominantTheme"],
    ));
    setJourneyStage(getString(
      safeJsonParse<UnknownRecord | null>(window.localStorage.getItem("bhumiJourneyData"), null),
      ["currentStage", "stage"],
    ));
    setWeeklyTheme(getString(
      safeJsonParse<UnknownRecord | null>(window.localStorage.getItem("bhumiWeeklySoulReport"), null),
      ["dominantTheme"],
    ));
    if (existingMembers.length === 0 && seed) {
      window.localStorage.setItem(COMMUNITY_MEMBERS_KEY, JSON.stringify(nextMembers));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || loading) return;
    window.localStorage.setItem(COMMUNITY_MEMBERS_KEY, JSON.stringify(members));
  }, [members, loading]);

  useEffect(() => {
    if (typeof window === "undefined" || loading) return;
    window.localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(workshops));
  }, [workshops, loading]);

  useEffect(() => {
    if (typeof window === "undefined" || loading) return;
    window.localStorage.setItem(WORKSHOP_PARTICIPANTS_KEY, JSON.stringify(participants));
  }, [participants, loading]);

  const addMember = () => {
    if (!memberForm.name.trim() || !memberForm.email.trim()) return;
    setMembers((current) => ([
      {
        id: `${memberForm.email.trim().toLowerCase()}-${Date.now()}`,
        ...memberForm,
      },
      ...current,
    ]));
    setMemberForm({
      name: "",
      email: "",
      joinDate: new Date().toISOString().slice(0, 10),
      plan: "free",
      lastActivity: "",
      journeyStage: "Awareness",
    });
  };

  const addWorkshop = () => {
    if (!workshopForm.title.trim() || !workshopForm.description.trim()) return;
    setWorkshops((current) => ([
      {
        id: `workshop-${Date.now()}`,
        ...workshopForm,
      },
      ...current,
    ]));
    setWorkshopForm({
      title: "",
      description: "",
      type: "Zoom",
      date: new Date().toISOString().slice(0, 16),
      maxParticipants: 20,
      status: "draft",
    });
  };

  const addParticipant = () => {
    if (!participantForm.workshopId || !participantForm.memberId) return;
    setParticipants((current) => ([
      {
        id: `participant-${Date.now()}`,
        ...participantForm,
      },
      ...current,
    ]));
  };

  const updateParticipantFlag = (id: string, field: "registered" | "attended" | "completed", value: boolean) => {
    setParticipants((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const recommendations = getWorkshopRecommendations({
    dominantTheme,
    journeyStage,
    weeklyReportTheme: weeklyTheme,
  });

  const totalRegistrations = participants.filter((item) => item.registered).length;
  const attendedCount = participants.filter((item) => item.attended).length;
  const completedCount = participants.filter((item) => item.completed).length;
  const attendanceRate = totalRegistrations === 0 ? 0 : Math.round((attendedCount / totalRegistrations) * 100);
  const completionRate = totalRegistrations === 0 ? 0 : Math.round((completedCount / totalRegistrations) * 100);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-10 pb-28">
        <AppNav />
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#E8E9E5] bg-white p-6">
          <p className="text-[#4F5E52]">Memuat Community & CRM Engine...</p>
        </div>
      </main>
    );
  }

  if (!role.isAdmin) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-10 pb-28">
        <AppNav />
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#E8E9E5] bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-[#4F5E52]">Community & CRM Engine</h1>
          <p className="mt-3 text-[#7B8776]">Akses admin tidak tersedia untuk akun ini.</p>
          <Link href="/admin" className="mt-5 inline-flex rounded-full bg-[#4F5E52] px-5 py-2 text-sm font-medium text-white">
            Kembali ke Admin
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-10 pb-28">
      <AppNav />
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold text-[#4F5E52]">Community & CRM Engine</h1>
              <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">
                Pusat admin untuk mengelola member komunitas, workshop, partisipasi, dan kesiapan pertumbuhan pasca soft launch.
              </p>
            </div>
            <Link href="/admin" className="rounded-full border border-[#D3D8D0] px-4 py-2 text-sm text-[#4F5E52]">
              Kembali ke Admin
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
          <p className="text-sm font-semibold text-[#4F5E52]">Community Members</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input value={memberForm.name} onChange={(e) => setMemberForm((c) => ({ ...c, name: e.target.value }))} placeholder="Name" className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm" />
            <input value={memberForm.email} onChange={(e) => setMemberForm((c) => ({ ...c, email: e.target.value }))} placeholder="Email" className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm" />
            <input type="date" value={memberForm.joinDate} onChange={(e) => setMemberForm((c) => ({ ...c, joinDate: e.target.value }))} className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm" />
            <input value={memberForm.plan} onChange={(e) => setMemberForm((c) => ({ ...c, plan: e.target.value }))} placeholder="Plan" className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm" />
            <input value={memberForm.lastActivity} onChange={(e) => setMemberForm((c) => ({ ...c, lastActivity: e.target.value }))} placeholder="Last Activity" className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm" />
            <input value={memberForm.journeyStage} onChange={(e) => setMemberForm((c) => ({ ...c, journeyStage: e.target.value }))} placeholder="Journey Stage" className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm" />
          </div>
          <button type="button" onClick={addMember} className="mt-3 rounded-full bg-[#4F5E52] px-4 py-2 text-sm font-medium text-white">Tambah Member</button>

          <div className="mt-4 space-y-2">
            {members.length === 0 && <p className="text-sm text-[#7B8776]">Belum ada community member.</p>}
            {members.map((member) => (
              <div key={member.id} className="rounded-2xl border border-[#E8E9E5] bg-[#FAFBF8] p-3 text-sm text-[#4F5E52]">
                <p className="font-medium">{member.name} · {member.email}</p>
                <p className="mt-1 text-[#7B8776]">Join: {member.joinDate} · Plan: {member.plan} · Last Activity: {member.lastActivity || "Belum tersedia"} · Stage: {member.journeyStage}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
          <p className="text-sm font-semibold text-[#4F5E52]">Workshop Management</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input value={workshopForm.title} onChange={(e) => setWorkshopForm((c) => ({ ...c, title: e.target.value }))} placeholder="Workshop title" className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm sm:col-span-2" />
            <textarea value={workshopForm.description} onChange={(e) => setWorkshopForm((c) => ({ ...c, description: e.target.value }))} placeholder="Description" className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm sm:col-span-2" />
            <select value={workshopForm.type} onChange={(e) => setWorkshopForm((c) => ({ ...c, type: e.target.value as WorkshopType }))} className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm">
              <option value="Zoom">Zoom</option>
              <option value="Offline">Offline</option>
              <option value="Healing Circle">Healing Circle</option>
              <option value="Webinar">Webinar</option>
            </select>
            <input type="datetime-local" value={workshopForm.date} onChange={(e) => setWorkshopForm((c) => ({ ...c, date: e.target.value }))} className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm" />
            <input type="number" min={1} value={workshopForm.maxParticipants} onChange={(e) => setWorkshopForm((c) => ({ ...c, maxParticipants: Number(e.target.value) || 1 }))} placeholder="Max participants" className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm" />
            <select value={workshopForm.status} onChange={(e) => setWorkshopForm((c) => ({ ...c, status: e.target.value as WorkshopStatus }))} className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm">
              <option value="draft">draft</option>
              <option value="open">open</option>
              <option value="closed">closed</option>
              <option value="completed">completed</option>
            </select>
          </div>
          <button type="button" onClick={addWorkshop} className="mt-3 rounded-full bg-[#4F5E52] px-4 py-2 text-sm font-medium text-white">Tambah Workshop</button>

          <div className="mt-4 space-y-2">
            {workshops.length === 0 && <p className="text-sm text-[#7B8776]">Belum ada workshop.</p>}
            {workshops.map((workshop) => (
              <div key={workshop.id} className="rounded-2xl border border-[#E8E9E5] bg-[#FAFBF8] p-3 text-sm text-[#4F5E52]">
                <p className="font-medium">{workshop.title} · {workshop.type}</p>
                <p className="mt-1 text-[#7B8776]">{workshop.description}</p>
                <p className="mt-1 text-[#7B8776]">Tanggal: {new Date(workshop.date).toLocaleString("id-ID")} · Max: {workshop.maxParticipants} · Status: {workshop.status}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
          <p className="text-sm font-semibold text-[#4F5E52]">Participant Tracking</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select value={participantForm.memberId} onChange={(e) => setParticipantForm((c) => ({ ...c, memberId: e.target.value }))} className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm">
              <option value="">Pilih member</option>
              {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
            <select value={participantForm.workshopId} onChange={(e) => setParticipantForm((c) => ({ ...c, workshopId: e.target.value }))} className="rounded-lg border border-[#D8DDD4] px-3 py-2 text-sm">
              <option value="">Pilih workshop</option>
              {workshops.map((workshop) => <option key={workshop.id} value={workshop.id}>{workshop.title}</option>)}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#4F5E52]">
            <label className="flex items-center gap-2"><input type="checkbox" checked={participantForm.registered} onChange={(e) => setParticipantForm((c) => ({ ...c, registered: e.target.checked }))} />registered</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={participantForm.attended} onChange={(e) => setParticipantForm((c) => ({ ...c, attended: e.target.checked }))} />attended</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={participantForm.completed} onChange={(e) => setParticipantForm((c) => ({ ...c, completed: e.target.checked }))} />completed</label>
          </div>
          <button type="button" onClick={addParticipant} className="mt-3 rounded-full bg-[#4F5E52] px-4 py-2 text-sm font-medium text-white">Tambah Participant</button>

          <div className="mt-4 space-y-2">
            {participants.length === 0 && <p className="text-sm text-[#7B8776]">Belum ada participant tracking.</p>}
            {participants.map((participant) => {
              const member = members.find((item) => item.id === participant.memberId);
              const workshop = workshops.find((item) => item.id === participant.workshopId);

              return (
                <div key={participant.id} className="rounded-2xl border border-[#E8E9E5] bg-[#FAFBF8] p-3 text-sm text-[#4F5E52]">
                  <p className="font-medium">{member?.name || "Member"} → {workshop?.title || "Workshop"}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#4F5E52]">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={participant.registered} onChange={(e) => updateParticipantFlag(participant.id, "registered", e.target.checked)} />registered</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={participant.attended} onChange={(e) => updateParticipantFlag(participant.id, "attended", e.target.checked)} />attended</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={participant.completed} onChange={(e) => updateParticipantFlag(participant.id, "completed", e.target.checked)} />completed</label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
          <p className="text-sm font-semibold text-[#4F5E52]">Workshop yang mungkin relevan</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recommendations.map((recommendation) => (
              <div key={recommendation.title} className="rounded-2xl border border-[#E8E9E5] bg-[#FAFBF8] p-4">
                <p className="text-sm font-medium text-[#4F5E52]">{recommendation.title}</p>
                <p className="mt-2 text-sm text-[#7B8776]">{recommendation.reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
          <p className="text-sm font-semibold text-[#4F5E52]">Admin Metrics</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-[#FAFBF8] p-4 text-center"><p className="text-xs text-[#7B8776]">Total Workshops</p><p className="mt-1 text-xl font-semibold text-[#4F5E52]">{workshops.length}</p></div>
            <div className="rounded-2xl bg-[#FAFBF8] p-4 text-center"><p className="text-xs text-[#7B8776]">Registrations</p><p className="mt-1 text-xl font-semibold text-[#4F5E52]">{totalRegistrations}</p></div>
            <div className="rounded-2xl bg-[#FAFBF8] p-4 text-center"><p className="text-xs text-[#7B8776]">Attendance Rate</p><p className="mt-1 text-xl font-semibold text-[#4F5E52]">{attendanceRate}%</p></div>
            <div className="rounded-2xl bg-[#FAFBF8] p-4 text-center"><p className="text-xs text-[#7B8776]">Completion Rate</p><p className="mt-1 text-xl font-semibold text-[#4F5E52]">{completionRate}%</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
