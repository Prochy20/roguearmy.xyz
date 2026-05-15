"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { DiscordIcon } from "@/components/shared/DiscordIcon"
import { CyberCorners } from "@/components/ui/CyberCorners"
import { cn } from "@/lib/utils"

const DISCORD_URL = "https://dc.roguearmy.xyz"

interface FooterLink {
  cmd: string
  href: string
  external?: boolean
  primary?: boolean
}

interface FooterGroup {
  label: string
  items: FooterLink[]
}

// Pass the key directly — Next.js Link's pushState may lag the click, so reading location.hash races.
function syncManifestoHash(href: string) {
  if (typeof window === 'undefined') return
  if (!href.startsWith('/manifesto#')) return
  if (window.location.pathname !== '/manifesto') return
  const key = href.slice('/manifesto#'.length)
  window.dispatchEvent(new CustomEvent('manifesto:switch', { detail: { key } }))
}

const LINK_GROUPS: FooterGroup[] = [
  {
    label: "community",
    items: [
      { cmd: "./join-discord", href: DISCORD_URL, external: true, primary: true },
      { cmd: "./rules", href: "/manifesto#rules" },
    ],
  },
  {
    label: "system",
    items: [
      { cmd: "man privacy", href: "/manifesto#privacy" },
      { cmd: "man terms", href: "/manifesto#terms" },
    ],
  },
]

function useSessionInfo() {
  const startTime = useRef(Date.now())
  // Math.random() in a useState initializer runs on both server and client during SSR,
  // producing different values and breaking hydration. Generate the hash post-mount.
  const [sessionHash, setSessionHash] = useState("----")
  const [elapsed, setElapsed] = useState("00m 00s")

  useEffect(() => {
    setSessionHash(
      Array.from({ length: 4 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")
    )
  }, [])

  useEffect(() => {
    const tick = () => {
      const diff = Math.floor((Date.now() - startTime.current) / 1000)
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setElapsed(
        h > 0
          ? `${h}h ${String(m).padStart(2, "0")}m`
          : `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return { sessionHash, elapsed }
}

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear()
  const { sessionHash, elapsed } = useSessionInfo()

  return (
    <footer
      className={cn(
        "relative bg-void text-text-secondary font-mono overflow-hidden",
        "mt-auto",
        className
      )}
    >
      {/* Glitch separator line */}
      <div className="relative h-4 w-full" aria-hidden="true">
        <div
          className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.4) 20%, rgba(0,255,255,0.3) 50%, rgba(0,255,65,0.4) 80%, transparent 100%)",
            boxShadow: "0 0 20px rgba(0,255,65,0.2)",
          }}
        />
      </div>

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
        }}
      />

      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 85% 30%, rgba(0,255,65,0.06) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 10% 90%, rgba(0,255,255,0.05) 0%, transparent 55%)",
        }}
      />

      <div className="relative px-6 md:px-12 lg:px-16 pt-10 md:pt-12">
        {/* ── Session line ── */}
        <div className="flex items-center gap-3 text-[12px] tracking-[0.15em] uppercase text-text-muted mb-7">
          <span className="text-rga-green">●</span>
          <span className="hidden sm:inline">session_{sessionHash} · duration {elapsed} · 0 incidents</span>
          <span className="sm:hidden">session_{sessionHash}</span>
          <span
            className="flex-1 h-px"
            style={{
              background: "linear-gradient(90deg, rgba(0,255,65,0.2), transparent)",
            }}
          />
          <span className="hidden md:inline">
            last commit · master@<span className="text-rga-cyan">{process.env.NEXT_PUBLIC_COMMIT_SHA}</span>
          </span>
        </div>

        {/* ── Brand + Terminal prompt ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-12 items-end mb-12 md:mb-14">
          {/* Left: wordmark */}
          <div>
            <div className="text-[11px] tracking-[0.3em] text-text-muted mb-3.5">
              // ROOT/BROADCAST
            </div>
            <div className="font-display text-[56px] md:text-[72px] lg:text-[92px] leading-[0.85] tracking-[0.02em] uppercase text-white">
              ROGUE
              <br />
              ARMY
              <span className="text-rga-green text-glow-green">.</span>
            </div>
            <p className="font-body text-[13px] text-text-secondary mt-4 max-w-[440px] leading-relaxed">
              Casual gaming community for adults 25+. 200 operators, six active
              squads, one Discord that refuses to die quietly.
            </p>
          </div>

          {/* Right: live terminal prompt */}
          <CyberCorners color="green" size="sm" glow>
            <div className="border border-rga-green/20 bg-[rgba(5,10,5,0.6)] p-5">
              <div className="text-[11px] text-text-muted tracking-[0.2em] mb-2.5">
                /rga/shell — visitor@void
              </div>
              <div className="text-[13px] text-white leading-[1.9]">
                <div>
                  <span className="text-rga-green">rga@void</span>
                  <span className="text-text-muted">:</span>
                  <span className="text-rga-cyan">~/footer</span>
                  <span className="text-text-muted">$ </span>
                  ./connect --discord
                </div>
                <div className="text-text-muted">
                  &gt; resolving dc.roguearmy.xyz …{" "}
                  <span className="text-rga-green">ok</span>
                </div>
                <div className="text-text-muted">
                  &gt; handshake …{" "}
                  <span className="text-rga-green">200 OK</span>
                </div>
                <div>
                  <span className="text-rga-green">rga@void</span>
                  <span className="text-text-muted">:</span>
                  <span className="text-rga-cyan">~/footer</span>
                  <span className="text-text-muted">$ </span>
                  <span className="inline-block w-2 h-3.5 bg-rga-green shadow-[0_0_6px_rgba(0,255,65,0.6)] align-middle animate-blink" />
                </div>
              </div>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-4 inline-flex items-center gap-2.5 px-[18px] py-[11px] border border-rga-green text-rga-green text-[12px] tracking-[0.25em] uppercase no-underline transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,255,65,0.25),inset_0_0_24px_rgba(0,255,65,0.08)] hover:bg-rga-green/5"
                style={{
                  boxShadow:
                    "0 0 18px rgba(0,255,65,0.18), inset 0 0 18px rgba(0,255,65,0.06)",
                }}
              >
                <DiscordIcon className="w-3.5 h-3.5" />
                Join Discord
                <span className="text-rga-green">&gt;&gt;</span>
              </a>
            </div>
          </CyberCorners>
        </div>

        {/* ── Link columns ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-8 pb-10 border-b border-rga-green/[0.08]">
          {LINK_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] tracking-[0.35em] text-rga-green mb-3.5 uppercase">
                <span className="text-text-muted">[</span>
                {group.label}
                <span className="text-text-muted">]</span>
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                {group.items.map((item) => {
                  const inner = (
                    <span className="inline-flex gap-2 items-baseline text-[13px]">
                      <span className="text-text-muted">$</span>
                      <span>{item.cmd}</span>
                      {item.primary && (
                        <span className="text-rga-green">★</span>
                      )}
                    </span>
                  )

                  return (
                    <li key={item.cmd}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "no-underline transition-colors duration-200 hover:text-rga-green hover:[text-shadow:0_0_8px_rgba(0,255,65,0.4)]",
                            item.primary ? "text-rga-green" : "text-text-secondary"
                          )}
                        >
                          {inner}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => syncManifestoHash(item.href)}
                          className="text-text-secondary no-underline transition-colors duration-200 hover:text-rga-green hover:[text-shadow:0_0_8px_rgba(0,255,65,0.4)]"
                        >
                          {inner}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Status strip ── */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 py-5 text-[11px] tracking-[0.18em] text-text-muted uppercase">
          <div className="flex items-center gap-4">
            <span className="text-rga-green">[SYS]</span>
            <span>ROGUE_ARMY</span>
            <span className="text-text-muted/50">//</span>
            <span className="text-rga-green">ONLINE</span>
          </div>
          <div className="flex items-center gap-4">
            <span>&copy; {year} ROGUE ARMY</span>
            <span className="text-text-muted/50">//</span>
            <span>
              built with{" "}
              <span className="text-rga-green">&lt;/&gt;</span> and{" "}
              <span className="text-rga-magenta">♥</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
