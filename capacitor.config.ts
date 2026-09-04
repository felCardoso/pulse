import type { CapacitorConfig } from '@capacitor/cli'

// Echo ships as a hosted PWA (Vercel) — Capacitor just wraps that live site
// in a native shell instead of bundling a static export, so dynamic routes
// and the existing deploy pipeline keep working unchanged. Point this at
// your production domain before building; the placeholder below will 404.
const PRODUCTION_URL = 'https://echo.monti.dev.br'

const config: CapacitorConfig = {
  appId: 'com.echo.app',
  appName: 'Echo',
  webDir: 'public',
  server: {
    url: PRODUCTION_URL,
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      // Status-bar icons must be a plain white silhouette — Android ignores
      // any other colors in the drawable and tints it with iconColor below.
      smallIcon: 'ic_stat_notify',
      iconColor: '#D4E400',
    },
  },
}

export default config
