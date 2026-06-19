"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Music, Sparkles, Dumbbell, Flower2,
  Utensils, Brain, ChevronDown, ChevronUp, CheckCircle2,
  Timer, Heart, Info
} from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { wellnessNavigatorRepository } from "@/lib/repositories/wellnessNavigatorRepository";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { HumanMeaningService } from "@/lib/services/humanMeaningService";
import { CanonicalTranslatorService } from "@/lib/services/canonicalTranslatorService";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import type { NavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import type { DailyState } from "@/lib/repositories/dailyStateRepository";
import { buildInnerworkDailyDecision, mapInnerworkPractice, type InnerworkPractice, type InnerworkSupportPractice } from "@/lib/engines/innerworkIntelligence";
import { buildZoneBHref, type ZoneBPracticeCategory } from "@/lib/innerwork/zoneBContext";
import type { JourneyDailyMemory } from "@/lib/types/journeyDailyRecord";
import { innerworkReflectionRepository } from "@/lib/repositories/innerworkReflectionRepository";
import type { Blueprint } from "@/lib/types/blueprint";
import { astroAwarenessEngine } from "@/lib/engines/astroAwarenessEngine";

// --- Companion Content Logic ---

type CurrentIssue = {
  key: string;
  title: string;
  notices: string;
  matters: string;
  fallbackFocus: string;
};

function issueNarrative(key: string): CurrentIssue {
  const issues: Record<string, CurrentIssue> = {
    love_block: {
      key, title: "Pola Kedekatan yang Menahan Hati",
      notices: "Catatan Hari Ini menyoroti pola cinta, kedekatan, atau kebutuhan emosional yang belum mendapat ruang aman.",
      matters: "Praktik hari ini perlu tetap berpusat pada hubungan dan rasa aman, bukan beralih ke tema generik.",
      fallbackFocus: "Dengarkan kebutuhan hatimu sebelum memberi atau menjauh."
    },
    inner_child: {
      key, title: "Bagian Diri Kecil yang Membutuhkan Rasa Aman",
      notices: "Catatan Hari Ini menyoroti kebutuhan lama yang masih terasa dalam pengalamanmu sekarang.",
      matters: "Bagian ini membutuhkan kehadiran dan perlindungan, bukan tuntutan untuk segera pulih.",
      fallbackFocus: "Temani bagian dirimu yang dulu harus menghadapi terlalu banyak hal sendirian."
    },
    money_block: {
      key, title: "Rasa Aman dalam Hubungan dengan Uang",
      notices: "Catatan Hari Ini menyoroti ketegangan antara uang, nilai diri, dan rasa aman.",
      matters: "Kejernihan finansial lebih mudah muncul setelah fakta dipisahkan dari ketakutan lama.",
      fallbackFocus: "Kembali pada fakta, sumber daya, dan satu langkah yang bisa kamu kendalikan."
    },
    anxiety: {
      key, title: "Sistem Tubuh yang Sedang Waspada",
      notices: "Catatan Hari Ini menyoroti kecemasan atau ketegangan yang membuat banyak hal terasa mendesak.",
      matters: "Tubuh perlu mendapat sinyal aman sebelum pikiran diminta mengambil keputusan.",
      fallbackFocus: "Tenangkan tubuh lebih dulu; tidak semua hal perlu dijawab sekarang."
    },
    grief: {
      key, title: "Duka yang Membutuhkan Ruang",
      notices: "Catatan Hari Ini menyoroti kehilangan atau emosi yang belum selesai dipeluk.",
      matters: "Duka tidak perlu dipercepat; ia perlu ditemani dengan kapasitas yang cukup.",
      fallbackFocus: "Berikan ruang pada yang hilang tanpa meninggalkan dirimu sendiri."
    },
    low_energy: {
      key, title: "Energi Tubuh yang Sedang Rendah",
      notices: "Catatan Hari Ini menyoroti keterbatasan tenaga dan kebutuhan pemulihan.",
      matters: "Praktik yang tepat hari ini harus menjaga energi, bukan menambah target.",
      fallbackFocus: "Pulihkan tubuh sebelum meminta lebih banyak darinya."
    },
    over_responsibility: {
      key, title: "Terlalu Banyak Hal yang Kamu Pikul",
      notices: "Bhumi melihat belakangan ini kamu cenderung mengambil peran untuk memikul segalanya sendirian.",
      matters: "Hari ini hal itu menjadi lebih penting untuk disadari karena tenagamu sebenarnya sedang butuh ruang untuk pulang pada kebutuhanmu sendiri.",
      fallbackFocus: "Tidak semua hal harus kamu pikul sendiri hari ini."
    },
    emotional_fatigue: {
      key, title: "Rasa Capek yang Sudah Lama Ditahan",
      notices: "Bhumi merasakan ada kelelahan emosional yang membuat hal-hal biasa terasa lebih berat bagi jiwamu.",
      matters: "Hari ini kamu tidak butuh jawaban atau rencana besar, yang kamu butuhkan hanyalah izin untuk tidak menuntut apa pun dari dirimu sendiri.",
      fallbackFocus: "Kamu boleh berhenti sejenak tanpa harus menjelaskan apa pun."
    },
    lack_of_clarity: {
      key, title: "Rasa Bingung Tentang Apa yang Kamu Butuhkan",
      notices: "Bhumi memperhatikan ada kabut tipis di batinmu yang membuat apa yang kamu inginkan terasa menjauh.",
      matters: "Terlalu cepat mencari jawaban justru akan membuatmu makin lelah. Hari ini adalah waktu untuk sekadar mendengarkan tanpa harus menyimpulkan.",
      fallbackFocus: "Dengarkan suara tubuhmu di balik keraguan pikiran."
    },
    fear_of_disappointing: {
      key, title: "Rasa Takut Membuat Orang Lain Kecewa",
      notices: "Bhumi melihat bayangan rasa tidak enak hati yang sering membuatmu mendahulukan kenyamanan orang lain di atas kesehatanmu.",
      matters: "Ketakutan ini dapat membuat suaramu sendiri tenggelam. Hari ini kita akan memberi ruang agar kejujuranmu dapat bernapas kembali.",
      fallbackFocus: "Kamu boleh berkata tidak untuk menjaga dirimu tetap utuh."
    },
    difficulty_resting: {
      key, title: "Sulit Beristirahat Tanpa Merasa Bersalah",
      notices: "Bhumi melihat tubuhmu sudah meminta jeda, namun pikiranmu masih berusaha mencari alasan agar tetap merasa berguna.",
      matters: "Rasa bersalah saat istirahat adalah tanda bahwa jiwamu butuh diingatkan kembali tentang nilainya yang tidak bergantung pada produktivitas.",
      fallbackFocus: "Istirahatmu adalah investasi bagi jiwamu, bukan kerugian."
    },
    need_for_boundaries: {
      key, title: "Batas yang Sudah Lama Ingin Kamu Sampaikan",
      notices: "Bhumi merasakan ada ketidaknyamanan yang muncul karena sesuatu telah mengambil terlalu banyak ruang dalam hidupmu.",
      matters: "Jika batas tidak dinyatakan, energimu akan terus terkuras tanpa henti. Hari ini kita akan mulai mengenali kembali garis amanmu.",
      fallbackFocus: "Sadari di mana kepedulianmu berubah menjadi pengorbanan."
    },
    achievement_worth: {
      key, title: "Rasa Baru Cukup Setelah Sesuatu Selesai",
      notices: "Bhumi melihat dorongan untuk terus membuktikan diri melalui hasil yang sering kali membuatmu lupa menghargai proses.",
      matters: "Mengukur nilai diri dari angka atau pencapaian akan membuatmu selalu merasa kurang. Hari ini kita akan mencari rasa cukup di dalam keberadaanmu.",
      fallbackFocus: "Rayakan satu langkah kecilmu tanpa memikirkan garis finis."
    },
    overthinking: {
      key, title: "Terlalu Lama Memikirkan Semuanya Sendirian",
      notices: "Bhumi melihat energi yang terlalu banyak menumpuk di kepala, membuat pikiranmu berputar dalam simulasi yang melelahkan.",
      matters: "Analisis tidak selalu membawa ketenangan. Hari ini kamu butuh untuk turun kembali ke tubuh dan merasakan momen yang nyata.",
      fallbackFocus: "Biarkan pikiranmu beristirahat dan biarkan tubuhmu memimpin."
    },
    direction_confusion: {
      key, title: "Bingung Memilih Arah",
      notices: "Bhumi memperhatikan ada banyak kemungkinan di depanmu yang membuatmu sulit menentukan mana yang harus didahulukan.",
      matters: "Masalahnya bukan kurang pilihan, tapi belum adanya satu suara yang cukup jujur untuk diikuti. Hari ini kita akan menyederhanakan perhatianmu.",
      fallbackFocus: "Fokuslah pada satu hal yang membuat hatimu merasa paling tenang."
    },
    disconnection: {
      key, title: "Terlalu Jauh dari Kebutuhan Sendiri",
      notices: "Bhumi merasakan adanya jarak antara apa yang sedang kamu lakukan dan apa yang sebenarnya jiwamu inginkan.",
      matters: "Terus bergerak dalam mode otomatis akan membuatmu kehilangan kontak dengan diri sendiri. Hari ini kita akan kembali menyapa batinmu.",
      fallbackFocus: "Kembalilah pulang pada kebutuhan yang selama ini kamu kesampingkan."
    },
  };
  return issues[key] || issues.difficulty_resting;
}

function humanFocus(raw: string | null | undefined, fallback: string): string {
  const firstSentence = raw?.split(/[.!?]/).map((part) => part.trim()).find(Boolean);
  const candidate = firstSentence && firstSentence !== "." ? `${firstSentence}.` : fallback;
  return candidate.trim() && candidate.trim() !== "." ? candidate : "Ambil satu langkah lembut yang menjaga dirimu tetap utuh hari ini.";
}

function catatanDominantIssue(guidance: DailyGuidance | null): string | null {
  if (guidance?.dominantIssue?.key) return guidance.dominantIssue.key;
  const text = [
    guidance?.dailyNoteText,
    guidance?.categories?.love?.insight,
    guidance?.categories?.love?.reason,
    guidance?.categories?.finance?.insight,
    guidance?.categories?.finance?.reason,
    guidance?.categories?.challenges?.insight,
    guidance?.categories?.challenges?.reason,
  ].filter(Boolean).join(" ").toLowerCase();
  if (/love block|hambatan cinta|kedekatan|takut dicintai|relasi/.test(text)) return "love_block";
  if (/inner child|anak batin|masa kecil|diri kecil/.test(text)) return "inner_child";
  if (/money block|hambatan uang|finansial|keuangan|kelangkaan/.test(text)) return "money_block";
  if (/cemas|kecemasan|anxiety|gelisah|tegang/.test(text)) return "anxiety";
  if (/duka|kehilangan|grief|berkabung/.test(text)) return "grief";
  if (/kelelahan|energi rendah|low energy|burnout|butuh istirahat/.test(text)) return "low_energy";
  if (/terlalu banyak memikul|tanggung jawab|beban orang|batas/.test(text)) return "over_responsibility";
  return null;
}

function deriveCurrentIssue(
  state: DailyState | null,
  navigator: NavigatorState | null,
  meaning: {
    shadow?: {
      sabotage?: { medium?: string };
      triggers?: { medium?: string };
      moneyBlock?: { medium?: string };
      loveBlock?: { medium?: string };
    };
    relationships?: { boundaries?: { medium?: string } };
  } | null
): CurrentIssue {
  const metrics = state?.wellnessSnapshot?.metrics;
  const mood = state?.moodLevel ?? metrics?.emotion;
  const energy = metrics?.energy;
  const mode = navigator?.mode;
  const profileText = [
    meaning?.shadow?.sabotage?.medium,
    meaning?.shadow?.triggers?.medium,
    meaning?.shadow?.moneyBlock?.medium,
    meaning?.shadow?.loveBlock?.medium,
    meaning?.relationships?.boundaries?.medium,
  ].filter(Boolean).join(" ").toLowerCase();

  if (/memberi terlalu banyak|mengorbank|menolong|mengurus|beban orang|bertanggung jawab atas/.test(profileText)) return issueNarrative("over_responsibility");
  if (/mengecewakan|penolakan|ditinggalkan|tidak disukai/.test(profileText)) return issueNarrative("fear_of_disappointing");
  if (/batas|sulit berkata tidak|kehilangan diri/.test(profileText)) return issueNarrative("need_for_boundaries");
  if (/nilai diri|membuktikan|layak|pengakuan|validasi|pencapaian/.test(profileText)) return issueNarrative("achievement_worth");
  if (mode === "RECOVERY" || (energy ?? 10) <= 4 || (mood ?? 10) <= 4) return issueNarrative("emotional_fatigue");
  if (mode === "REFLECTION") return issueNarrative("overthinking");
  if (mode === "GROWTH") return issueNarrative("direction_confusion");
  return issueNarrative("difficulty_resting");
}

export default function InnerworkCoachPage() {
  const auth = useAuth();

  const [navigatorState, setNavigatorState] = useState<NavigatorState | null>(null);
  const [dailyGuidance, setDailyGuidance] = useState<DailyGuidance | null>(null);
  const [currentIssue, setCurrentIssue] = useState<CurrentIssue | null>(null);
  const [practice, setPractice] = useState<InnerworkPractice | null>(null);
  const [supportPractices, setSupportPractices] = useState<InnerworkSupportPractice[]>([]);
  const [sourceSignals, setSourceSignals] = useState<string[]>([]);
  const [localDateKey, setLocalDateKey] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  const [reflectionResponse, setReflectionResponse] = useState("");
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionError, setReflectionError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("open_innerwork", auth?.user?.uid);

    const fetchData = async () => {
      if (!auth?.user?.uid) {
        setLoading(false);
        return;
      }
      const uid = auth.user.uid;
      try {
        const [profile, blueprint] = await Promise.all([
          storageProvider.getUserProfile(),
          storageProvider.getUserBlueprint()
        ]);

        const timezone = profile?.timezone || "UTC";
        const today = getLocalDateKey(new Date(), timezone);
        setLocalDateKey(today);
        void innerworkReflectionRepository.retryPending(uid, today);

        const [dg, state, nav, recentResult, dailyMemoryResult] = await Promise.all([
          dailyGuidanceRepository.getDailyGuidance(uid, today),
          dailyStateRepository.getDailyState(uid, today),
          wellnessNavigatorRepository.getNavigatorState(uid),
          journeyRepository.getRecentDailyStates(uid, 7)
            .then((entries) => ({ entries, failed: false }))
            .catch((error) => {
              console.warn("[INNERWORK_JOURNEY_READ_FAILED]", {
                uid,
                date: today,
                error,
              });
              return { entries: [] as DailyState[], failed: true };
            }),
          journeyRepository.getDailyMemory(uid)
            .then((memory) => ({ memory, failed: false }))
            .catch((error) => {
              console.warn("[JOURNEY_DAILY_MEMORY_READ_FAILED]", { uid, date: today, error });
              const memory: JourneyDailyMemory = { yesterday: null, last7Days: [], last30Days: [] };
              return { memory, failed: true };
            }),
        ]);
        const recent = recentResult.entries;

        setDailyGuidance(dg);
        setNavigatorState(nav);
        const meaning = blueprint
          ? HumanMeaningService.generate(CanonicalTranslatorService.translate(blueprint as unknown as Blueprint))
          : null;
        const catatanIssue = catatanDominantIssue(dg);
        const derivedIssue = catatanIssue
          ? issueNarrative(catatanIssue)
          : deriveCurrentIssue(state, nav, meaning);
        setCurrentIssue(derivedIssue);
        const profileSignals = [
          meaning?.shadow?.sabotage?.medium,
          meaning?.shadow?.triggers?.medium,
          meaning?.relationships?.boundaries?.medium,
        ].filter((value): value is string => Boolean(value));
        const astroSignals = [
          dg?.astrologyToday,
          ...(dg?.astroHouseActivations ?? []).slice(0, 2).map((item) => JSON.stringify(item)),
          `moonPhase:${astroAwarenessEngine.getAwarenessContext(new Date()).currentMoonPhase.label}`,
          ...astroAwarenessEngine.getAwarenessContext(new Date()).activeAwarenessEvents
            .slice(0, 3)
            .map((event) => `${event.type}:${event.title}`),
        ].filter((value): value is string => Boolean(value));
        const gaiaSignals = profile?.gaiaProfile
          ? Object.values(profile.gaiaProfile.sections)
            .flat()
            .sort((left, right) => right.meta.confidence - left.meta.confidence)
            .slice(0, 4)
            .map((insight) => `${insight.theme}:${insight.title}:${insight.summary}`)
          : [];
        const wellnessSignals = [
          nav?.mode ? `navigator:${nav.mode}` : "",
          state?.emotionalWord ? `emotion:${state.emotionalWord}` : "",
          state?.nervousSystemState ? `nervousSystem:${state.nervousSystemState}` : "",
          state?.wellnessSnapshot?.metrics?.energy != null ? `energy:${state.wellnessSnapshot.metrics.energy}` : "",
        ].filter(Boolean);
        const journeySignals = recent
          .filter((entry) => entry.innerworkJourney?.completed)
          .slice(0, 3)
          .map((entry) => `${entry.date}:${entry.innerworkJourney?.practiceId}`);
        const structuredContext = {
          issueSource: profileSignals.length > 0 ? "profileMeaning" : state?.wellnessSnapshot ? "wellnessState" : "navigatorMode",
          profileSignals,
          astroSignals,
          wellnessSignals,
          journeySignals,
        };
        const dailyDecision = buildInnerworkDailyDecision({
          dominantIssue: derivedIssue.key,
          localDateKey: today,
          navigatorMode: nav?.mode,
          wellnessState: {
            energy: state?.wellnessSnapshot?.metrics?.energy,
            mood: state?.moodLevel ?? state?.wellnessSnapshot?.metrics?.emotion,
            nervousSystemState: state?.nervousSystemState,
          },
          dailyScan: {
            emotionalWord: state?.emotionalWord,
            dailyNoteText: dg?.dailyNoteText,
          },
          profileMeaning: [...profileSignals, ...gaiaSignals],
          astroContext: astroSignals,
          journeyHistory: dailyMemoryResult.memory.last30Days.length
            ? dailyMemoryResult.memory.last30Days.map((entry) => ({
                date: entry.appDate,
                practiceId: entry.innerworkCompletion.actualPracticeId || entry.innerworkRecommendation?.practiceId,
                innerworkType: entry.innerworkCompletion.actualPracticeType || entry.innerworkRecommendation?.practiceType,
                dominantIssue: entry.dominantIssue,
                completed: entry.innerworkCompletion.completed,
                skipped: entry.innerworkCompletion.skipped,
                reflectionResult: entry.innerworkCompletion.reflectionResult,
              }))
            : recent.map((entry) => ({
                date: entry.date,
                practiceId: entry.innerworkJourney?.practiceId,
                innerworkType: entry.innerworkJourney?.innerworkType,
                dominantIssue: entry.innerworkJourney?.dominantIssue,
                completed: entry.innerworkJourney?.completed,
                skipped: false,
                reflectionResult: entry.innerworkJourney?.reflectionResult,
              })),
          journeyLearning: {
            weeklyLearning: dailyMemoryResult.memory.weeklyLearning,
            monthlyLearning: dailyMemoryResult.memory.monthlyLearning,
            coachMemory: dailyMemoryResult.memory.coachMemory,
            growthNarrative: dailyMemoryResult.memory.growthNarrative,
            practiceEffectiveness: dailyMemoryResult.memory.practiceInsights,
          },
        });
        const mappedPractice = dailyDecision.mainPractice;
        setPractice(mappedPractice);
        setSupportPractices(dailyDecision.supportPractices);
        setSourceSignals([
          `issueSource:${dg?.dominantIssue ? "catatan" : structuredContext.issueSource}`,
          `journeyRead:${recentResult.failed ? "failed-safe-fallback" : "success"}`,
          `dailyMemoryRead:${dailyMemoryResult.failed ? "failed-safe-fallback" : "success"}`,
          ...mappedPractice.sourceSignals,
        ]);
        await journeyRepository.updateDailyRecord(uid, today, {
          dominantIssue: mappedPractice.issueKey,
          issueCategory: mappedPractice.issueCategory,
          navigatorMode: mappedPractice.navigatorMode,
          wellnessState: {
            energy: state?.wellnessSnapshot?.metrics?.energy ?? null,
            mood: state?.moodLevel ?? state?.wellnessSnapshot?.metrics?.emotion ?? null,
            nervousSystemState: state?.nervousSystemState ?? "",
          },
          dailyScanCompleted: Boolean(state?.wellnessSnapshot?.checkInCompleted),
          dailyScanSummary: state?.emotionalWord ? `Emosi hari ini: ${state.emotionalWord}.` : "",
          catatanSummary: dg?.dailyNoteText || "",
          catatanMainDirection: dg?.categories?.advice?.advice || dg?.groundedAction || "",
          catatanChallenge: dg?.categories?.challenges?.insight || dg?.categories?.challenges?.reason || "",
          catatanOpportunity: dg?.categories?.opportunities?.insight || dg?.categories?.opportunities?.reason || "",
          astroSummary: astroSignals.join(" | "),
          astroEvents: astroSignals,
          profileSignals: [...profileSignals, ...gaiaSignals],
          innerworkRecommendation: {
            practiceId: mappedPractice.practiceId,
            practiceType: mappedPractice.type,
            practiceTitle: mappedPractice.title,
            durationMinutes: mappedPractice.durationMinutes,
            intensity: mappedPractice.intensity,
            reason: mappedPractice.whyThisPractice,
            sourceSignals: mappedPractice.sourceSignals,
          },
          sourceConfidence: dg?.dominantIssue ? 0.95 : catatanIssue ? 0.85 : 0.7,
        }).catch((error) => console.warn("[JOURNEY_INNERWORK_RECOMMENDATION_UPDATE_FAILED]", error));

        if (state?.innerworkDone) {
          setPracticeStarted(true);
          setPracticeCompleted(true);
          setReflectionSubmitted(true);
          const savedResult = state.innerworkJourney?.reflectionResult || state.innerworkReflection;
          const responses: Record<string, string> = {
            "Lebih Tenang": "Terima kasih sudah memberi ruang untuk dirimu hari ini. Tidak semua perubahan harus besar untuk berarti.",
            "Sama Saja": "Tidak apa-apa. Kadang praktik bukan langsung mengubah keadaan, tetapi membantu kita melihatnya dengan lebih jernih.",
            "Sedikit Lebih Berat": "Terima kasih sudah jujur. Mungkin ada sesuatu yang sedang meminta perhatian lebih dalam. Bhumi akan mengingat ini.",
            "Belum Yakin": "Tidak semua hal perlu diputuskan sekarang. Biarkan pengalaman ini tinggal sebentar sebelum dinilai.",
          };
          setReflectionResponse(
            savedResult
              ? responses[savedResult] || `Refleksi terakhir tersimpan: ${savedResult}.`
              : "Praktikmu sudah tersimpan. Terima kasih sudah memberi ruang untuk dirimu hari ini.",
          );
        }
      } catch (err) {
        console.error("[INNERWORK_DATA_FETCH_ERROR]", err);
        const fallbackIssue = issueNarrative("difficulty_resting");
        const fallbackContext = {
          issueSource: "safeFallback",
          profileSignals: [],
          astroSignals: [],
          wellnessSignals: ["navigator:REFLECTION"],
          journeySignals: [],
        };
        setCurrentIssue(fallbackIssue);
        const fallbackPractice = mapInnerworkPractice({
          dominantIssue: fallbackIssue.key,
          localDateKey: getLocalDateKey(new Date()),
          navigatorMode: "REFLECTION",
          journeyHistory: [],
        });
        setPractice(fallbackPractice);
        setSourceSignals([`issueSource:${fallbackContext.issueSource}`, ...fallbackPractice.sourceSignals]);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.authStateResolved) {
      fetchData();
    }
  }, [auth]);

  const handleReflection = async (state: string) => {
    if (reflectionSaving) return;
    if (!auth?.user?.uid || !practice) {
      setReflectionError("Praktik belum siap disimpan. Muat ulang halaman lalu coba lagi.");
      return;
    }
    const dateKey = localDateKey || dailyGuidance?.localDateKey || dailyGuidance?.date;
    if (!dateKey) {
      console.error("[INNERWORK_SAVE_DATE_MISSING]");
      setReflectionError("Tanggal praktik belum tersedia. Muat ulang halaman lalu coba lagi.");
      return;
    }
    const createdAt = new Date().toISOString();
    const responses: Record<string, string> = {
      "Lebih Tenang": "Terima kasih sudah memberi ruang untuk dirimu hari ini. Tidak semua perubahan harus besar untuk berarti.",
      "Sama Saja": "Tidak apa-apa. Kadang praktik bukan langsung mengubah keadaan, tetapi membantu kita melihatnya dengan lebih jernih.",
      "Sedikit Lebih Berat": "Terima kasih sudah jujur. Mungkin ada sesuatu yang sedang meminta perhatian lebih dalam. Bhumi akan mengingat ini.",
      "Belum Yakin": "Tidak semua hal perlu diputuskan sekarang. Biarkan pengalaman ini tinggal sebentar sebelum dinilai."
    };
    const response = responses[state] || "Terima kasih atas refleksimu.";
    setReflectionSaving(true);
    setReflectionError("");
    try {
      const saveResult = await innerworkReflectionRepository.saveZoneAReflection({
        uid: auth.user.uid,
        date: dateKey,
        dominantIssue: practice.issueKey,
        issueCategory: practice.issueCategory,
        navigatorMode: practice.navigatorMode,
        practiceId: practice.practiceId,
        practiceType: practice.type,
        practiceTitle: practice.title,
        durationMinutes: practice.durationMinutes,
        reflectionResult: state,
        reflectionResponse: response,
        sourceSignals,
        createdAt,
      });
      setReflectionResponse(
        saveResult.journeySynced
          ? response
          : `${response} Catatanmu sudah tersimpan dan akan diselaraskan ke Journey saat koneksi siap.`,
      );
      setReflectionSubmitted(true);
      trackEvent("practice_completed", auth.user.uid);
    } catch (err) {
      console.error("[ZONE_A_REFLECTION_SAVE_FAILED]", err);
      setReflectionError("Refleksimu belum berhasil disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setReflectionSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FCFAF5] flex items-center justify-center p-8">
      <p className="font-serif italic text-[#4F5E52]">Mempersiapkan panduan...</p>
    </div>
  );

  const mode = navigatorState?.mode || "REFLECTION";

  const focusStatement = humanFocus(dailyGuidance?.dailyNoteText, currentIssue?.fallbackFocus || "Amati ritmemu hari ini dengan lembut.");

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />

        <div className="mx-auto max-w-lg">
          <BhumiPageHeader className="mb-8" />

          {/* ZONE A: RECOMMENDED TODAY */}
          <section className="space-y-8">
            <header className="text-center">
              <p className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-2">Recommended Today</p>
              <h1 className="text-3xl font-serif text-[#4F5E52] mb-4">
                🎯 Fokus Hari Ini
              </h1>
              <div className="bhumi-card bg-white p-6 border-none shadow-sm ring-1 ring-black/5">
                 <p className="text-lg font-serif text-[#4F5E52] leading-relaxed italic">
                   "{focusStatement}"
                 </p>
              </div>
            </header>

            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={18} className="text-[#9BB89A]" />
                <h2 className="text-xs font-bold text-[#4F5E52] uppercase tracking-wider">💡 Kenapa Bhumi Mengajakmu?</h2>
              </div>
              <div className="bg-white/50 p-6 rounded-[2rem] border border-[#E8E9E5] space-y-4">
                <p className="text-sm text-[#526053] leading-relaxed">
                  {currentIssue?.notices}
                </p>
                <p className="text-sm text-[#526053] leading-relaxed font-medium">
                  {currentIssue?.matters}
                </p>
                <p className="text-sm text-[#526053] leading-relaxed italic border-l-2 border-[#9BB89A] pl-4">
                  Karena itulah Bhumi mengajakmu kembali ke latihan sederhana yang membantu batinmu menemukan ritme yang lebih stabil.
                </p>
              </div>
            </section>

            {/* PRIMARY PRACTICE CARD */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-amber-500" />
                <h2 className="text-xs font-bold text-[#4F5E52] uppercase tracking-wider">🌿 Praktik Hari Ini</h2>
              </div>

              {practice ? (
                <div className="bhumi-card bg-white p-7 border-2 border-amber-100 shadow-lg shadow-amber-900/5 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-bold text-[#4F5E52]">{practice.title}</h3>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#9BB89A]">{practice.type}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full text-amber-700 text-[10px] font-bold">
                      <Timer size={12} />
                      {practice.durationMinutes} Menit
                    </div>
                  </div>

                  <p className="text-sm text-[#526053] leading-relaxed">
                    {practice.description}
                  </p>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-wider flex items-center gap-2">
                      <Info size={12} /> Manfaat Praktik
                    </p>
                    <ul className="grid grid-cols-1 gap-2">
                      {practice.expectedBenefit.map((b: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-[11px] text-[#7B8776]">
                          <div className="w-1 h-1 rounded-full bg-[#9BB89A]" /> {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!practiceStarted ? (
                    <button
                      onClick={() => {
                        setPracticeStarted(true);
                        trackEvent("open_innerwork", auth?.user?.uid);
                      }}
                      className="bhumi-button w-full block text-center py-5 text-lg"
                    >
                      Mulai Sekarang
                    </button>
                  ) : !practiceCompleted ? (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                      <div className="p-5 bg-[#FCFAF5] rounded-3xl border border-amber-100/50">
                        <ol className="space-y-3 text-xs text-[#4F5E52] leading-relaxed">
                          {practice.instructions.map((instruction, index) => (
                            <li key={instruction} className="flex gap-3">
                              <span className="font-bold text-amber-700">{index + 1}.</span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <button
                        onClick={() => setPracticeCompleted(true)}
                        className="bhumi-button w-full bg-[#4F5E52] hover:bg-[#3D4A40] py-5 text-lg"
                      >
                        Saya Sudah Melakukan Ini
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm justify-center py-3 bg-green-50 rounded-2xl">
                      <CheckCircle2 size={18} />
                      Praktik Utama Selesai
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-[#E8E9E5]">
                  <p className="text-sm text-[#7B8776]">Ambil jeda lembut untuk kembali pada napas dan kebutuhanmu hari ini.</p>
                </div>
              )}
            </section>

            {/* SUPPORTING PRACTICES (Hidden for RECOVERY or if practice not completed) */}
            {mode !== 'RECOVERY' && practiceCompleted && supportPractices.length > 0 && (
              <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-xs font-bold text-[#4F5E52] uppercase tracking-wider">🌱 Praktik Pendukung</h2>
                <div className="grid grid-cols-1 gap-3">
                  {supportPractices.map((rec) => (
                    <Link
                      key={rec.category}
                      href={rec.category === "audio"
                        ? rec.href
                        : buildZoneBHref(rec.href, {
                            issue: rec.issueKey || practice?.issueKey || currentIssue?.key || "difficulty_resting",
                            practiceId: rec.practiceId,
                            practiceCategory: rec.category as ZoneBPracticeCategory,
                            sourceTheme: rec.sourceTheme || practice?.issueCategory || currentIssue?.title || "body recovery",
                            title: rec.title,
                            durationMinutes: rec.durationMinutes,
                          })}
                      className="bhumi-card p-4 bg-white border border-[#E8E9E5] flex items-center gap-4 transition-transform active:scale-95 hover:shadow-md"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#FCFAF5] flex items-center justify-center text-[#4F5E52]">
                        {rec.category === 'yoga' ? <Flower2 size={24}/> : rec.category === 'audio' ? <Music size={24}/> : rec.category === 'journaling' ? <BookOpen size={24}/> : <Brain size={24}/>}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#4F5E52]">{rec.title}</h4>
                        <p className="text-[10px] text-[#7B8776] line-clamp-1">{rec.reason}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* REFLECTION AFTER PRACTICE */}
            {practiceCompleted && (
              reflectionSubmitted ? (
                <div className="bhumi-card bg-[#F1F3F0] border-none p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Heart size={32} className="text-red-400 fill-red-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-[#4F5E52]">Progres Dicatat</h3>
                    <p className="text-sm text-[#526053] leading-relaxed italic px-4">
                      "{reflectionResponse}"
                    </p>
                  </div>
                </div>
              ) : (
                <section className="pt-10 border-t border-[#E8E9E5] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <h2 className="text-center text-sm font-serif italic text-[#4F5E52] mb-8">🌙 Setelah Praktik: Bagaimana keadaanmu sekarang?</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {["Lebih Tenang", "Sama Saja", "Sedikit Lebih Berat", "Belum Yakin"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleReflection(opt)}
                        disabled={reflectionSaving}
                        className="p-5 bg-white border border-[#E8E9E5] rounded-[1.5rem] text-xs font-semibold text-[#4F5E52] active:bg-[#4F5E52] active:text-white hover:border-[#4F5E52]/30 transition-all shadow-sm disabled:cursor-wait disabled:opacity-60"
                      >
                        {reflectionSaving ? "Menyimpan..." : opt}
                      </button>
                    ))}
                  </div>
                  {reflectionError && (
                    <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-center text-xs font-medium text-red-700">
                      {reflectionError}
                    </p>
                  )}
                </section>
              )
            )}

            {/* EXPLORATION (GROWTH ONLY) */}
            {mode === 'GROWTH' && practiceCompleted && (
               <section className="space-y-4 pt-4">
                 <h2 className="text-xs font-bold text-[#4F5E52] uppercase tracking-wider">🔍 Eksplorasi Lanjut</h2>
                 <div className="space-y-3">
                   <p className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest px-1">Ingin mendalami topik ini lebih jauh?</p>
                   <div className="p-5 bg-white rounded-[2rem] border border-[#E8E9E5] flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                       <Music size={18} />
                     </div>
                     <p className="text-xs italic text-[#4F5E52] leading-relaxed">
                       Cari di YouTube: <br/>
                       <span className="font-bold not-italic">"Cara menghadapi {currentIssue?.title.toLowerCase()}"</span>
                     </p>
                   </div>
                 </div>
               </section>
            )}
          </section>

          {/* ZONE B: JELAJAHI INNERWORK (ACCORDION) */}
          <section className="mt-20">
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className="w-full flex items-center justify-between p-6 bg-white border border-[#E8E9E5] rounded-[2.5rem] shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-[#9BB89A]" />
                <span className="font-serif text-lg font-bold text-[#4F5E52]">Jelajahi Innerwork</span>
              </div>
              {showLibrary ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {showLibrary && (
              <div className="mt-6 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {[
                  { id: "journaling", icon: BookOpen, label: "Journaling", color: "bg-blue-50 text-blue-600" },
                  { id: "meditation", icon: Brain, label: "Meditasi", color: "bg-purple-50 text-purple-600" },
                  { id: "audio-healing", icon: Music, label: "Audio Healing", color: "bg-indigo-50 text-indigo-600" },
                  { id: "manifestasi", icon: Sparkles, label: "Manifestasi", color: "bg-amber-50 text-amber-600" },
                  { id: "workout", icon: Dumbbell, label: "Workout", color: "bg-orange-50 text-orange-600" },
                  { id: "yoga", icon: Flower2, label: "Yoga", color: "bg-green-50 text-green-600" },
                  { id: "herbal", icon: Utensils, label: "Herbal", color: "bg-emerald-50 text-emerald-600" },
                ].map((item) => (
                  <Link
                    key={item.id}
                    href={(() => {
                      const category = item.id === "audio-healing" ? "audio" : item.id;
                      const rec = supportPractices.find((entry) => entry.category === category);
                      if (!rec || rec.category === "audio") return `/innerwork/${item.id}`;
                      return buildZoneBHref(`/innerwork/${item.id}`, {
                        issue: rec.issueKey || practice?.issueKey || currentIssue?.key || "difficulty_resting",
                        practiceId: rec.practiceId,
                        practiceCategory: rec.category as ZoneBPracticeCategory,
                        sourceTheme: rec.sourceTheme || practice?.issueCategory || currentIssue?.title || "body recovery",
                        title: rec.title,
                        durationMinutes: rec.durationMinutes,
                      });
                    })()}
                    className="bhumi-card p-6 flex flex-col items-center justify-center text-center bg-white hover:shadow-lg hover:-translate-y-1 transition-all active:scale-95"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4 shadow-inner`}>
                      <item.icon size={24} />
                    </div>
                    <span className="text-xs font-bold text-[#4F5E52]">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <footer className="mt-20 text-center opacity-40">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9AA394]">
              Dibimbing oleh Bhumi • Satu langkah hari ini
            </p>
          </footer>
        </div>
      </main>
    </ProtectedRoute>
  );
}
