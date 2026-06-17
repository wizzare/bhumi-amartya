export interface SupportResource {
  id: string;
  name: string;
  url?: string;
  phone?: string;
  purpose: { id: string; en: string };
  level: 1 | 2 | 3 | 4 | 5 | 6; // 5: Safety Observation, 6: Jalur Aman
  type: "internal" | "external" | "contact";
}

export const INTERNAL_RESOURCES: SupportResource[] = [
  { id: "daily_checkin", name: "Daily Check-In", level: 1, type: "internal", purpose: { id: "Monitor kondisi harian", en: "Monitor daily condition" } },
  { id: "wellness_assessment", name: "Wellness Assessment", level: 1, type: "internal", purpose: { id: "Evaluasi kesejahteraan mendalam", en: "Deep wellness evaluation" } },
  { id: "journaling", name: "Journaling", level: 1, type: "internal", purpose: { id: "Refleksi pikiran dan emosi", en: "Reflection of thoughts and emotions" } },
  { id: "audio_healing", name: "Audio Healing", level: 1, type: "internal", purpose: { id: "Relaksasi dan regulasi saraf", en: "Relaxation and nervous system regulation" } },
  { id: "meditation", name: "Meditasi", level: 1, type: "internal", purpose: { id: "Ketenangan batin dan kehadiran", en: "Inner peace and presence" } },
];

export const EXTERNAL_RESOURCES: SupportResource[] = [
  // LEVEL 3
  {
    id: "sejiwa_screening",
    name: "SEJIWA Screening",
    url: "https://sejiwa.web.id/skrining",
    level: 3,
    type: "external",
    purpose: { id: "Skrining mandiri kesehatan mental", en: "Mental health self-screening" }
  },
  {
    id: "indonesia_sehat_jiwa",
    name: "Indonesia Sehat Jiwa",
    url: "https://indonesiasehatjiwa.com",
    level: 3,
    type: "external",
    purpose: { id: "Edukasi, peer support, dan rujukan profesional", en: "Education, peer support, and professional referral" }
  },
  // LEVEL 4
  {
    id: "satusehat_mobile",
    name: "SATUSEHAT Mobile",
    url: "https://satusehat.kemkes.go.id/mobile",
    level: 4,
    type: "external",
    purpose: { id: "Platform kesehatan pemerintah dengan akses skrining jiwa", en: "Government health platform with mental health screening" }
  },
  {
    id: "bpjs_kesehatan",
    name: "BPJS Kesehatan",
    url: "https://bpjs-kesehatan.go.id",
    level: 4,
    type: "external",
    purpose: { id: "Akses layanan kesehatan publik dan rujukan mental", en: "Access to public healthcare and mental health referrals" }
  },
  // LEVEL 6 (JALUR AMAN)
  {
    id: "healing119_call",
    name: "Healing119 (Call)",
    phone: "119",
    level: 6,
    type: "external",
    purpose: { id: "Bantuan stabilisasi emosi 24 jam (Ext 8)", en: "24-hour emotional stabilization support (Ext 8)" }
  },
  {
    id: "healing119_web",
    name: "Healing119 Web",
    url: "https://www.healing119.id",
    level: 6,
    type: "external",
    purpose: { id: "Layanan dukungan kesehatan mental Kemenkes", en: "MOH mental health support services" }
  }
];

export const SUPPORT_DISCLAIMERS = {
  wellness: "Pilihan ini berfokus pada kesejahteraan dan pengembangan diri. Bukan pengganti layanan medis profesional atau diagnosis psikologis.",
  safety_intro: "Kami melihat beberapa sinyal yang menunjukkan bahwa kamu mungkin membutuhkan dukungan tambahan saat ini.",
  safety_recommendation: "Bhumi merekomendasikan jalur dukungan yang lebih dekat dan lebih manusiawi."
};
