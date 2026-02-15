'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { decodeBoxConfig } from '@/lib/overlay-box-config'
import { OverlayBox } from '@/components/overlays/OverlayBox'

function BoxOverlayContent() {
  const params = useSearchParams()
  const encoded = params.get('c')
  const config = encoded ? decodeBoxConfig(encoded) : decodeBoxConfig('')

  return <OverlayBox {...config} />
}

export default function TwitchBoxOverlayPage() {
  return (
    <Suspense>
      <BoxOverlayContent />
    </Suspense>
  )
}
