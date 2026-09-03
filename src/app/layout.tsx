import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

// Used sparingly, only for brand/impact moments (app name, rest-timer
// countdown, load numbers) — everything else stays on Geist Sans.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '700'],
})

export const metadata: Metadata = {
  title: 'Echo',
  description: 'Acompanhe seus treinos, rotinas e progresso.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Echo',
    startupImage: '/icons/icon-512.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'Echo',
    'msapplication-TileColor': '#0f0f0f',
    'msapplication-TileImage': '/icons/icon-144.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        {/* Apply saved primary hue before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem('echo-store')||'{}');var h=s.state?.settings?.primaryHue;if(h!=null)document.documentElement.style.setProperty('--primary-hue',h);}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${spaceGrotesk.variable} antialiased`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/service-worker.js')}`,
          }}
        />
      </body>
    </html>
  )
}
