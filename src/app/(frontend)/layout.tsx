import React from 'react'
import '@/app/globals.css'
import { ScanlineOverlay } from '@/components/effects'

export const metadata = {
  title: 'Rogue Army | Casual Gaming Community for Adults 25+',
  description: 'Join 200+ gamers in a drama-free community. Division 2, Battlefield, Helldivers 2, and more. No toxicity, just good times.',
  keywords: ['gaming community', 'adult gamers', 'Division 2', 'Battlefield', 'casual gaming', 'discord server'],
  openGraph: {
    title: 'Rogue Army Gaming Community',
    description: 'Casual gaming community for adults 25+. No drama, just good times.',
    type: 'website',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-void text-foreground font-body antialiased">
        <ScanlineOverlay intensity="low" />
        <main>{children}</main>
      </body>
    </html>
  )
}
