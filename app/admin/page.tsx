"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminUiExposed } from "@/lib/config/adminUiExposure";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Build 106 hotfix: the in-app admin console is not exposed in the production
    // UI. Admin AUTHORIZATION is unchanged; only this page surface is withdrawn.
    router.replace(isAdminUiExposed() ? "/admin/activity" : "/dashboard");
  }, [router]);

  return (
    <main className="min-h-screen bg-[#FCFAF5] flex items-center justify-center">
      <p className="text-[#7B8776] animate-pulse font-medium">Memuat...</p>
    </main>
  );
}
