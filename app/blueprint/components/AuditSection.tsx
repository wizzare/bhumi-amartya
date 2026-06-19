"use client";

import React from 'react';

export function AuditField({
  label,
  value,
  sourcePath,
  isFounder,
}: {
  label: string;
  value: any;
  sourcePath: string;
  isFounder: boolean;
}) {
  const isMissing = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
  
  let displayValue = 'Belum tersedia';
  if (!isMissing) {
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (typeof value === 'object') {
      displayValue = JSON.stringify(value);
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Ya' : 'Tidak';
    } else {
      displayValue = String(value);
    }
  }

  return (
    <div className="border-b border-[#E8E9E5] py-3 last:border-0 flex flex-col gap-1">
      <div className="flex items-start justify-between gap-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#7B8776]">{label}</p>
        <p className={`text-right text-sm font-semibold text-wrap break-all ${isMissing ? 'text-[#8A9489] italic font-normal' : 'text-[#4F5E52]'}`}>
          {displayValue}
        </p>
      </div>
      {isFounder && (
        <div className="flex justify-between items-center bg-[#F5F1E8] px-2 py-1 rounded text-[9px] font-mono text-[#8A9489] mt-1">
          <span>{sourcePath || ""}</span>
          <span className={isMissing ? 'text-rose-500 font-bold' : 'text-emerald-600'}>{isMissing ? 'MISSING' : 'OK'}</span>
        </div>
      )}
    </div>
  );
}

export function AuditSection({
  title,
  fields,
  isFounder,
}: {
  title: string;
  fields: { label: string; value: any; sourcePath: string }[];
  isFounder: boolean;
}) {
  const missingCount = fields.filter(f => f.value === undefined || f.value === null || f.value === '' || (Array.isArray(f.value) && f.value.length === 0)).length;
  const total = fields.length;
  const percentage = total > 0 ? Math.round(((total - missingCount) / total) * 100) : 0;

  return (
    <section className="rounded-[2rem] border border-[#E8E9E5] bg-white p-7 shadow-sm mb-5">
      <div className="flex justify-between items-end mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">{title}</p>
        {isFounder && (
          <div className="text-[9px] font-mono font-bold bg-[#E8E9E5] px-2 py-1 rounded-md text-[#4F5E52]">
            {percentage}% ({total - missingCount}/{total})
          </div>
        )}
      </div>
      <div className="space-y-1">
        {fields.map(f => (
          <AuditField key={f.label} {...f} isFounder={isFounder} />
        ))}
      </div>
    </section>
  );
}
