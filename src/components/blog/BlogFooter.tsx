'use client'

import { ChevronUp } from 'lucide-react'
import { DiscordIcon } from '@/components/shared/DiscordIcon'

export function BlogFooter() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="mt-auto py-6 text-center">
      {/* Links row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
        <a
          href="https://dc.roguearmy.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-text-muted hover:text-rga-green transition-colors duration-300 font-mono text-sm"
        >
          <DiscordIcon className="w-5 h-5" />
          Join Discord
        </a>

        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-1 text-text-muted hover:text-rga-green transition-colors duration-300 font-mono text-sm"
        >
          Back to Top
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Copyright */}
      <p className="text-text-muted font-mono text-sm mb-4">
        © {currentYear} Rogue Army Gaming Community
      </p>

      {/* Tagline */}
      <p className="text-text-muted/50 text-xs font-mono">
        Built with{' '}
        <span className="text-rga-green">&lt;/&gt;</span>
        {' '}and{' '}
        <span className="text-rga-magenta">♥</span>
      </p>
    </footer>
  )
}
