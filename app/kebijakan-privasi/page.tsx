import { isEnlEdition } from "@/lib/config/edition";

export default function KebijakanPrivasiPage() {
  const isEn = isEnlEdition();
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
              <p>We collect account identity information (name, email address, Firebase UID), birth information (date, time, and place/coordinates of birth) to compute your Blueprint, astrology, and Human Design profiles, and in-app activity records (journals, meditation sessions, daily reflections, and Google Play subscription verification metadata). When you grant optional location permission for Environment Context (local weather/AQI), your current coordinates are used ephemerally for weather lookup and are never used to calculate your Blueprint.</p>
              <p>For account security and free-trial integrity, our Android app also collects one-way SHA-256 cryptographic hashes derived from app-scoped device and installation identifiers (Android ID hash, installation ID hash, and Google Play Services App Set ID hash when provided by the device), as well as Google Play Integrity / Firebase App Check attestation tokens. Raw hardware identifiers are never transmitted or stored, and because security hashes can be correlated across accounts on the same device within our protected fraud-prevention ledger, they are treated as pseudonymous security identifiers (not anonymous).</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">2. How Data Is Used</h2>
              <p>Your account and birth data are used strictly to personalize daily guidance, Blueprint insights, and wellness reflections inside the application. Pseudonymous security and device hashes are used exclusively for fraud prevention, security attestation, and protecting free-trial fairness — never for advertising or cross-app tracking.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">3. Data Security & Confidentiality</h2>
              <p>Your data is transmitted over encrypted HTTPS connections and stored securely using encrypted cloud infrastructure and protected local storage. We NEVER sell, rent, or trade your personal data to third parties for advertising.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">4. Account & Data Deletion</h2>
              <p>You retain full sovereignty over your data and may permanently delete your account and all associated profile, birth/Blueprint, journal, and activity records at any time via Settings &gt; Danger Zone. Upon deletion, personal birth-similarity links are removed and raw user identifiers in anti-fraud logs are scrubbed; minimal pseudonymous device-claim hashes may be retained strictly for fraud prevention and security compliance for up to 180 days (and security audit logs for up to 90 days) before expiration.</p>

              <p>For further questions or shared-device verification assistance, contact us at hello@wedhaswara.my.id.</p>
            </>
          ) : (
            <>
              <p>Terakhir diperbarui: 11 November 2026</p>

              <p>Selamat datang di Bhumi Amartya. Kami menghargai privasimu dan berkomitmen untuk melindungi data pribadimu.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">1. Informasi yang Kami Kumpulkan</h2>
              <p>Kami mengumpulkan data identitas akun (nama, alamat email, Firebase UID), data kelahiran (tanggal, waktu, dan tempat/koordinat lahir) untuk menghitung profil Blueprint dan Human Design dirimu, serta aktivitas dalam aplikasi (jurnal, sesi meditasi, refleksi harian, dan metadata verifikasi langganan Google Play). Jika kamu mengizinkan akses lokasi opsional untuk Konteks Lingkungan (cuaca/AQI lokal), koordinat perangkatmu hanya dipakai sementara untuk mengambil informasi cuaca dan tidak pernah digunakan untuk menghitung Blueprint.</p>
              <p>Khusus untuk keamanan akun dan integritas masa uji coba gratis, aplikasi Android kami juga memproses hash kriptografis satu arah (SHA-256) dari pengidentifikasi aplikasi dan perangkat (Android ID yang di-hash, ID instalasi aplikasi yang di-hash, serta App Set ID Google Play Services yang di-hash apabila tersedia pada perangkat), beserta token atestasi Google Play Integrity / Firebase App Check. Pengidentifikasi perangkat mentah tidak pernah dikirimkan maupun disimpan. Karena hash keamanan tersebut dapat dikorelasikan antar-akun pada perangkat yang sama dalam catatan anti-penyalahgunaan server kami, data tersebut diklasifikasikan sebagai pengidentifikasi keamanan pseudonim (bukan data anonim).</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">2. Penggunaan Data</h2>
              <p>Data akun dan kelahiranmu digunakan secara eksklusif untuk menyediakan fitur personalisasi dalam aplikasi, seperti refleksi harian dan panduan meditasi. Sinyal hash perangkat pseudonim hanya digunakan untuk keamanan akun, atestasi integritas, integritas masa uji coba gratis, dan pencegahan penyalahgunaan multi-akun — tidak pernah digunakan untuk iklan ataupun pelacakan lintas aplikasi.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">3. Keamanan Data</h2>
              <p>Seluruh data dikirimkan melalui koneksi HTTPS terenkripsi serta disimpan secara aman menggunakan Firebase dan penyimpanan lokal terproteksi. Kami tidak pernah menjual, menyewakan, ataupun membagikan data pribadimu kepada pihak ketiga untuk tujuan periklanan.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">4. Penghapusan Akun</h2>
              <p>Kamu dapat menghapus akun beserta seluruh profil, data kelahiran/Blueprint, jurnal, dan aktivitas terkait secara permanen kapan saja melalui menu Pengaturan &gt; Zona Bahaya. Saat akun dihapus, tautan kesamaan profil kelahiran akan dibersihkan dan UID mentah pada catatan keamanan dihapus; hash klaim perangkat pseudonim minimal dapat dipertahankan paling lama 180 hari (dan log audit keamanan paling lama 90 hari) semata-mata untuk pencegahan penyalahgunaan uji coba gratis dan keamanan sistem.</p>

              <p>Untuk pertanyaan lebih lanjut atau bantuan verifikasi perangkat bersama, hubungi kami di hello@wedhaswara.my.id.</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
