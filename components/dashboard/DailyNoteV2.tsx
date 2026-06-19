"use client";

import React from "react";
import { Compass, Brain, Wallet, Heart, Users, Sparkles, ShieldAlert, Sprout } from "lucide-react";
import type { DailyGuidance, DailyGuidanceCategory } from "@/lib/dailyGuidance/types";
import type { DailyState } from "@/lib/repositories/dailyStateRepository";
import type { HumanMeaning } from "@/lib/types/humanMeaning";
import type { NavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import { cleanMarkdown } from "@/lib/utils/markdown";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { useAuth } from "@/context/AuthContext";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";

interface DailyNoteV2Props {
  dailyGuidance: DailyGuidance | null;
  focus?: string;
  language: "id" | "en";
  userName: string;
  dailyState: DailyState | null;
  yesterdayState: DailyState | null;
  recentDailyStates: DailyState[];
  navigatorState: NavigatorState | null;
  meaning: HumanMeaning | null;
}

type LetterSection = {
  key: keyof NonNullable<DailyGuidance["categories"]>;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type CurrentIssue = {
  key: "over_responsibility" | "emotional_fatigue" | "lack_of_clarity" | "fear_of_disappointing" | "difficulty_resting" | "need_for_boundaries" | "achievement_worth" | "relationship_uncertainty" | "direction_confusion" | "overthinking" | "disconnection";
  title: string;
  summary: string;
  mental: string;
  resources: string;
  intimacy: string;
  connection: string;
  lesson: string;
  derailment: string;
  opportunity: string;
};

const SECTIONS: LetterSection[] = [
  { key: "general", title: "Kabar Harimu", icon: Compass },
  { key: "mental", title: "Pikiran", icon: Brain },
  { key: "finance", title: "Rasa Aman & Rezeki", icon: Wallet },
  { key: "love", title: "Hati", icon: Heart },
  { key: "relational", title: "Orang Terdekat", icon: Users },
  { key: "spiritual", title: "Makna Batin", icon: Sparkles },
  { key: "challenges", title: "Yang Lagi Berat", icon: ShieldAlert },
  { key: "opportunities", title: "Ruang Baru", icon: Sprout },
];

export function DailyNoteV2({
  dailyGuidance,
  focus,
  language,
  userName,
  dailyState,
  yesterdayState,
  recentDailyStates,
  navigatorState,
  meaning,
}: DailyNoteV2Props) {
  const auth = useAuth();
  const firstName = userName.split(" ")[0] || "Jiwa";

  React.useEffect(() => {
    if (dailyGuidance) trackEvent("open_daily_note", auth?.user?.uid);
  }, [dailyGuidance, auth?.user?.uid]);

  if (!dailyGuidance?.categories) {
    return (
      <section className="mt-8 space-y-4">
        <h3 className="px-1 text-2xl font-serif font-bold text-[#4F6658]">Catatan dari Bhumi untuk Kamu</h3>
        <div className="bhumi-card border border-[#E8E9E5]/50 bg-[#FCFAF5] p-8 text-center text-sm italic text-[#7B8776]">
          {language === "id" ? "Catatanmu sedang dirapikan sebentar..." : "Your letter is being written..."}
        </div>
      </section>
    );
  }

  const categories = dailyGuidance.categories;
  const currentIssue = deriveCurrentIssue(dailyState, navigatorState, meaning);
  const stateContext = currentIssue.summary;
  const hasHistory = Boolean(yesterdayState || recentDailyStates.length > 0);
  const yesterdayContext = buildYesterdayContext(yesterdayState);
  const journeyContext = hasHistory ? buildJourneyContext(dailyGuidance, recentDailyStates) : "";
  const dayContext = buildDayContext(dailyGuidance.localDateKey || dailyGuidance.date);
  const approachingContext = focus
    ? "Ada perubahan ritme yang mulai terasa mendekat. Pelan-pelan saja ya meresponnya."
    : "Ritme hari ini terasa cukup jelas, jalani saja sesuai apa yang ada di depan mata.";
  const usedSentences = new Set<string>();

  const markRead = () => {
    if (!auth?.user?.uid) return;
    const dateKey = dailyGuidance.localDateKey || dailyGuidance.date || new Date().toISOString().slice(0, 10);
    void dailyStateRepository.saveDailyState(auth.user.uid, dateKey, { dailyNoteDone: true });
  };

  return (
    <section className="mt-10 space-y-4">
      <div className="px-1">
        <h3 className="font-serif text-2xl font-bold text-[#4F6658]">Catatan dari Bhumi untuk Kamu</h3>
      </div>

      <article
        onMouseEnter={markRead}
        className="bhumi-card max-h-[72vh] overflow-y-auto border-none bg-white p-7 shadow-sm sm:p-8"
      >
        <div className="space-y-9">
          <header className="space-y-4 border-b border-[#F1EEE7] pb-7">
            <p className="font-serif text-xl font-bold text-[#4F6658]">Hai {firstName},</p>
            <p className="text-sm leading-7 text-[#526053]">
              Hari ini ada beberapa hal yang ingin Bhumi ceritakan padamu. Nggak perlu buru-buru menyelesaikannya kok.
              Anggap saja tulisan ini sebagai teman duduk yang menemanimu melihat apa yang sedang bergerak hari ini.
            </p>
          </header>

          {SECTIONS.map(({ key, title, icon: Icon }) => {
            const category = categories[key];
            const sourceContext = buildSectionContext({
              key,
              yesterdayContext,
              stateContext,
              journeyContext,
              approachingContext,
              dayContext,
              dailyState,
              meaning,
              currentIssue,
              hasHistory,
            });
            const body = synthesizeSection(category, sourceContext, key, usedSentences);

            return (
              <section key={key} className="space-y-4">
                <div className="flex items-center gap-3 text-[#4F6658]">
                  <span className="rounded-2xl bg-[#FCFAF5] p-2.5"><Icon size={19} /></span>
                  <h4 className="font-serif text-lg font-bold">{title}</h4>
                </div>
                <p className="text-sm leading-7 text-[#3C3C3C]">{body.main}</p>
                <div className="rounded-2xl bg-[#F5F1E8]/55 p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B8776]">Saran dari Bhumi</p>
                  <p className="text-sm leading-6 text-[#526053]">{body.advice}</p>
                </div>
              </section>
            );
          })}

          <section className="space-y-4 border-t border-[#F1EEE7] pt-8">
            <div className="flex items-center gap-3 text-[#4F6658]">
              <Sprout size={20} />
              <h4 className="font-serif text-lg font-bold">Pesan Penutup buat Kamu</h4>
            </div>
            <p className="text-sm leading-7 text-[#3C3C3C]">
              {dedupeText(
                buildClosing(currentIssue, hasHistory ? yesterdayContext : "", stateContext, journeyContext, approachingContext, meaning),
                usedSentences,
              )}
            </p>
          </section>
        </div>
      </article>
    </section>
  );
}

function synthesizeSection(
  category: DailyGuidanceCategory,
  sourceContext: { main: string; advice: string },
  key: LetterSection["key"],
  usedSentences: Set<string>,
) {
  const categoryMainRaw = key === "general" || key === "spiritual"
    ? [category.insight, category.reason, category.reflection].join(" ")
    : stripAstroSentences([category.insight, category.reason, category.reflection].join(" "));
  const categoryMain = stripVisibleSourceLanguage(categoryMainRaw);
  const categoryAdviceRaw = key === "general" || key === "spiritual"
    ? category.advice
    : stripAstroSentences(category.advice);
  const categoryAdvice = stripVisibleSourceLanguage(categoryAdviceRaw);
  const mainSource = [sourceContext.main, categoryMain, sectionBridge(key)]
    .filter(Boolean)
    .join(" ");
  return {
    main: dedupeText(limitCompleteSentences(humanizeCompanionLanguage(translateProfileLanguage(cleanMarkdown(mainSource))), 75), usedSentences),
    advice: dedupeText(limitCompleteSentences(humanizeCompanionLanguage(cleanMarkdown(`${sourceContext.advice} ${categoryAdvice}`)), 38), usedSentences),
  };
}

function sectionBridge(key: LetterSection["key"]): string {
  return {
    general: "Catatan ini bukan buat menilai harimu ya, tapi cuma buat melihat mana yang paling butuh perhatian.",
    mental: "Pikiran yang tenang nggak berarti semuanya harus hilang; kadang cukup dengan tahu mana yang perlu didengar duluan.",
    finance: "Bagian ini bukan ramalan. Ini adalah ruang untuk memperhatikan sikapmu terhadap rasa aman dan sumber daya yang tersedia.",
    love: "Kedekatan hari ini mulai dari gimana kamu memperlakukan dirimu sendiri dulu.",
    relational: "Rasa memiliki dapat tumbuh ketika komunikasi dan batas hadir bersama, tanpa ada yang harus dikorbankan.",
    spiritual: "Makna batin nggak harus jadi jawaban besar; seringnya ia tumbuh dari kejujuran kecil yang membumi.",
    challenges: "Tantangan ini bukan tanda kalau harimu salah ya. Ini cuma bagian yang mungkin butuh kamu sapa dengan lebih lembut.",
    opportunities: "Peluang nggak selalu soal perubahan gede. Kadang ia cuma ruang kecil buat merespon dengan cara yang beda.",
    advice: "",
  }[key];
}

function deriveCurrentIssue(
  state: DailyState | null,
  navigator: NavigatorState | null,
  meaning: HumanMeaning | null,
): CurrentIssue {
  const metrics = state?.wellnessSnapshot?.metrics;
  const mood = state?.moodLevel ?? metrics?.emotion;
  const energy = metrics?.energy;
  const nervous = state?.nervousSystemState?.toLowerCase() || "";
  const mode = navigator?.mode;
  const profileText = [
    meaning?.shadow.sabotage.medium,
    meaning?.shadow.triggers.medium,
    meaning?.shadow.moneyBlock.medium,
    meaning?.shadow.loveBlock.medium,
    meaning?.relationships.boundaries.medium,
  ].filter(Boolean).join(" ").toLowerCase();

  if (/memberi terlalu banyak|mengorbank|menolong|mengurus|beban orang|bertanggung jawab atas/.test(profileText)) {
    return issueNarrative("over_responsibility");
  }
  if (/mengecewakan|penolakan|ditinggalkan|tidak disukai/.test(profileText)) {
    return issueNarrative("fear_of_disappointing");
  }
  if (/batas|sulit berkata tidak|kehilangan diri/.test(profileText)) {
    return issueNarrative("need_for_boundaries");
  }
  if (/nilai diri|membuktikan|layak|pengakuan|validasi|pencapaian/.test(profileText)) {
    return issueNarrative("achievement_worth");
  }

  if (mode === "RECOVERY" || (energy ?? 10) <= 4 || (mood ?? 10) <= 4) {
    return issueNarrative("emotional_fatigue");
  }

  if (/stress|tegang|cemas|activated|fight|flight|freeze/.test(nervous) || mode === "REFLECTION") {
    return issueNarrative("overthinking");
  }

  if (mood == null && energy == null) {
    return issueNarrative("lack_of_clarity");
  }

  return issueNarrative(mode === "GROWTH" ? "direction_confusion" : "difficulty_resting");
}

function issueNarrative(key: CurrentIssue["key"]): CurrentIssue {
  const issues: Record<CurrentIssue["key"], CurrentIssue> = {
    over_responsibility: {
      key, title: "terlalu banyak hal yang kamu pikul",
      summary: "Sepertinya yang paling terasa hari ini adalah dorongan buat beresin semuanya sendiri. Pasti melelahkan ya kalau harus menjaga semuanya tetap berjalan. Boleh kok kalau hari ini kamu butuh berjalan lebih pelan.",
      mental: "Di kepalamu, mungkin muncul daftar panjang hal yang harus dibereskan biar hatimu bisa tenang.",
      resources: "Pas lagi mikirin tenaga atau uang, kadang rasanya nggak pernah cukup kalau dipake buat bantuin semua orang.",
      intimacy: "Kalau menyangkut orang tersayang, mungkin kamu merasa baru berharga setelah memenuhi kebutuhan mereka.",
      connection: "Kalau lagi bareng orang lain, ngomong jujur soal batas dirimu mungkin rasanya seperti lagi bikin salah ya?",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah bahwa kamu tetap berharga meskipun tidak sedang menyelamatkan siapa pun.",
      derailment: "Kalau hal ini terus dipikul sendiri, tenagamu bisa habis sementara hatimu tetap merasa kurang.",
      opportunity: "Ada ruang buat tetap peduli tanpa harus kehilangan dirimu sendiri di tengah jalan.",
    },
    emotional_fatigue: {
      key, title: "rasa capek yang sudah lama ditahan",
      summary: "Mungkin yang paling terasa hari ini adalah kelelahan yang membuat hal biasa terasa cukup berat. Wajar jika kamu lelah. Barangkali tubuhmu membutuhkan waktu untuk pulih. Tidak apa-apa jika hari ini kamu ingin berhenti sejenak.",
      mental: "Boleh jadi di kepalamu rasanya seperti ada kabut, gampang kesal, atau susah milih mana yang benar-benar penting.",
      resources: "Saat tenagamu lagi nggak banyak, pilih satu hal yang bener-bener butuh dirawat aja ya, nggak usah dipaksain semuanya.",
      intimacy: "Mungkin hari ini hatimu hanya ingin ditemani, tanpa harus menjelaskan atau menyelesaikan apa pun.",
      connection: "Saat tenaga sedang terbatas, menyampaikan kebutuhanmu kepada orang lain bukan berarti kamu merepotkan.",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah kalau istirahat itu juga bagian penting dari perjalananmu.",
      derailment: "Kalau kelelahan ini terus diabaikan, kamu mungkin menjalani hari secara otomatis dan semakin jauh dari hatimu sendiri.",
      opportunity: "Kalau kamu memberi diri izin untuk pulih, kejernihan dan rasa hadir mungkin kembali perlahan.",
    },
    lack_of_clarity: {
      key, title: "rasa bingung tentang apa yang sebenarnya kamu butuhkan",
      summary: "Kelihatannya hari ini keadaan dirimu belum terbaca jelas ya. Kadang tidak mudah buat ngenalin apa yang lagi dirasain tubuh. Boleh kok kalau hari ini kamu belum punya semua jawaban.",
      mental: "Dalam pikiranmu, kebingungan ini dapat muncul sebagai asumsi dan terlalu banyak kemungkinan yang membuat hati tidak tenang.",
      resources: "Kalau rasa nggak pasti ini lagi kuat, mungkin milih satu langkah paling kecil yang sudah jelas bisa bantu hatimu tenang.",
      intimacy: "Kamu mungkin lagi berharap orang lain paham sesuatu yang kamu sendiri belum bisa kasih nama sekarang.",
      connection: "Nggak apa-apa kok kalau kamu butuh waktu sebentar buat nanya ke diri sendiri sebelum jelasin ke orang lain.",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah gimana cara ngenalin apa yang kamu rasain sebelum buru-buru menyimpulkannya.",
      derailment: "Kalau dipaksain harus jelas sekarang, keputusannya mungkin nggak benar-benar mewakili keinginan hatimu.",
      opportunity: "Kalau kamu kasih ruang sedikit aja, satu perasaan yang jujur bisa jadi awal dari arah yang lebih terang nanti.",
    },
    fear_of_disappointing: {
      key, title: "rasa takut membuat orang lain kecewa",
      summary: "Sepertinya yang paling terasa hari ini adalah rasa takut mengecewakan orang lain. Kadang memang berat ya kalau harus terus-terusan menjaga perasaan semua orang. Boleh kok kalau hari ini kamu mengutamakan suaramu sendiri.",
      mental: "Dalam pikiranmu, rasa takut ini dapat muncul sebagai percakapan yang terus diulang dan pencarian jawaban yang paling aman bagi semua orang.",
      resources: "Pas lagi mikirin tenaga, mungkin kamu bakal kasih lebih dari yang kamu punya cuma biar nggak dianggap kurang peduli.",
      intimacy: "Kejujuran di hati sering tertahan karena takut perubahan kecil bisa mengusik hubungan yang sudah ada.",
      connection: "Tidak apa-apa jika kamu perlu berkata tidak agar hubunganmu tetap jujur dan tidak dipaksakan.",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah hubungan yang sehat itu bisa nerima kejujuran, bukan cuma kepatuhan.",
      derailment: "Kalau ketakutan ini yang memimpin, kamu bakal terus bilang 'ya' tapi perlahan makin jauh dari dirimu sendiri.",
      opportunity: "Kalau rasa takut ini bisa sedikit melunak, kamu bisa milih hubungan yang ngehargain kehadiranmu apa adanya.",
    },
    difficulty_resting: {
      key, title: "sulitnya benar-benar beristirahat tanpa rasa bersalah",
      summary: "Mungkin yang paling terasa hari ini adalah sulit berhenti tanpa merasa bersalah. Kamu tidak harus terus produktif untuk tetap berharga. Boleh saja jika hari ini kamu ingin benar-benar diam sejenak.",
      mental: "Mungkin muncul dorongan untuk mengisi setiap waktu luang, disertai rasa tidak nyaman ketika tidak ada yang sedang diselesaikan.",
      resources: "Waktu istirahat membantu memulihkan tenagamu. Itu bukan tanda bahwa kamu kalah atau merugi.",
      intimacy: "Tidak apa-apa jika hari ini kamu hanya ingin ditemani, tanpa harus melakukan apa pun bersama orang tersayang.",
      connection: "Mungkin kamu lebih mudah membantu orang lain daripada membiarkan mereka merawat dan menjagamu.",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah bahwa keberadaanmu tetap berharga meskipun kamu sedang tidak melakukan apa-apa.",
      derailment: "Kalau kebiasaan ini lanjut terus, jeda cuma jadi tempat nunggu sebelum kamu capek lagi.",
      opportunity: "Kalau kamu bisa kasih izin buat istirahat, rasa hidupmu bisa balik lagi nanti, bukan sekadar berhenti beraktivitas.",
    },
    need_for_boundaries: {
      key, title: "batas yang sudah lama ingin kamu sampaikan",
      summary: "Kelihatannya hari ini kamu lagi butuh batas yang lebih jelas ya. Kadang tidak mudah buat ngaku kalau ada sesuatu yang sudah ambil terlalu banyak ruang. Boleh kok kalau hari ini kamu mau bilang 'cukup' dulu.",
      mental: "Dalam pikiranmu, kebutuhan akan batas ini dapat muncul sebagai percakapan yang berulang dan rasa kesal yang dipendam sendiri.",
      resources: "Kalau tenagamu sudah mulai habis buat urusan yang nggak selaras lagi, mungkin itu tandanya kamu butuh ambil jarak sebentar.",
      intimacy: "Batas yang tidak disampaikan dapat membuatmu merasa jauh dari orang-orang yang kamu sayangi.",
      connection: "Batas bukanlah penolakan. Ia membantu orang lain memahami cara yang tepat untuk mendampingimu.",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah kedekatan itu nggak harus dibayar dengan cara ngilangin dirimu sendiri.",
      derailment: "Kalau batas ini terus ditunda, tubuh dan emosimu mungkin menyampaikan kebutuhan itu melalui kelelahan yang mendalam.",
      opportunity: "Kalau batas dapat disampaikan lebih awal, hubunganmu mungkin terasa lebih ringan dan saling percaya.",
    },
    achievement_worth: {
      key, title: "rasa baru cukup setelah sesuatu selesai",
      summary: "Sepertinya yang paling terasa hari ini adalah dorongan buat ngukur nilai dirimu dari hasil yang dicapai. Tapi kamu berharga kok meskipun hari ini belum ada yang selesai. Boleh kok kalau hari ini kamu cuma mau 'ada' aja.",
      mental: "Dalam pikiranmu, kebiasaan ini dapat muncul sebagai standar yang terus berubah dan kesulitan menikmati proses sebelum target baru hadir.",
      resources: "Kalau kamu merasa harus mengambil lebih banyak beban untuk membuktikan kemampuan, periksa kembali apakah tenagamu memang masih cukup.",
      intimacy: "Mungkin kamu lebih sering menunjukkan sisi yang mampu menangani semuanya daripada mengatakan bahwa kamu sedang membutuhkan dukungan.",
      connection: "Tidak apa-apa jika kamu membutuhkan kasih sayang tanpa harus lebih dahulu melakukan sesuatu untuk orang lain.",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah gimana cara misahin harga dirimu dari banyaknya hal yang selesai.",
      derailment: "Kalau ini terus lanjut, setiap sukses cuma bakal jadi syarat buat tuntutan yang lebih berat lagi nanti.",
      opportunity: "Kalau tuntutan ini bisa melunak, pencapaianmu bakal jadi ekspresi diri, bukan bukti kalau kamu layak disayang.",
    },
    relationship_uncertainty: {
      key, title: "rasa tidak pasti dalam hubungan",
      summary: "Mungkin yang paling terasa hari ini adalah rasa nggak pasti dalam hubungan. Kadang tidak mudah ya kalau harus terus-terusan nebak apa yang lagi terjadi. Boleh kok kalau hari ini kamu mau nanya kejelasan sebentar.",
      mental: "Mungkin pikiranmu sedang membaca tanda, mengulang percakapan, dan mencari makna dalam hal-hal kecil.",
      resources: "Kalau perhatianmu habis cuma buat jaga hubungan tetap aman, mungkin area lain di hidupmu jadi nggak keurus ya?",
      intimacy: "Tidak apa-apa jika kamu membutuhkan waktu untuk merasakan apa yang sungguh-sungguh diinginkan hatimu sekarang.",
      connection: "Rasa nggak pasti ini mungkin cuma tandanya kamu lagi butuh ngobrol jujur aja, bukan karena hubunganmu lagi salah.",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah gimana ngebangun rasa aman dari kejelasan, bukan dari tebakan.",
      derailment: "Kalau ini lanjut terus, kecemasanmu bakal ngomong lebih kencang dibanding kenyataan yang beneran ada.",
      opportunity: "Kalau keraguan ini melunak, kamu dapat melihat hubungan dengan lebih jernih dan memilih langkah dari tempat yang lebih tenang.",
    },
    direction_confusion: {
      key, title: "bingung memilih arah",
      summary: "Sepertinya hari ini ada kebingungan tentang arah di tengah banyak pilihan. Wajar jika kamu merasa ragu. Boleh saja jika hari ini kamu ingin diam sejenak dan belum memilih apa pun.",
      mental: "Dalam pikiranmu, kebingungan ini dapat muncul sebagai kebiasaan membandingkan pilihan dan rasa takut kehilangan pilihan lain.",
      resources: "Kalau terlalu banyak arah bikin tenagamu pecah-pecah, mungkin kamu butuh fokus ke satu hal paling ringan aja hari ini.",
      intimacy: "Kebingungan tentang arah mungkin juga membuatmu sulit menjelaskan kebutuhanmu kepada orang lain.",
      connection: "Nggak apa-apa kok kalau kompas batinmu suaranya lagi pelan; itu bukan berarti kamu lagi nyasar.",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah gimana milih jalan yang paling selaras, bukan yang paling kelihatan wah.",
      derailment: "Kalau semua pintu ingin tetap terbuka, mungkin tidak ada satu pun pilihan yang benar-benar mendapat ruang untuk tumbuh.",
      opportunity: "Kalau satu arah sudah dipilih pelan-pelan, nanti rasa percaya diri kamu bakal mulai balik lagi.",
    },
    overthinking: {
      key, title: "terlalu lama memikirkan semuanya sendirian",
      summary: "Sepertinya yang paling terasa hari ini adalah kebiasaan buat mikirin semuanya di dalam kepala sendiri. Pasti melelahkan ya kalau pikiran nggak bisa berhenti berputar. Boleh kok kalau hari ini kamu mau 'matiin' sebentar logikamu.",
      mental: "Mungkin pikiranmu dipenuhi pengulangan dan simulasi, seolah satu analisis lagi akan membuat keadaan terasa aman.",
      resources: "Terlalu banyak berpikir dapat menunda keputusan sederhana dan menghabiskan tenaga sebelum kamu mulai bertindak.",
      intimacy: "Nggak apa-apa kok kalau perasaanmu nggak bisa dijelasin pake logika sekarang; rasain aja dulu apa adanya.",
      connection: "Mungkin kamu sudah siapin jawaban bahkan sebelum bener-benar denger apa yang lagi orang lain bilang ya?",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah cara memberi tubuh dan perasaanmu ruang dalam mengambil keputusan.",
      derailment: "Kalau ini lanjut terus, pemahamanmu mungkin nambah tapi rasa dekat sama diri sendiri malah berkurang nanti.",
      opportunity: "Kalau pikiran bisa lebih santai, kejernihan bakal datang dari apa yang kamu alami langsung hari ini.",
    },
    disconnection: {
      key, title: "terlalu jauh dari apa yang sebenarnya kamu butuhkan",
      summary: "Mungkin yang paling terasa hari ini adalah jarak antara apa yang kamu lakukan dan apa yang sebenarnya diinginkan hatimu. Wajar jika kebutuhanmu sendiri terasa asing. Boleh saja jika hari ini kamu ingin menanyakan kabar dirimu sejenak.",
      mental: "Di kepalamu, semuanya jalan secara otomatis tanpa ada ruang buat nanya 'aku beneran mau ini nggak?'.",
      resources: "Kadang kebutuhanmu sendiri ditaruh paling terakhir setelah urusan orang lain beres ya?",
      intimacy: "Nggak apa-apa kok kalau hari ini kamu lagi nggak bisa hadir sepenuhnya; kasih waktu buat dirimu sendiri dulu aja.",
      connection: "Mungkin kamu tetap 'ada' buat orang lain tapi sebenernya perlahan lagi ngilang dari pengalamanmu sendiri ya?",
      lesson: "Barangkali yang sedang ingin kamu pahami adalah cara mengenali kembali kebutuhanmu tanpa menganggapnya sebagai gangguan.",
      derailment: "Kalau ini terus berlanjut, hidupmu mungkin terasa penuh aktivitas tetapi jauh dari kehadiranmu sendiri.",
      opportunity: "Kalau kamu dapat lebih peka, pilihan-pilihan harimu mungkin terasa lebih jujur dan kembali menjadi milikmu.",
    },
  };
  return issues[key];
}

function buildYesterdayContext(state: DailyState | null): string {
  if (!state) {
    return "Akhir-akhir ini mungkin belum banyak waktu untuk berhenti dan menanyakan kabar dirimu sendiri. Tidak apa-apa. Kamu selalu boleh memulai kembali hari ini.";
  }
  const completed = [
    state.innerworkDone ? "innerwork" : "",
    state.journalingDone ? "nulis jurnal" : "",
    state.meditationDone ? "meditasi" : "",
    state.wellnessSnapshot?.checkInCompleted || state.assessmentDone ? "cek kondisi diri" : "",
    state.workoutDone ? "latihan tubuh" : "",
    state.dailyNoteDone ? "baca catatan Bhumi" : "",
  ].filter(Boolean);
  if (completed.length > 0) {
    const restorative = completed.some((item) => ["nulis jurnal", "meditasi", "cek kondisi diri", "baca catatan Bhumi"].includes(item));
    const active = completed.some((item) => ["innerwork", "latihan tubuh"].includes(item));
    if (restorative && active) return "Kemarin kamu sempat memberi ruang untuk mendengarkan diri sekaligus menjaga tubuh tetap bergerak. Boleh diteruskan perlahan, tanpa menjadikannya beban baru.";
    if (restorative) return "Kemarin kamu sudah mulai memberi ruang untuk berhenti dan mendengarkan dirimu sendiri, meskipun mungkin belum terasa mudah.";
    return "Kemarin kamu sudah usaha buat tetap gerak. Hari ini, coba kasih ruang sedikit ya biar tenagamu nggak cuma habis buat bertahan.";
  }
  return "Akhir-akhir ini harimu sepertinya terasa lebih berat. Hari ini kamu tidak perlu mengejar apa pun. Cukup pilih satu langkah yang paling ringan untuk dilakukan.";
}

function buildJourneyContext(guidance: DailyGuidance, states: DailyState[]): string {
  const recent = states.filter((state) => state.date !== guidance.localDateKey).slice(0, 5);
  const activeDays = recent.filter(hasMeaningfulActivity).length;
  if (recent.length >= 5 && activeDays === 0) {
    return "Beberapa hari ini ritme harimu lagi berat ya? Belum balik ke kebiasaan lama bukan berarti perjalananmu berhenti kok.";
  }
  if (activeDays >= 4) {
    return "Belakangan kamu terlihat cukup konsisten. Yang penting hari ini jaga ritmenya ya, jangan sampai berubah jadi tekanan buat dirimu.";
  }
  if (guidance.streakDays && guidance.streakDays >= 3) return "Ritme yang kamu bangun beberapa hari ini menunjukkan kalau langkah kecilmu mulai punya akar.";
  if ((guidance.practiceCompletedCountYesterday ?? 0) > 0) return "Sudah ada jejak praktik yang kamu sentuh kemarin; itu tanda kalau perjalananmu tetap gerak.";
  return guidance.previousProgressSummary || "Langkahmu nggak harus kelihatan gede buat tetap berarti.";
}

function buildSectionContext(input: {
  key: LetterSection["key"];
  yesterdayContext: string;
  stateContext: string;
  journeyContext: string;
  approachingContext: string;
  dayContext: string;
  dailyState: DailyState | null;
  meaning: HumanMeaning | null;
  currentIssue: CurrentIssue;
  hasHistory: boolean;
}): { main: string; advice: string } {
  const meaning = input.meaning;
  const emotionalState = describeEmotionalState(input.dailyState);
  const history = input.hasHistory ? input.journeyContext : "";
  const shadowTrigger = translateMeaningToToday(meaning?.shadow.triggers.medium, "mental");
  const moneyBlock = translateMeaningToToday(meaning?.shadow.moneyBlock.medium, "finance");
  const workStyle = translateMeaningToToday(meaning?.talents.workStyle.medium, "finance");
  const loveBlock = translateMeaningToToday(meaning?.shadow.loveBlock.medium, "love");
  const relationshipPattern = translateMeaningToToday(meaning?.relationships.pattern.medium, "love");
  const relationshipDomain = translateMeaningToToday(meaning?.relationships.medium, "relational");
  const boundaries = translateMeaningToToday(meaning?.relationships.boundaries.medium, "relational");
  const purpose = translateMeaningToToday(meaning?.purpose.medium, "spiritual");
  const growthArea = translateMeaningToToday(meaning?.timing.growthArea.medium, "spiritual");
  const sabotage = translateMeaningToToday(meaning?.shadow.sabotage.medium, "challenges");
  const potential = translateMeaningToToday(meaning?.talents.potential.medium, "opportunities");
  const talents = translateMeaningToToday(meaning?.talents.dna.medium, "opportunities");

  return {
    general: {
      main: `${input.currentIssue.summary} ${input.hasHistory ? input.yesterdayContext : ""} ${history} ${input.dayContext}`,
      advice: "Jaga ritme harimu sesuai tenaga yang benar-benar tersedia. Kamu tidak harus mengikuti tuntutan yang paling keras suaranya.",
    },
    mental: {
      main: `${input.currentIssue.mental} ${emotionalState} ${shadowTrigger} ${input.hasHistory ? yesterdayMentalTrace(input.yesterdayContext) : ""}`,
      advice: `${profilePatternAdvice(meaning, "mental")} Bedakan mana yang perlu dipikirkan sekarang dan mana yang hanya membutuhkan sedikit ruang.`,
    },
    finance: {
      main: `${input.currentIssue.resources} ${moneyBlock} ${workStyle} ${history}`,
      advice: `${profilePatternAdvice(meaning, "finance")} Ambil keputusan yang membuatmu merasa stabil dan sesuai dengan caramu bekerja, bukan karena merasa terdesak.`,
    },
    love: {
      main: `${input.currentIssue.intimacy} ${loveBlock} ${relationshipPattern} ${emotionalState}`,
      advice: `${profilePatternAdvice(meaning, "love")} Dengarkan apa yang sedang dibutuhkan hatimu sebelum terburu-buru meminta kepastian atau memberi terlalu banyak kepada orang lain.`,
    },
    relational: {
      main: `${input.currentIssue.connection} ${relationshipDomain} ${boundaries} ${input.hasHistory ? yesterdayRelationalTrace(input.yesterdayContext) : ""}`,
      advice: `${profilePatternAdvice(meaning, "relational")} Cobalah menyampaikan apa yang kamu butuhkan tanpa menutup pintu bagi dukungan dari orang lain.`,
    },
    spiritual: {
      main: `${input.currentIssue.lesson} ${purpose} ${growthArea} ${history} ${input.hasHistory ? yesterdaySpiritualTrace(input.yesterdayContext) : ""} ${input.approachingContext}`,
      advice: `${profilePatternAdvice(meaning, "spiritual")} Biarkan satu makna yang terasa jujur tinggal lebih lama di hati. Tidak perlu segera menjadikannya jawaban besar.`,
    },
    challenges: {
      main: `${input.currentIssue.derailment} ${sabotage} ${input.stateContext} ${history}`,
      advice: "Hadapi tantangan hari ini dengan ngenalin kebiasaan lama yang muncul sebelum ia berubah jadi reaksi otomatis.",
    },
    opportunities: {
      main: `${input.currentIssue.opportunity} ${potential} ${talents} ${history}`,
      advice: "Pake peluang hari ini buat nguatin satu kemampuan yang sudah kamu punya, nggak perlu buka terlalu banyak arah baru.",
    },
    advice: { main: "", advice: "" },
  }[input.key];
}

function describeEmotionalState(state: DailyState | null): string {
  const metrics = state?.wellnessSnapshot?.metrics;
  const mood = state?.moodLevel ?? metrics?.emotion;
  const energy = metrics?.energy;
  const nervous = state?.nervousSystemState?.toLowerCase() || "";
  if (/stress|tegang|cemas|activated|fight|flight|freeze/.test(nervous)) {
    return "Hatimu sepertinya lebih peka terhadap tekanan hari ini. Wajar jika pikiranmu menangkap banyak hal sebagai sesuatu yang mendesak.";
  }
  if ((mood ?? 10) <= 4 || (energy ?? 10) <= 4) {
    return "Tenaga batinmu sepertinya sedang terbatas. Kejernihan mungkin datang saat kamu mengurangi beban, bukan menambah usaha.";
  }
  if ((mood ?? 0) >= 7 && (energy ?? 0) >= 7) {
    return "Kamu terlihat cukup terbuka dan bersemangat hari ini. Arah yang sederhana dapat membantu menjaga semangatmu tetap utuh.";
  }
  return "Kondisi hatimu terasa cukup seimbang untuk memperhatikan pikiran tanpa harus mengikuti setiap dorongan yang muncul.";
}

function buildDayContext(dateKey: string): string {
  const day = new Date(`${dateKey}T12:00:00`).getDay();
  return [
    "Hari Minggu ini memberi ruang untuk menutup satu siklus dan menyiapkan langkah baru.",
    "Senin biasanya membawa tema awal, arah, dan niat yang ingin dijaga.",
    "Selasa adalah waktu untuk menjaga ritme dan konsistensi harimu.",
    "Rabu memberi ruang untuk melihat kembali proses dan pelajaran yang diperoleh.",
    "Kamis bantu pengalamanmu nemuin makna yang lebih luas.",
    "Jumat waktunya lihat perjalanan sepekan ini dengan rasa cukup.",
    "Sabtu memberi ruang untuk bernapas lega dan kembali kepada diri sendiri.",
  ][day];
}

function buildClosing(
  issue: CurrentIssue,
  yesterdayContext: string,
  stateContext: string,
  journeyContext: string,
  approachingContext: string,
  meaning: HumanMeaning | null,
): string {
  const memory = yesterdayContext
    ? `${yesterdayContext} Apa yang terjadi kemarin bukan sekadar catatan. Itu menunjukkan caramu menjaga diri di tengah ${issue.title.toLowerCase()} ini.`
    : "Kamu nggak butuh riwayat panjang kok supaya keadaanmu hari ini layak buat dipahami.";
  const journey = journeyContext
    ? `${journeyContext} Biarkan perjalanan itu jadi bukti kalau perubahan nggak harus terjadi sekaligus.`
    : "";
  const profileExplanation = meaning?.shadow.sabotage.medium
    ? `Kebiasaan yang selama ini membantumu bertahan juga dapat membuat ${issue.title.toLowerCase()} terasa lebih kuat saat ada tekanan.`
    : "";
  const astroSupport = approachingContext
    ? "Suasana hari ini mungkin bikin kebiasaan itu lebih gampang kelihatan, tapi itu bukan penyebab utama dari apa yang kamu alami kok."
    : "";
  const source = [
    `Kalau Bhumi hanya boleh memberi satu pesan hari ini: kamu sedang menghadapi ${issue.title.toLowerCase()}, dan kamu tidak harus menyelesaikannya dengan menjadi lebih keras kepada dirimu sendiri.`,
    memory,
    journey,
    profileExplanation,
    stateContext,
    astroSupport,
    issue.opportunity,
    "Yang paling kamu butuhkan bukan jawaban sempurna, melainkan satu respons yang membuatmu tetap dekat dengan dirimu sendiri. Biarkan hari ini menjadi ruang untuk mengurangi beban yang bukan milikmu, mendengarkan kebutuhan yang tertunda, dan memilih langkah yang benar-benar jujur untuk dijalani.",
  ].filter(Boolean).join(" ");
  return limitCompleteSentences(humanizeCompanionLanguage(cleanMarkdown(source)), 180);
}

function hasMeaningfulActivity(state: DailyState): boolean {
  return Boolean(
    state.innerworkDone
    || state.journalingDone
    || state.meditationDone
    || state.workoutDone
    || state.yogaDone
    || state.audioHealingDone
    || state.wellnessSnapshot?.checkInCompleted
    || state.assessmentDone
    || state.dailyNoteDone,
  );
}

function limitCompleteSentences(value: string, maximum: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.split(/\s+/).length <= maximum) return ensureSentenceEnding(clean);
  const selected: string[] = [];
  let count = 0;
  for (const sentence of splitSentences(clean)) {
    const nextCount = count + sentence.split(/\s+/).length;
    if (selected.length > 0 && nextCount > maximum) break;
    selected.push(sentence);
    count = nextCount;
  }
  return ensureSentenceEnding(selected.join(" "));
}

function dedupeText(value: string, used: Set<string>): string {
  const unique = splitSentences(value).filter((sentence) => {
    const key = sentence.toLocaleLowerCase("id-ID").replace(/[.!?]+$/, "").trim();
    if (!key || used.has(key)) return false;
    used.add(key);
    return true;
  });
  return ensureSentenceEnding(unique.join(" "));
}

function splitSentences(value: string): string[] {
  return value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [];
}

function ensureSentenceEnding(value: string): string {
  const clean = value.trim();
  if (!clean) return "";
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function stripAstroSentences(value: string): string {
  const astroTerms = /matahari|bulan|merkurius|venus|mars|jupiter|saturn|uranus|neptunus|pluto|transit|retrograde|zodiak|astrolog|gerhana|fase|langit|house|rumah ke-\d+/i;
  return splitSentences(value).filter((sentence) => !astroTerms.test(sentence)).join(" ");
}

function stripVisibleSourceLanguage(value: string): string {
  const sourceTerms = /human design|life path|numerologi|destiny matrix|arcana|gate|channel|chakra|bodygraph|bazi|vedic|tzolkin|weton|natal chart|sun sign|moon sign|ascendant|authority|strategy|projector|generator|manifestor|reflector|profile \d/i;
  const profileOpenings = /^(kamu adalah|kamu hadir untuk|kamu berpotensi|kamu memiliki|kamu cenderung|kamu mencari)\b/i;
  return splitSentences(value)
    .filter((sentence) => !sourceTerms.test(sentence) && !profileOpenings.test(sentence.trim()))
    .join(" ");
}

function translateMeaningToToday(
  value: string | undefined,
  domain: "mental" | "finance" | "love" | "relational" | "spiritual" | "challenges" | "opportunities",
): string {
  if (!value) return "";
  const translated = invisibleProfileExplanation(value, domain);
  const bridge = {
    mental: "Hari ini, kebiasaan ini mungkin terasa saat pikiranmu mencari rasa aman dan mencoba memahami terlalu banyak hal sekaligus.",
    finance: "Hari ini, kebiasaan ini mungkin memengaruhi caramu mempertimbangkan rasa aman dan urusan rezeki.",
    love: "Hari ini, kebiasaan ini mungkin terasa saat kedekatan menyentuh kebutuhanmu akan kepastian atau ruang pribadi.",
    relational: "Hari ini, kebiasaan ini mungkin muncul melalui batas yang kamu buat dan ruang yang kamu berikan kepada dirimu sendiri.",
    spiritual: "Hari ini, kebiasaan ini membantu menjelaskan pelajaran yang sedang ingin kamu alami, bukan hanya dipahami dalam pikiran.",
    challenges: "Saat ada tekanan hari ini, kebiasaan lama ini dapat muncul lebih cepat dan mengatur responsmu sebelum kamu menyadarinya.",
    opportunities: "Saat hal yang berat mulai melunak, kebiasaan ini dapat berubah menjadi kekuatan yang lebih tenang dan tidak menguras tenaga.",
  }[domain];
  return `${translated} ${bridge}`;
}

function invisibleProfileExplanation(
  value: string,
  domain: "mental" | "finance" | "love" | "relational" | "spiritual" | "challenges" | "opportunities",
): string {
  const lower = value.toLowerCase();
  const responsibility = /tanggung jawab|menolong|mengurus|menopang|stabil|andal|diandalkan/.test(lower);
  const analysis = /analisis|pikiran|pola|logis|detail|solusi|memahami/.test(lower);
  const certainty = /kepastian|komitmen|aman|setia|jangka panjang/.test(lower);
  const approval = /pengakuan|diterima|disukai|membuktikan|nilai diri|layak/.test(lower);
  const boundary = /batas|mengorbank|memberi terlalu banyak|kehilangan diri/.test(lower);

  if (domain === "mental" && analysis) return "Mencari penjelasan biasanya membantumu merasa lebih siap. Namun hari ini, kebiasaan itu mungkin membuatmu terlalu lama berputar dalam pikiran sendiri.";
  if (domain === "mental" && responsibility) return "Mungkin ada bagian dirimu yang merasa harus memastikan semuanya selesai sebelum mengizinkan pikiranmu tenang.";
  if (domain === "finance" && approval) return "Terkadang keputusan terasa lebih berat ketika hasilnya diam-diam digunakan untuk membuktikan bahwa kamu cukup mampu.";
  if (domain === "finance" && responsibility) return "Boleh jadi kamu lebih cepat ngitung kebutuhan orang lain dibanding cek berapa banyak tenaga yang sebenernya kamu punya.";
  if (domain === "love" && certainty) return "Hari ini kamu mungkin lebih peka terhadap sikap yang terasa setengah hati atau tidak jelas.";
  if (domain === "love" && boundary) return "Terkadang keinginan menjaga kedekatan membuatmu mengalah lebih jauh daripada yang sebenarnya kamu inginkan.";
  if (domain === "relational" && responsibility) return "Mungkin ada dorongan buat langsung beresin keadaan biar semua orang balik tenang, bahkan sebelum kamu sempat tanya kabar dirimu sendiri.";
  if (domain === "relational" && boundary) return "Ada kemungkinan kamu sudah merasa penuh sebelum akhirnya berani mengatakan bahwa kamu membutuhkan ruang.";
  if (domain === "spiritual" && approval) return "Mungkin ada bagian dirimu yang baru merasa tenang setelah mendapat tanda bahwa langkahmu sudah benar.";
  if (domain === "challenges" && analysis) return "Saat keadaan menekan, mencari satu penjelasan lagi mungkin terasa lebih aman daripada mengakui apa yang sebenarnya sedang kamu rasakan.";
  if (domain === "opportunities" && responsibility) return "Ada ruang buat tetap peduli tanpa harus otomatis ambil semua beban ke pundakmu.";
  return {
    mental: "Mungkin ada kebiasaan lama yang bikin pikiranmu cepat nyari jawaban sebelum perasaanmu sempat kedengeran.",
    finance: "Caramu mencari rasa aman hari ini mungkin memengaruhi keputusan tentang uang, waktu, dan tenaga.",
    love: "Apa yang terasa aman atau tidak di hatimu mungkin sedang memengaruhi caramu memandang hubungan hari ini.",
    relational: "Caramu jaga hubungan mungkin lagi berhadapan sama kebutuhan buat tetap punya ruang buat dirimu sendiri.",
    spiritual: "Ada sesuatu yang mungkin ingin dipahami melalui pengalamanmu hari ini, bukan hanya melalui penjelasan.",
    challenges: "Kebiasaan lama mungkin muncul lebih cepat saat kamu lelah, bingung, atau merasa harus segera memilih.",
    opportunities: "Hal yang selama ini membantumu bertahan dapat digunakan dengan cara yang lebih lembut dan tidak melelahkan.",
  }[domain];
}

function translateProfileLanguage(value: string): string {
  return splitSentences(value).map((sentence) => {
    const clean = sentence.trim();
    if (/^kamu adalah\b/i.test(clean)) {
      return clean.replace(/^kamu adalah\b/i, "Karena selama ini kamu sering dikenal sebagai").replace(/[.!?]?$/, ", hal itu hari ini bisa ngaruh ke caramu ngerespon keadaan.");
    }
    if (/^kamu hadir untuk\b/i.test(clean)) {
      return clean.replace(/^kamu hadir untuk\b/i, "Karena selama ini kamu sering mengambil peran untuk").replace(/[.!?]?$/, ", ada kemungkinan kamu merasa perlu memikul semuanya bahkan saat tenagamu sedang terbatas.");
    }
    if (/^kamu berpotensi\b/i.test(clean)) {
      return clean.replace(/^kamu berpotensi\b/i, "Kebiasaanmu yang kuat dalam").replace(/[.!?]?$/, " memang bantuin banyak hal, tapi hari ini juga bisa bikin kamu terlalu lama ngandelin itu aja.");
    }
    if (/^kamu memiliki\b/i.test(clean)) {
      return clean.replace(/^kamu memiliki\b/i, "Karena selama ini kamu bawa").replace(/[.!?]?$/, ", hal tersebut hari ini bisa ngaruh ke apa yang kamu rasa penting.");
    }
    if (/^kamu cenderung\b/i.test(clean)) {
      return clean.replace(/^kamu cenderung\b/i, "Saat keadaan terasa penting, kamu biasanya").replace(/[.!?]?$/, ", dan hari ini respons itu mungkin muncul sebelum kebutuhanmu sendiri sempat terdengar.");
    }
    if (/^kamu mencari\b/i.test(clean)) {
      return clean.replace(/^kamu mencari\b/i, "Saat sesuatu terasa penting, kamu lebih memilih untuk mencari").replace(/[.!?]?$/, " daripada mengambil risiko untuk tetap terbuka terhadap ketidakpastian.");
    }
    return clean;
  }).join(" ");
}

function humanizeCompanionLanguage(value: string): string {
  return splitSentences(value).map((sentence) => {
    let next = sentence
      .replace(/^Di dalam domain ini[:,]?\s*/i, "Mungkin hari ini ")
      .replace(/^Dalam relasi[:,]?\s*/i, "Kalau lagi bareng orang terdekat, ")
      .replace(/^Dalam sumber daya[:,]?\s*/i, "Pas lagi mikirin tenaga atau uang, ")
      .replace(/^Pelajaran di bawah isu ini adalah\s*/i, "Barangkali yang sedang ingin kamu pahami adalah ")
      .replace(/^Ketika pola ini muncul[:,]?\s*/i, "Kalau hal ini terasa kembali, ")
      .replace(/^Isu ini\s*/i, "Hal ini ")
      .replace(/\bisu\b/gi, "hal yang lagi kamu hadapi")
      .replace(/\bpola\b/gi, "kebiasaan")
      .replace(/\bproduktivitas\b/gi, "banyaknya hal yang selesai")
      .replace(/\bsumber daya\b/gi, "tenaga dan waktu")
      .replace(/\bkebutuhan emosional\b/gi, "apa yang lagi kamu rasain")
      .replace(/\bpengakuan\b/gi, "rasa dihargai")
      .replace(/\bvalidasi\b/gi, "kepastian dari orang lain")
      .replace(/\bdinamika\b/gi, "apa yang lagi terjadi")
      .replace(/\bkecenderungan\b/gi, "dorongan")
      .replace(/\bkapasitas\b/gi, "tenaga yang ada")
      .replace(/\bketidakjelasan\b/gi, "rasa bingung")
      .replace(/\bketidakpastian\b/gi, "rasa tidak pasti")
      .replace(/\bmanifestasi\b/gi, "cara hal itu terasa")
      .replace(/\bmeredakan ketidaknyamanan\b/gi, "bikin hati cepat lega")
      // Recognition Pass Additions
      .replace(/Kondisimu sedang membutuhkan beban yang lebih ringan/gi, "Sepertinya hari ini tenagamu perlu dijaga dengan lebih lembut")
      .replace(/Kurangi tuntutan, pilih satu langkah kecil/gi, "Coba kurangi daftar pekerjaanmu, pilih satu saja yang paling penting")
      .replace(/Sistem tubuhmu sedang lebih peka terhadap tekanan/gi, "Sepertinya ada sedikit ketegangan yang kamu rasakan hari ini")
      .replace(/Tenangkan tubuh lebih dulu/gi, "Tenangkan badanmu sebentar")
      .replace(/Energi dan suasana hatimu cukup kuat/gi, "Hari ini kamu terlihat memiliki semangat dan energi yang cukup segar")
      .replace(/Check-in hari ini belum tercatat/gi, "Belum sempat mencatat kabar harimu ya");

    if (/^Yang paling penting hari ini adalah/i.test(next)) {
      next = next.replace(/^Yang paling penting hari ini adalah/i, "Mungkin yang paling terasa hari ini adalah");
    } else if (/^Di pikiran,/i.test(next)) {
      next = next.replace(/^Di pikiran,/i, "Boleh jadi di kepalamu,");
    } else if (/^Dalam kedekatan,/i.test(next)) {
      next = next.replace(/^Dalam kedekatan,/i, "Kalau menyangkut orang yang kamu sayang,");
    } else if (/^Dalam hubungan,/i.test(next)) {
      next = next.replace(/^Dalam hubungan,/i, "Kalau lagi bareng orang lain,");
    } else if (/^Jika pola ini berlanjut,/i.test(next)) {
      next = next.replace(/^Jika pola ini berlanjut,/i, "Kalau hal ini terus kamu pikul,");
    } else if (/^Jika melunak,/i.test(next)) {
      next = next.replace(/^Jika melunak,/i, "Kalau kamu bisa sedikit lebih santai,");
    } else if (/^Peluangmu adalah/i.test(next)) {
      next = next.replace(/^Peluangmu adalah/i, "Ada ruang buat");
    }

    return ensureSentenceEnding(next);
  }).join(" ");
}

function profilePatternAdvice(meaning: HumanMeaning | null, section: "mental" | "finance" | "love" | "relational" | "spiritual"): string {
  const profileText = [
    meaning?.shadow.sabotage.medium,
    meaning?.shadow.triggers.medium,
    meaning?.shadow.moneyBlock.medium,
    meaning?.shadow.loveBlock.medium,
    meaning?.relationships.boundaries.medium,
  ].filter(Boolean).join(" ").toLowerCase();
  const overGiving = /memberi terlalu banyak|mengorbank|menyenangkan|menolong|mengurus|beban orang|bertanggung jawab atas/.test(profileText);
  const boundary = /batas|sulit berkata tidak|terlalu terbuka|kehilangan diri/.test(profileText);
  const selfWorth = /nilai diri|membuktikan|layak|pengakuan|validasi/.test(profileText);
  const control = /kontrol|mengendalikan|sempurna|kesalahan|kaku/.test(profileText);

  if (section === "finance" && selfWorth) return "Pisahin nilai dirimu dari hasil, angka, atau gimana orang lain lihat kamu ya.";
  if ((section === "love" || section === "relational") && overGiving) return "Kebiasaan kasih terlalu banyak nggak harus jadi harga buat disayang kok.";
  if ((section === "love" || section === "relational") && boundary) return "Batas yang jelas itu bukan penolakan; ia cuma jaga biar kamu nggak kehilangan diri sendiri.";
  if (section === "mental" && control) return "Dorongan untuk mengatur semuanya mungkin merupakan cara melindungi diri dari rasa takut berbuat salah.";
  if (section === "spiritual" && selfWorth) return "Pertumbuhan batinmu nggak perlu dibuktiin lewat pencapaian apa pun.";
  return {
    mental: "Kebiasaan pikiranmu hari ini perlu kamu sapa dulu sebelum diarahkan.",
    finance: "Caramu mengelola rezeki dan tenaga perlu tetap selaras dengan hal yang kamu anggap berharga.",
    love: "Kedekatan yang sehat itu nggak bakal minta kamu ninggalin kebutuhanmu sendiri.",
    relational: "Dukungan yang tulus itu jalan bareng sama batas yang jelas.",
    spiritual: "Makna yang tumbuh pelan-pelan itu tetap berharga kok.",
  }[section];
}

function yesterdayMentalTrace(yesterday: string): string {
  if (/meditasi|nulis jurnal|baca catatan Bhumi/.test(yesterday)) return "Waktu yang kamu berikan kemarin untuk berhenti dan melihat ke dalam dapat membantu pikiranmu mengenali hal yang penting hari ini.";
  if (/belum ada praktik|belum meninggalkan catatan/.test(yesterday)) return "Karena kemarin belum banyak waktu buat berhenti, pikiran hari ini mungkin masih bawa sisa hal yang belum beres.";
  return "Ritme kemarin masih kasih pengaruh ke gimana pikiranmu milih perhatian hari ini.";
}

function yesterdayRelationalTrace(yesterday: string): string {
  if (/nulis jurnal|baca catatan Bhumi|cek kondisi diri/.test(yesterday)) return "Waktu yang kamu berikan kemarin untuk mengenali diri dapat membuat batas dan kebutuhanmu lebih mudah dipahami dalam hubungan hari ini.";
  if (/belum ada praktik|belum meninggalkan catatan/.test(yesterday)) return "Karena kemarin tidak banyak ruang untuk memeriksa kabar diri, kesabaran dan batas dalam hubungan hari ini mungkin membutuhkan perhatian lebih.";
  return "Caramu pake tenaga kemarin bisa ngaruh ke kesiapanmu nerima dukungan hari ini.";
}

function yesterdaySpiritualTrace(yesterday: string): string {
  if (/meditasi|nulis jurnal|baca catatan Bhumi/.test(yesterday)) return "Refleksi yang kamu sentuh kemarin jadi bahan yang nyata buat makna yang lagi tumbuh hari ini.";
  if (/belum ada praktik|belum meninggalkan catatan/.test(yesterday)) return "Belum adanya ruang refleksi kemarin nggak nutup perjalanan batinmu kok; hari ini tetap bisa jadi tempat buat mulai dengar lagi.";
  return "Apa yang kamu jalani kemarin sudah jadi bagian dari pelajaran yang mulai kebaca hari ini.";
}
