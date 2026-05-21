import React from 'react'
import { Footer } from '@/components/chrome/Footer'
import { Header } from '@/components/chrome/header/Header'

/**
 * Sub-layout for "normal" pages that get the full site chrome (Header + Footer).
 *
 * Routes that should NOT have chrome (error.tsx, not-found.tsx, /auth/*) live
 * outside this route group at (frontend)/ — they inherit only the providers,
 * scanlines, and analytics from the parent (frontend)/layout.tsx.
 *
 * Adding a new chromeless surface? Put it at (frontend)/<your-route>/.
 * Adding a new normal page? Put it inside (with-chrome)/.
 */
export default function WithChromeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
