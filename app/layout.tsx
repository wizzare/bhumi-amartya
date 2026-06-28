import type { Metadata } from "next";
import "./globals.css";

import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { APP_VERSION, RELEASE_NAME } from "@/src/lib/version";
import { GentleNightReminderLifecycle } from "@/components/notifications/GentleNightReminderLifecycle";
import { ActivityTracker } from "@/components/analytics/ActivityTracker";
import { VersionChecker } from "@/components/global/VersionChecker";

export const metadata: Metadata = {

  title:
    "Bhumi Amartya",

  description:
    "Ruang untuk pulang dan mengenali diri.",

  manifest: "/manifest.json",

  other: {
    "google-adsense-account": "ca-pub-0971666335614952",
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (

    <html lang="en">

      <body>

        <AuthProvider>
          <ActivityTracker />
          <VersionChecker />
          <LanguageProvider>
            <GentleNightReminderLifecycle />
            {children}
            <footer className="border-t border-[#4F5E52]/10 bg-[#FCFAF5] px-6 py-4 text-center text-xs uppercase tracking-[0.18em] text-[#7B8776]">
              Versi: {APP_VERSION} {RELEASE_NAME}
            </footer>
          </LanguageProvider>
        </AuthProvider>

      </body>

    </html>

  );

}
