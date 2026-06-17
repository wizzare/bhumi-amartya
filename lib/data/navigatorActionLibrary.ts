export type NavigatorMode = "RECOVERY" | "REFLECTION" | "GROWTH";

export interface NavigatorAction {
  id: string;
  mode: NavigatorMode;
  category: string;
  label: { id: string; en: string };
  microAction: { id: string; en: string };
  targetDimension?: "BODY" | "EMOTION" | "RELATIONSHIP" | "MEANING" | "SPIRITUALITY";
}

export const NAVIGATOR_ACTIONS: NavigatorAction[] = [
  // RECOVERY MODE ACTIONS
  {
    id: "early_sleep",
    mode: "RECOVERY",
    category: "Rest",
    label: { id: "Pemulihan Energi", en: "Energy Recovery" },
    microAction: { id: "Tidur 30 menit lebih awal malam ini.", en: "Sleep 30 minutes earlier tonight." },
    targetDimension: "BODY"
  },
  {
    id: "breath_60s",
    mode: "RECOVERY",
    category: "Regulation",
    label: { id: "Penenangan Saraf", en: "Nervous System Calming" },
    microAction: { id: "Tarik napas perlahan selama 60 detik.", en: "Breathe in slowly for 60 seconds." },
    targetDimension: "EMOTION"
  },
  {
    id: "cold_water",
    mode: "RECOVERY",
    category: "Grounding",
    label: { id: "Grounding Sederhana", en: "Simple Grounding" },
    microAction: { id: "Basuh wajah dengan air dingin untuk menyegarkan saraf.", en: "Wash your face with cold water to refresh your nerves." },
    targetDimension: "BODY"
  },
  {
    id: "digital_detox",
    mode: "RECOVERY",
    category: "Space",
    label: { id: "Ruang Tenang", en: "Quiet Space" },
    microAction: { id: "Matikan notifikasi HP selama 15 menit ke depan.", en: "Turn off phone notifications for the next 15 minutes." },
    targetDimension: "EMOTION"
  },

  // REFLECTION MODE ACTIONS
  {
    id: "one_line_journal",
    mode: "REFLECTION",
    category: "Journaling",
    label: { id: "Jurnal Singkat", en: "Short Journaling" },
    microAction: { id: "Tuliskan satu hal yang masih penting bagimu hari ini.", en: "Write down one thing that still matters to you today." },
    targetDimension: "MEANING"
  },
  {
    id: "gratitude_one",
    mode: "REFLECTION",
    category: "Gratitude",
    label: { id: "Praktik Syukur", en: "Gratitude Practice" },
    microAction: { id: "Sebutkan satu hal kecil yang kamu syukuri hari ini.", en: "Name one small thing you are grateful for today." },
    targetDimension: "SPIRITUALITY"
  },
  {
    id: "blueprint_reminder",
    mode: "REFLECTION",
    category: "Identity",
    label: { id: "Refleksi Diri", en: "Self Reflection" },
    microAction: { id: "Baca kembali deskripsi Role Blueprint-mu.", en: "Re-read your Blueprint Role description." },
    targetDimension: "MEANING"
  },
  {
    id: "window_view",
    mode: "REFLECTION",
    category: "Presence",
    label: { id: "Kehadiran Utuh", en: "Full Presence" },
    microAction: { id: "Lihat ke luar jendela selama 1 menit tanpa gadget.", en: "Look out the window for 1 minute without any gadgets." },
    targetDimension: "SPIRITUALITY"
  },

  // GROWTH MODE ACTIONS
  {
    id: "learn_10m",
    mode: "GROWTH",
    category: "Learning",
    label: { id: "Pengembangan Diri", en: "Self Development" },
    microAction: { id: "Pelajari satu hal baru selama 10 menit hari ini.", en: "Learn one new thing for 10 minutes today." },
    targetDimension: "MEANING"
  },
  {
    id: "vision_step",
    mode: "GROWTH",
    category: "Vision",
    label: { id: "Langkah Masa Depan", en: "Vision Step" },
    microAction: { id: "Tuliskan satu tujuan kecil untuk minggu depan.", en: "Write down one small goal for next week." },
    targetDimension: "MEANING"
  },
  {
    id: "connection_outreach",
    mode: "GROWTH",
    category: "Relational",
    label: { id: "Koneksi Bermakna", en: "Meaningful Connection" },
    microAction: { id: "Kirim pesan singkat apresiasi pada satu teman.", en: "Send a short appreciation message to one friend." },
    targetDimension: "RELATIONSHIP"
  }
];
