'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { OverlayLogo } from '@/components/overlays/OverlayLogo'

function LogoOverlayContent() {
  const params = useSearchParams()
  const bg = params.get('bg')

  return (
    <div style={bg ? { backgroundColor: bg } : undefined}>
      <OverlayLogo />
    </div>
  )
}

export default function TwitchLogoOverlayPage() {
  return (
    <Suspense>
      <LogoOverlayContent />
    </Suspense>
  )
}
