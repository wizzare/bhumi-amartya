import JourneyDetailClient from "@/components/journey/details/JourneyDetailClient";

export function generateStaticParams() {
  return [
    { id: "stage" },
    { id: "message" },
    { id: "focus" },
    { id: "growing" },
    { id: "attention" },
    { id: "milestone" },
    { id: "history" }
  ];
}

export default async function JourneyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JourneyDetailClient id={id} />;
}
