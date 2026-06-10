"use client";

import type { EmotionalAnalysis } from "@/lib/data/types";

interface JournalInsightProps {
  analysis: EmotionalAnalysis;
  wordCount: number;
}

export function JournalInsight({ analysis, wordCount }: JournalInsightProps) {
  const emotionColors: Record<string, string> = {
    grief: "#C4A88A",
    anger: "#D47A6E",
    fear: "#9B8B7E",
    joy: "#A08963",
    confusion: "#B5A399",
    resignation: "#8B9488",
    hope: "#A08963",
    ambivalence: "#9A9381",
  };

  return (
    <section className="mb-8">
      <div className="bhumi-card rounded-[28px] p-8 bg-gradient-to-br from-[#F7F4ED] to-[#FCFAF5] shadow-soft">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-[#E8E9E5]">
          <p className="text-[#8B9488] text-xs mb-2 uppercase tracking-wide">
            What We&apos;re Witnessing
          </p>
          <h2 className="text-3xl md:text-4xl text-[#4F5E52] font-light">
            Your Emotional Landscape
          </h2>
        </div>

        {/* Primary Emotion */}
        <div className="mb-8 p-6 bg-white rounded-2xl">
          <p className="text-[#8B9488] text-sm mb-2">Primary Emotion</p>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full"
              style={{
                backgroundColor:
                  emotionColors[analysis.emotionalTone] || "#A08963",
                opacity: 0.2,
              }}
            />
            <div>
              <p
                className="text-2xl font-semibold"
                style={{
                  color: emotionColors[analysis.emotionalTone] || "#A08963",
                }}
              >
                {analysis.emotionalTone
                  .charAt(0)
                  .toUpperCase() + analysis.emotionalTone.slice(1)}
              </p>
              {analysis.secondaryEmotions && analysis.secondaryEmotions.length > 0 && (
                <p className="text-[#8B9488] text-sm mt-1">
                  Also present: {analysis.secondaryEmotions.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Nervous System State */}
        <div className="mb-8 p-6 bg-white rounded-2xl">
          <p className="text-[#8B9488] text-sm mb-3">Nervous System State</p>
          <p className="text-lg text-[#4F5E52] font-medium">
            {analysis.nervousSystemDetection
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </p>
          <p className="text-[#8B9488] text-sm mt-2">
            This tells us how your body is responding to what&apos;s happening internally.
          </p>
        </div>

        {/* Recurring Patterns */}
        {analysis.recurringThemes && analysis.recurringThemes.length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-2xl">
            <p className="text-[#8B9488] text-sm mb-4 uppercase tracking-wide">
              Themes we noticed
            </p>
            <div className="space-y-2">
              {analysis.recurringThemes.map((theme, idx) => (
                <div
                  key={idx}
                  className="inline-block px-3 py-2 bg-[#F0EDEA] rounded-lg text-[#4F5E52] text-sm mr-2 mb-2"
                >
                  {theme}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recurring Wounds */}
        {analysis.recurringWounds && analysis.recurringWounds.length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-2xl border-l-4 border-[#C4A88A]">
            <p className="text-[#8B9488] text-sm mb-4 uppercase tracking-wide">
              Wounds we&apos;re holding
            </p>
            <p className="text-[#4F5E52] leading-relaxed mb-3">
              These are tender places asking for compassion:
            </p>
            <ul className="space-y-2">
              {analysis.recurringWounds.map((wound, idx) => (
                <li key={idx} className="text-[#8B9488] text-sm flex gap-2">
                  <span className="text-[#A08963]">•</span>
                  <span>{wound}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gentle Insight */}
        <div className="mb-8 p-6 bg-[#FBF9F4] rounded-2xl border border-[#E8E9E5]">
          <p className="text-[#A08963] font-medium mb-3 uppercase text-xs tracking-wide">
            💫 A Gentle Reflection
          </p>
          <p className="text-[#4F5E52] leading-relaxed text-lg italic">
            {analysis.gentleInsight}
          </p>
        </div>

        {/* Healing Direction */}
        <div className="mb-8 p-6 bg-[#FBF9F4] rounded-2xl border border-[#E8E9E5]">
          <p className="text-[#A08963] font-medium mb-3 uppercase text-xs tracking-wide">
            🌱 Where Healing Points
          </p>
          <p className="text-[#4F5E52] leading-relaxed">
            {analysis.healingDirection}
          </p>
        </div>

        {/* Suggested Next Innerwork */}
        <div className="mb-8 p-6 bg-white rounded-2xl">
          <p className="text-[#8B9488] text-sm mb-4 uppercase tracking-wide">
            Suggested Practice
          </p>
          <p className="text-[#4F5E52] leading-relaxed">
            {analysis.suggestedNextInnerwork}
          </p>
        </div>

        {/* Grounding Suggestion */}
        <div className="mb-8 p-6 bg-gradient-to-r from-[#F7F4ED] to-[#FCFAF5] rounded-2xl border border-[#E8E9E5]">
          <p className="text-[#A08963] font-medium mb-2 uppercase text-xs tracking-wide">
            🌍 Grounding for Today
          </p>
          <p className="text-[#4F5E52] leading-relaxed">
            What would help right now: <span className="font-semibold">{analysis.groundingNeed}</span>
          </p>
        </div>

        {/* Footer message */}
        <div className="text-center pt-6 border-t border-[#E8E9E5]">
          <p className="text-[#8B9488] text-sm leading-relaxed">
            You wrote {wordCount} words today. That took courage. 
            <br />
            Your words matter. You matter.
          </p>
        </div>
      </div>
    </section>
  );
}
