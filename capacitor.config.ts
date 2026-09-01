import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tivaid.app',
  appName: 'TivAid',
  webDir: 'out',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'http://10.0.2.2:3000',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
