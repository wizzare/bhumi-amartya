"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/activity");
  }, [router]);

  return (
    <main className="min-h-screen bg-[#FCFAF5] flex items-center justify-center">
      <p className="text-[#7B8776] animate-pulse font-medium">Memuat Founder Dashboard...</p>
    </main>
  );
}
