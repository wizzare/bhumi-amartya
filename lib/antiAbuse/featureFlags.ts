export type AntiAbuseMode = "off" | "observe" | "enforce";

export type AntiAbuseFeatureFlags = {
  mode: AntiAbuseMode;
  enforceDeviceFreeClaim: boolean;
  allowSignalUnavailableFallback: boolean;
  enableBirthFingerprintObservation: boolean;
  requirePlayIntegrity: boolean;
  requireAppCheck: boolean;
  enableVc121MigrationGrace: boolean;
};

export const DEFAULT_ANTI_ABUSE_FLAGS: AntiAbuseFeatureFlags = {
  mode: "observe",
  enforceDeviceFreeClaim: false,
  allowSignalUnavailableFallback: true,
  enableBirthFingerprintObservation: true,
  requirePlayIntegrity: false,
  requireAppCheck: false,
  enableVc121MigrationGrace: true,
};

function parseBoolEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return fallback;
}

function parseModeEnv(value: string | undefined, fallback: AntiAbuseMode): AntiAbuseMode {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "off" || normalized === "observe" || normalized === "enforce") {
    return normalized;
  }
  return fallback;
}

export function resolveAntiAbuseFeatureFlags(
  remoteConfig?: Partial<Record<keyof AntiAbuseFeatureFlags, unknown>> | null,
  env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {},
): AntiAbuseFeatureFlags {
  const envMode = parseModeEnv(env.BHUMI_ANTI_ABUSE_MODE, DEFAULT_ANTI_ABUSE_FLAGS.mode);
  const remoteMode =
    remoteConfig && typeof remoteConfig.mode === "string"
      ? parseModeEnv(remoteConfig.mode, envMode)
      : envMode;

  const mode: AntiAbuseMode = env.BHUMI_ANTI_ABUSE_KILL_SWITCH === "true" ? "off" : remoteMode;

  if (mode === "off") {
    return {
      mode: "off",
      enforceDeviceFreeClaim: false,
      allowSignalUnavailableFallback: true,
      enableBirthFingerprintObservation: false,
      requirePlayIntegrity: false,
      requireAppCheck: false,
      enableVc121MigrationGrace: true,
    };
  }

  const pickBool = (key: keyof AntiAbuseFeatureFlags, envKey: string, defaultVal: boolean) => {
    if (remoteConfig && typeof remoteConfig[key] === "boolean") {
      return remoteConfig[key] as boolean;
    }
    return parseBoolEnv(env[envKey], defaultVal);
  };

  return {
    mode,
    enforceDeviceFreeClaim:
      mode === "enforce" && pickBool("enforceDeviceFreeClaim", "BHUMI_ANTI_ABUSE_ENFORCE_DEVICE", true),
    allowSignalUnavailableFallback: pickBool(
      "allowSignalUnavailableFallback",
      "BHUMI_ANTI_ABUSE_SIGNAL_FALLBACK",
      DEFAULT_ANTI_ABUSE_FLAGS.allowSignalUnavailableFallback,
    ),
    enableBirthFingerprintObservation: pickBool(
      "enableBirthFingerprintObservation",
      "BHUMI_ANTI_ABUSE_BIRTH_FINGERPRINT",
      DEFAULT_ANTI_ABUSE_FLAGS.enableBirthFingerprintObservation,
    ),
    requirePlayIntegrity:
      mode === "enforce" && pickBool("requirePlayIntegrity", "BHUMI_ANTI_ABUSE_REQUIRE_PLAY_INTEGRITY", false),
    requireAppCheck:
      mode === "enforce" && pickBool("requireAppCheck", "BHUMI_ANTI_ABUSE_REQUIRE_APP_CHECK", false),
    enableVc121MigrationGrace: pickBool(
      "enableVc121MigrationGrace",
      "BHUMI_ANTI_ABUSE_VC121_GRACE",
      DEFAULT_ANTI_ABUSE_FLAGS.enableVc121MigrationGrace,
    ),
  };
}
