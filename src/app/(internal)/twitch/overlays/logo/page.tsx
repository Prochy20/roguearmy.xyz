'use client'

import { useSearchParams } from 'next/navigation'
import { OverlayLogo } from '@/components/overlays/OverlayLogo'

export default function TwitchLogoOverlayPage() {
  const params = useSearchParams()
  const bg = params.get('bg')

  return (
    <div style={bg ? { backgroundColor: bg } : undefined}>
      <OverlayLogo />
    </div>
  )
}
