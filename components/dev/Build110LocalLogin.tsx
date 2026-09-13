"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { isBuild110LocalQa } from '@/lib/config/localQa';

export function Build110LocalLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = searchParams.get('next') || '/dashboard';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!isBuild110LocalQa()) return null;
  async function enter(cohort: 'baru' | 'lama') {
    if (!isBuild110LocalQa() || auth.app.options.projectId !== 'demo-build110-local') return;
    setBusy(true);
    setError('');
    try {
      // Disposable credentials accepted only by the isolated Auth emulator.
      await signInWithEmailAndPassword(auth, `${cohort}@build110.test`, 'Build110-local-only!');
      if (cohort === 'lama') {
        router.replace(nextTarget);
      } else {
        router.replace('/setup');
      }
    } catch {
      setError('Akun uji belum siap. Pastikan emulator dan fixture lokal sedang berjalan, lalu coba lagi.');
    } finally { setBusy(false); }
  }
  return <section className="space-y-3 rounded-2xl border border-[#D9D6CC] bg-[#F7F4ED] p-5">
    <h2 className="font-semibold">Pratinjau lokal Founder</h2>
    <p className="text-sm">Data contoh sintetis. Pilih alur yang ingin diperiksa.</p>
    <button className="bhumi-button w-full" disabled={busy} onClick={() => void enter('lama')}>Buka profil contoh lengkap</button>
    <button className="bhumi-button w-full" disabled={busy} onClick={() => void enter('baru')}>Periksa setup pengguna baru</button>
    {busy && <p role="status">Menyiapkan sesi lokal…</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
