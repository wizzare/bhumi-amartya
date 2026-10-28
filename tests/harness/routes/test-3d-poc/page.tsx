"use client";

import React, { useState } from "react";
import { Real3DEarth } from "@/components/environment/Real3DEarth";
import { Animated3DObjectPOC } from "@/components/celestial/Animated3DObjectPOC";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";


export default function ThreeDPocTestPage() {
  const [view, setView] = useState("earth");
  const [animate, setAnimate] = useState(true);
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#F7F4EE] px-6 py-10 text-[#2D352E]">
        <BhumiPageHeader className="mb-6" />
        <h1>Validasi 3D terisolasi</h1>
        <div role="group" aria-label="Pilih objek">
          <button type="button" aria-pressed={view === "earth"} onClick={() => setView("earth")}>Bumi</button>
          <button type="button" aria-pressed={view === "model"} onClick={() => setView("model")}>Objek glTF</button>
        </div>
        <button type="button" aria-pressed={!animate} onClick={() => setAnimate(!animate)}>{animate ? "Jeda" : "Lanjutkan"}</button>
        {view === "earth" ? <Real3DEarth size={220} allowAnimation={animate} /> : <Animated3DObjectPOC size={220} allowAnimation={animate} />}
        <p>Fitur pengembangan internal: satu objek glTF sintetis CC0 dan Bumi 3D melalui pipeline Bhumi.</p>
      </main>
    </ProtectedRoute>
  );
}

