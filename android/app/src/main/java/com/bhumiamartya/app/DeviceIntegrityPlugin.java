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
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@CapacitorPlugin(name = "DeviceIntegrity")
public class DeviceIntegrityPlugin extends Plugin {
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
            result.put("appSetIdHash", JSObject.NULL);
        } catch (Exception e) {
            result.put("deviceIdHash", JSObject.NULL);
            result.put("appSetIdHash", JSObject.NULL);
        }

        call.resolve(result);
    }
}
