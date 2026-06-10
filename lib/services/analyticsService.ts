import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AnalyticsEventName } from "@/lib/analytics/usageAnalytics";

export interface AggregateMetrics {
  dailyLogins: Record<string, number>;
  dashboardOpens: number;
  dailyNoteOpens: number;
  expandReasonCount: number;
  innerworkOpens: number;
  dailyCompletions: number;
  journeyOpens: number;
  activityBreakdown: Record<string, number>;
  retention: Record<string, number>;
  totalUniqueUsers: number;
  funnel: Array<{ step: string; count: number; percentage: number }>;
  personaHeatmap: {
    lifePath: Record<string, number>;
    humanDesign: Record<string, number>;
    sunSign: Record<string, number>;
  };
}

export const analyticsService = {
  async getTesterMetrics(days: number = 14): Promise<AggregateMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateString = startDate.toISOString().slice(0, 10);

    const q = query(
      collection(db, "analytics"),
      where("date", ">=", startDateString),
      orderBy("date", "asc")
    );

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => doc.data());
    const uniqueUids = Array.from(new Set(events.map(e => e.uid).filter(Boolean)));

    // Fetch Persona Data for Heatmap
    const personaData = {
      lifePath: {} as Record<string, number>,
      humanDesign: {} as Record<string, number>,
      sunSign: {} as Record<string, number>
    };

    try {
      // Small batch fetching to avoid firestore query limits
      const blueprintPromises = uniqueUids.map(uid => getDocs(query(collection(db, "blueprints"), where("uid", "==", uid))));
      const blueprintSnapshots = await Promise.all(blueprintPromises);

      blueprintSnapshots.forEach(snap => {
        if (!snap.empty) {
          const data = snap.docs[0].data();
          const lp = data.lifePath?.number || "Unknown";
          const hd = data.humanDesign?.type || "Unknown";
          const sun = data.astrology?.sunSign || data.natalChart?.sunSign || "Unknown";

          personaData.lifePath[lp] = (personaData.lifePath[lp] || 0) + 1;
          personaData.humanDesign[hd] = (personaData.humanDesign[hd] || 0) + 1;
          personaData.sunSign[sun] = (personaData.sunSign[sun] || 0) + 1;
        }
      });
    } catch (e) {
      console.error("Failed to fetch persona data:", e);
    }

    const metrics: AggregateMetrics = {
      dailyLogins: {},
      dashboardOpens: 0,
      dailyNoteOpens: 0,
      expandReasonCount: 0,
      innerworkOpens: 0,
      dailyCompletions: 0,
      journeyOpens: 0,
      activityBreakdown: {
        journaling: 0,
        meditation: 0,
        audio: 0,
        workout: 0,
        yoga: 0,
        herbal: 0
      },
      retention: { D1: 0, D3: 0, D7: 0, D14: 0 },
      totalUniqueUsers: uniqueUids.length,
      funnel: [],
      personaHeatmap: personaData
    };

    const funnelSteps = {
      dashboard: new Set(),
      dailyNote: new Set(),
      expandReason: new Set(),
      innerwork: new Set(),
      anyActivity: new Set(),
      completion: new Set(),
      journey: new Set()
    };

    events.forEach(event => {
      const date = event.date;
      const name = event.eventName as AnalyticsEventName;
      const uid = event.uid;

      if (name === "login_success") {
        metrics.dailyLogins[date] = (metrics.dailyLogins[date] || 0) + 1;
      } else if (name === "open_dashboard" || name === "dashboard_view") {
        metrics.dashboardOpens++;
        if (uid) funnelSteps.dashboard.add(uid);
      } else if (name === "open_daily_note") {
        metrics.dailyNoteOpens++;
        if (uid) funnelSteps.dailyNote.add(uid);
      } else if (name === "expand_reason") {
        metrics.expandReasonCount++;
        if (uid) funnelSteps.expandReason.add(uid);
      } else if (name === "open_innerwork") {
        metrics.innerworkOpens++;
        if (uid) funnelSteps.innerwork.add(uid);
      } else if (name === "daily_completion_reached") {
        metrics.dailyCompletions++;
        if (uid) funnelSteps.completion.add(uid);
      } else if (name === "open_journey") {
        metrics.journeyOpens++;
        if (uid) funnelSteps.journey.add(uid);
      } else if (name.startsWith("complete_")) {
        if (uid) funnelSteps.anyActivity.add(uid);
        if (name === "complete_journaling") metrics.activityBreakdown.journaling++;
        else if (name === "complete_meditation") metrics.activityBreakdown.meditation++;
        else if (name === "complete_audio") metrics.activityBreakdown.audio++;
        else if (name === "complete_workout") metrics.activityBreakdown.workout++;
        else if (name === "complete_yoga") metrics.activityBreakdown.yoga++;
        else if (name === "complete_herbal") metrics.activityBreakdown.herbal++;
      }
    });

    // Build Funnel
    const total = metrics.totalUniqueUsers || 1;
    metrics.funnel = [
      { step: "Open Dashboard", count: funnelSteps.dashboard.size, percentage: Math.round((funnelSteps.dashboard.size / total) * 100) },
      { step: "Open Daily Note", count: funnelSteps.dailyNote.size, percentage: Math.round((funnelSteps.dailyNote.size / total) * 100) },
      { step: "Expand Reason", count: funnelSteps.expandReason.size, percentage: Math.round((funnelSteps.expandReason.size / total) * 100) },
      { step: "Open Innerwork", count: funnelSteps.innerwork.size, percentage: Math.round((funnelSteps.innerwork.size / total) * 100) },
      { step: "Complete Activity", count: funnelSteps.anyActivity.size, percentage: Math.round((funnelSteps.anyActivity.size / total) * 100) },
      { step: "Daily Completion (2+)", count: funnelSteps.completion.size, percentage: Math.round((funnelSteps.completion.size / total) * 100) },
      { step: "Open Journey", count: funnelSteps.journey.size, percentage: Math.round((funnelSteps.journey.size / total) * 100) }
    ];

    // Simple retention calculation based on first appearance vs subsequent appearances
    const userActivityDates: Record<string, Set<string>> = {};
    events.forEach(e => {
        if (!e.uid) return;
        if (!userActivityDates[e.uid]) userActivityDates[e.uid] = new Set();
        userActivityDates[e.uid].add(e.date);
    });

    let d1Count = 0, d3Count = 0, d7Count = 0, d14Count = 0;
    Object.values(userActivityDates).forEach(dates => {
        const sorted = Array.from(dates).sort();
        const first = new Date(sorted[0]);

        const checkDay = (dayNum: number) => {
            const target = new Date(first);
            target.setDate(target.getDate() + dayNum);
            return dates.has(target.toISOString().slice(0, 10));
        };

        if (checkDay(1)) d1Count++;
        if (checkDay(3)) d3Count++;
        if (checkDay(7)) d7Count++;
        if (checkDay(14)) d14Count++;
    });

    metrics.retention.D1 = Math.round((d1Count / total) * 100);
    metrics.retention.D3 = Math.round((d3Count / total) * 100);
    metrics.retention.D7 = Math.round((d7Count / total) * 100);
    metrics.retention.D14 = Math.round((d14Count / total) * 100);

    return metrics;
  }
};
