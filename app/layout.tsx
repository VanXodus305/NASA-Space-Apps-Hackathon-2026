import type { Metadata } from 'next'
import { IBM_Plex_Mono, Instrument_Sans, Sora } from 'next/font/google'
import { SiteShell } from '@/components/site-shell'
import './globals.css'
const body = Instrument_Sans({
  variable: '--font-instrument',
  subsets: ['latin'],
  display: 'swap',
})
const mono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})
const display = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  display: 'swap',
})
export const metadata: Metadata = {
  title: {
    default: 'SPHEREx Blink - Watch the universe move',
    template: '%s · SPHEREx Blink',
  },
  description:
    'Explore NASA SPHEREx infrared observations. Blink through time, discover moving stars, and watch the sky change.',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${body.variable} ${mono.variable} ${display.variable} dark scroll-smooth antialiased motion-reduce:scroll-auto`}
    >
      <body className="flex min-h-screen flex-col bg-[#08080e] font-sans text-[#eee7f0] selection:bg-[#aa87c8] selection:text-black">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
