"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Compass } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import type { Blueprint } from "@/lib/types/blueprint";
import type { HumanDesignChart } from "@/lib/humandesign/types";
import { getHdState, type HdStateResult } from "@/lib/humandesign/hdState";
import { HumanDesignBodygraphLite } from "@/components/blueprint/HumanDesignBodygraphLite";
import { executeHumanMeaningRuntime } from "@/lib/humanMeaningRuntime/publicInterface";
import { buildHumanDesignHumanMeaning } from "@/lib/humandesign/presentation";
import type { HumanDesignHumanMeaning } from "@/lib/humandesign/presentation";

function getStatusCopy(state: HdStateResult, hasBirthData: boolean): { title: string; body: string } {
  switch (state.state) {
    case "CANONICAL":
      return { title: "Human Design siap", body: "Chart Human Design sudah terverifikasi dan siap dibaca." };
    case "FALLBACK_LABELED":
      if (state.provenance === "local_fallback") {
        return {
          title: "Perhitungan belum berhasil",
          body: "Perhitungan sebelumnya belum menghasilkan chart lengkap. Hasil sementara tidak ditampilkan sebagai pembacaan final dan akan dicoba lagi.",
        };
      }
      return {
        title: "Data historis, perlu kalkulasi ulang",
        body: "Tipe yang tersimpan dapat ditampilkan sebagai data historis, tetapi chart lengkap menunggu kalkulasi canonical.",
      };
    case "PENDING":
      return hasBirthData
        ? { title: "Perhitungan sedang berlangsung", body: "Peta Human Design sedang diproses. Chart lengkap akan muncul setelah kalkulasi selesai." }
        : { title: "Data kelahiran belum lengkap", body: "Lengkapi tanggal, waktu, zona waktu, dan lokasi kelahiran untuk menyiapkan chart." };
    case "RETRIABLE_ERROR":
      return { title: "Kalkulasi perlu dicoba ulang", body: "Layanan Human Design belum tersedia saat ini. Coba lagi nanti; chart perkiraan tidak ditampilkan sebagai hasil final." };
    case "TERMINAL_ERROR":
      return { title: "Human Design belum tersedia", body: "Data Human Design belum dapat dihitung. Periksa kembali data kelahiranmu sebelum mencoba lagi." };
  }
}

function buildBhumiSummary(reading: HumanDesignHumanMeaning): string[] {
  const authorityText = `${reading.authority.title} ${reading.authority.paragraphs.join(" ")}`.toLowerCase();
  const emotional = authorityText.includes("gelombang") || authorityText.includes("waktu");
  const profileHasStories = reading.profile.paragraphs.length > 0;
  const environmentHasStories = reading.variables.environment.trim().length > 0;

  return [
    "Ada ritme alami dalam dirimu yang terasa paling jujur ketika tidak dipaksa mengikuti kecepatan orang lain. Kamu bisa bergerak dengan penuh tenaga saat sesuatu benar-benar terasa hidup dan layak untuk dijalani. Dari sana, langkahmu menemukan bentuknya sendiri dengan cara yang luwes dan tetap membumi.",
    emotional
      ? "Untuk keputusan penting, beri dirimu ruang agar perasaan tidak perlu langsung menjadi jawaban. Setelah gelombang di dalam diri lebih tenang, biasanya ada kejelasan yang terasa sederhana. Kamu tidak perlu menjelaskan semuanya sekaligus untuk mempercayai arah yang sudah terasa benar."
      : "Untuk keputusan penting, tubuhmu sering memberi tanda yang lebih jujur daripada daftar pertimbangan yang panjang. Perhatikan rasa lapang atau berat yang muncul ketika sebuah pilihan benar-benar dibayangkan. Kejelasanmu tumbuh saat kamu memberi tempat pada sinyal kecil itu.",
    profileHasStories
      ? "Cara kamu belajar menjadi diri sendiri tumbuh melalui pengalaman yang benar-benar kamu jalani. Ada hal-hal yang baru terasa jelas setelah kamu melihatnya dari beberapa sisi dan membiarkan waktu ikut mengajarkan. Pengalaman itu perlahan menjadi kebijaksanaan yang bisa kamu bagikan dengan hangat."
      : "Cara kamu belajar menjadi diri sendiri tumbuh melalui pengalaman yang benar-benar kamu jalani. Tidak semua hal perlu dipahami sejak awal karena sebagian jawaban muncul setelah kamu memberi waktu pada prosesnya. Pelan-pelan, pengalaman itu menjadi kebijaksanaan yang terasa milikmu.",
    environmentHasStories
      ? "Kamu akan lebih mudah mendengar dirimu ketika berada di ruang yang memberi napas, bukan yang menuntutmu terus membuktikan diri. Perhatian pada tubuh, suasana sekitar, dan kebutuhan istirahat membantu tenagamu kembali utuh. Dari ruang yang tepat, hubungan dan pilihan terasa lebih selaras."
      : "Ruang yang memberi napas membantu kamu mendengar dirimu dengan lebih jernih. Perhatian pada tubuh, suasana sekitar, dan kebutuhan istirahat membuat tenagamu kembali utuh. Dari sana, hubungan dan pilihan terasa lebih selaras.",
  ];
}

function ExpandableExplanation({ value, dark = false }: { value: string; dark?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = value.split(/(?<=[.!?])\s+/).filter(Boolean);
  return (
    <div className="mt-3">
      {expanded && <div className="space-y-3">{paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`} className="text-sm leading-6 text-[#7B8776]">{paragraph}</p>)}</div>}
      <button type="button" onClick={() => setExpanded((current) => !current)} className={`inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4 ${dark ? "text-[#F5F1E8]" : "text-[#4F5E52]"}`}>
        {expanded ? "Tutup penjelasan" : "Lihat lebih selengkapnya"}
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    </div>
  );
}

export default function HumanDesignPage() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [hdState, setHdState] = useState<HdStateResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void storageProvider.getUserBlueprint().then((value) => {
      if (!active) return;
      const next = value as Blueprint | null;
      setBlueprint(next);
      setHdState(getHdState(next?.humanDesign));
    }).catch((error) => {
      if (!active) return;
      setLoadError(error instanceof Error ? error.message : "Gagal membaca blueprint.");
      setHdState(getHdState({ status: "error", calculationStatus: "error", type: null }));
    });
    return () => { active = false; };
  }, []);

  const hasBirthData = Boolean(blueprint?.input?.birthDate && blueprint?.input?.birthTime && blueprint?.input?.timezone);
  const chart = useMemo(
    () => hdState?.state === "CANONICAL" ? blueprint?.humanDesign as HumanDesignChart : null,
    [blueprint, hdState],
  );
  const statusCopy = hdState ? getStatusCopy(hdState, hasBirthData) : null;
  const runtime = useMemo(() => {
    if (!chart || !blueprint) return null;
    return executeHumanMeaningRuntime(blueprint);
  }, [blueprint, chart]);
  const presentation = useMemo(() => chart && runtime?.ok ? buildHumanDesignHumanMeaning(chart) : null, [chart, runtime]);

  const signature = chart?.type === "Projector" ? "Success" : chart?.type === "Manifestor" ? "Peace" : chart?.type === "Reflector" ? "Surprise" : "Satisfaction";
  const notSelf = chart?.type === "Projector" ? "Bitterness" : chart?.type === "Manifestor" ? "Anger" : chart?.type === "Reflector" ? "Disappointment" : "Frustration";
  const cards = chart ? [
    ["Type", chart.type, presentation?.type.paragraphs.join(" ")], ["Strategy", chart.strategy, presentation?.strategy.paragraphs.join(" ")], ["Authority", chart.authority, presentation?.authority.paragraphs.join(" ")], ["Profile", chart.profile, presentation?.profile.paragraphs.join(" ")],
    ["Definition", chart.definition, presentation?.definition.paragraphs.join(" ")], ["Signature", signature, presentation?.signature.paragraphs.join(" ")], ["Not-Self Theme", notSelf, presentation?.notSelf.paragraphs.join(" ")],
  ] as const : [];
  const centerEntries = presentation ? Object.keys(presentation.centers).sort().map((key) => [key, presentation.centers[key]] as const) : [];
  const channelEntries = presentation ? Object.keys(presentation.channels).sort().map((key) => [key, presentation.channels[key]] as const) : [];
  const gateEntries = presentation ? (chart?.gates || []).filter((gate, index, values) => values.indexOf(gate) === index).map((gate) => [gate, presentation.gates[gate] || ""] as const) : [];
  const variableEntries = presentation ? [["Digestion", presentation.variables.digestion], ["Cognition", presentation.variables.cognition], ["Environment", presentation.variables.environment], ["Motivation", presentation.variables.motivation], ["Perspective", presentation.variables.perspective]] as const : [];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>
          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white"><Compass size={25} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Human Design</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Desain Energimu</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">Mari mengenal cara alami dirimu bergerak, memilih, dan menemukan ruang yang terasa tepat.</p>
          </header>

          {!hdState && <p className="py-20 text-center text-sm text-[#7B8776]">Memuat blueprint...</p>}
          {hdState && hdState.state !== "CANONICAL" && statusCopy && (
            <section className="rounded-2xl border border-[#E9E4D9] bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9AA394]">Status Human Design</p>
              <h2 className="mt-2 font-serif text-2xl text-[#4F5E52]">{statusCopy.title}</h2>
              {hdState.state === "FALLBACK_LABELED" && hdState.provenance === "historical" && hdState.type && <p className="mt-3 text-sm font-semibold text-[#4F6658]">Tipe historis: {hdState.type}</p>}
              <p className="mt-3 text-sm leading-6 text-[#7B8776]">{statusCopy.body}</p>
              {loadError && <p className="mt-3 break-words text-xs text-rose-700">{loadError}</p>}
            </section>
          )}

          {hdState?.state === "CANONICAL" && chart && (
            <div className="space-y-6">
              <HumanDesignBodygraphLite humanDesign={chart} />
              <div className="grid gap-4 sm:grid-cols-2">
                {cards.map(([label, value, meaning]) => <div key={label} className="rounded-2xl border border-[#E9E4D9] bg-white p-5 shadow-sm"><h3 className="font-serif text-lg text-[#4F5E52]">{label}</h3><p className="mt-1 text-xl font-medium text-[#2C362F]">{value || "-"}</p><ExpandableExplanation value={meaning || "Cerita untuk bagian ini sedang disiapkan."} /></div>)}
              </div>
              <div className="rounded-2xl border border-[#E9E4D9] bg-white p-5 shadow-sm"><h3 className="font-serif text-xl text-[#4F5E52]">Centers</h3><p className="mt-2 text-sm text-[#7B8776]">Defined: {Object.entries(chart.centers || {}).filter(([, value]) => value === true).map(([key]) => key).join(", ") || "-"}</p><p className="mt-2 text-sm text-[#7B8776]">Open: {Object.entries(chart.centers || {}).filter(([, value]) => value === false).map(([key]) => key).join(", ") || "-"}</p></div>
              <div className="rounded-2xl border border-[#E9E4D9] bg-white p-5 shadow-sm">
                <h3 className="font-serif text-xl text-[#4F5E52]">Incarnation Cross</h3>
                <p className="mt-2 text-sm text-[#7B8776]">{chart.incarnationCross?.name || "-"}</p>
                <p className="mt-1 text-xs text-[#9AA394]">Beberapa tema yang sering menemanimu dalam perjalanan hidup.</p>
                {presentation?.incarnationCross.paragraphs && <ExpandableExplanation value={presentation.incarnationCross.paragraphs.join(" ")} />}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E9E4D9] bg-white p-5 shadow-sm">
                  <h3 className="font-serif text-xl text-[#4F5E52]">Gates</h3>
                  {gateEntries.length ? gateEntries.map(([gate, meaning]) => <div key={gate} className="mt-3"><p className="text-sm font-semibold text-[#4F5E52]">Gate {gate}</p><ExpandableExplanation value={meaning || "Cerita untuk gate ini sedang disiapkan."} /></div>) : <p className="mt-2 text-sm text-[#7B8776]">Belum ada gate yang bisa diceritakan.</p>}
                </div>
                <div className="rounded-2xl border border-[#E9E4D9] bg-white p-5 shadow-sm">
                  <h3 className="font-serif text-xl text-[#4F5E52]">Channels</h3>
                  {channelEntries.length ? channelEntries.map(([channel, meaning]) => <div key={channel} className="mt-3"><p className="text-sm font-semibold text-[#4F5E52]">Channel {channel}</p><ExpandableExplanation value={meaning} /></div>) : <p className="mt-2 text-sm text-[#7B8776]">Belum ada channel yang bisa diceritakan.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E9E4D9] bg-white p-5 shadow-sm">
                <h3 className="font-serif text-xl text-[#4F5E52]">Centers</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {centerEntries.map(([key, meaning]) => <div key={key} className="sm:col-span-2"><p className="text-sm font-semibold text-[#4F5E52]">{key} <span className="text-xs font-normal text-[#9AA394]">({chart.centers[key as keyof typeof chart.centers] === true ? "Defined" : "Open"})</span></p><ExpandableExplanation value={meaning} /></div>)}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E9E4D9] bg-[#FAFAFA] p-5 shadow-sm">
                <h3 className="font-serif text-xl text-[#4F5E52]">Variables</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {variableEntries.map(([label, value]) => <div key={label}><p className="text-xs font-bold uppercase tracking-wider text-[#7B8776]">{label}</p><ExpandableExplanation value={value} /></div>)}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E9E4D9] bg-[#4F5E52] p-6 text-white shadow-sm">
                <h3 className="font-serif text-2xl">Kesimpulan Dirimu</h3>
                {presentation && <div className="mt-4 space-y-4">{buildBhumiSummary(presentation).map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-[#F5F1E8]">{paragraph}</p>)}</div>}
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
