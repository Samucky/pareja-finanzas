import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Pareja Finanzas',
  slug: 'pareja-finanzas',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'parejafinanzas',
  android: {
    package: 'com.samucky.parejafinanzas',
    adaptiveIcon: {
      backgroundColor: '#0F1117',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
  },
  plugins: ['expo-router', 'expo-font', 'expo-secure-store', 'expo-splash-screen'],
  extra: {
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL ??
      'https://pareja-finanzas.onrender.com',
    eas: {
      projectId: 'f6000fcf-cba5-4325-8ac0-0df72763f401',
    },
  },
};

export default config;
