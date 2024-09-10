import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ionic.traveller',
  appName: 'Traveller',
  webDir: 'www/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
