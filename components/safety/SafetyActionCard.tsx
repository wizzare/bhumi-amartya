"use client";

import React, { useState } from "react";
import { ShieldAlert, Heart, Phone, MessageCircle, UserPlus, X, CheckCircle2 } from "lucide-react";
import { SafetyState } from "@/lib/engines/safetySentinelEngine";
import { TrustedContact } from "@/lib/repositories/safetyRepository";
import { SUPPORT_DISCLAIMERS } from "@/lib/data/supportResourceLibrary";

interface SafetyActionCardProps {
  state: SafetyState;
  trustedContact?: TrustedContact;
  language: "id" | "en";
  onDismiss: () => void;
}

export function SafetyActionCard({ state, trustedContact, language, onDismiss }: SafetyActionCardProps) {
  const [flow, setFlow] = useState<"initial" | "additional_support">("initial");

  const handleCall119 = () => {
    window.location.href = "tel:119";
  };

  const handleTextContact = () => {
    if (trustedContact?.phone) {
      const msg = language === "id"
        ? "Halo, saya sedang berada di fase yang berat dan butuh teman bicara. Bisa tolong hubungi saya?"
        : "Hi, I'm going through a heavy phase and need someone to talk to. Could you reach out?";
      window.location.href = `sms:${trustedContact.phone}?body=${encodeURIComponent(msg)}`;
    }
  };

  if (flow === "initial") {
    return (
      <div className="mt-8 bhumi-card p-8 bg-[#F8F9FB] border-2 border-indigo-100 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <ShieldAlert size={80} className="text-indigo-600" />
        </div>

        <header className="mb-6 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white text-indigo-600 shadow-sm">
            <Heart size={24} fill="currentColor" />
          </div>
          <h3 className="text-[#4F6658] font-bold text-xl italic">Dukungan Untukmu</h3>
        </header>

        <p className="text-[15px] text-[#3C3C3C] leading-relaxed mb-8 font-medium italic opacity-90">
          "{SUPPORT_DISCLAIMERS.safety_intro}"
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setFlow("additional_support")}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {language === "id" ? "Saya Butuh Dukungan Tambahan" : "I Want Additional Support"}
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-4 rounded-2xl bg-white border border-[#E8E9E5] text-[#7B8776] text-xs font-bold uppercase tracking-widest hover:border-[#4F6658] transition-all"
          >
            {language === "id" ? "Saya Baik-baik Saja" : "I Am Okay"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bhumi-card p-8 bg-white border-2 border-indigo-100 shadow-xl animate-in zoom-in-95 duration-300">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h3 className="text-indigo-600 font-bold text-xl italic">Jalur Aman</h3>
          <p className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest mt-1">Dukungan manusia & profesional</p>
        </div>
        <button onClick={() => setFlow("initial")} className="text-[#9AA394] hover:text-[#4F6658]">
          <X size={20} />
        </button>
      </header>

      <div className="space-y-6">
        {/* HEALING119 */}
        <div className="p-5 rounded-[2rem] bg-indigo-50 border border-indigo-100 group cursor-pointer hover:shadow-md transition-all" onClick={handleCall119}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
                 <Phone size={18} />
               </div>
               <h4 className="text-sm font-bold text-indigo-800 italic">Healing119 (Kemenkes)</h4>
            </div>
            <span className="text-[9px] font-bold bg-white text-indigo-600 px-2 py-0.5 rounded-full uppercase">24 Jam</span>
          </div>
          <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
            Hubungi 119 (Ext 8) untuk bantuan stabilisasi emosi dan dukungan psikologis awal.
          </p>
        </div>

        {/* TRUSTED CONTACT */}
        {trustedContact && trustedContact.isActive && (
          <div className="p-5 rounded-[2rem] bg-emerald-50 border border-emerald-100 group cursor-pointer hover:shadow-md transition-all" onClick={handleTextContact}>
            <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm">
                 <MessageCircle size={18} />
               </div>
               <h4 className="text-sm font-bold text-emerald-800 italic">Hubungi {trustedContact.name}</h4>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
              Klik untuk mengirim pesan bantuan yang sudah disiapkan ke kontak terpercayamu.
            </p>
          </div>
        )}

        {!trustedContact && (
           <div className="p-5 rounded-[2rem] bg-[#FCFAF5] border border-[#E8E9E5] border-dashed">
             <div className="flex items-center gap-3 mb-2">
                <UserPlus size={16} className="text-[#9BB89A]" />
                <h4 className="text-[11px] font-bold text-[#7B8776] uppercase">Tambah Kontak Terpercaya</h4>
             </div>
             <p className="text-[10px] text-[#9AA394] leading-relaxed">
               Di masa depan, kamu bisa mendaftarkan satu kontak untuk membantumu di saat sulit.
             </p>
           </div>
        )}

        <div className="pt-4 border-t border-[#F5F1E8]">
           <p className="text-[10px] text-[#7B8776] leading-relaxed italic text-center">
             "{SUPPORT_DISCLAIMERS.safety_recommendation}"
           </p>
        </div>
      </div>
    </div>
  );
}
