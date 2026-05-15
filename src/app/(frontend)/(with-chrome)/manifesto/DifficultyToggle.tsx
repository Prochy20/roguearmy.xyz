'use client'

import { cn } from '@/lib/utils'
import type { DifficultyMode } from './types'

const MODES = [
  { value: 'casual' as const, label: 'CASUAL', flavor: "for those who don't read" },
  { value: 'hardcore' as const, label: 'HARDCORE', flavor: 'the unabridged experience' },
] as const

interface DifficultyToggleProps {
  mode: DifficultyMode
  onToggle: () => void
}

export function DifficultyToggle({ mode, onToggle }: DifficultyToggleProps) {
  return (
    <div className="border border-rga-green/[0.12] bg-black/40 p-4">
      <div className="text-[10px] tracking-[0.35em] text-rga-green mb-3 font-mono">
        // DIFFICULTY
      </div>

      <div className="flex gap-1.5">
        {MODES.map(({ value, label }) => {
          const isActive = mode === value
          return (
            <button
              key={value}
              onClick={isActive ? undefined : onToggle}
              aria-pressed={isActive}
              className={cn(
                'relative flex-1 py-2.5 font-mono text-[11px] tracking-[0.25em] uppercase transition-all duration-200 rounded-sm cursor-pointer',
                isActive
                  ? 'text-rga-green bg-rga-green/10'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/5',
              )}
            >
              {/* Active glow border */}
              {isActive && (
                <div className="absolute inset-0 rounded-sm border border-rga-green/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]" />
              )}

              {/* Corner bracket accents */}
              {isActive && (
                <>
                  <span className="absolute top-0 left-0 w-1.5 h-px bg-rga-green" />
                  <span className="absolute top-0 left-0 w-px h-1.5 bg-rga-green" />
                  <span className="absolute bottom-0 right-0 w-1.5 h-px bg-rga-green" />
                  <span className="absolute bottom-0 right-0 w-px h-1.5 bg-rga-green" />
                </>
              )}

              <span className="relative z-10">
                {isActive && <span className="mr-1">▸</span>}
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Flavor text */}
      <div className="mt-2.5 text-[10px] text-text-muted tracking-[0.1em] font-mono">
        {MODES.find((m) => m.value === mode)?.flavor}
      </div>
    </div>
  )
}
