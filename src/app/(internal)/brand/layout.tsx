import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brand Book | Rogue Army',
  description:
    'RGA design system reference — color palette, type system, gradients, effects, and component primitives. Two-layer token architecture with semantic aliases.',
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
