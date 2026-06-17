"use client";

import React from "react";
import { Sparkles, ShieldCheck, Leaf } from "lucide-react";

export type GuardianRole = "founder" | "admin" | "user";
export type GuardianBadge = "core_guardian" | "guardian";
export type RecognitionTier = "FOUNDER" | "CORE_GUARDIAN" | "GUARDIAN";

interface GuardianIdentityCardProps {
  role: GuardianRole;
  badge: GuardianBadge;
  tier: RecognitionTier;
  recognitionDate?: string;
  language: "id" | "en";
}

export function GuardianIdentityCard({ role, badge, tier, recognitionDate, language }: GuardianIdentityCardProps) {

  const getGreeting = () => {
    if (tier === "FOUNDER") {
      return {
        icon: <Sparkles className="text-yellow-500" />,
        title: "🌟 Selamat Datang di Bhumi Amartya",
        message: language === "id"
          ? "Kamu adalah Founder Bhumi. Terima kasih telah menghadirkan ruang untuk pulang, mengenali diri, dan bertumbuh bersama."
          : "You are the Founder of Bhumi. Thank you for creating a space to come home, know yourself, and grow together."
      };
    }
    if (tier === "CORE_GUARDIAN") {
      return {
        icon: <Leaf className="text-emerald-500" />,
        title: "🌱 Selamat Datang di Bhumi Amartya",
        message: language === "id"
          ? "Kamu adalah Penjaga Inti Bhumi. Sebelum banyak orang mengenal Bhumi, kamu telah lebih dahulu berjalan bersama kami. Terima kasih telah membantu menjaga, merawat, dan membentuk rumah ini."
          : "You are a Core Guardian of Bhumi. Before many knew Bhumi, you walked with us. Thank you for helping protect, nurture, and shape this home."
      };
    }
    if (role === "admin") {
      return {
        icon: <ShieldCheck className="text-blue-500" />,
        title: "🛡️ Selamat Datang di Bhumi Amartya",
        message: language === "id"
          ? "Kamu adalah Admin Bhumi. Terima kasih telah membantu menjaga ruang ini agar tetap aman, hangat, dan bermanfaat bagi banyak orang."
          : "You are a Bhumi Admin. Thank you for helping keep this space safe, warm, and meaningful for many."
      };
    }
    return {
      icon: <Leaf className="text-green-500" />,
      title: "🌿 Selamat Datang di Bhumi Amartya",
      message: language === "id"
        ? "Kamu adalah Penjaga Bhumi. Terima kasih telah menjadi bagian dari perjalanan untuk mengenali diri, bertumbuh, dan menemukan jalan pulangmu sendiri."
        : "You are a Guardian of Bhumi. Thank you for being part of the journey to know yourself, grow, and find your own way home."
    };
  };

  const greeting = getGreeting();

  return (
    <div className="mt-8 bhumi-card p-8 bg-white border-none shadow-sm relative overflow-hidden">
      <div className="relative z-10">
        <header className="mb-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-[#FCFAF5]">
            {greeting.icon}
          </div>
          <h3 className="text-[#4F6658] font-bold text-lg italic">{greeting.title}</h3>
        </header>

        <p className="text-[14px] text-[#3C3C3C] leading-relaxed mb-6 font-medium opacity-90">
          {greeting.message}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {role === "founder" ? (
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-[10px] font-bold text-yellow-700 uppercase tracking-wider">
               <Sparkles size={12} />
               Founder Bhumi
             </div>
          ) : (
            <>
              {badge === "core_guardian" && (
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                   <Leaf size={12} />
                   Penjaga Inti Bhumi
                 </div>
              )}
              {badge === "guardian" && (
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-[10px] font-bold text-green-700 uppercase tracking-wider">
                   <Leaf size={12} />
                   Penjaga Bhumi
                 </div>
              )}
              {role === "admin" && (
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                   <ShieldCheck size={12} />
                   Admin Bhumi
                 </div>
              )}
            </>
          )}
        </div>

        {recognitionDate && (
          <p className="text-[10px] text-[#9AA394] italic font-medium">
            Bersama Bhumi sejak {recognitionDate}
          </p>
        )}
      </div>
    </div>
  );
}
