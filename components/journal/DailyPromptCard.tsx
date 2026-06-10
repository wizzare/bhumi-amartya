"use client";

import type { JournalPrompt } from "@/lib/data/types";

interface DailyPromptCardProps {
  prompt: JournalPrompt;
}

export function DailyPromptCard({ prompt }: DailyPromptCardProps) {
  return (
    <section className="mb-8">
      <div className="bhumi-card rounded-[28px] p-8 bg-gradient-to-br from-[#F7F4ED] to-[#FCFAF5] shadow-soft">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-[#E8E9E5]">
          <p className="text-[#8B9488] text-sm mb-2 tracking-wide">
            Today&apos;s Reflection
          </p>
          <p className="text-[#7B8776] text-xs mb-3">
            Theme: {prompt.theme} • {prompt.emotionalDepth} depth
          </p>
        </div>

        {/* Main prompt */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl text-[#4F5E52] font-light leading-relaxed italic">
            &ldquo;{prompt.prompt}&rdquo;
          </p>
          <p className="text-[#8B9488] text-sm mt-4 leading-relaxed">
            {prompt.purpose}
          </p>
        </div>

        {/* Sub-prompts (optional deeper questions) */}
        {prompt.subPrompts && prompt.subPrompts.length > 0 && (
          <div className="bg-white/50 rounded-2xl p-6 mb-6">
            <p className="text-[#7B8776] font-medium mb-4 text-sm">
              If you want to go deeper:
            </p>
            <ul className="space-y-3">
              {prompt.subPrompts.map((subPrompt, idx) => (
                <li key={idx} className="text-[#8B9488] text-sm leading-relaxed">
                  <span className="text-[#A08963] mr-2">—</span>
                  {subPrompt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Context from identity */}
        {prompt.generatedBasedOn && (
          <div className="bg-[#FBF9F4] rounded-2xl p-4 border border-[#E8E9E5]">
            <p className="text-[#7B8776] font-medium mb-3 text-xs uppercase tracking-wide">
              Generated for your blueprint
            </p>
            <div className="space-y-2">
              {prompt.generatedBasedOn.lifePathInsight && (
                <p className="text-[#8B9488] text-sm">
                  <span className="font-medium">Life Path:</span>{" "}
                  {prompt.generatedBasedOn.lifePathInsight}
                </p>
              )}
              {prompt.generatedBasedOn.arcanaInsight && (
                <p className="text-[#8B9488] text-sm">
                  <span className="font-medium">Arcana:</span>{" "}
                  {prompt.generatedBasedOn.arcanaInsight}
                </p>
              )}
              {prompt.generatedBasedOn.humanDesignInsight && (
                <p className="text-[#8B9488] text-sm">
                  <span className="font-medium">Design:</span>{" "}
                  {prompt.generatedBasedOn.humanDesignInsight}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
