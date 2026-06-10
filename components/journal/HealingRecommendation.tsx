"use client";

import type { HealingRecommendation } from "@/lib/data/types";

interface HealingRecommendationProps {
  recommendations: HealingRecommendation[];
}

const typeIcons: Record<string, string> = {
  innerwork: "🌱",
  meditation: "🧘",
  movement: "💃",
  creative: "🎨",
  relational: "🤝",
  somatic: "🫀",
  cognitive: "💭",
  spiritual: "✨",
};

const typeColors: Record<string, string> = {
  innerwork: "from-[#C4A88A] to-[#D4C5B9]",
  meditation: "from-[#9B8B7E] to-[#A08963]",
  movement: "from-[#D47A6E] to-[#E8B4A8]",
  creative: "from-[#A08963] to-[#B5A399]",
  relational: "from-[#8B9488] to-[#A08963]",
  somatic: "from-[#C4A88A] to-[#8B9488]",
  cognitive: "from-[#9B8B7E] to-[#B5A399]",
  spiritual: "from-[#A08963] to-[#C4A88A]",
};

export function HealingRecommendationComponent({
  recommendations,
}: HealingRecommendationProps) {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl text-[#4F5E52] font-light mb-2">
          Practices for Your Healing
        </h2>
        <p className="text-[#8B9488] leading-relaxed">
          These are suggestions based on what we&apos;re witnessing. Choose what calls to
          you. Trust your instinct.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bhumi-card rounded-[24px] overflow-hidden shadow-soft hover:shadow-md transition-shadow"
          >
            {/* Header with gradient */}
            <div
              className={`bg-gradient-to-r ${
                typeColors[rec.type] || "from-[#A08963] to-[#C4A88A]"
              } p-6 text-white`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">
                  {typeIcons[rec.type] || "🌿"}
                </span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {rec.duration}m
                </span>
              </div>
              <h3 className="text-xl font-medium leading-tight">
                {rec.title}
              </h3>
              <p className="text-white/90 text-sm mt-2">{rec.description}</p>
            </div>

            {/* Content */}
            <div className="p-6 bg-white">
              {/* Why this practice */}
              <div className="mb-5 pb-5 border-b border-[#E8E9E5]">
                <p className="text-[#8B9488] text-xs uppercase tracking-wide mb-2">
                  Why this practice
                </p>
                <p className="text-[#4F5E52] text-sm leading-relaxed">
                  {rec.basedOnEmotionalAnalysis}
                </p>
              </div>

              {/* How to do it */}
              <div className="mb-5 pb-5 border-b border-[#E8E9E5]">
                <p className="text-[#8B9488] text-xs uppercase tracking-wide mb-3">
                  How to do it
                </p>
                <ol className="space-y-2">
                  {rec.instructions.map((instruction, idx) => (
                    <li key={idx} className="text-[#4F5E52] text-sm leading-relaxed">
                      <span className="font-semibold text-[#A08963]">{idx + 1}.</span>{" "}
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              {rec.tips && rec.tips.length > 0 && (
                <div className="mb-5 pb-5 border-b border-[#E8E9E5]">
                  <p className="text-[#8B9488] text-xs uppercase tracking-wide mb-3">
                    Tips
                  </p>
                  <ul className="space-y-2">
                    {rec.tips.map((tip, idx) => (
                      <li key={idx} className="text-[#4F5E52] text-sm flex gap-2">
                        <span className="text-[#A08963]">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timing & Frequency */}
              <div className="mb-5 pb-5 border-b border-[#E8E9E5]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#8B9488] text-xs uppercase tracking-wide mb-1">
                      When
                    </p>
                    <p className="text-[#4F5E52] font-medium">
                      {rec.bestTiming
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8B9488] text-xs uppercase tracking-wide mb-1">
                      Frequency
                    </p>
                    <p className="text-[#4F5E52] font-medium">{rec.frequency}</p>
                  </div>
                </div>
              </div>

              {/* Supportive reminder */}
              <div className="bg-[#FBF9F4] rounded-lg p-4 border border-[#E8E9E5]">
                <p className="text-[#A08963] font-medium text-sm leading-relaxed">
                  💫 {rec.supportiveReminder}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer message */}
      {recommendations.length === 0 && (
        <div className="text-center py-12 bg-[#FBF9F4] rounded-2xl">
          <p className="text-[#8B9488] leading-relaxed">
            No recommendations yet. <br />
            Sometimes the deepest practice is simply resting.
          </p>
        </div>
      )}
    </section>
  );
}
