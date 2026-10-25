"use client";

import React, { useState } from "react";
import { OnboardingStep, OnboardingStepData } from "./OnboardingStep";
import { OnboardingPagination } from "./OnboardingPagination";
import { BHUMI_TOKENS } from "./onboardingTokens";
import { translations } from "@/lib/data/translations";

interface OnboardingWalkthroughProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingWalkthrough({ onComplete, onSkip }: OnboardingWalkthroughProps) {
  const t = translations["id"] as any;
  const ob = t?.onboarding;

  const ONBOARDING_STEPS: OnboardingStepData[] = [
    {
      category: ob?.step1?.category || "SELAMAT DATANG",
      title: ob?.step1?.title || "Ruang untuk Pulang dan Kenali Diri",
      description:
        ob?.step1?.body ||
        "Bhumi hadir untuk membantumu mengenali diri, memahami pola yang sering muncul dalam hidup, dan melihat potensi yang bisa kamu kembangkan.",
    },
    {
      category: ob?.step2?.category || "KENALI DIRIMU",
      title: ob?.step2?.title || "Pahami pola, karakter, dan potensi dirimu.",
      description:
        ob?.step2?.body ||
        "Berbagai pendekatan pengenalan diri dirangkum menjadi gambaran yang lebih mudah dipahami tentang kekuatan, kebiasaan, pola kehidupan, dan ruang untuk bertumbuh.",
    },
    {
      category: ob?.step3?.category || "BERTUMBUH",
      title: ob?.step3?.title || "Kenali. Pahami. Lalu jalani dengan lebih sadar.",
      description:
        ob?.step3?.body ||
        "Mengenali diri bukan tentang menjadi orang lain. Bhumi membantumu memahami dirimu dan menjalani proses pertumbuhanmu sendiri, satu langkah pada satu waktu.",
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = ONBOARDING_STEPS.length;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const nextLabel = isLastStep
    ? ob?.actions?.start || "Mulai Kenali Dirimu"
    : ob?.actions?.next || "Lanjut";
  const backLabel = ob?.actions?.back || "Kembali";
  const skipLabel = ob?.actions?.skip || "Lewati";

  return (
    <main
      className="min-h-screen flex flex-col justify-between px-6 py-6 sm:py-8 select-none relative overflow-hidden"
      style={{
        backgroundColor: BHUMI_TOKENS.canvas,
        paddingTop: "max(1.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Soft Ambient Light Gradient on Canvas */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[320px] pointer-events-none opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, #EAE4D5 0%, rgba(247,244,238,0) 70%)",
        }}
        aria-hidden="true"
      />

      {/* Top Header: Brand & Skip Button */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-sm mx-auto pt-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: BHUMI_TOKENS.surface,
              border: `1px solid ${BHUMI_TOKENS.border}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}
          >
            <img src="/images/logo.png" alt="Bhumi" className="w-5 h-5 object-contain" />
          </div>
          <span
            className="text-sm font-serif font-medium tracking-wide"
            style={{ color: BHUMI_TOKENS.textPrimary }}
          >
            Bhumi Amartya
          </span>
        </div>

        <button
          onClick={onSkip}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xs font-medium px-2 rounded-lg transition-colors hover:opacity-80 active:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            color: BHUMI_TOKENS.textSecondary,
            outlineColor: BHUMI_TOKENS.primary,
          }}
          aria-label="Lewati pengenalan"
        >
          {skipLabel}
        </button>
      </header>

      {/* Main Content Area (Breathing Space + Visual + Step Content) */}
      <section className="relative z-10 my-auto py-2 sm:py-4 flex flex-col items-center">
        <OnboardingStep
          step={ONBOARDING_STEPS[currentStep]}
          stepIndex={currentStep}
        />
        <div className="mt-4 sm:mt-6">
          <OnboardingPagination
            totalSteps={totalSteps}
            currentStep={currentStep}
          />
        </div>
      </section>

      {/* Bottom Navigation Buttons */}
      <footer className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-2.5 pb-2">
        <button
          onClick={handleNext}
          className="w-full min-h-[52px] font-medium text-white transition-all active:scale-[0.99] focus-visible:outline-3 focus-visible:outline-offset-2 flex items-center justify-center"
          style={{
            backgroundColor: BHUMI_TOKENS.primary,
            borderRadius: BHUMI_TOKENS.radiusControl,
            boxShadow: "0 2px 10px rgba(74, 88, 73, 0.14)",
            fontSize: "15px",
            outlineColor: BHUMI_TOKENS.primary,
          }}
        >
          {nextLabel}
        </button>

        {currentStep > 0 ? (
          <button
            onClick={handleBack}
            className="w-full min-h-[44px] flex items-center justify-center text-sm font-medium transition-colors hover:opacity-80 active:opacity-60"
            style={{ color: BHUMI_TOKENS.textSecondary }}
          >
            {backLabel}
          </button>
        ) : (
          <div className="min-h-[44px]" aria-hidden="true" />
        )}
      </footer>
    </main>
  );
}
