import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import "./globals.css"
import Providers from "@/components/Providers"
import OfflineIndicator from "@/components/OfflineIndicator"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const jetbrainsMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-jetbrains-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "DailyPulse — Academia",
  description: "Registre seus treinos, exercícios e progresso na academia.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DailyPulse",
    startupImage: "/icons/icon-512.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "DailyPulse",
    "msapplication-TileColor": "#0f0f0f",
    "msapplication-TileImage": "/icons/icon-144.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <OfflineIndicator />
          {children}
        </Providers>
      </body>
    </html>
  )
}
