/**
 * BHUMI AMARTYA - Incarnation Cross Intelligence Layer
 */

export interface CrossMission {
  soulMission: string;
  lifeTheme: string;
  legacyTheme: string;
  contributionTheme: string;
  growthChallenge: string;
}

export const CROSS_INTELLIGENCE: Record<string, CrossMission> = {
  "The Right Angle Cross of the Sphinx": {
    soulMission: "Menjadi kompas bagi orang lain untuk menemukan arah mereka",
    lifeTheme: "Navigasi",
    legacyTheme: "Arah yang baru bagi generasi mendatang",
    contributionTheme: "Membuka jalan",
    growthChallenge: "Berhenti meragukan arahmu sendiri"
  },
  "The Right Angle Cross of Eden": {
    soulMission: "Membawa kebijaksanaan dari pengalaman masa lalu untuk membangun masa depan",
    lifeTheme: "Transmisi Pengalaman",
    legacyTheme: "Kisah-kisah yang mendewasakan batin",
    contributionTheme: "Cerita dan pembelajaran",
    growthChallenge: "Melepaskan rasa bersalah atas kesalahan masa lalu"
  },
  "The Right Angle Cross of Explanation": {
    soulMission: "Mengkomunikasikan ide-ide kompleks menjadi bahasa yang dimengerti",
    lifeTheme: "Kejelasan",
    legacyTheme: "Sistem komunikasi yang jujur",
    contributionTheme: "Penjelasan dan pengajaran",
    growthChallenge: "Menunggu waktu yang tepat untuk berbicara agar tidak ditolak"
  }
  // All standard crosses would be mapped here.
};

export function getCrossMission(name: string | null): CrossMission {
  const match = name ? Object.keys(CROSS_INTELLIGENCE).find(k => name.includes(k)) : null;
  return (match && CROSS_INTELLIGENCE[match]) || {
    soulMission: "Mewujudkan potensi unikmu melalui tindakan yang selaras",
    lifeTheme: "Pertumbuhan",
    legacyTheme: "Dampak positif yang berkelanjutan",
    contributionTheme: "Hadir secara utuh",
    growthChallenge: "Menyelaraskan batin dengan tindakan luar"
  };
}
