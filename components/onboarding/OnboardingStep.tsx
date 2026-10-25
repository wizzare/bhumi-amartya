import React from "react";
import { BHUMI_TOKENS } from "./onboardingTokens";

export interface OnboardingStepData {
  category: string;
  title: string;
  description: string;
}

interface OnboardingStepProps {
  step: OnboardingStepData;
  stepIndex: number;
}

export function OnboardingStep({ step, stepIndex }: OnboardingStepProps) {
  return (
    <div className="flex flex-col items-center text-center px-2 max-w-sm mx-auto">
      {/* Visual System Container per step */}
      <div
        className="w-44 h-44 sm:w-48 sm:h-48 rounded-[28px] flex items-center justify-center mb-6 relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: BHUMI_TOKENS.surface,
          border: `1px solid ${BHUMI_TOKENS.border}`,
          boxShadow: BHUMI_TOKENS.shadowSoft,
        }}
      >
        {/* Soft background ambient light */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, #F0EADB 0%, #FFFFFF 70%)",
          }}
        />

        {stepIndex === 0 && (
          /* SCREEN 1: WELCOME — Arrival, grounding, leaf/seed, warm horizon */
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Outer soft containment ring */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center relative"
              style={{
                backgroundColor: BHUMI_TOKENS.primarySoft,
                border: `1px solid ${BHUMI_TOKENS.border}`,
              }}
            >
              {/* Inner grounded circle with earth accent */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: BHUMI_TOKENS.surface,
                  boxShadow: "0 2px 8px rgba(74, 88, 73, 0.08)",
                }}
              >
                {/* Botanical/Seed motif */}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={BHUMI_TOKENS.primary}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22v-8" />
                  <path d="M12 14c-3.5 0-6-2.5-6-6 4 0 6 2 6 6z" />
                  <path d="M12 14c3.5 0 6-2.5 6-6-4 0-6 2-6 6z" />
                </svg>
              </div>
            </div>
            {/* Subtle grounding horizon line */}
            <div
              className="w-20 h-0.5 rounded-full mt-3 opacity-60"
              style={{ backgroundColor: BHUMI_TOKENS.earthAccent }}
            />
          </div>
        )}

        {stepIndex === 1 && (
          /* SCREEN 2: KENALI DIRI — Interconnected organic layers, pattern, alignment */
          <div className="relative z-10 flex items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Left interconnected circle */}
              <div
                className="absolute w-16 h-16 rounded-full -left-1 opacity-70"
                style={{
                  backgroundColor: BHUMI_TOKENS.primarySoft,
                  border: `1.5px solid ${BHUMI_TOKENS.primary}`,
                }}
              />
              {/* Right interconnected circle */}
              <div
                className="absolute w-16 h-16 rounded-full -right-1 opacity-60"
                style={{
                  backgroundColor: "#F2EBE1",
                  border: `1.5px solid ${BHUMI_TOKENS.earthAccent}`,
                }}
              />
              {/* Center overlapping focal core */}
              <div
                className="relative z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm"
                style={{ border: `1px solid ${BHUMI_TOKENS.border}` }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: BHUMI_TOKENS.primary }}
                />
              </div>
            </div>
          </div>
        )}

        {stepIndex === 2 && (
          /* SCREEN 3: BERTUMBUH — Path, opening horizon, upward organic motion */
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center relative"
              style={{
                backgroundColor: BHUMI_TOKENS.primarySoft,
                border: `1px solid ${BHUMI_TOKENS.border}`,
              }}
            >
              {/* Ascending organic arc/path */}
              <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                stroke={BHUMI_TOKENS.primary}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19c4-4 8-6 16-6" />
                <path d="M12 5l4 4-4 4" />
                <path d="M16 9H8" />
              </svg>
            </div>
            {/* Soft upward ripple indicators */}
            <div className="flex gap-1.5 mt-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: BHUMI_TOKENS.primarySoft }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: BHUMI_TOKENS.primary }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: BHUMI_TOKENS.earthAccent }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category / Eyebrow */}
      <span
        className="text-[11px] sm:text-xs uppercase tracking-[0.16em] font-medium mb-2.5 transition-colors"
        style={{ color: BHUMI_TOKENS.textSecondary }}
      >
        {step.category}
      </span>

      {/* Main Headline */}
      <h2
        className="text-2xl sm:text-[28px] font-serif mb-3 leading-snug tracking-tight font-medium"
        style={{ color: BHUMI_TOKENS.textPrimary }}
      >
        {step.title}
      </h2>

      {/* Body Description */}
      <p
        className="text-sm sm:text-[15px] leading-relaxed max-w-[290px] sm:max-w-[320px]"
        style={{ color: BHUMI_TOKENS.textSecondary }}
      >
        {step.description}
      </p>
    </div>
  );
}
