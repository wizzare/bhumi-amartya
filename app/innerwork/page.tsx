"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Music, Sparkles, Dumbbell, Flower2, Utensils } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics/usageAnalytics";

export default function InnerworkHubPage() {
  const { language } = useLanguage();
  const auth = useAuth();
  const t = (translations[language] as any).innerwork;

  React.useEffect(() => {
    trackEvent("open_innerwork", auth?.user?.uid);
  }, [auth?.user?.uid]);

  const menuItems = [
    {
      id: "journaling",
      icon: BookOpen,
      label: t.journaling,
      href: "/innerwork/journaling",
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "meditation",
      icon: Sparkles,
      label: t.meditation,
      href: "/innerwork/meditation",
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: "audio",
      icon: Music,
      label: t.audio,
      href: "/innerwork/audio-healing",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      id: "workout",
      icon: Dumbbell,
      label: t.workout,
      href: "/innerwork/workout",
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: "yoga",
      icon: Flower2,
      label: t.yoga,
      href: "/innerwork/yoga",
      color: "bg-green-50 text-green-600",
    },
    {
      id: "herbal",
      icon: Utensils,
      label: t.herbal,
      href: "/innerwork/herbal",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />

        <div className="mx-auto max-w-lg">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">{t.title}</h1>
            <p className="text-[#7B8776]">{t.subtitle}</p>
          </header>

          <div className="grid grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="bhumi-card p-6 flex flex-col items-center justify-center text-center transition-transform active:scale-95 hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon size={24} />
                </div>
                <span className="text-sm font-semibold text-[#4F5E52]">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
