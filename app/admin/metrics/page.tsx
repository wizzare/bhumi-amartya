"use client";

import React, { useEffect, useState } from "react";
import { analyticsService, AggregateMetrics } from "@/lib/services/analyticsService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BarChart, Activity, Users, LogIn, CheckCircle, Map } from "lucide-react";

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<AggregateMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await analyticsService.getTesterMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to load metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-mono">Loading tester metrics...</p>
      </main>
    );
  }

  if (!metrics) return null;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 p-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart className="text-indigo-600" />
              Tester Validation Metrics (14 Days)
            </h1>
            <p className="text-slate-500 text-sm">Monitoring behavior of 20 Alpha Testers.</p>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Users size={20}/>} label="Unique Users" value={metrics.totalUniqueUsers} color="bg-blue-50 text-blue-600" />
            <StatCard icon={<Activity size={20}/>} label="Dashboard Opens" value={metrics.dashboardOpens} color="bg-emerald-50 text-emerald-600" />
            <StatCard icon={<CheckCircle size={20}/>} label="Daily Completions" value={metrics.dailyCompletions} color="bg-purple-50 text-purple-600" />
            <StatCard icon={<Map size={20}/>} label="Journey Opens" value={metrics.journeyOpens} color="bg-orange-50 text-orange-600" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                <LogIn size={16}/> Daily Logins
              </h2>
              <div className="space-y-3">
                {Object.entries(metrics.dailyLogins).reverse().map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-600 font-mono">{date}</span>
                    <span className="font-bold text-slate-800">{count} logins</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Retention Rate</h2>
              <div className="grid grid-cols-2 gap-4">
                <RetentionCircle label="D1" percentage={metrics.retention.D1} />
                <RetentionCircle label="D3" percentage={metrics.retention.D3} />
                <RetentionCircle label="D7" percentage={metrics.retention.D7} />
                <RetentionCircle label="D14" percentage={metrics.retention.D14} />
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 md:col-span-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Activity Breakdown & Trends</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {Object.entries(metrics.activityBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([activity, count]) => (
                  <div key={activity} className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{activity}</p>
                    <p className="text-xl font-bold text-slate-800">{count}</p>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                <h3 className="text-indigo-800 font-bold text-sm mb-4">Internal Validation Report</h3>
                <ul className="space-y-3 text-sm text-indigo-700">
                  <li className="flex justify-between">
                    <span>Daily Completion Rate:</span>
                    <span className="font-bold">{Math.round((metrics.dailyCompletions / (metrics.totalUniqueUsers || 1)) * 100)}% of users</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Journey Engagement:</span>
                    <span className="font-bold">{Math.round((metrics.journeyOpens / (metrics.dashboardOpens || 1)) * 100)}% of dashboard opens</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Most Used Activity:</span>
                    <span className="font-bold uppercase">{Object.entries(metrics.activityBreakdown).sort(([,a],[,b]) => b-a)[0][0]}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Least Used Activity:</span>
                    <span className="font-bold uppercase">{Object.entries(metrics.activityBreakdown).sort(([,a],[,b]) => a-b)[0][0]}</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
      <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function RetentionCircle({ label, percentage }: { label: string, percentage: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center relative mb-2">
        <div
          className="absolute inset-0 rounded-full border-4 border-indigo-500 transition-all duration-1000"
          style={{ clipPath: `inset(${100 - percentage}% 0 0 0)` }}
        />
        <span className="text-xs font-bold text-slate-800">{percentage}%</span>
      </div>
      <span className="text-[10px] font-bold text-slate-400">{label}</span>
    </div>
  );
}
