'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { CyberButton } from '@/components/members/CyberButton'

/**
 * Back button that fades in after scrolling past the hero section
 * Uses CyberButton component for consistent styling
 */
export function ScrollBackButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling ~15% of viewport height
      const threshold = window.innerHeight * 0.15
      setIsVisible(window.scrollY > threshold)
    }

    handleScroll() // Check initial state
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        x: isVisible ? 0 : -20,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-6 left-4 z-50"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <CyberButton
        href="/members"
        iconLeft={<ArrowLeft className="w-4 h-4" />}
      >
        Back
      </CyberButton>
    </motion.nav>
  )
}
