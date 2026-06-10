"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/navigation/AppNav";
import { useAuth } from "@/context/AuthContext";
import { getUserRole } from "@/lib/auth/getUserRole";
import {
  Users,
  CreditCard,
  TrendingUp,
  Zap,
  Leaf,
  MessageCircle,
  AlertTriangle,
  Settings,
  Package,
  ChevronRight,
  ShieldCheck,
  Clock
} from "lucide-react";
import { PENJAGA_BHUMI_INTI_EMAILS } from "@/lib/constants/membership";

export default function AdminPage() {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const userProfile = auth?.userProfile || null;
  const role = getUserRole(userProfile);
  const isAdmin = role.isAdmin;

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] flex items-center justify-center">
        <p className="text-[#7B8776] animate-pulse font-medium">Membuka Founder Control Room...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-10 flex items-center justify-center">
        <div className="max-w-md w-full bhumi-card p-10 text-center bg-white">
          <ShieldCheck size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-serif font-bold text-[#4F5E52]">Akses Ditolak</h1>
          <p className="mt-3 text-[#7B8776]">Hanya Founder yang memiliki akses ke ruangan ini.</p>
          <Link href="/dashboard" className="bhumi-button mt-8 inline-flex">Kembali ke Dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] text-[#4F5E52] pb-32">
      <AppNav />

      {/* Header */}
      <header className="pt-12 pb-8 px-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[#4F5E52] text-white shadow-sm">
            <Settings size={18} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7B8776]">Founder Control Room</p>
        </div>
        <h1 className="text-4xl font-serif font-bold text-[#4F6658]">Admin Bhumi</h1>
      </header>

      <div className="max-w-4xl mx-auto px-6 space-y-8">

        {/* 1. Founder Summary */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Users size={18} className="text-[#9BB89A]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Founder Summary</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Penjaga Bhumi" value="-" sub="Connected to Firestore" />
            <StatCard label="Active Today" value="-" sub="Real-time Analytics" />
            <StatCard label="Trial Active" value="-" />
            <StatCard label="Paid Members" value="0" />
            <StatCard label="Penjaga Bhumi Inti" value={PENJAGA_BHUMI_INTI_EMAILS.length.toString()} />
            <StatCard label="Free Plan Active" value="-" />
          </div>
        </section>

        {/* 2. Revenue & Billing */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <CreditCard size={18} className="text-[#9BB89A]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Revenue & Billing</h2>
          </div>
          <div className="bhumi-card bg-white p-8 border-none shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-[#7B8776] font-medium italic">Billing belum aktif</p>
            <p className="text-[10px] mt-2 text-[#9AA394] uppercase tracking-widest font-bold">Planned for Build 31</p>
          </div>
        </section>

        {/* 3. Growth & Play Store */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp size={18} className="text-[#9BB89A]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Growth & Play Store</h2>
          </div>
          <div className="bhumi-card bg-white p-8 border-none shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-[#7B8776] font-medium italic">Data Play Store belum terhubung</p>
            <p className="text-[10px] mt-2 text-[#9AA394] uppercase tracking-widest font-bold">Waiting for Production Track</p>
          </div>
        </section>

        {/* 4. Feature Usage */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Zap size={18} className="text-[#9BB89A]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Feature Usage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bhumi-card bg-white p-6 border-none shadow-sm space-y-4">
              <UsageRow label="Refleksi Jiwa opened" value="0%" />
              <UsageRow label="Astro Hari Ini opened" value="0%" />
              <UsageRow label="Catatan Hari Ini opened" value="0%" />
              <UsageRow label="Innerwork opened" value="0%" />
              <UsageRow label="Manifestasi opened" value="0%" />
            </div>
            <div className="bhumi-card bg-white p-6 border-none shadow-sm space-y-4">
              <UsageRow label="Journaling" value="0%" />
              <UsageRow label="Meditation" value="0%" />
              <UsageRow label="Audio Healing" value="0%" />
              <UsageRow label="Yoga / Workout" value="0%" />
            </div>
          </div>
        </section>

        {/* 5. Penjaga Bhumi Inti */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Leaf size={18} className="text-[#9BB89A]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Penjaga Bhumi Inti</h2>
          </div>
          <div className="bhumi-card bg-white border-none shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#F5F1E8] flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-[#7B8776] uppercase tracking-widest">Allowlist Active</p>
                <p className="text-sm text-[#4F5E52] mt-1">{PENJAGA_BHUMI_INTI_EMAILS.length} Emails Approved</p>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">Read Only</button>
            </div>
            <div className="max-h-60 overflow-y-auto p-4 bg-[#FCFAF5]/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PENJAGA_BHUMI_INTI_EMAILS.map(email => (
                  <div key={email} className="text-xs p-2 bg-white border border-[#E8E9E5] rounded-lg font-mono text-[#7B8776]">
                    {email}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Feedback */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <MessageCircle size={18} className="text-[#9BB89A]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Feedback Penjaga Bhumi</h2>
          </div>
          <div className="bhumi-card bg-white p-8 border-none shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-[#7B8776] font-medium italic">Feedback belum terhubung</p>
          </div>
        </section>

        {/* 7. Founder Alerts */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <AlertTriangle size={18} className="text-[#9BB89A]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Founder Alerts</h2>
          </div>
          <div className="space-y-3">
             <AlertItem title="Gemini API" status="Warning" desc="Pending Validation" />
             <AlertItem title="Billing" status="Not Configured" desc="No active provider" />
             <AlertItem title="Push Notification" status="Not Configured" desc="FCM pending" />
          </div>
        </section>

        {/* 8 & 9. Engine & Build Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Package size={18} className="text-[#9BB89A]" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Build Status</h2>
            </div>
            <div className="bhumi-card bg-white p-6 border-none shadow-sm space-y-4">
              <BuildRow label="versionCode" value="30" />
              <BuildRow label="versionName" value="1.4.3-founder-control" />
              <BuildRow label="Track" value="Internal Testing" />
              <BuildRow label="Last Release" value={new Date().toLocaleDateString('id-ID')} />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Settings size={18} className="text-[#9BB89A]" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Engine Status</h2>
            </div>
            <div className="bhumi-card bg-white p-6 border-none shadow-sm space-y-4">
              <StatusRow label="AI Engine" status="Pending" />
              <StatusRow label="Astro Engine" status="Active" />
              <StatusRow label="Google Login" status="Active" />
              <StatusRow label="Firestore" status="Active" />
            </div>
          </section>
        </div>

        {/* 10. Next Build Focus */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 px-1">
            <Clock size={18} className="text-[#9BB89A]" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Build Roadmap</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bhumi-card bg-[#4F5E52] p-6 text-white border-none shadow-md">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Current: Build 30</p>
              <ul className="text-sm space-y-2 font-medium">
                <li>• Penjaga Bhumi Inti</li>
                <li>• About Bhumi Amartya Page</li>
                <li>• Admin Page Cleanup</li>
              </ul>
            </div>
            <div className="bhumi-card bg-white p-6 border-none shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7B8776] mb-2">Next: Build 31</p>
              <ul className="text-sm space-y-2 font-medium text-[#4F5E52]">
                <li className="opacity-50">• Push Notification</li>
                <li className="opacity-50">• Billing Subscription</li>
                <li className="opacity-50">• Bug Tracking Improvement</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bhumi-card bg-white p-5 border-none shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#7B8776] mb-2">{label}</p>
      <p className="text-2xl font-serif font-bold text-[#4F6658]">{value}</p>
      {sub && <p className="text-[9px] mt-1 text-[#9AA394] font-medium">{sub}</p>}
    </div>
  );
}

function UsageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm font-medium">
      <span className="text-[#7B8776]">{label}</span>
      <span className="text-[#4F5E52]">{value}</span>
    </div>
  );
}

function BuildRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm font-medium border-b border-[#F5F1E8] pb-2 last:border-0 last:pb-0">
      <span className="text-[#7B8776]">{label}</span>
      <span className="text-[#4F5E52] font-mono text-xs">{value}</span>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: "Active" | "Pending" | "Error" }) {
  const color = status === "Active" ? "text-emerald-600 bg-emerald-50" : status === "Pending" ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
  return (
    <div className="flex justify-between items-center text-sm font-medium">
      <span className="text-[#7B8776]">{label}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${color}`}>{status}</span>
    </div>
  );
}

function AlertItem({ title, status, desc }: { title: string; status: string; desc: string }) {
  return (
    <div className="bhumi-card bg-white p-4 border-l-4 border-amber-400 shadow-sm flex justify-between items-center">
      <div>
        <p className="text-sm font-bold text-[#4F5E52]">{title}</p>
        <p className="text-xs text-[#7B8776] mt-1">{desc}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{status}</p>
      </div>
    </div>
  );
}
