"use client";

import { useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Crown, Home, MessageSquare, MoreHorizontal, Settings, Sprout, User, Activity } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { useAuth } from "@/context/AuthContext";

type NavLabelKey = keyof typeof translations.id.nav;
type NavItem = {
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  labelKey: NavLabelKey;
  label?: string;
  href: string;
};

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { Icon: Home, labelKey: "home", href: "/dashboard" },
  { Icon: User, labelKey: "profile", href: "/profile" },
  { Icon: Sprout, labelKey: "innerwork", href: "/wellness" },
  { Icon: Compass, labelKey: "journey", href: "/journey" },
];

const UTILITY_NAV_ITEMS: NavItem[] = [
  { Icon: Settings, labelKey: "settings", href: "/settings" },
  { Icon: MessageSquare, labelKey: "profile" as any, label: "Inbox", href: "/inbox" },
  { Icon: Crown, labelKey: "profile" as any, label: "Premium Bhumi", href: "/premium-bhumi" },
];

export function AppNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language];
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const auth = useAuth();
  const profile = auth?.userProfile;

  const moreItems = useMemo(() => {
    const items = [...UTILITY_NAV_ITEMS];
    if (profile?.guardianRole === "founder" || profile?.email?.trim().toLowerCase() === "wizzare@gmail.com") {
      items.push({ Icon: Activity, label: "Auth Diagnostics", href: "/admin/diagnostics", labelKey: "profile" as any });
    }
    return items;
  }, [profile]);

  const desktopNavItems = useMemo(() => {
    return [...PRIMARY_NAV_ITEMS];
  }, []);

  const isMoreActive = moreItems.some((item) => pathname === item.href);
  const moreLabel = t.nav.lainnya;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {isMoreOpen && (
        <div className="mx-auto mb-2 max-w-sm rounded-3xl border border-[#E8E9E5] bg-[#FCFAF5]/98 p-2 shadow-[0_-12px_35px_rgba(79,94,82,0.14)] backdrop-blur md:hidden">
          {moreItems.map((item) => {
            const isActive = pathname === item.href;
            const { Icon } = item;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMoreOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#F5F1E8] text-[#4F5E52]"
                    : "text-[#7B8776] hover:bg-[#F5F1E8] hover:text-[#4F5E52]"
                }`}
              >
                <Icon aria-hidden className="h-5 w-5 shrink-0" />
                <span>{item.label || t.nav[item.labelKey]}</span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mx-auto flex max-w-sm items-stretch gap-0.5 rounded-t-[24px] border border-[#E8E9E5] border-b-0 bg-[#FCFAF5]/95 px-1.5 py-2 shadow-[0_-12px_35px_rgba(79,94,82,0.12)] backdrop-blur md:hidden">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const { Icon } = item;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative inline-flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-medium transition ${
                isActive
                  ? "text-[#4F5E52]"
                  : "text-[#9AA394] hover:bg-[#F5F1E8] hover:text-[#7B8776]"
              }`}
            >
              <Icon aria-hidden className="h-5 w-5" />
              <span className="mt-1 max-w-full truncate leading-none">{item.label || t.nav[item.labelKey]}</span>
              {isActive && (
                <span className="mt-2 h-1 w-5 rounded-full bg-[#4F5E52]" />
              )}
            </Link>
          );
        })}

        <button
          type="button"
          aria-expanded={isMoreOpen}
          aria-label={moreLabel}
          onClick={() => setIsMoreOpen((current) => !current)}
          className={`relative inline-flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-medium transition ${
            isMoreActive || isMoreOpen
              ? "text-[#4F5E52]"
              : "text-[#9AA394] hover:bg-[#F5F1E8] hover:text-[#7B8776]"
          }`}
        >
          <MoreHorizontal aria-hidden className="h-5 w-5" />
          <span className="mt-1 max-w-full truncate leading-none">{moreLabel}</span>
          {(isMoreActive || isMoreOpen) && (
            <span className="mt-2 h-1 w-5 rounded-full bg-[#4F5E52]" />
          )}
        </button>
      </div>

      <div className="mx-auto hidden max-w-3xl items-stretch gap-1 rounded-t-[28px] border border-[#E8E9E5] border-b-0 bg-[#FCFAF5]/95 px-2 py-2 shadow-[0_-12px_35px_rgba(79,94,82,0.12)] backdrop-blur md:flex">
        {desktopNavItems.map((item) => {
          const isActive = pathname === item.href;
          const { Icon } = item;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative inline-flex min-w-[72px] flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-medium transition ${
                isActive
                  ? "text-[#4F5E52]"
                  : "text-[#9AA394] hover:bg-[#F5F1E8] hover:text-[#7B8776]"
              }`}
            >
              <Icon aria-hidden className="h-5 w-5" />
              <span className="mt-1 leading-none">{item.label || t.nav[item.labelKey]}</span>
              {isActive && (
                <span className="mt-2 h-1 w-5 rounded-full bg-[#4F5E52]" />
              )}
            </Link>
          );
        })}

        {/* Desktop More Button */}
        <button
          type="button"
          onClick={() => setIsMoreOpen((current) => !current)}
          className={`relative inline-flex min-w-[72px] flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-medium transition ${
            isMoreActive || isMoreOpen
              ? "text-[#4F5E52]"
              : "text-[#9AA394] hover:bg-[#F5F1E8] hover:text-[#7B8776]"
          }`}
        >
          <MoreHorizontal aria-hidden className="h-5 w-5" />
          <span className="mt-1 leading-none">{moreLabel}</span>
          {(isMoreActive || isMoreOpen) && (
            <span className="mt-2 h-1 w-5 rounded-full bg-[#4F5E52]" />
          )}
        </button>

        {isMoreOpen && (
          <div className="absolute bottom-full right-0 mb-4 w-64 rounded-3xl border border-[#E8E9E5] bg-[#FCFAF5]/98 p-2 shadow-xl backdrop-blur hidden md:block">
            {moreItems.map((item) => {
              const isActive = pathname === item.href;
              const { Icon } = item;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#F5F1E8] text-[#4F5E52]"
                      : "text-[#7B8776] hover:bg-[#F5F1E8] hover:text-[#4F5E52]"
                  }`}
                >
                  <Icon aria-hidden className="h-5 w-5 shrink-0" />
                  <span>{item.label || t.nav[item.labelKey]}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
