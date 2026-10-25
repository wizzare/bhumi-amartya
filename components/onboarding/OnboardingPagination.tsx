import React from "react";
import { BHUMI_TOKENS } from "./onboardingTokens";

interface OnboardingPaginationProps {
  totalSteps: number;
  currentStep: number;
}

export function OnboardingPagination({ totalSteps, currentStep }: OnboardingPaginationProps) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-2"
      role="tablist"
      aria-label="Progres Onboarding"
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        return (
          <div
            key={index}
            aria-label={`Langkah ${index + 1} dari ${totalSteps}`}
            aria-current={isActive ? "step" : undefined}
            style={{
              backgroundColor: isActive ? BHUMI_TOKENS.primary : `${BHUMI_TOKENS.primary}25`,
            }}
            className={`transition-all duration-300 rounded-full ${
              isActive ? "w-6 h-2" : "w-2 h-2"
            }`}
          />
        );
      })}
    </div>
  );
}
