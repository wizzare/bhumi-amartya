import { FOUNDER_EMAIL } from '@/lib/firebase';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBpggqO_lvH9m4nmYqvRl1r02tO9260z-A';

type LookupResponse = {
  users?: Array<{ email?: string; localId?: string }>;
};

export async function verifyFounderRequest(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return { ok: false as const, status: 401, reason: 'missing_token' };

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: match[1] }),
      cache: 'no-store',
    });

    if (!response.ok) return { ok: false as const, status: 401, reason: 'invalid_token' };
    const data = await response.json() as LookupResponse;
    const user = data.users?.[0];
    const email = String(user?.email || '').trim().toLowerCase();
    if (!email || email !== FOUNDER_EMAIL.toLowerCase()) {
      return { ok: false as const, status: 403, reason: 'founder_only' };
    }

    return { ok: true as const, email, uid: String(user?.localId || '') };
  } catch {
    return { ok: false as const, status: 503, reason: 'auth_lookup_failed' };
  }
}
