import { isEnlEdition } from "@/lib/config/edition";

export default function KebijakanPrivasiPage() {
  const isEn = false;
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-16 text-[#4F5E52]">
      <section className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-[#7B8776]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-serif">{isEn ? "Privacy Policy" : "Kebijakan Privasi"}</h1>
        <div className="mt-8 space-y-6 text-[#7B8776] leading-relaxed text-sm">
          {isEn ? (
            <>
              <p>Last updated: November 11, 2026</p>

              <p>Welcome to Bhumi Amartya. We honor your privacy and are committed to safeguarding your personal data.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">1. Information We Collect</h2>
              <p>We collect birth information (date, time, and place of birth) solely to compute your Blueprint, astrology, and Human Design profiles, either locally or through secure third-party services. For account security and free-trial integrity, our Android app may also generate one-way SHA-256 cryptographic hashes derived from app-scoped device/installation identifiers (Android ID hash and app installation ID hash). Raw hardware device identifiers are never transmitted or stored.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">2. How Data Is Used</h2>
              <p>Your birth data is used strictly to personalize daily guidance, reflections, and meditation practices within the application for your user profile. One-way hashed device/installation signals are used strictly for fraud prevention, security, and protecting free-trial fairness — never for advertising or cross-app tracking.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">3. Data Security & Confidentiality</h2>
              <p>Your data is transmitted over encrypted HTTPS connections and stored securely using industry-standard encrypted cloud infrastructure and local storage. We NEVER sell, rent, or trade your personal data to third parties.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">4. Account & Data Deletion</h2>
              <p>You retain full sovereignty over your data and may permanently delete your account and all associated records at any time via Settings &gt; Danger Zone.</p>

              <p>For further questions, contact us through the Contact page.</p>
            </>
          ) : (
            <>
              <p>Terakhir diperbarui: 11 November 2026</p>

              <p>Selamat datang di Bhumi Amartya. Kami menghargai privasimu dan berkomitmen untuk melindungi data pribadimu.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">1. Informasi yang Kami Kumpulkan</h2>
              <p>Kami mengumpulkan data kelahiran (tanggal, waktu, dan tempat lahir) untuk menghitung profil Blueprint dan Human Design dirimu secara lokal atau melalui layanan pihak ketiga yang aman. Khusus untuk keamanan akun dan integritas masa uji coba gratis, aplikasi Android kami juga dapat memproses hash kriptografis satu arah (SHA-256) dari pengidentifikasi aplikasi/perangkat (seperti Android ID dan ID instalasi aplikasi yang telah di-hash). Pengidentifikasi perangkat mentah tidak pernah dikirimkan maupun disimpan.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">2. Penggunaan Data</h2>
              <p>Data kelahiranmu digunakan secara eksklusif untuk menyediakan fitur personalisasi dalam aplikasi, seperti refleksi harian dan panduan meditasi. Sinyal hash perangkat satu arah hanya digunakan untuk keamanan akun, integritas masa uji coba gratis, dan pencegahan penyalahgunaan multi-akun — tidak pernah digunakan untuk iklan ataupun pelacakan lintas aplikasi.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">3. Keamanan Data</h2>
              <p>Seluruh data dikirimkan melalui koneksi HTTPS terenkripsi serta disimpan secara aman menggunakan Firebase dan penyimpanan lokal terproteksi. Kami tidak menjual, menyewakan, ataupun membagikan data pribadimu kepada pihak ketiga untuk tujuan periklanan.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">4. Penghapusan Akun</h2>
              <p>Kamu dapat menghapus akun dan seluruh data terkait kapan saja melalui menu Pengaturan di dalam aplikasi.</p>

              <p>Untuk pertanyaan lebih lanjut, hubungi kami melalui halaman Kontak.</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}