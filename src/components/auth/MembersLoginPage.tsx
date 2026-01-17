'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { DiscordIcon } from '@/components/shared/DiscordIcon'
import { TerminalWindow } from './TerminalWindow'
import { AsciiArt } from './AsciiArt'
import { BootSequence } from './BootSequence'

/**
 * Immersive "Terminal Authentication" login page for the members area.
 * Features boot sequence animation, ASCII art, and HeroGlitch effects.
 */
export function MembersLoginPage() {
  const [bootComplete, setBootComplete] = useState(false)

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,65,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,65,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)`,
        }}
      />

      {/* Main content */}
      <TerminalWindow
        title="MEMBERS PORTAL"
        className="relative z-10 w-full max-w-lg"
        footerText="AWAITING AUTHENTICATION"
      >
        <div className="space-y-6">
          {/* ASCII Art Logo */}
          <AsciiArt />

          {/* Boot sequence */}
          <div className="border-t border-rga-green/20 pt-4">
            <BootSequence onComplete={() => setBootComplete(true)} />
          </div>

          {/* Authentication section - fades in after boot sequence */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: bootComplete ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Terminal command block */}
            <div className="border border-rga-green/30 rounded bg-black/50 overflow-hidden">
              {/* Command header */}
              <div className="px-3 py-2 bg-rga-green/5 border-b border-rga-green/20 flex items-center gap-2">
                <span className="text-rga-magenta font-mono text-xs">AUTHENTICATION</span>
                <span className="text-text-muted font-mono text-xs">|</span>
                <span className="text-yellow-400 font-mono text-xs animate-pulse">REQUIRED</span>
              </div>

              {/* Command content */}
              <div className="p-4 space-y-4">
                {/* Auth prompt line */}
                <div className="font-mono text-sm">
                  <span className="text-rga-green">root@rga</span>
                  <span className="text-text-muted">:</span>
                  <span className="text-rga-cyan">~/members</span>
                  <span className="text-text-muted">$ </span>
                  <span className="text-white">./authenticate --provider=discord</span>
                </div>

                {/* Output message */}
                <div className="font-mono text-xs text-text-secondary pl-0 space-y-1">
                  <p className="text-yellow-400/80">{'->'} Identity verification required</p>
                  <p className="text-text-muted">{'->'} Click below to authenticate via Discord OAuth2</p>
                </div>

                {/* Terminal-styled auth button */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: bootComplete ? 1 : 0, y: bootComplete ? 0 : 5 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="pt-2"
                >
                  <button
                    onClick={() => { window.location.href = '/api/auth/discord' }}
                    className="group w-full relative overflow-hidden"
                  >
                    {/* Button container */}
                    <div className="relative border border-rga-cyan/50 bg-rga-cyan/5 hover:bg-rga-cyan/10
                                    hover:border-rga-cyan transition-all duration-300
                                    hover:shadow-[0_0_20px_rgba(0,255,255,0.3),inset_0_0_20px_rgba(0,255,255,0.1)]">
                      {/* Scan line effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rga-cyan/10 to-transparent
                                        translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700" />
                      </div>

                      {/* Button content */}
                      <div className="relative px-4 py-3 flex items-center justify-center gap-3">
                        {/* Left bracket */}
                        <span className="font-mono text-rga-cyan/60 group-hover:text-rga-cyan transition-colors">[</span>

                        {/* Discord icon */}
                        <DiscordIcon className="w-5 h-5 text-rga-cyan/80 group-hover:text-rga-cyan transition-colors" />

                        {/* Command text */}
                        <span className="font-mono text-sm tracking-wider">
                          <span className="text-rga-green group-hover:text-rga-green transition-colors">{'>'}</span>
                          <span className="text-white group-hover:text-white ml-2">EXECUTE</span>
                          <span className="text-text-muted group-hover:text-text-secondary ml-2 transition-colors">auth.discord()</span>
                        </span>

                        {/* Right bracket */}
                        <span className="font-mono text-rga-cyan/60 group-hover:text-rga-cyan transition-colors">]</span>
                      </div>

                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-rga-cyan/50 group-hover:border-rga-cyan transition-colors" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-rga-cyan/50 group-hover:border-rga-cyan transition-colors" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-rga-cyan/50 group-hover:border-rga-cyan transition-colors" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-rga-cyan/50 group-hover:border-rga-cyan transition-colors" />
                    </div>
                  </button>
                </motion.div>
              </div>

              {/* Footer with join link */}
              <div className="px-4 py-3 bg-black/30 border-t border-rga-green/20 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-rga-cyan">$</span>
                  <span className="text-text-muted">_</span>
                  <span className="inline-block w-1.5 h-3 bg-rga-green animate-blink" />
                </div>
                <a
                  href="https://discord.gg/roguearmy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-text-muted hover:text-rga-cyan transition-colors group"
                >
                  <span className="text-rga-green/60 group-hover:text-rga-green">{'>'}</span>
                  {' '}not a member?{' '}
                  <span className="text-rga-cyan underline underline-offset-2">join discord</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </TerminalWindow>
    </div>
  )
}
