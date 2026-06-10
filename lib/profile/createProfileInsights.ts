type UnknownRecord = Record<string, unknown>;

export type ProfileInsights = {
  ancestorKarma: string;
  repeatingPatterns: {
    patterns: string[];
    question: string;
  };
  innerWounds: {
    paragraph: string;
    themes: string[];
  };
  soulFragmentMap: Array<{
    part: string;
    need: string;
    practice: string;
  }>;
  shadowIntegrationMap: {
    shadowPattern: string;
    growthInvitation: string;
    dailyPractice: string;
  };
};

const LIFE_PATH_PATTERNS: Record<number, string[]> = {
  1: ["terlalu cepat merasa harus memimpin sendiri", "sulit meminta dukungan", "menunda kelembutan karena ingin terlihat kuat"],
  2: ["mudah menyerap suasana orang lain", "menghindari konflik agar relasi tetap aman", "menunggu validasi sebelum memilih"],
  3: ["menahan ekspresi karena takut dinilai", "membuat ringan hal yang sebenarnya penting", "mudah kehilangan fokus saat terlalu banyak ide"],
  4: ["mengambil terlalu banyak tanggung jawab", "menunda kebutuhan diri", "merasa harus membuktikan nilai diri melalui hasil"],
  5: ["gelisah saat hidup terasa terlalu sempit", "sulit bertahan pada satu ritme", "mencari perubahan sebelum tubuhmu siap"],
  6: ["merasa harus menjaga semua orang", "sulit menerima bantuan", "mengukur cinta dari seberapa banyak kamu memberi"],
  7: ["menarik diri saat butuh dipahami", "menganalisis perasaan terlalu lama", "sulit percaya pada jawaban sederhana"],
  8: ["menegang saat membahas uang atau kuasa", "merasa harus kuat dan berhasil", "sulit melepas kontrol atas hasil"],
  9: ["membawa beban emosional banyak orang", "sulit menutup siklus", "menunda kebutuhan pribadi demi kebaikan bersama"],
  11: ["terlalu peka pada tanda dan suasana", "mudah lelah oleh intensitas batin", "ragu membagikan intuisi"],
  22: ["membawa visi besar sampai tubuh terasa berat", "takut gagal pada sesuatu yang penting", "menunda langkah kecil karena menunggu sempurna"],
  33: ["ingin menyembuhkan semua orang", "sulit membedakan kasih dan pengorbanan", "merasa harus selalu bijak"],
};

const ARCANA_SHADOWS: Record<number, { shadow: string; growth: string; practice: string }> = {
  4: {
    shadow: "terlalu mengontrol struktur agar terasa aman",
    growth: "belajar membangun tanpa kehilangan kelembutan",
    practice: "setiap hari pilih satu hal kecil yang bisa dirapikan tanpa memaksa semuanya selesai.",
  },
  8: {
    shadow: "menahan emosi agar terlihat kuat dan bertanggung jawab",
    growth: "memegang kekuatan tanpa menegangkan tubuhmu",
    practice: "sebelum mengambil keputusan besar, letakkan tangan di dada dan perut selama lima napas.",
  },
  13: {
    shadow: "takut melepas identitas lama meski sudah tidak selaras",
    growth: "mengizinkan akhir kecil menjadi ruang bagi bentuk baru",
    practice: "tulis satu hal yang boleh selesai hari ini, lalu lakukan satu tindakan penutup yang lembut.",
  },
  15: {
    shadow: "terikat pada pola yang memberi rasa aman sementara",
    growth: "melihat keinginan dan ketakutan tanpa menghakimi dirimu",
    practice: "saat dorongan lama muncul, beri jeda satu menit sebelum merespons.",
  },
  16: {
    shadow: "bertahan pada struktur yang sebenarnya membuat tubuhmu tegang",
    growth: "membangun ulang dari kejujuran, bukan dari tekanan",
    practice: "pilih satu ekspektasi yang bisa dilonggarkan hari ini.",
  },
  18: {
    shadow: "membiarkan ketidakjelasan membuatmu meragukan intuisi",
    growth: "membedakan rasa takut dan suara batin yang tenang",
    practice: "catat tiga fakta dan satu perasaan sebelum menyimpulkan sesuatu.",
  },
};

const HD_PARTS: Record<string, string[]> = {
  Generator: ["Bagian yang ingin merespons dengan jujur", "Bagian yang lelah berkata iya", "Bagian yang butuh ritme tubuh"],
  "Manifesting Generator": ["Bagian yang ingin mencoba banyak pintu", "Bagian yang takut dianggap tidak konsisten", "Bagian yang butuh izin bergerak cepat lalu mengevaluasi"],
  Projector: ["Bagian yang ingin diakui", "Bagian yang takut tidak terlihat", "Bagian yang butuh istirahat sebelum membimbing"],
  Manifestor: ["Bagian yang ingin bebas bergerak", "Bagian yang takut ditahan", "Bagian yang butuh memberi tahu tanpa menjelaskan berlebihan"],
  Reflector: ["Bagian yang menyerap lingkungan", "Bagian yang butuh waktu", "Bagian yang mencari ruang yang terasa benar"],
};

function getRecordValue(record: UnknownRecord | null | undefined, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);
}

function getString(record: UnknownRecord | null | undefined, path: string[]): string | null {
  const value = getRecordValue(record, path);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(record: UnknownRecord | null | undefined, path: string[]): number | null {
  const value = getRecordValue(record, path);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function createProfileInsights({
  profile,
  blueprint,
}: {
  profile?: UnknownRecord | null;
  blueprint?: UnknownRecord | null;
}): ProfileInsights {
  const lifePath = getNumber(blueprint, ["lifePath", "number"]) ?? getNumber(blueprint, ["numerology", "number"]);
  const arcanaCenter = getNumber(blueprint, ["arcanaCenter", "number"])
    ?? getNumber(blueprint, ["destinyMatrix", "center"])
    ?? getNumber(blueprint, ["destinyMatrix", "arcanaCenter"]);
  const humanDesignType = getString(blueprint, ["humanDesign", "type"]);
  const sunSign = getString(blueprint, ["sunSign", "sign"])
    ?? getString(blueprint, ["natalChart", "sunSign"])
    ?? getString(blueprint, ["astrology", "sunSign"]);
  const name = getString(profile, ["fullName"]) || "dirimu";
  const patterns = LIFE_PATH_PATTERNS[lifePath ?? 0] ?? [
    "mengabaikan sinyal tubuh saat hidup terasa sibuk",
    "menunggu validasi sebelum mempercayai pilihanmu",
    "membawa beban yang sebenarnya bisa dibagi",
  ];
  const arcanaMap = ARCANA_SHADOWS[arcanaCenter ?? 0] ?? {
    shadow: "menjauh dari kebutuhan diri saat ingin menjaga semuanya tetap baik",
    growth: "memilih kejujuran kecil tanpa membuat dirimu merasa salah",
    practice: "ambil satu jeda sadar sebelum menjawab permintaan orang lain.",
  };
  const parts = HD_PARTS[humanDesignType ?? ""] ?? [
    "Bagian yang ingin merasa aman",
    "Bagian yang ingin diakui",
    "Bagian yang takut mengecewakan",
  ];
  const woundThemes = lifePath === 8
    ? ["takut gagal", "merasa harus selalu kuat", "sulit menerima bantuan"]
    : lifePath === 2 || sunSign === "Libra"
      ? ["takut ditinggalkan", "menunda kebutuhan diri", "takut mengecewakan"]
      : arcanaCenter && [13, 15, 16, 18].includes(arcanaCenter)
        ? ["takut berubah", "merasa tidak cukup aman", "sulit mempercayai proses"]
        : ["merasa tidak cukup", "sulit menerima bantuan", "takut gagal"];

  return {
    ancestorKarma: `Karma leluhur di sini tidak dibaca sebagai hukuman, melainkan pola yang mungkin diwariskan melalui cara keluarga memandang tanggung jawab, cinta, uang, atau rasa aman. Pada perjalanan ${name}, bagian terpentingnya adalah belajar memilih respons yang lebih sadar daripada sekadar mengulang pola lama.\n\nHal ini bisa terasa melalui cara kamu mencari rasa aman, mengatur kedekatan, dan memegang tanggung jawab. Perubahan tidak harus keras; ia bisa dimulai dari mendengar tubuhmu dengan lebih jujur, lalu memilih satu tindakan kecil yang terasa lebih sehat dari biasanya.`,
    repeatingPatterns: {
      patterns: patterns.slice(0, 3),
      question: "Pola mana yang paling sering muncul saat kamu merasa harus aman, diterima, atau berhasil?",
    },
    innerWounds: {
      paragraph: `Kemungkinan luka batin yang bisa diperhatikan bukanlah diagnosis, melainkan petunjuk lembut tentang bagian dalam dirimu yang mungkin belajar bertahan terlalu lama. Jika pola ini muncul, dekati dengan rasa ingin tahu, bukan menyalahkan diri.`,
      themes: woundThemes,
    },
    soulFragmentMap: parts.slice(0, 3).map((part, index) => ({
      part,
      need: index === 0 ? "mungkin membutuhkan pengakuan yang tenang" : index === 1 ? "mungkin membutuhkan batas yang terasa aman" : "mungkin membutuhkan izin untuk tidak sempurna",
      practice: index === 0 ? "tulis satu kalimat validasi untuk dirimu hari ini." : index === 1 ? "tarik napas panjang sebelum berkata iya." : "pilih satu tugas kecil yang cukup, bukan sempurna.",
    })),
    shadowIntegrationMap: {
      shadowPattern: arcanaMap.shadow,
      growthInvitation: arcanaMap.growth,
      dailyPractice: arcanaMap.practice,
    },
  };
}
