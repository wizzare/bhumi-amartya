# Project-specific ProGuard / R8 rules for Bhumi Amartya
# AGP 9.2.1 / R8 optimization configuration

# Preserve line numbers and source file attributes for Play Console de-obfuscation
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Preserve MainActivity entry point
-keep public class com.bhumiamartya.app.MainActivity {
    public *;
}

# Preserve custom native Capacitor plugins registered in MainActivity
-keep class com.bhumiamartya.app.billing.BhumiBillingPlugin { *; }
-keep class com.bhumiamartya.app.ReviewPlugin { *; }
-keep class com.bhumiamartya.app.AppUpdatePlugin { *; }

# Google Play Billing Library IPC interfaces and models
-keep class com.android.billingclient.api.** { *; }

# Google Play In-App Review and In-App Update
-keep class com.google.android.play.core.review.** { *; }
-keep class com.google.android.play.core.appupdate.** { *; }

# Suppress missing-class warnings on unbundled optional Facebook SDK (compileOnly in @capacitor-firebase/authentication)
-dontwarn com.facebook.**
