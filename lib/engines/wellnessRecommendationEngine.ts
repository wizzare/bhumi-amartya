import { WellnessSnapshot } from "@/lib/data/types";

export interface WellnessRecommendation {
  primaryAction: {
    label: string;
    action: string; // e.g., 'meditation', 'journaling', 'audio'
  };
  supportingAdvice: string[];
}

export function getWellnessRecommendation(snapshot: WellnessSnapshot): WellnessRecommendation {
  const { metrics } = snapshot;
  const recommendations: string[] = [];

  // Priority based on hierarchy: Sleep > Energy > Emotion > Focus

  let primaryAction = { label: "Mulai Journaling", action: "journaling" };

  if (metrics.sleep < 4) {
    recommendations.push("Dengarkan Alunan Kepulangan (Relaxation Audio)");
    recommendations.push("Istirahat lebih awal malam ini");
    primaryAction = { label: "Dengarkan Audio Healing", action: "audio" };
  }

  if (metrics.energy < 4) {
    recommendations.push("Lakukan Meditasi Grounding");
    recommendations.push("Yoga Pemulihan Lembut (Gentle Yoga)");
    if (metrics.sleep >= 4) {
      primaryAction = { label: "Mulai Meditasi", action: "meditation" };
    }
  }

  if (metrics.emotion < 4) {
    recommendations.push("Gunakan Audio Healing untuk regulasi emosi");
    recommendations.push("Tuliskan perasaanmu di Jurnal");
    if (metrics.sleep >= 4 && metrics.energy >= 4) {
      primaryAction = { label: "Dengarkan Audio Healing", action: "audio" };
    }
  }

  if (metrics.focus < 4) {
    recommendations.push("Journaling singkat untuk menjernihkan pikiran");
    recommendations.push("Jalan santai sejenak (Walking)");
    if (metrics.sleep >= 4 && metrics.energy >= 4 && metrics.emotion >= 4) {
      primaryAction = { label: "Mulai Journaling", action: "journaling" };
    }
  }

  // Default if all good
  if (recommendations.length === 0) {
    recommendations.push("Pertahankan ritme baikmu hari ini");
    recommendations.push("Lanjutkan praktik harianmu");
  }

  return {
    primaryAction,
    supportingAdvice: recommendations.slice(0, 3)
  };
}
