const config = {
  name: 'Pareja Finanzas',
  slug: 'pareja-finanzas',
  version: '1.0.4',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'parejafinanzas',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0F1117',
  },
  android: {
    package: 'com.samucky.parejafinanzas',
    adaptiveIcon: {
      backgroundColor: '#0F1117',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 120,
        resizeMode: 'contain',
        backgroundColor: '#0F1117',
      },
    ],
  ],
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
