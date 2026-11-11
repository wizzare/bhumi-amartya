"use client";

import { useState } from "react";

type BhumiPageHeaderProps = {
  className?: string;
  inverse?: boolean;
  inline?: boolean;
};

export function BhumiPageHeader({
  className = "",
  inverse = false,
  inline = false,
}: BhumiPageHeaderProps) {
  const [logoError, setLogoError] = useState(false);

  if (inline) {
    return (
      <div
        className={`inline-flex items-center gap-2.5 ${className}`}
        aria-label="Bhumi Amartya"
      >
        <div
          className={`relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full p-1 ${
            inverse ? "bg-white" : "bg-white shadow-sm ring-1 ring-[#4A5849]/15"
          }`}
        >
          {logoError ? (
            <span className="font-serif text-xs font-bold text-[#4A5849]" aria-hidden="true">
              BA
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/logo.png"
              alt="Bhumi Amartya"
              width={24}
              height={24}
              decoding="async"
              onError={() => setLogoError(true)}
              className="h-full w-full object-contain"
            />
          )}
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.22em] ${
            inverse ? "text-white/80" : "text-[#5F6B5E]"
          }`}
        >
          Bhumi Amartya
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      aria-label="Bhumi Amartya"
    >
      <div
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full p-1 ${
          inverse ? "bg-white" : "bg-white shadow-sm ring-1 ring-black/5"
        }`}
      >
        {logoError ? (
          <span className="font-serif text-xs font-bold text-[#4A5849]" aria-hidden="true">
            BA
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/logo.png"
            alt="Bhumi Amartya"
            width={28}
            height={28}
            decoding="async"
            onError={() => setLogoError(true)}
            className="h-full w-full object-contain"
          />
        )}
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-[0.24em] ${
          inverse ? "text-white/80" : "text-[#7B8776]"
        }`}
      >
        Bhumi Amartya
      </span>
    </div>
  );
}
