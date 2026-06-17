"use client";

import React, { useMemo, useState } from "react";
import { TranslatedProfile } from "@/lib/profile/v2/insightTranslator";
import { GrowthProfile } from "@/lib/engines/growthEngine";

type DetailCard = {
  id: string;
  section: "IDENTITAS" | "PETA JIWA" | "POTENSI" | "PERTUMBUHAN";
  title: string;
  headline: string;
  summary: string;
  explanation: string;
  patterns: string[];
  potential: string;
  reflection: string;
  sources: string[];
  talents?: TalentDetail[];
};

type TalentDetail = {
  name: string;
  meaning: string;
  strength: string;
  blindSpot: string;
  development: string;
  sources: string[];
};

interface ProfileTabsProps {
  data: TranslatedProfile;
  growth: GrowthProfile | null;
}

function firstSentence(text: string, fallback: string): string {
  const sentence = text.split(/(?<=[.!?])\s+/)[0]?.trim();
  return sentence || fallback;
}

function createTalentDetails(strengths: string[]): TalentDetail[] {
  const defaults = [
    "Pattern Reader",
    "Grounded Builder",
    "Relational Listener",
    "Meaning Maker",
    "Steady Integrator",
  ];

  return defaults.map((name, index) => {
    const strength = strengths[index] || strengths[index % Math.max(strengths.length, 1)] || "Kemampuan membaca pola diri dan mengubahnya menjadi langkah yang lebih sadar.";
    return {
      name,
      meaning: strength,
      strength: "Membantu kamu mengenali arah yang terasa alami sebelum memaksakan standar dari luar.",
      blindSpot: "Bisa berubah menjadi tekanan jika kamu menuntut bakat ini selalu muncul sempurna.",
      development: "Latih lewat satu tindakan kecil yang konsisten, lalu catat kapan tubuh terasa lebih ringan.",
      sources: ["Talents", "Human Design", "Mercury", "Jupiter"],
    };
  });
}

function buildCards(data: TranslatedProfile, growth: GrowthProfile | null): DetailCard[] {
  const talents = createTalentDetails(data.potentials.strengths);
  const growthStory = growth?.story || "Data pertumbuhan sedang dikumpulkan dari jejak praktik harianmu.";
  return [
    {
      id: "soul-mission",
      section: "IDENTITAS",
      title: "Misi Jiwa",
      headline: "Arah utama yang ingin kamu wujudkan.",
      summary: firstSentence(data.destinyMatrix.soulMission, "Misi jiwamu dibaca dari beberapa lapisan jati dirimu."),
      explanation: data.destinyMatrix.soulMission,
      patterns: ["Arah batin perlu diturunkan menjadi tindakan nyata.", "Makna hidup terasa lebih kuat saat tidak hanya menjadi ide."],
      potential: "Kamu dapat menjadi pribadi yang menghubungkan visi batin dengan kontribusi yang membumi.",
      reflection: "Bagian mana dari hidupmu yang terasa paling meminta arah yang lebih jujur saat ini?",
      sources: ["Jati Diri", "Misi Hidup", "Tujuan Jiwa"],
    },
    {
      id: "main-archetype",
      section: "IDENTITAS",
      title: "Arketipe Utama",
      headline: data.identity.coreEssence,
      summary: firstSentence(data.identity.description, "Arketipe utama menunjukkan cara alami energimu bekerja."),
      explanation: data.identity.description,
      patterns: ["Energi utama muncul dari kombinasi bawaan dan desain tubuh.", "Saat selaras, arah hidup terasa lebih sederhana dan tidak terlalu dipaksakan."],
      potential: "Arketipe ini bisa menjadi kompas untuk memilih cara bergerak yang paling manusiawi bagi dirimu.",
      reflection: "Kapan kamu merasa paling menjadi dirimu sendiri tanpa harus menjelaskan banyak hal?",
      sources: ["Pola Bawaan", "Desain Diri", "Binar Jiwa"],
    },
    {
      id: "soul-light",
      section: "IDENTITAS",
      title: "Cahaya Jiwa",
      headline: "Kualitas terang yang bisa kamu pancarkan saat selaras.",
      summary: firstSentence(data.potentials.lightManifestation, "Cahaya jiwamu muncul saat energi dan pilihan berjalan searah."),
      explanation: data.potentials.lightManifestation,
      patterns: ["Kekuatan sering muncul lewat kehadiran yang tenang.", "Dampak terbaik tidak selalu datang dari usaha yang paling keras."],
      potential: "Saat dilatih dengan sadar, kualitas ini bisa menjadi cara kamu membantu diri sendiri dan sekitar.",
      reflection: "Apa satu kualitas terang yang ingin kamu hidupi hari ini tanpa memaksanya terlihat besar?",
      sources: ["Kualitas Batin", "Pancaran Diri", "Kekuatan Jiwa"],
    },
    {
      id: "soul-shadow",
      section: "IDENTITAS",
      title: "Bayangan Jiwa",
      headline: "Sisi yang perlu dilihat tanpa dihakimi.",
      summary: firstSentence(data.soulMap.whyPatterns, "Bayangan jiwa menunjukkan pola perlindungan lama."),
      explanation: data.soulMap.whyPatterns,
      patterns: ["Bayangan sering muncul saat kamu ingin merasa aman.", "Pola ini melembut saat dikenali lebih awal."],
      potential: "Tantangannya adalah tidak mengubah perlindungan lama menjadi identitas tetap.",
      reflection: "Apa pola lama yang mulai bisa kamu lihat dengan lebih lembut?",
      sources: ["Pola Perlindungan", "Tepi Batin", "Ruang Belajar"],
    },
    {
      id: "ancestor-karma",
      section: "PETA JIWA",
      title: "Karma Leluhur",
      headline: "Pola keluarga yang bisa dihormati tanpa selalu diteruskan.",
      summary: firstSentence(data.destinyMatrix.ancestorKarma, "Karma leluhur membaca garis ayah, ibu, dan pola warisan batin."),
      explanation: data.destinyMatrix.ancestorKarma,
      patterns: ["Ada warisan yang menguatkan.", "Ada respons lama yang tidak harus diteruskan."],
      potential: "Hadiah leluhur bisa menjadi ketahanan, kedewasaan, dan rasa tanggung jawab yang lebih sadar.",
      reflection: "Pola keluarga mana yang ingin kamu hormati tanpa harus kamu ulangi?",
      sources: ["Garis Ayah", "Garis Ibu", "Warisan Batin"],
    },
    {
      id: "repeating-patterns",
      section: "PETA JIWA",
      title: "Pola Berulang",
      headline: "Tema yang sering kembali sampai diberi respons baru.",
      summary: firstSentence(data.destinyMatrix.repeatingPatterns, "Pola berulang bukan hukuman, melainkan tempat latihan respons baru."),
      explanation: data.destinyMatrix.repeatingPatterns,
      patterns: ["Respons lama biasanya muncul saat tubuh merasa terdesak.", "Kesadaran kecil bisa memutus pengulangan yang besar."],
      potential: "Kamu bisa mengubah pola ini dengan memilih jeda sebelum bereaksi.",
      reflection: "Situasi apa yang terasa berulang, dan respons apa yang ingin kamu coba berbeda?",
      sources: ["Pengulangan Diri", "Tepi Batin", "Pola Lama"],
    },
    {
      id: "core-wound",
      section: "PETA JIWA",
      title: "Luka Inti",
      headline: "Bagian yang paling sering meminta perlindungan.",
      summary: firstSentence(data.soulMap.innerChildNeeds, "Luka inti menunjukkan kebutuhan emosional yang ingin dilihat."),
      explanation: data.soulMap.innerChildNeeds,
      patterns: ["Luka sering muncul sebagai kebutuhan untuk diterima.", "Bagian ini tidak perlu dipaksa cepat pulih."],
      potential: "Saat dirawat, luka inti bisa menjadi pintu empati dan kedewasaan emosional.",
      reflection: "Apa kebutuhan batin yang paling sering kamu tunda karena ingin tetap terlihat kuat?",
      sources: ["Kebutuhan Batin", "Ruang Sayang", "Pola Emosi"],
    },
    {
      id: "inner-child",
      section: "PETA JIWA",
      title: "Inner Child",
      headline: "Kebutuhan emosional yang ingin merasa aman.",
      summary: firstSentence(data.destinyMatrix.innerChild, "Inner Child membaca binar diri, garis keluarga, and kebutuhan batin."),
      explanation: data.destinyMatrix.innerChild,
      patterns: ["Bagian kecil dalam diri butuh rasa aman sebelum diminta dewasa.", "Ketenangan tubuh sering menjadi awal pemulihan."],
      potential: "Praktik batin ringan dapat membantu bagian ini merasa ditemani tanpa dipaksa berubah.",
      reflection: "Apa cara paling sederhana untuk menenangkan dirimu hari ini?",
      sources: ["Diri Kecil", "Rasa Aman", "Kelembutan Diri"],
    },
    {
      id: "talent-dna",
      section: "POTENSI",
      title: "Potensi Bawaan",
      headline: "5 bakat dominan yang muncul dari pola dirimu.",
      summary: "5 bakat dominan yang muncul dari pola dirimu.",
      explanation: data.destinyMatrix.greatestPotential,
      patterns: talents.map((talent) => talent.name),
      potential: "Bakat ini akan terasa paling hidup saat dikembangkan lewat ritme yang realistis.",
      reflection: "Bakat mana yang ingin kamu latih lewat langkah kecil minggu ini?",
      sources: ["Bakat Alami", "Kekuatan Diri", "Binar Jiwa"],
      talents,
    },
    {
      id: "career-potential",
      section: "POTENSI",
      title: "Potensi Karya",
      headline: "Arah karya yang paling selaras dengan pola energimu.",
      summary: firstSentence(data.destinyMatrix.moneyAndWork, "Arah karya dibaca dari pola keberlimpahan, binar diri, dan tindakan nyata."),
      explanation: data.destinyMatrix.moneyAndWork,
      patterns: ["Cocok untuk peran yang memberi ruang membangun dan mengarahkan energi.", "Lingkungan kerja perlu mendukung fokus, ritme, dan batas yang sehat."],
      potential: "Arah karya dominanmu mengarah pada karya yang menggabungkan ketekunan, makna, dan kontribusi nyata.",
      reflection: "Lingkungan kerja seperti apa yang membuat energimu terasa paling bersih?",
      sources: ["Aliran Rezeki", "Arah Karya", "Daya Aksi"],
    },
    {
      id: "spiritual-archetype",
      section: "POTENSI",
      title: "Binar Batin",
      headline: "Kecenderungan binar batin dan energi jiwamu.",
      summary: "Kamu memiliki kualitas batin yang dapat muncul sebagai pembimbing, penyembuh, pembangun, atau penjaga jika dilatih dengan sadar.",
      explanation: data.potentials.soulMission,
      patterns: ["Potensi batin perlu tetap membumi.", "Kualitas ini bukan label mutlak, tetapi kecenderungan energi yang bisa dilatih."],
      potential: "Jika dirawat dengan kesadaran, potensi ini bisa muncul sebagai kemampuan menenangkan, mengajar, membangun, atau menerjemahkan makna.",
      reflection: "Kualitas batin apa yang ingin kamu latih tanpa menjadikannya tuntutan baru?",
      sources: ["Kualitas Batin", "Pola Jiwa", "Binar Diri"],
    },
    {
      id: "relationship-style",
      section: "POTENSI",
      title: "Gaya Relasi",
      headline: "Cara hati membangun kedekatan dan menjaga batas.",
      summary: firstSentence(data.destinyMatrix.loveAndRelationships, "Gaya relasi membaca pola cinta, kelembutan batin, dan desain diri."),
      explanation: data.destinyMatrix.loveAndRelationships,
      patterns: ["Kedekatan sehat membutuhkan kejujuran dan batas.", "Hati perlu merasa aman sebelum terbuka lebih dalam."],
      potential: "Relasi bisa menjadi tempat bertumbuh saat kamu tidak meninggalkan kebutuhan dirimu sendiri.",
      reflection: "Di relasi mana kamu ingin lebih jujur sekaligus tetap lembut?",
      sources: ["Pola Cinta", "Kelembutan Hati", "Desain Relasi"],
    },
    {
      id: "growth-stage",
      section: "PERTUMBUHAN",
      title: "Tahap Pertumbuhan",
      headline: growth?.currentMilestone || "Tahap pertumbuhan sedang dibaca.",
      summary: firstSentence(growthStory, "Tahap pertumbuhan dibaca dari jejak praktik terbaru."),
      explanation: growthStory,
      patterns: ["Pertumbuhan tidak dinilai dari sempurna atau tidak.", "Jejak kecil yang berulang tetap dihitung sebagai arah."],
      potential: "Tahap ini membantu kamu melihat proses tanpa mengubahnya menjadi scoreboard.",
      reflection: "Apa satu tanda kecil bahwa kamu sudah tidak berada di titik yang sama seperti dulu?",
      sources: ["Journey History", "Daily State", "Innerwork"],
    },
    {
      id: "development-area",
      section: "PERTUMBUHAN",
      title: "Area Pengembangan",
      headline: "Area yang sedang paling siap dilatih.",
      summary: `Sinyal pertumbuhan terkuat saat ini berkaitan dengan kesadaran dirimu.`,
      explanation: growth ? `Skor pertumbuhanmu: kesadaran ${growth.signals.awareness}, konsistensi ${growth.signals.consistency}, kedalaman ${growth.signals.depth}, keseimbangan ${growth.signals.balance}, keberanian ${growth.signals.courage}, penerimaan ${growth.signals.acceptance}.` : "Data pengembangan akan semakin presisi setelah lebih banyak aktivitas harian tercatat.",
      patterns: ["Area kuat bisa menjadi pijakan.", "Area rendah tidak berarti gagal, hanya butuh dukungan yang lebih sederhana."],
      potential: "Dengan ritme kecil, area ini bisa menjadi bukti bahwa perubahan tidak harus dramatis.",
      reflection: "Area mana yang ingin kamu rawat tanpa menekan dirimu?",
      sources: ["Jejak Langkah", "Cek-in Harian", "Pola Diri"],
    },
    {
      id: "current-focus",
      section: "PERTUMBUHAN",
      title: "Fokus Saat Ini",
      headline: "Satu arah kecil untuk dibawa hari ini.",
      summary: "Fokus terbaik saat ini adalah memilih langkah yang cukup kecil untuk benar-benar dilakukan.",
      explanation: data.soulMap.healingPath,
      patterns: ["Fokus yang terlalu besar mudah berubah menjadi tekanan.", "Fokus kecil memberi tubuh pengalaman berhasil."],
      potential: "Jika dijaga, fokus ini bisa menjadi jembatan dari insight menuju kebiasaan baru.",
      reflection: "Apa satu langkah yang cukup kecil, jujur, dan bisa kamu lakukan hari ini?",
      sources: ["Journey History", "Healing Path", "Daily Practice"],
    },
  ];
}

function CardDetail({ card }: { card: DetailCard }) {
  const [selectedTalent, setSelectedTalent] = useState<TalentDetail | null>(card.talents?.[0] ?? null);

  return (
    <section className="bhumi-card p-6 bg-white border-none shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9AA394]">{card.section}</p>
      <h3 className="mt-2 text-2xl font-serif font-semibold text-[#4F5E52]">{card.title}</h3>
      <p className="mt-2 text-base font-semibold text-[#3C3C3C]">{card.headline}</p>
      <p className="mt-5 text-sm leading-7 text-[#4F5E52]">{card.explanation}</p>

      {card.talents && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9AA394]">Talent DNA</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {card.talents.map((talent) => (
              <button
                key={talent.name}
                type="button"
                onClick={() => setSelectedTalent(talent)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                  selectedTalent?.name === talent.name
                    ? "border-[#4F5E52] bg-[#4F5E52] text-white"
                    : "border-[#E8E9E5] bg-[#FCFAF5] text-[#4F5E52]"
                }`}
              >
                {talent.name}
              </button>
            ))}
          </div>
          {selectedTalent && (
            <div className="mt-4 rounded-2xl border border-[#E8E9E5] bg-[#FCFAF5] p-4">
              <h4 className="font-bold text-[#4F5E52]">{selectedTalent.name}</h4>
              <div className="mt-3 grid gap-3 text-sm text-[#4F5E52]">
                <p><span className="font-semibold">Makna:</span> {selectedTalent.meaning}</p>
                <p><span className="font-semibold">Kekuatan:</span> {selectedTalent.strength}</p>
                <p><span className="font-semibold">Blind spot:</span> {selectedTalent.blindSpot}</p>
                <p><span className="font-semibold">Cara mengembangkan:</span> {selectedTalent.development}</p>
                <p><span className="font-semibold">Source blueprint:</span> {selectedTalent.sources.slice(0, 4).join(", ")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9AA394]">Pola yang terlihat</p>
          <ul className="mt-3 space-y-2 text-sm text-[#4F5E52]">
            {card.patterns.slice(0, 4).map((pattern) => (
              <li key={pattern}>{pattern}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9AA394]">Potensi / tantangan</p>
          <p className="mt-3 text-sm leading-6 text-[#4F5E52]">{card.potential}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#E8E9E5] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9AA394]">Saran refleksi</p>
        <p className="mt-3 text-sm leading-6 text-[#4F5E52]">{card.reflection}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {card.sources.slice(0, 6).map((source) => (
          <span key={source} className="rounded-full bg-[#E8E9E5]/60 px-3 py-2 text-xs font-semibold text-[#4F5E52]">
            {source}
          </span>
        ))}
      </div>
    </section>
  );
}

export function ProfileTabs({ data, growth }: ProfileTabsProps) {
  const cards = useMemo(() => buildCards(data, growth), [data, growth]);
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? "");
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];
  const sections = Array.from(new Set(cards.map((card) => card.section)));

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section} className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9AA394]">{section}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {cards.filter((card) => card.section === section).map((card) => {
              const active = selectedCard?.id === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedCardId(card.id)}
                  className={`group min-h-[172px] rounded-2xl border bg-white p-5 text-left shadow-sm transition-all ${
                    active
                      ? "border-[#4F5E52] ring-1 ring-[#4F5E52]/20"
                      : "border-transparent hover:border-[#DDE7DB]"
                  }`}
                >
                  <div className="flex h-full flex-col">
                    <p className="text-lg font-serif font-semibold text-[#4F5E52]">{card.title}</p>
                    <p className="mt-2 text-sm font-semibold text-[#3C3C3C]">{card.headline}</p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#7B8776]">{card.summary}</p>
                    <p className="mt-auto pt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#9AA394] group-hover:text-[#4F5E52]">
                      Lihat Detail
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {selectedCard && <CardDetail card={selectedCard} />}
    </div>
  );
}
