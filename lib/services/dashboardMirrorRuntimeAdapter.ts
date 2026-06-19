import type { HumanMeaning } from "@/lib/types/humanMeaning";
import type { AstroAwarenessContext } from "@/lib/engines/astroAwarenessEngine";

export type DashboardDailyNoteCategory = {
  insight: string;
  reason: string;
  reflection: string;
  advice: string;
};

export type DashboardDailyNoteCategories = {
  general: DashboardDailyNoteCategory;
  mental: DashboardDailyNoteCategory;
  finance: DashboardDailyNoteCategory;
  love: DashboardDailyNoteCategory;
  relational: DashboardDailyNoteCategory;
  spiritual: DashboardDailyNoteCategory;
  challenges: DashboardDailyNoteCategory;
  opportunities: DashboardDailyNoteCategory;
  advice: DashboardDailyNoteCategory;
};

export class DashboardMirrorRuntimeAdapter {
  public static buildReflection(
    meaning: HumanMeaning,
    userName: string,
    dateKey: string,
    awareness?: AstroAwarenessContext,
  ): string {
    const day = new Date(dateKey + "T12:00:00").getDay();
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayName = dayNames[day];
    const firstName = userName.split(" ")[0] || "Jiwa";
    const dayReflections = [
      "Minggu membawa suasana penutup yang lembut. Ada ruang untuk melihat kembali apa yang telah dilalui, tanpa harus menilai semuanya sebagai berhasil atau gagal.",
      "Senin membuka halaman baru. Mungkin ada banyak arah yang memanggil, tetapi tidak semuanya perlu segera diberi jawaban.",
      "Selasa mengajakmu menjaga ritme yang sudah mulai terbentuk. Yang terasa pelan belum tentu tertinggal; bisa jadi dirimu sedang menemukan langkah yang lebih jujur.",
      "Rabu berada di tengah perjalanan pekan. Dari sini, proses yang semula samar sering mulai memperlihatkan pelajaran kecilnya.",
      "Kamis memberi ruang untuk memandang pengalaman dari sisi yang lebih luas. Sesuatu yang kemarin terasa membingungkan mungkin perlahan menemukan maknanya.",
      "Jumat membawa suasana menoleh ke belakang dengan lebih hangat. Ada hal-hal kecil yang patut dihargai, termasuk bagian dirimu yang tetap bertahan dan bertumbuh.",
      "Sabtu terasa lebih lapang dan personal. Di sela jeda, bagian dirimu yang biasanya tenggelam dalam kesibukan mungkin terdengar sedikit lebih jelas.",
    ];
    const identityReflection = this.humanize(meaning.identity.medium);
    const awarenessTouch = awareness?.activeAwarenessEvents.length
      ? "Beberapa ritme di sekelilingmu sedang bergerak menuju perubahan. Tidak perlu terburu-buru memahami semuanya sekaligus."
      : "";

    return [
      `Hai ${firstName}, bagaimana keadaanmu di hari ${dayName} ini?`,
      dayReflections[day],
      identityReflection,
      awarenessTouch,
      "Peluk hangat dari Bhumi untukmu.",
      "Yuk kita lanjutkan perjalanan mengenal diri, satu langkah kecil pada satu waktu.",
    ].filter(Boolean).join("\n\n");
  }

  private static humanize(value: string): string {
    const clean = value
      .replace(/blueprint|profil|arcana|human design|zodiak|cakra|gate|channel|house/gi, "pola dirimu")
      .replace(/\b\d+\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const softened = clean
      .replace(/^Kamu adalah/i, "Ada sisi dalam dirimu yang terasa")
      .replace(/^Kamu memiliki/i, "Ada bagian dalam dirimu yang membawa")
      .replace(/^Kamu dirancang untuk/i, "Dirimu mungkin paling nyaman ketika")
      .replace(/^Misimu adalah/i, "Ada arah dalam dirimu yang perlahan mengajakmu untuk");

    if (!softened) {
      return "Ada bagian dalam dirimu yang mungkin sedang meminta untuk dilihat dengan lebih lembut. Ia tidak membutuhkan penjelasan besar, hanya ruang untuk hadir apa adanya.";
    }

    const words = softened.split(" ");
    return words.length <= 42 ? softened : `${words.slice(0, 42).join(" ").replace(/[,:;]$/, "")}.`;
  }

  public static buildDailyNoteCategories(meaning: HumanMeaning): DashboardDailyNoteCategories {
    return {
      general: this.category(meaning.timing.currentState, meaning.timing.dailyFocus),
      mental: this.category(meaning.energy.authority, meaning.energy.strategy),
      finance: this.category(meaning.talents.wealthFlow, meaning.talents.workStyle),
      love: this.category(meaning.relationships.attraction, meaning.relationships.loveLanguage),
      relational: this.category(meaning.relationships.pattern, meaning.relationships.boundaries),
      spiritual: this.category(meaning.spirituality.path, meaning.spirituality.evolution),
      challenges: this.category(meaning.shadow.sabotage, meaning.shadow.triggers),
      opportunities: this.category(meaning.talents.potential, meaning.purpose),
      advice: this.category(meaning.timing.dailyFocus, meaning.timing.growthArea),
    };
  }

  private static category(
    primary: HumanMeaning["purpose"],
    practical: HumanMeaning["purpose"],
  ): DashboardDailyNoteCategory {
    return {
      insight: primary.short,
      reason: primary.medium,
      reflection: primary.long,
      advice: practical.long,
    };
  }
}
