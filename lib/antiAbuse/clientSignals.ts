import { Capacitor, registerPlugin } from "@capacitor/core";

export type ClientAntiAbuseSignals = {
  platform: "android" | "web" | "ios" | "unknown";
  appVersionCode: number | null;
  deviceIdHash: string | null;
  appSetIdHash: string | null;
  installIdHash: string | null;
  challengeToken?: string | null;
  integrityToken?: string | null;
};

type DeviceIntegrityPluginType = {
  getDeviceSignals(): Promise<{
    deviceIdHash?: string | null;
    appSetIdHash?: string | null;
    appVersionCode?: number | null;
    isEmulator?: boolean;
    installerPackage?: string | null;
  }>;
  requestIntegrityToken?(options: { nonce: string; cloudProjectNumber?: number }): Promise<{
    integrityToken?: string | null;
    integrityError?: string | null;
  }>;
};

const DeviceIntegrityPlugin = registerPlugin<DeviceIntegrityPluginType>("DeviceIntegrity");
const INSTALL_STORAGE_KEY = "bhumi_client_install_id_v1";

function fallbackUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

async function sha256Hex(value: string): Promise<string | null> {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;
  const encoded = new TextEncoder().encode(`bhumi-client-v1:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getOrCreateInstallId(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const existing = window.localStorage.getItem(INSTALL_STORAGE_KEY);
    if (existing && existing.length >= 16) return existing;
    const created = fallbackUuid();
    window.localStorage.setItem(INSTALL_STORAGE_KEY, created);
    return created;
  } catch {
    return null;
  }
}

export async function collectClientAntiAbuseSignals(): Promise<ClientAntiAbuseSignals> {
  const isNative = Capacitor.isNativePlatform();
  const capPlatform = Capacitor.getPlatform();
  const platform: ClientAntiAbuseSignals["platform"] =
    capPlatform === "android"
      ? "android"
      : capPlatform === "ios"
        ? "ios"
        : typeof window !== "undefined"
          ? "web"
          : "unknown";

  const installId = getOrCreateInstallId();
  const installIdHash = installId ? await sha256Hex(installId).catch(() => null) : null;

  if (isNative && platform === "android") {
    try {
      const nativeSignals = await DeviceIntegrityPlugin.getDeviceSignals();
      return {
        platform: "android",
        appVersionCode: typeof nativeSignals.appVersionCode === "number" ? nativeSignals.appVersionCode : null,
        deviceIdHash: typeof nativeSignals.deviceIdHash === "string" ? nativeSignals.deviceIdHash : null,
        appSetIdHash: typeof nativeSignals.appSetIdHash === "string" ? nativeSignals.appSetIdHash : null,
        installIdHash,
      };
    } catch {
      return {
        platform: "android",
        appVersionCode: null,
        deviceIdHash: null,
        appSetIdHash: null,
        installIdHash,
      };
    }
  }

  return {
    platform,
    appVersionCode: null,
    deviceIdHash: null,
    appSetIdHash: null,
    installIdHash,
  };
}

export async function requestNativePlayIntegrityToken(
  nonce: string,
): Promise<{ integrityToken: string | null; integrityError: string | null }> {
  if (!nonce || !Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
    return { integrityToken: null, integrityError: null };
  }
  try {
    if (typeof DeviceIntegrityPlugin.requestIntegrityToken !== "function") {
      return { integrityToken: null, integrityError: "PLUGIN_METHOD_UNAVAILABLE" };
    }
    const res = await DeviceIntegrityPlugin.requestIntegrityToken({ nonce });
    return {
      integrityToken: typeof res?.integrityToken === "string" ? res.integrityToken : null,
      integrityError: typeof res?.integrityError === "string" ? res.integrityError : null,
    };
  } catch {
    return { integrityToken: null, integrityError: "INTEGRITY_CALL_FAILED" };
  }
}
