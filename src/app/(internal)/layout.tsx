import React from 'react'
import type { Metadata } from 'next'
import '@/app/globals.css'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * Minimal layout for internal pages (overlays, embeds, etc.).
 * No ScanlineOverlay, AuthProvider, Analytics, or JSON-LD.
 */
export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html, body { background: transparent !important; overflow: hidden; }`}</style>
      {children}
    </>
  )
}
