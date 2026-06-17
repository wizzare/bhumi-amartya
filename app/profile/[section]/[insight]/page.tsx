import ProfileInsightClient from "@/components/profile/details/ProfileInsightClient";
import { GAIA_INSIGHT_DEFINITIONS } from "@/lib/profile/gaia/synthesisEngine";
import type { GaiaTheme } from "@/lib/profile/gaia/types";

export function generateStaticParams() {
  return (Object.keys(GAIA_INSIGHT_DEFINITIONS) as GaiaTheme[]).flatMap((section) =>
    GAIA_INSIGHT_DEFINITIONS[section].map((insight) => ({ section, insight: insight.id })),
  );
}

export default async function ProfileInsightPage({ params }: { params: Promise<{ section: string; insight: string }> }) {
  const { section, insight } = await params;
  return <ProfileInsightClient section={section} insightId={insight} />;
}
