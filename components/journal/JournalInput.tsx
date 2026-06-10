"use client";

import { useRef, useState } from "react";

interface JournalInputProps {
  onSubmit: (content: string, durationMinutes: number) => void;
  isLoading?: boolean;
}

export function JournalInput({ onSubmit, isLoading }: JournalInputProps) {
  const [content, setContent] = useState("");
  const startTimeRef = useRef<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    const startedAt = startTimeRef.current ?? Date.now();
    const durationMinutes = Math.round((Date.now() - startedAt) / 60000);
    onSubmit(content, durationMinutes);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const characterCount = content.length;

  return (
    <section className="mb-8">
      <div className="bhumi-card rounded-[28px] p-8 bg-white shadow-soft">
        <div className="mb-4 pb-4 border-b border-[#E8E9E5]">
          <h2 className="text-[#7B8776] font-medium text-sm uppercase tracking-wide">
            💭 Your Words
          </h2>
          <p className="text-[#8B9488] text-sm mt-2">
            There&apos;s no right way to do this. Write however it comes.
          </p>
        </div>

        {/* Writing area */}
        <div className="relative mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => {
              startTimeRef.current = startTimeRef.current ?? Date.now();
              setIsExpanded(true);
            }}
            placeholder="Start writing... Let it flow. There is no judgment here."
            className={`w-full rounded-2xl border-2 border-[#E8E9E5] bg-[#FCFAF5] text-[#4F5E52] placeholder-[#C4B5A8] focus:outline-none focus:border-[#A08963] focus:bg-white p-6 font-[16px] leading-relaxed transition-all ${
              isExpanded ? "min-h-96" : "min-h-48"
            }`}
            style={{ resize: "none" }}
          />
        </div>

        {/* Stats and tips */}
        {isExpanded && (
          <div className="bg-[#FBF9F4] rounded-2xl p-4 mb-6 border border-[#E8E9E5]">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-[#8B9488] text-xs uppercase tracking-wide mb-1">
                  Words
                </p>
                <p className="text-2xl text-[#A08963] font-light">{wordCount}</p>
              </div>
              <div>
                <p className="text-[#8B9488] text-xs uppercase tracking-wide mb-1">
                  Characters
                </p>
                <p className="text-2xl text-[#A08963] font-light">
                  {characterCount}
                </p>
              </div>
              <div>
                <p className="text-[#8B9488] text-xs uppercase tracking-wide mb-1">
                  Status
                </p>
                <p className="text-lg text-[#4F5E52] font-medium">
                  {content.trim().length > 50 ? "✓ Ready" : "..."}
                </p>
              </div>
            </div>

            <p className="text-[#8B9488] text-sm leading-relaxed">
              Tips: Don&apos;t worry about grammar or making sense. Let raw emotion come
              through. Your words don&apos;t need to be polished; they need to be true.
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            content.trim().length === 0
          }
          className="w-full py-3 px-4 rounded-xl bg-[#4F5E52] text-white font-medium hover:bg-[#3D4A3F] disabled:bg-[#C4B5A8] disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing your words...
            </span>
          ) : (
            "Submit & Receive Insight"
          )}
        </button>

        {/* Privacy note */}
        <p className="text-[#8B9488] text-xs text-center mt-4">
          🔒 Your journal is private and stays with you. Nothing is shared.
        </p>
      </div>
    </section>
  );
}
