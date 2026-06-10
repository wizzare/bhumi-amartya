"use client";

import React, { useEffect, useState } from "react";
import { analyticsService, AggregateMetrics } from "@/lib/services/analyticsService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  LineChart,
  BarChart,
  PieChart,
  TrendingUp,
  Users,
  Zap,
  Target,
  Layout,
  Compass,
  ArrowDown
} from "lucide-react";

export default function AdminInsightsPage() {
  const [metrics, setMetrics] = useState<AggregateMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await analyticsService.getTesterMetrics(30); // 30 days for deeper insight
        setMetrics(data);
      } catch (error) {
        console.error("Failed to load insights:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-mono animate-pulse">Gathering product intelligence...</p>
      </main>
    );
  }

  if (!metrics) return null;

  const topActivity = Object.entries(metrics.activityBreakdown).sort(([,a],[,b]) => b-a)[0];
  const leastActivity = Object.entries(metrics.activityBreakdown).sort(([,a],[,b]) => a-b)[0];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 p-6 pb-24 text-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* FOUNDER QUICK SUMMARY */}
          <section className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <h2 className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] mb-6">Founder Dashboard</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <p className="text-4xl font-bold">{metrics.totalUniqueUsers}</p>
                <p className="text-indigo-300 text-sm mt-1">Total Alpha Testers</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{metrics.retention.D1}%</p>
                <p className="text-indigo-300 text-sm mt-1">D1 Retention</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{Math.round((metrics.dailyCompletions / (metrics.dashboardOpens || 1)) * 100)}%</p>
                <p className="text-indigo-300 text-sm mt-1">Completion Velocity</p>
              </div>
              <div>
                <p className="text-4xl font-bold uppercase">{topActivity[0]}</p>
                <p className="text-indigo-300 text-sm mt-1">Winning Activity</p>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* ADOPTION FUNNEL */}
            <section className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target className="text-indigo-600" /> Feature Adoption Funnel
              </h3>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="space-y-4">
                  {metrics.funnel.map((step, i) => (
                    <div key={step.step}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-600">{step.step}</span>
                        <span className="text-xs font-mono text-slate-400">{step.count} users ({step.percentage}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                          style={{ width: `${step.percentage}%` }}
                        />
                      </div>
                      {i < metrics.funnel.length - 1 && (
                        <div className="flex justify-center my-1">
                          <ArrowDown size={14} className="text-slate-200" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PRODUCT INTELLIGENCE STATS */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="text-amber-500" /> Intelligence
              </h3>
              <div className="grid gap-4">
                <MetricTile label="Reason Expansion Rate" value={`${Math.round((metrics.expandReasonCount / (metrics.dailyNoteOpens || 1)) * 100)}%`} detail="Users curious about 'Why'" />
                <MetricTile label="Journey Unlock Rate" value={`${Math.round((metrics.journeyOpens / (metrics.totalUniqueUsers || 1)) * 100)}%`} detail="Users seeing their history" />
                <MetricTile label="Least Used Feature" value={leastActivity[0]} detail="Needs more attention" color="text-red-500" />
                <MetricTile label="D7 Retention" value={`${metrics.retention.D7}%`} detail="One week loyalty" />
              </div>
            </section>

            {/* PERSONA HEATMAP */}
            <section className="lg:col-span-3 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Compass className="text-emerald-600" /> Persona Heatmap (Active Users)
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <HeatmapCard title="Life Path Activity" data={metrics.personaHeatmap.lifePath} />
                <HeatmapCard title="Human Design Types" data={metrics.personaHeatmap.humanDesign} />
                <HeatmapCard title="Sun Sign Distribution" data={metrics.personaHeatmap.sunSign} />
              </div>
            </section>

          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function MetricTile({ label, value, detail, color = "text-slate-800" }: { label: string, value: string | number, detail: string, color?: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{detail}</p>
    </div>
  );
}

function HeatmapCard({ title, data }: { title: string, data: Record<string, number> }) {
  const sorted = Object.entries(data).sort(([,a],[,b]) => b-a);
  const max = sorted[0]?.[1] || 1;

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
      <h4 className="text-sm font-bold text-slate-500 mb-6">{title}</h4>
      <div className="space-y-4">
        {sorted.map(([label, count]) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-600">{label}</span>
              <span className="font-bold text-slate-400">{count}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
