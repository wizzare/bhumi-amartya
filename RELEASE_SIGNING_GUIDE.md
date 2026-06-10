# Release Signing Guide - Bhumi Amartya

This guide outlines the steps to prepare and configure Android release signing for the Google Play Store.

## 1. Audit Result
- **Release Keystore:** ❌ Not Found.
- **Signing Configuration (`app/build.gradle`):** ❌ Missing `signingConfigs` for release.
- **Bundle Readiness:** ⚠️ `bundleRelease` will fail until signing is configured.

---

## 2. Create a Release Keystore

If you do not have a keystore, you can generate one using the `keytool` command (provided with the JDK).

### Recommended Configuration:
- **Location:** `android/app/bhumi-release.keystore` (Add this to `.gitignore` if not already there).
- **Alias:** `bhumi-alias`
- **Validity:** `10000` days

### Command:
Run the following command in your terminal:

```bash
keytool -genkey -v -keystore android/app/bhumi-release.keystore -alias bhumi-alias -keyalg RSA -keysize 2048 -validity 10000
```

*Note: You will be prompted to enter passwords and organizational details.*

---

## 3. Configure Gradle Signing

To avoid committing passwords to version control, it is recommended to use `gradle.properties` or environment variables.

### Step A: Update `android/gradle.properties`
Add the following lines (replace placeholders with actual values):

```properties
BHUMI_RELEASE_STORE_FILE=bhumi-release.keystore
BHUMI_RELEASE_STORE_PASSWORD=your_keystore_password
BHUMI_RELEASE_KEY_ALIAS=bhumi-alias
BHUMI_RELEASE_KEY_PASSWORD=your_key_password
```

### Step B: Update `android/app/build.gradle`
Modify the `android` block to include `signingConfigs`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('BHUMI_RELEASE_STORE_FILE')) {
                storeFile file(BHUMI_RELEASE_STORE_FILE)
                storePassword BHUMI_RELEASE_STORE_PASSWORD
                keyAlias BHUMI_RELEASE_KEY_ALIAS
                keyPassword BHUMI_RELEASE_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 4. Build the App Bundle (AAB)

Once configured, generate the signed bundle for Play Store upload:

```bash
cd android
./gradlew bundleRelease
```

The generated file will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 5. Security Best Practices
1. **NEVER** commit your `.keystore` file to a public repository.
2. **NEVER** commit production passwords to `gradle.properties` in version control. Use a local `gradle.properties` that is ignored by Git, or use a CI/CD secret manager.
3. Keep a backup of your keystore in a safe, offline location. Losing it will prevent you from updating your app on the Play Store.
