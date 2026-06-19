import type { CurrentSky } from "@/lib/astrology/calculateCurrentSky";
import type { AstroHouseActivation } from "@/lib/astrology/astroHouseActivations";

export type DashboardAstroRuntime = {
  humanImpact: string;
  practicalAwareness: string;
  dailyFocus: string;
};

const PHASE_CONTEXT: Record<string, DashboardAstroRuntime> = {
  "New Moon": {
    humanImpact: "Hari ini mendukung awal yang tenang dan penentuan niat yang tidak berlebihan.",
    practicalAwareness: "Perhatikan mana yang benar-benar ingin dimulai, bukan mana yang hanya terasa mendesak.",
    dailyFocus: "Pilih satu awal kecil yang bisa dijaga.",
  },
  "Waxing Crescent": {
    humanImpact: "Hari ini mendukung pertumbuhan awal yang masih membutuhkan kesabaran.",
    practicalAwareness: "Kemajuan kecil lebih berguna daripada menambah terlalu banyak arah.",
    dailyFocus: "Rawat satu langkah yang sudah dimulai.",
  },
  "First Quarter": {
    humanImpact: "Hari ini dapat terasa lebih aktif dan meminta keputusan yang jelas.",
    practicalAwareness: "Gesekan tidak selalu berarti arahmu salah; kadang ia meminta penyesuaian cara.",
    dailyFocus: "Pilih satu keputusan yang siap dijalankan.",
  },
  "Waxing Gibbous": {
    humanImpact: "Hari ini mendukung penyempurnaan sebelum sesuatu dibawa lebih jauh.",
    practicalAwareness: "Periksa detail tanpa mengubah evaluasi menjadi kritik diri.",
    dailyFocus: "Rapikan satu bagian yang paling menentukan.",
  },
  "Full Moon": {
    humanImpact: "Hari ini dapat memperjelas perasaan, hasil, atau ketegangan yang sebelumnya samar.",
    practicalAwareness: "Gunakan kejernihan yang muncul untuk melihat, bukan untuk bereaksi terburu-buru.",
    dailyFocus: "Akui yang sudah terlihat dan pilih respons yang tenang.",
  },
  "Waning Gibbous": {
    humanImpact: "Hari ini mendukung integrasi pengalaman dan pembagian pelajaran yang sudah matang.",
    practicalAwareness: "Tidak semua pemahaman perlu segera diubah menjadi tindakan baru.",
    dailyFocus: "Simpan satu pelajaran yang ingin dibawa ke depan.",
  },
  "Last Quarter": {
    humanImpact: "Hari ini mendukung evaluasi, penyederhanaan, dan pelepasan cara yang tidak lagi membantu.",
    practicalAwareness: "Perhatikan kebiasaan yang bertahan hanya karena sudah lama dilakukan.",
    dailyFocus: "Hentikan satu pola kecil yang menguras.",
  },
  "Waning Crescent": {
    humanImpact: "Hari ini mendukung penutupan, istirahat, dan persiapan batin sebelum siklus berikutnya.",
    practicalAwareness: "Kapasitas yang menurun bukan kegagalan; tubuh mungkin sedang menyelesaikan sesuatu.",
    dailyFocus: "Kurangi satu tuntutan dan pulihkan tenaga.",
  },
};

export class DashboardAstroRuntimeAdapter {
  public static build(
    currentSky: CurrentSky,
    activations: AstroHouseActivation[],
  ): DashboardAstroRuntime {
    const phase = PHASE_CONTEXT[currentSky.moonInfo.label] ?? {
      humanImpact: "Hari ini membawa perubahan ritme yang layak diamati tanpa dijadikan kepastian.",
      practicalAwareness: "Gunakan kondisi hari ini sebagai konteks, lalu tetap periksa kebutuhan nyata dalam hidupmu.",
      dailyFocus: "Pilih respons yang paling membumi.",
    };
    const activeArea = activations[0]?.lifeArea?.toLowerCase();

    if (!activeArea) return phase;

    return {
      ...phase,
      humanImpact: `${phase.humanImpact} Dampaknya paling mungkin terasa pada ${activeArea}.`,
    };
  }
}
