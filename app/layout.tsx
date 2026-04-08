import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  title: "FlexDrop — Put up or shut up.",
  description: 'The world\'s only real-time wealth flex leaderboard. Drop cash. Get famous. Dare someone to beat you.',
  openGraph: {
    title: "FlexDrop — Put up or shut up.",
    description: 'Drop cash. Get famous. Outflex everyone.',
    url: 'https://flexdrop.io',
    siteName: 'FlexDrop',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FlexDrop — Put up or shut up.",
    description: 'Drop cash. Get famous. Outflex everyone.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body style={{ margin: 0, padding: 0, background: '#0a0a0a' }}>
        {children}
      </body>
    </html>
  )
}
