'use client'

import { ChevronUp } from 'lucide-react'
import { CyberButton } from '@/components/members/CyberButton'

export function BackToTop() {
  return (
    <CyberButton
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      iconRight={<ChevronUp className="w-4 h-4" />}
      color="gray"
    >
      Back to top
    </CyberButton>
  )
}
