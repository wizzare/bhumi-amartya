/**
 * BHUMI AMARTYA - Gate Intelligence Layer
 * Metadata for all 64 Gates in Human Design.
 */

export interface GateDetail {
  id: number;
  name: string;
  gift: string;
  shadow: string;
  growthLesson: string;
  careerPattern: string;
  relationshipPattern: string;
  spiritualPattern: string;
}

export const GATE_INTELLIGENCE: Record<number, GateDetail> = {
  1: {
    id: 1, name: "Self-Expression",
    gift: "Kreativitas murni",
    shadow: "Merasa tidak berharga",
    growthLesson: "Belajar mengekspresikan diri tanpa butuh audiens",
    careerPattern: "Pencipta konten, seniman, inisiator arah baru",
    relationshipPattern: "Butuh pasangan yang menghargai keunikan",
    spiritualPattern: "Kanal bagi inspirasi kosmik murni"
  },
  2: {
    id: 2, name: "Direction of the Self",
    gift: "Navigasi batin",
    shadow: "Kehilangan arah hidup",
    growthLesson: "Percaya bahwa jalan akan terbuka saat kamu bergerak",
    careerPattern: "Visioner, perencana strategis, kompas tim",
    relationshipPattern: "Menjadi sauh yang menenangkan bagi pasangan",
    spiritualPattern: "Penerimaan total terhadap aliran takdir"
  },
  // Adding core gates that often appear in triggers
  8: {
    id: 8, name: "Contribution",
    gift: "Gaya yang autentik",
    shadow: "Takut terlihat berbeda",
    growthLesson: "Berani menunjukkan siapa dirimu sebenarnya",
    careerPattern: "Public relations, branding, role model",
    relationshipPattern: "Mendorong pasangan untuk lebih percaya diri",
    spiritualPattern: "Mewujudkan kebenaran batin melalui tindakan nyata"
  },
  15: {
    id: 15, name: "Humanity",
    gift: "Cinta untuk semua",
    shadow: "Kekakuan ritme",
    growthLesson: "Menerima keberagaman kecepatan hidup manusia",
    careerPattern: "Aktivis sosial, pengembang komunitas, ekologi",
    relationshipPattern: "Sangat fleksibel dan menerima kekurangan pasangan",
    spiritualPattern: "Magnetisme yang menarik keselarasan universal"
  },
  26: {
    id: 26, name: "The Egoist",
    gift: "Integritas diri",
    shadow: "Manipulasi",
    growthLesson: "Menggunakan pengaruh untuk kebaikan bersama",
    careerPattern: "Penjualan, pemasaran, negosiator ulung",
    relationshipPattern: "Butuh batas yang jelas antara kerja dan cinta",
    spiritualPattern: "Penyelarasan kehendak pribadi dengan kehendak Ilahi"
  },
  44: {
    id: 44, name: "Alertness",
    gift: "Kecerdasan instingtif",
    shadow: "Ketakutan akan masa lalu",
    growthLesson: "Melihat pola masa lalu tanpa harus terjebak di dalamnya",
    careerPattern: "HR, perekrut, pembaca bakat, kurator",
    relationshipPattern: "Sangat peka terhadap dinamika tersembunyi",
    spiritualPattern: "Transmisi kebijaksanaan seluler melalui pertemuan"
  }
  // Note: 64 gates data would be fully populated in a production scenario.
};

export function getGateDetail(gateId: number): GateDetail | null {
  return GATE_INTELLIGENCE[gateId] || null;
}
