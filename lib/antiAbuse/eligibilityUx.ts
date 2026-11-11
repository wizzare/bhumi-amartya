export type AntiAbuseUxBanner = {
  kind: "free_limit_reached" | "verification_required";
  title: string;
  description: string;
  primaryCtaLabel: string;
  restoreCtaLabel: string;
  switchAccountCtaLabel: string;
  verifyAccountCtaLabel: string;
};

export function getAntiAbuseUxCopy(profile?: Record<string, unknown> | null): AntiAbuseUxBanner | null {
  if (!profile) return null;
  const status = typeof profile.trialEligibilityStatus === "string" ? profile.trialEligibilityStatus : "";

  if (status === "DEVICE_FREE_TRIAL_USED" || status === "FREE_LIMIT_REACHED") {
    return {
      kind: "free_limit_reached",
      title: "Akses Gratis Telah Digunakan",
      description:
        "Kamu sudah pernah menikmati akses gratis Bhumi Amartya. Untuk melanjutkan perjalanan mengenal diri dengan fitur lebih lengkap, kamu bisa menjelajahi Bhumi Premium.",
      primaryCtaLabel: "Lihat Bhumi Premium",
      restoreCtaLabel: "Pulihkan Pembelian",
      switchAccountCtaLabel: "Masuk Akun Lama",
      verifyAccountCtaLabel: "Verifikasi Akun",
    };
  }

  if (status === "VERIFICATION_REQUIRED" || status === "SIGNAL_UNAVAILABLE" || status === "SUSPECTED_DUPLICATE") {
    return {
      kind: "verification_required",
      title: "Kami Perlu Memverifikasi Aksesmu",
      description:
        "Kami perlu memverifikasi integritas akun dan perangkat sebelum melanjutkan akses gratis. Kamu dapat mencoba verifikasi ulang atau melanjutkan ke Bhumi Premium.",
      primaryCtaLabel: "Lihat Bhumi Premium",
      restoreCtaLabel: "Pulihkan Pembelian",
      switchAccountCtaLabel: "Masuk Akun Lama",
      verifyAccountCtaLabel: "Verifikasi Akun",
    };
  }

  return null;
}
