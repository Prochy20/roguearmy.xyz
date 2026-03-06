'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { decodeHeroConfig } from '@/lib/overlay-hero-config'
import { OverlayHero } from '@/components/overlays/OverlayHero'

function HeroOverlayContent() {
  const params = useSearchParams()
  const encoded = params.get('c')
  const config = encoded ? decodeHeroConfig(encoded) : decodeHeroConfig('')

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden"
      style={{ background: config.bgTransparent ? 'transparent' : '#000' /* base opacity handled by OverlayHero */ }}
    >
      {/* 16:9 container that fills viewport via object-fit contain logic */}
      <div
        className="relative"
        style={{
          width: '100vw',
          height: 'calc(100vw * 9 / 16)',
          maxHeight: '100vh',
          maxWidth: 'calc(100vh * 16 / 9)',
        }}
      >
        <OverlayHero config={config} />
      </div>
    </div>
  )
}

export default function TwitchHeroOverlayPage() {
  return (
    <Suspense>
      <HeroOverlayContent />
    </Suspense>
  )
}
