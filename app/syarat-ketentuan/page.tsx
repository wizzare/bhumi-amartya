import { isEnlEdition } from "@/lib/config/edition";

export default function SyaratKetentuanPage() {
  const isEn = false;
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-16 text-[#4F5E52]">
      <section className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-[#7B8776]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-serif">{isEn ? "Terms of Service" : "Syarat & Ketentuan"}</h1>
        <div className="mt-8 space-y-6 text-[#7B8776] leading-relaxed text-sm">
          {isEn ? (
            <>
              <p>Last updated: June 6, 2026</p>

              <p>By using the Bhumi Amartya application, you agree to the following terms and conditions.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">1. Service Use</h2>
              <p>This application is provided for the purpose of personal growth, self-reflection, and mindfulness. Calculation results (Blueprint/Human Design) are strictly informational and educational, and do NOT constitute medical, psychological, legal, or financial professional advice.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">2. User Account</h2>
              <p>You are responsible for maintaining the security of your account and for ensuring that the data you provide is accurate for optimal calculation results.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">3. Limitation of Liability</h2>
              <p>Bhumi Amartya and its creators are not liable for any personal, relational, or financial decisions made based on content or insights provided by the application.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">4. Service Modifications</h2>
              <p>We reserve the right to modify, update, or discontinue features of the service at any time as the service evolves.</p>

              <p>Thank you for growing together with Bhumi Amartya.</p>
            </>
          ) : (
            <>
              <p>Terakhir diperbarui: 6 Juni 2026</p>

              <p>Dengan menggunakan aplikasi Bhumi Amartya, kamu menyetujui syarat dan ketentuan berikut.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">1. Penggunaan Layanan</h2>
              <p>Aplikasi ini disediakan untuk tujuan pengembangan diri dan refleksi pribadi. Hasil kalkulasi (Blueprint/Human Design) bersifat informatif dan bukan merupakan saran medis atau profesional.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">2. Akun Pengguna</h2>
              <p>Kamu bertanggung jawab untuk menjaga keamanan akunmu dan memastikan data yang dimasukkan akurat untuk hasil kalkulasi yang optimal.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">3. Batasan Tanggung Jawab</h2>
              <p>Bhumi Amartya tidak bertanggung jawab atas keputusan yang diambil pengguna berdasarkan konten atau wawasan yang disediakan oleh aplikasi.</p>

              <h2 className="text-xl font-semibold text-[#4F5E52]">4. Perubahan Layanan</h2>
              <p>Kami berhak untuk mengubah atau menghentikan fitur layanan kapan saja selama masa pengembangan Beta ini.</p>

              <p>Terima kasih telah bertumbuh bersama Bhumi Amartya.</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
