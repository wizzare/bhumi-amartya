"use client";

import React, { useEffect, useState } from "react";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { APP_TIME_REFRESH_MS, getTimeOfDayGreeting } from "@/lib/dailyGuidance/timeOfDayGreeting";

interface DashboardHeaderProps {
  userName: string;
  language: "id" | "en";
}

export function DashboardHeader({ userName, language }: DashboardHeaderProps) {
  const [now, setNow] = useState(() => new Date());
  const locale = language === "id" ? "id-ID" : "en-US";
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateString = now.toLocaleDateString(locale, options);
  const timeString = now.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const greeting = getTimeOfDayGreeting(now, language);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), APP_TIME_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="flex flex-col items-center pt-10 pb-8 px-6 text-center">
      <BhumiPageHeader className="mb-6" />
      
      <div className="space-y-1.5">
        <p className="text-base font-serif italic text-[#7B8776]">{greeting}</p>
        <h1 className="text-3xl font-serif text-[#4F5E52] leading-tight">{userName}</h1>
        <p className="text-[13px] text-[#7B8776] font-semibold italic opacity-60">
          {dateString} · {timeString}
        </p>
      </div>
    </header>
  );
}
