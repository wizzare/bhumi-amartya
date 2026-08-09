'use client';

import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth, FOUNDER_EMAIL } from '@/lib/firebase';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, async (next) => {
    if (next && (next.email || '').toLowerCase() !== FOUNDER_EMAIL) {
      await signOut(auth);
      setError('Akses hanya untuk akun Founder.');
      setUser(null);
      return;
    }
    setUser(next);
  }), []);

  const login = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      if ((result.user.email || '').toLowerCase() !== FOUNDER_EMAIL) {
        await signOut(auth);
        setError('Akses hanya untuk akun Founder.');
      }
    } catch (e: any) {
      setError(e?.message || 'Google Sign-In gagal.');
    }
  };

  if (user === undefined) return <div className="login-page"><div className="login-card"><div className="brand-mark" style={{margin:'0 auto'}}>BA</div><h1>Founder Intelligence</h1><p>Memeriksa sesi Founder…</p></div></div>;

  if (!user) return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-mark" style={{margin:'0 auto'}}>BA</div>
        <h1>Bhumi Founder Intelligence</h1>
        <p>Dashboard bisnis, product analytics, komunikasi, dan Google Play. Akses khusus Founder.</p>
        {error && <div className="error-box">{error}</div>}
        <button className="google-btn" onClick={login}>G&nbsp;&nbsp; Masuk dengan Google</button>
        <p style={{fontSize:9}}>Allowed: {FOUNDER_EMAIL}</p>
      </div>
    </div>
  );

  return <>{children}</>;
}

export async function founderLogout() {
  await signOut(auth);
}
