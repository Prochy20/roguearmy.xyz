'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { decodeDropConfig } from '@/lib/overlay-drop-config'
import { LootDrop } from '@/components/overlays/LootDrop'

function DropOverlayContent() {
  const params = useSearchParams()
  const encoded = params.get('c')
  const config = encoded ? decodeDropConfig(encoded) : decodeDropConfig('')

  return <LootDrop config={config} />
}

export default function TwitchDropOverlayPage() {
  return (
    <Suspense>
      <DropOverlayContent />
    </Suspense>
  )
}
