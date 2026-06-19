"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles, Zap, Lock, BookOpen } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { Blueprint } from "@/lib/types/blueprint";
import { HumanDesignBodygraphLite } from "@/components/blueprint/HumanDesignBodygraphLite";

const typeSignatureMap: Record<string, string> = {
  "Manifesting Generator": "Satisfaction",
  "Generator": "Satisfaction",
  "Projector": "Success",
  "Manifestor": "Peace",
  "Reflector": "Surprise",
};

const typeNotSelfMap: Record<string, string> = {
  "Manifesting Generator": "Frustration",
  "Generator": "Frustration",
  "Projector": "Bitterness",
  "Manifestor": "Anger",
  "Reflector": "Disappointment",
};

export default function HumanDesignPage() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const bp = await storageProvider.getUserBlueprint();
        if (bp) setBlueprint(bp as any);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const hd = (blueprint?.humanDesign as any) || {};

  // Mappings
  const signature = hd.type ? typeSignatureMap[hd.type] || "Satisfaction" : "Satisfaction";
  const notSelfTheme = hd.type ? typeNotSelfMap[hd.type] || "Frustration" : "Frustration";

  // Centers formatting
  const rawCenters = hd.centers || {};
  const definedCenters: string[] = [];
  const openCenters: string[] = [];
  
  if (Object.keys(rawCenters).length > 0) {
    Object.entries(rawCenters).forEach(([key, value]) => {
      // capitalize key logic
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
      if (value === true) {
        definedCenters.push(formattedKey);
      } else {
        openCenters.push(formattedKey);
      }
    });
  }

  const advancedFallback = "Belum tersedia pada versi Human Design saat ini";

  const renderCard = (title: string, value: any, icon?: React.ReactNode, description?: string) => (
    <div className="rounded-2xl border border-[#E9E4D9] bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        {icon && <span className="text-[#9AA394]">{icon}</span>}
        <h3 className="font-serif text-lg text-[#4F5E52]">{title}</h3>
      </div>
      <p className="text-xl font-medium text-[#2C362F]">{value || "-"}</p>
      {description && <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{description}</p>}
    </div>
  );

  const renderListCard = (title: string, items: any[], emptyMsg: string) => (
    <div className="rounded-2xl border border-[#E9E4D9] bg-white p-5 shadow-sm">
      <h3 className="mb-3 font-serif text-lg text-[#4F5E52]">{title}</h3>
      {items && items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="rounded-lg bg-[#F5F1E8] px-3 py-1.5 text-sm font-medium text-[#4F5E52]">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#7B8776]">{emptyMsg}</p>
      )}
    </div>
  );

  const getKesimpulan = () => {
    if (!hd.type) return null;
    return (
      <div className="mt-8 overflow-hidden rounded-3xl border border-[#E9E4D9] bg-gradient-to-b from-[#F9F7F2] to-white shadow-sm">
        <div className="bg-[#4F5E52] p-6 text-white">
          <h2 className="font-serif text-2xl">Kesimpulan Human Design</h2>
          <p className="mt-2 text-sm opacity-90">Sintesis pola energimu</p>
        </div>
        <div className="space-y-6 p-6">
          <div>
            <h3 className="font-bold text-[#4F5E52]">1. Cara energi bekerja ({hd.type})</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#7B8776]">Sebagai seorang {hd.type}, energimu dirancang untuk berinteraksi dengan dunia secara khas. Profile {hd.profile} memberikan warna tambahan pada bagaimana peran ini dimainkan di masyarakat.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#4F5E52]">2. Cara mengambil keputusan ({hd.authority})</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#7B8776]">Otoritas {hd.authority} menunjukkan bahwa keputusan terbaikmu datang dari tempat ini. Mengikuti strategi "{hd.strategy}" adalah kunci agar energimu dapat mengalir tanpa hambatan.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#4F5E52]">3. Kekuatan alami</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#7B8776]">Memiliki definisi {hd.definition} dan {definedCenters.length} center terdefinisi membuatmu memiliki pancaran energi yang konsisten di area-area tersebut. Channel dan Gate aktifmu merupakan bakat yang selalu bisa kamu andalkan.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#4F5E52]">4. Tanda sedang selaras</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#7B8776]">Saat kamu merasakan "{signature}", itu adalah konfirmasi dari tubuh bahwa kamu berada di jalur yang tepat dan energimu digunakan secara otentik.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#4F5E52]">5. Tanda sedang keluar jalur</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#7B8776]">Jika kamu mulai sering merasakan "{notSelfTheme}", ini adalah sinyal peringatan bahwa kamu mungkin mengambil keputusan dari pikiran (bukan otoritas) atau memaksakan kehendak.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#4F5E52]">6. Saran praktis harian</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#7B8776]">Hormati strategimu ({hd.strategy}). Jangan terburu-buru mengambil tindakan jika otoritasmu ({hd.authority}) belum memberikan kejelasan. Temukan kenyamanan dalam pola inkarnasi ({hd.incarnationCross?.name || "-"}) yang menjadi jalan hidupmu.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]">
            <ArrowLeft size={16} />Kembali ke Profil
          </Link>
          
          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white">
              <Compass size={25} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Human Design</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Desain Energimu</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">
              Human Design membantu memahami cara energimu bekerja, bagaimana mengambil keputusan yang tepat, serta bagaimana menjalani hidup sesuai ritme alammu. Sistem ini menggabungkan tipe energi, strategi, otoritas, pusat energi, dan pola bawaan yang unik untuk setiap individu.
            </p>
          </header>

          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#4F5E52] border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-[#7B8776]">Memuat blueprint...</p>
            </div>
          ) : blueprint ? (
            <div className="space-y-6">
              <HumanDesignBodygraphLite humanDesign={hd} />
              
              <div className="grid gap-4 sm:grid-cols-2">
                {renderCard("Type", hd.type, <Zap size={18} />)}
                {renderCard("Strategy", hd.strategy, <Compass size={18} />)}
                {renderCard("Authority", hd.authority, <Lock size={18} />)}
                {renderCard("Profile", hd.profile, <BookOpen size={18} />)}
              </div>

              {renderCard("Definition", hd.definition)}
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E9E4D9] bg-gradient-to-br from-[#F5F1E8] to-[#FCFAF5] p-5 shadow-sm">
                  <h3 className="font-serif text-lg text-[#4F5E52]">Signature</h3>
                  <p className="mt-1 text-2xl font-medium text-[#4F5E52]">{signature}</p>
                  <p className="mt-2 text-xs text-[#7B8776]">Tanda saat energimu selaras</p>
                </div>
                <div className="rounded-2xl border border-[#E9E4D9] bg-gradient-to-br from-[#FDF8F6] to-white p-5 shadow-sm">
                  <h3 className="font-serif text-lg text-[#8B4C3A]">Not Self Theme</h3>
                  <p className="mt-1 text-2xl font-medium text-[#8B4C3A]">{notSelfTheme}</p>
                  <p className="mt-2 text-xs text-[#7B8776]">Tanda peringatan saat keluar jalur</p>
                </div>
              </div>

              {renderCard("Incarnation Cross", hd.incarnationCross?.name)}

              {renderListCard("Gates", hd.gates, "Data gate tidak tersedia")}
              {renderListCard("Channels", hd.channels, "Data channel tidak tersedia")}

              {/* Centers Section */}
              <div className="rounded-2xl border border-[#E9E4D9] bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-serif text-xl text-[#4F5E52]">Centers</h3>
                
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-[#7B8776]">Center Terdefinisi</h4>
                  {definedCenters.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {definedCenters.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-medium text-[#4F5E52]">
                          <span className="text-green-600">✓</span> {c}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-[#7B8776]">Tidak ada center terdefinisi</p>}
                </div>

                <div>
                  <h4 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wider text-[#7B8776]">Center Terbuka</h4>
                  {openCenters.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {openCenters.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-medium text-[#7B8776]">
                          <span className="text-gray-400">○</span> {c}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-[#7B8776]">Tidak ada center terbuka</p>}
                </div>
              </div>

              {/* Advanced Section */}
              <div className="rounded-2xl border border-[#E9E4D9] bg-[#FAFAFA] p-5 shadow-sm">
                <h3 className="mb-4 font-serif text-xl text-[#4F5E52]">Advanced</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B8776]">Variables</h4>
                    <p className="mt-1 text-[#2C362F]">{((hd.variables?.advanced as any)?.variable as string) || advancedFallback}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B8776]">Digestion</h4>
                    <p className="mt-1 text-[#2C362F]">{hd.digestion || advancedFallback}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B8776]">Cognition</h4>
                    <p className="mt-1 text-[#2C362F]">{hd.cognition || advancedFallback}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B8776]">Environment</h4>
                    <p className="mt-1 text-[#2C362F]">{hd.environment || advancedFallback}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B8776]">Motivation</h4>
                    <p className="mt-1 text-[#2C362F]">{hd.motivation || advancedFallback}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7B8776]">Perspective</h4>
                    <p className="mt-1 text-[#2C362F]">{hd.perspective || advancedFallback}</p>
                  </div>
                </div>
              </div>

              {getKesimpulan()}

              <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#F5F1E8] p-4 text-xs leading-5 text-[#7B8776]">
                <Sparkles size={16} className="mt-0.5 shrink-0" />
                <p>Data ini adalah bagian dari pola energimu. Eksplorasi fitur Profile Echo untuk melihat bagaimana energi ini bersinergi dengan Life Path dan peta kelahiranmu yang lain.</p>
              </div>

            </div>
          ) : (
            <p className="text-center text-[#7B8776]">Data blueprint belum tersedia.</p>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
