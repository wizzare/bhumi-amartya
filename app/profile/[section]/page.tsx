import ProfileSectionClient from "@/components/profile/details/ProfileSectionClient";
import { GAIA_SECTION_PRESENTATION } from "@/lib/profile/gaia/presentation";

export function generateStaticParams() {
  return Object.keys(GAIA_SECTION_PRESENTATION).map((section) => ({ section }));
}

export default async function ProfileSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <ProfileSectionClient section={section} />;
}
