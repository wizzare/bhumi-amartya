import ProfileSectionClient from "@/components/profile/details/ProfileSectionClient";

export function generateStaticParams() {
  return [
    { section: "siapa-dirimu" },
    { section: "energi-mekanika" },
    { section: "luka-bayangan-warisan" },
    { section: "karya-talenta" },
    { section: "cinta-relasi" },
    { section: "raga-ruang" },
    { section: "spiritualitas-evolusi" },
    { section: "fase-kehidupan-saat-ini" }
  ];
}

export default async function ProfileSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <ProfileSectionClient section={section} />;
}
