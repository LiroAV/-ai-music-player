import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Music Gem — Find your sound',
  description: 'An adaptive music platform that learns your taste and helps you discover sounds you never knew you liked.',
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-background text-text-primary antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
