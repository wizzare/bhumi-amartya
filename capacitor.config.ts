/// <reference types="@capacitor-firebase/authentication" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bhumiamartya.app',
  appName: 'Bhumi Amartya',
  webDir: 'out',
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
