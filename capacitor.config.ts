/// <reference types="@capacitor-firebase/authentication" />

import type { CapacitorConfig } from '@capacitor/cli';

const useFirebaseEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

const config: CapacitorConfig = {
  appId: 'com.bhumiamartya.app',
  appName: 'Bhumi Amartya',
  webDir: 'out',
  ...(useFirebaseEmulators ? {
    server: {
      androidScheme: 'http',
    },
  } : {}),
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    LocalNotifications: {
      iconColor: "#4F5E52",
    },
  },
};

export default config;
