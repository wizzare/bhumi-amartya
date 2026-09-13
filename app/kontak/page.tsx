import { isEnlEdition } from "@/lib/config/edition";

export default function KontakPage() {
  const isEn = false;
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-16 text-[#4F5E52]">
      <section className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-[#7B8776]">
          {isEn ? "Contact" : "Kontak"}
        </p>
        <h1 className="mt-3 text-4xl">{isEn ? "Contact Us" : "Hubungi Kami"}</h1>
        <p className="mt-6 text-[#7B8776]">
          {isEn ? "Need help or want to share feedback? Reach us at:" : "Butuh bantuan atau ingin memberi masukan? Hubungi kami di:"}
        </p>
        <p className="mt-4 font-medium text-[#4F5E52]">
          hello@wedhaswara.my.id
        </p>
      </section>
    </main>
  );
}
