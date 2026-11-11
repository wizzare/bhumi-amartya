package com.bhumiamartya.app;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.appset.AppSet;
import com.google.android.play.core.integrity.IntegrityManager;
import com.google.android.play.core.integrity.IntegrityManagerFactory;
import com.google.android.play.core.integrity.IntegrityTokenRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@CapacitorPlugin(name = "DeviceIntegrity")
public class DeviceIntegrityPlugin extends Plugin {
    private static final long DEFAULT_CLOUD_PROJECT_NUMBER = 59259824153L;

    private static String sha256Hex(String input) {
        if (input == null || input.trim().isEmpty()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            return null;
        }
    }

    private static boolean detectEmulator() {
        String fingerprint = Build.FINGERPRINT != null ? Build.FINGERPRINT : "";
        String model = Build.MODEL != null ? Build.MODEL : "";
        String hardware = Build.HARDWARE != null ? Build.HARDWARE : "";
        String product = Build.PRODUCT != null ? Build.PRODUCT : "";
        return fingerprint.startsWith("generic")
            || fingerprint.startsWith("unknown")
            || model.contains("google_sdk")
            || model.contains("Emulator")
            || model.contains("Android SDK built for x86")
            || hardware.contains("goldfish")
            || hardware.contains("ranchu")
            || product.contains("sdk_gphone");
    }

    @PluginMethod
    public void getDeviceSignals(PluginCall call) {
        JSObject result = new JSObject();
        Context context = getContext();
        if (context == null) {
            result.put("deviceIdHash", JSObject.NULL);
            result.put("appSetIdHash", JSObject.NULL);
            call.resolve(result);
            return;
        }

        try {
            String androidId = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
            String pkgName = context.getPackageName();
            String hashedAndroidId = androidId != null && !androidId.trim().isEmpty()
                ? sha256Hex("bhumi-android-ssaid-v1:" + pkgName + ":" + androidId.trim())
                : null;
            result.put("deviceIdHash", hashedAndroidId != null ? hashedAndroidId : JSObject.NULL);

            long versionCode = 0L;
            String installerPackage = null;
            PackageManager pm = context.getPackageManager();
            if (pm != null) {
                PackageInfo info = pm.getPackageInfo(pkgName, 0);
                if (info != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        versionCode = info.getLongVersionCode();
                    } else {
                        versionCode = info.versionCode;
                    }
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    installerPackage = pm.getInstallSourceInfo(pkgName).getInstallingPackageName();
                } else {
                    installerPackage = pm.getInstallerPackageName(pkgName);
                }
            }

            result.put("appVersionCode", versionCode > 0 ? versionCode : JSObject.NULL);
            result.put("installerPackage", installerPackage != null ? installerPackage : JSObject.NULL);
            result.put("isEmulator", detectEmulator());

            try {
                final String finalPkgName = pkgName;
                AppSet.getClient(context)
                    .getAppSetIdInfo()
                    .addOnSuccessListener(appSetInfo -> {
                        String id = appSetInfo != null ? appSetInfo.getId() : null;
                        String hash = (id != null && !id.trim().isEmpty())
                            ? sha256Hex("bhumi-android-appset-v1:" + finalPkgName + ":" + id.trim())
                            : null;
                        result.put("appSetIdHash", hash != null ? hash : JSObject.NULL);
                        call.resolve(result);
                    })
                    .addOnFailureListener(err -> {
                        result.put("appSetIdHash", JSObject.NULL);
                        call.resolve(result);
                    });
                return;
            } catch (Exception ignored) {
                result.put("appSetIdHash", JSObject.NULL);
            }
        } catch (Exception e) {
            result.put("deviceIdHash", JSObject.NULL);
            result.put("appSetIdHash", JSObject.NULL);
        }

        call.resolve(result);
    }

    @PluginMethod
    public void requestIntegrityToken(PluginCall call) {
        JSObject result = new JSObject();
        Context context = getContext();
        String nonce = call.getString("nonce", "");
        if (context == null || nonce == null || nonce.trim().length() < 16) {
            result.put("integrityToken", JSObject.NULL);
            result.put("integrityError", "INVALID_CONTEXT_OR_NONCE");
            call.resolve(result);
            return;
        }

        long cloudProjectNumber = DEFAULT_CLOUD_PROJECT_NUMBER;
        Integer provided = call.getInt("cloudProjectNumber");
        if (provided != null && provided > 0) {
            cloudProjectNumber = provided.longValue();
        } else {
            String rawNum = call.getString("cloudProjectNumberStr");
            if (rawNum != null && !rawNum.trim().isEmpty()) {
                try {
                    long parsed = Long.parseLong(rawNum.trim());
                    if (parsed > 0) {
                        cloudProjectNumber = parsed;
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }

        try {
            IntegrityManager integrityManager = IntegrityManagerFactory.create(context);
            IntegrityTokenRequest request = IntegrityTokenRequest.builder()
                .setCloudProjectNumber(cloudProjectNumber)
                .setNonce(nonce.trim())
                .build();

            integrityManager
                .requestIntegrityToken(request)
                .addOnSuccessListener(response -> {
                    String token = response != null ? response.token() : null;
                    if (token != null && !token.trim().isEmpty()) {
                        result.put("integrityToken", token.trim());
                        result.put("integrityError", JSObject.NULL);
                    } else {
                        result.put("integrityToken", JSObject.NULL);
                        result.put("integrityError", "EMPTY_INTEGRITY_TOKEN");
                    }
                    call.resolve(result);
                })
                .addOnFailureListener(err -> {
                    result.put("integrityToken", JSObject.NULL);
                    result.put("integrityError", err != null && err.getMessage() != null ? err.getMessage() : "INTEGRITY_REQUEST_FAILED");
                    call.resolve(result);
                });
        } catch (Exception e) {
            result.put("integrityToken", JSObject.NULL);
            result.put("integrityError", e.getMessage() != null ? e.getMessage() : "INTEGRITY_EXCEPTION");
            call.resolve(result);
        }
    }
}
