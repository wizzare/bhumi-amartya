"use client";

import React from "react";
import Image from "next/image";

interface DashboardHeaderProps {
  userName: string;
  language: "id" | "en";
}

export function DashboardHeader({ userName, language }: DashboardHeaderProps) {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateString = today.toLocaleDateString(language === "id" ? "id-ID" : "en-US", options);

  return (
    <header className="flex flex-col items-center pt-10 pb-8 px-6 text-center">
      <div className="w-16 h-16 relative mb-6 hover:scale-105 transition-transform duration-500 active:scale-95">
        <Image
          src="/images/logo.png"
          alt="Bhumi Amartya"
          fill
          className="object-contain"
          priority
        />
      </div>
      
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7B8776] opacity-80">
          Bhumi Amartya
        </p>
        <h1 className="text-3xl font-serif italic text-[#4F5E52] leading-tight">
          {language === "id" ? "Halo" : "Hello"}, {userName}
        </h1>
        <p className="text-[13px] text-[#7B8776] font-semibold italic opacity-60">
          {dateString}
        </p>
      </div>
    </header>
  );
}
