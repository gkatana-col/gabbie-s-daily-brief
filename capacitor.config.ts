import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Minimal Capacitor configuration for future Android packaging.
 * The web app itself is untouched: Capacitor simply packages the
 * static SPA output in dist/client inside a WebView.
 */
const config: CapacitorConfig = {
  appId: 'com.brief.app',
  appName: 'Brief',
  webDir: '.output/public',
};

export default config;
