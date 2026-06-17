"use client";

import React from "react";
import { HumanDesignChart } from "@/lib/humandesign/types";

interface FounderDebugHDProps {
  hd: HumanDesignChart;
}

export function FounderDebugHD({ hd }: FounderDebugHDProps) {
  return (
    <div className="mt-8 p-6 rounded-3xl bg-black text-green-400 font-mono text-[10px] overflow-auto max-h-96 border-4 border-yellow-500 shadow-2xl">
      <h3 className="text-yellow-500 font-bold mb-4 uppercase tracking-widest text-xs">
        🛠️ Founder Debug Mode (Human Design Raw)
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <section className="space-y-1">
          <p><span className="text-gray-500">TYPE:</span> {hd.type}</p>
          <p><span className="text-gray-500">AUTH:</span> {hd.authority}</p>
          <p><span className="text-gray-500">PROF:</span> {hd.profile}</p>
          <p><span className="text-gray-500">DEFN:</span> {hd.definition}</p>
          <p><span className="text-gray-500">STRAT:</span> {hd.strategy}</p>
          <p><span className="text-gray-500">CROSS:</span> {hd.incarnationCross.name}</p>
        </section>

        <section className="space-y-1">
          <p><span className="text-gray-500">SOURCE:</span> {hd.source}</p>
          <p><span className="text-gray-500">ACCY:</span> {hd.accuracy}</p>
          <p><span className="text-gray-500">TZ:</span> {hd.timezone} ({hd.timezoneSource})</p>
          <p><span className="text-gray-500">UPDATED:</span> {String(hd.updatedAt)}</p>
        </section>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-yellow-500 mb-2 font-bold">CHANNELS ({hd.channels.length}):</p>
        <p className="break-words">{hd.channels.join(", ")}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-yellow-500 mb-2 font-bold">GATES ({hd.gates.length}):</p>
        <p className="break-words">{hd.gates.join(", ")}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-yellow-500 mb-2 font-bold">VARIABLES:</p>
        <pre className="text-[8px]">{JSON.stringify(hd.variables, null, 2)}</pre>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 flex gap-4">
        <div>
           <p className="text-yellow-500 font-bold mb-1">CENTERS:</p>
           {Object.entries(hd.centers).map(([k, v]) => (
             <p key={k} className={v ? "text-green-400" : "text-gray-700"}>
               {v ? "●" : "○"} {k.toUpperCase()}
             </p>
           ))}
        </div>
      </div>
    </div>
  );
}
