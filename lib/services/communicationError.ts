export type CommunicationErrorKind = 'offline' | 'permission' | 'auth' | 'request' | 'retry' | 'precondition' | 'error';

export function classifyCommunicationError(error: unknown, online = true): CommunicationErrorKind {
  const code = String((error as { code?: string })?.code || '').toLowerCase();
  if (!online || code === 'unavailable' || code === 'network-request-failed') return 'offline';
  if (code === 'permission-denied') return 'permission';
  if (code === 'unauthenticated') return 'auth';
  if (code === 'invalid-argument' || code === 'not-found' || code === 'already-exists') return 'request';
  if (code === 'resource-exhausted') return 'retry';
  if (code === 'failed-precondition') return 'precondition';
  return 'error';
}

export function communicationErrorMessage(kind: CommunicationErrorKind) {
  return ({ offline: 'Koneksi sedang offline.', permission: 'Kamu tidak memiliki izin untuk melakukan tindakan ini.', auth: 'Sesi login belum siap. Silakan login kembali.', request: 'Permintaan pesan tidak valid.', retry: 'Terlalu banyak permintaan. Silakan coba lagi.', precondition: 'Konfigurasi Inbox sedang diperbarui. Silakan muat ulang halaman.', error: 'Terjadi kesalahan saat memproses komunikasi.' })[kind];
}

export function communicationErrorCode(error: unknown) { return String((error as { code?: string })?.code || 'unknown'); }
