"use client";

import { useState } from "react";
import type { EmotionalCheckIn } from "@/lib/data/types";

interface EmotionalCheckinProps {
  onCheckInComplete: (checkIn: EmotionalCheckIn) => void;
}

export function EmotionalCheckin({ onCheckInComplete }: EmotionalCheckinProps) {
  const [moodLevel, setMoodLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [nervousSystem, setNervousSystem] = useState<
    "dysregulated" | "activated" | "calm" | "grounded" | "floaty"
  >("calm");
  const [bodyLocation, setBodyLocation] = useState("");
  const [emotionalWord, setEmotionalWord] = useState("");

  const handleComplete = () => {
    onCheckInComplete({
      moodLevel,
      energyLevel,
      nervousSystemState: nervousSystem,
      bodyLocation: bodyLocation || "general",
      emotionalWord: emotionalWord || "present",
    });
  };

  return (
    <section className="mb-8">
      <div className="bhumi-card rounded-[28px] p-8 bg-white shadow-soft">
        <h2 className="text-[#7B8776] font-medium mb-6 text-sm uppercase tracking-wide">
          🫀 Emotional Check-in
        </h2>

        {/* Mood Level */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <label className="text-[#4F5E52] font-medium">
              How are you feeling?
            </label>
            <span className="text-2xl text-[#A08963] font-light">{moodLevel}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={moodLevel}
            onChange={(e) => setMoodLevel(Number(e.target.value))}
            className="w-full h-2 bg-[#E8E9E5] rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #D4C5B9 0%, #D4C5B9 ${
                (moodLevel / 10) * 100
              }%, #E8E9E5 ${(moodLevel / 10) * 100}%, #E8E9E5 100%)`,
            }}
          />
          <div className="flex justify-between text-[#8B9488] text-xs mt-2">
            <span>Overwhelmed</span>
            <span>Calm</span>
          </div>
        </div>

        {/* Energy Level */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <label className="text-[#4F5E52] font-medium">
              Physical energy level?
            </label>
            <span className="text-2xl text-[#A08963] font-light">{energyLevel}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(Number(e.target.value))}
            className="w-full h-2 bg-[#E8E9E5] rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #D4C5B9 0%, #D4C5B9 ${
                (energyLevel / 10) * 100
              }%, #E8E9E5 ${(energyLevel / 10) * 100}%, #E8E9E5 100%)`,
            }}
          />
          <div className="flex justify-between text-[#8B9488] text-xs mt-2">
            <span>Drained</span>
            <span>Energized</span>
          </div>
        </div>

        {/* Nervous System */}
        <div className="mb-8">
          <label className="text-[#4F5E52] font-medium mb-3 block">
            How is your nervous system?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { value: "dysregulated", label: "Dysregulated 😵" },
              { value: "activated", label: "Activated 🚨" },
              { value: "calm", label: "Calm 😌" },
              { value: "grounded", label: "Grounded 🌍" },
              { value: "floaty", label: "Floaty ☁️" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setNervousSystem(
                    option.value as typeof nervousSystem
                  )
                }
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  nervousSystem === option.value
                    ? "bg-[#4F5E52] text-white shadow-md"
                    : "bg-[#F0EDEA] text-[#7B8776] hover:bg-[#E8E9E5]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body Location */}
        <div className="mb-8">
          <label className="text-[#4F5E52] font-medium mb-2 block">
            Where do you feel it in your body?
          </label>
          <input
            type="text"
            value={bodyLocation}
            onChange={(e) => setBodyLocation(e.target.value)}
            placeholder="e.g., chest, stomach, shoulders..."
            className="w-full px-4 py-3 rounded-xl border border-[#E8E9E5] bg-[#FCFAF5] text-[#4F5E52] placeholder-[#C4B5A8] focus:outline-none focus:border-[#A08963]"
          />
        </div>

        {/* Emotional Word */}
        <div className="mb-8">
          <label className="text-[#4F5E52] font-medium mb-2 block">
            In one word, how would you describe what you&apos;re feeling?
          </label>
          <input
            type="text"
            value={emotionalWord}
            onChange={(e) => setEmotionalWord(e.target.value)}
            placeholder="e.g., tender, heavy, uncertain..."
            className="w-full px-4 py-3 rounded-xl border border-[#E8E9E5] bg-[#FCFAF5] text-[#4F5E52] placeholder-[#C4B5A8] focus:outline-none focus:border-[#A08963]"
          />
        </div>

        {/* Complete button */}
        <button
          onClick={handleComplete}
          className="w-full py-3 px-4 rounded-xl bg-[#4F5E52] text-white font-medium hover:bg-[#3D4A3F] transition-colors"
        >
          Continue to Journaling
        </button>
      </div>
    </section>
  );
}
