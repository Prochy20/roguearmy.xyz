'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  getRarityColors,
  getRarityLabels,
  DROP_SIZE_MAP,
  TEXT_SIZE_MAP,
  rollRarity,
  type OverlayDropConfig,
  type Rarity,
} from '@/lib/overlay-drop-config'
import { rollDivision2Loot, type LootDrop as LootDropItem } from '@/lib/division2-loot'
import { useTwitchChat, type TwitchMessage } from '@/hooks/useTwitchChat'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActiveDrop {
  id: string
  rarity: Rarity
  x: number // 5-95% horizontal
  y: number // 30-85% vertical (ground area)
  username: string
  item?: LootDropItem
}

// ─── Demo Mode Fake Usernames ────────────────────────────────────────────────

const DEMO_USERNAMES = [
  'RogueSniper42', 'ShadowAgent_X', 'NeonViper99', 'CyberWolf_HD',
  'GlitchHunter', 'PixelRogue', 'DarkMatter_TV', 'VoidRunner',
  'PhantomOps', 'TurboFrag', 'NightHawk_GG', 'BinaryStorm',
]

// ─── Component ───────────────────────────────────────────────────────────────

export function LootDrop({
  config,
  demoMode = false,
  contained = false,
  onConnectionChange,
  onReady,
}: {
  config: OverlayDropConfig
  demoMode?: boolean
  /** When true, uses absolute positioning relative to parent instead of fixed/vh */
  contained?: boolean
  /** Called when Twitch connection status changes (live mode only) */
  onConnectionChange?: (status: { isConnected: boolean; error: string | null }) => void
  /** Provides a function to spawn a drop with a specific rarity (bypasses cooldowns) */
  onReady?: (spawnPreview: (rarity: Rarity) => void) => void
}) {
  const [drops, setDrops] = useState<ActiveDrop[]>([])
  const globalCooldownRef = useRef(0)
  const userCooldownsRef = useRef(new Map<string, number>())
  const dropIdRef = useRef(0)

  const spawnDrop = useCallback(
    (username: string) => {
      const now = Date.now()

      // Global cooldown check
      if (now - globalCooldownRef.current < config.cooldown * 1000) return
      // Per-user cooldown check
      const lastUserDrop = userCooldownsRef.current.get(username) ?? 0
      if (now - lastUserDrop < config.userCooldown * 1000) return

      // Max active drops check
      setDrops((prev) => {
        if (prev.length >= config.maxActiveDrops) return prev

        globalCooldownRef.current = now
        userCooldownsRef.current.set(username, now)

        const id = `drop-${++dropIdRef.current}`
        const rarity = rollRarity()
        const item = config.franchise === 'division2' ? rollDivision2Loot(rarity) : undefined
        const x = 5 + Math.random() * 90
        const y = 30 + Math.random() * 55 // spawn in the lower ~55% of the screen

        return [...prev, { id, rarity, x, y, username, item }]
      })
    },
    [config.cooldown, config.userCooldown, config.maxActiveDrops, config.franchise],
  )

  // Spawn a specific rarity (for preview buttons, bypasses cooldowns)
  const spawnPreviewDrop = useCallback(
    (rarity: Rarity) => {
      setDrops((prev) => {
        const id = `drop-${++dropIdRef.current}`
        const item = config.franchise === 'division2' ? rollDivision2Loot(rarity) : undefined
        const x = 5 + Math.random() * 90
        const y = 30 + Math.random() * 55
        return [...prev, { id, rarity, x, y, username: 'Preview', item }]
      })
    },
    [config.franchise],
  )

  // Expose spawnPreviewDrop to parent
  useEffect(() => {
    if (onReady) onReady(spawnPreviewDrop)
  }, [onReady, spawnPreviewDrop])

  // Remove drop after beam fades
  const removeDrop = useCallback((id: string) => {
    setDrops((prev) => prev.filter((d) => d.id !== id))
  }, [])

  // ── Twitch Chat Connection ──
  const { onMessage, isConnected, error } = useTwitchChat({
    channel: config.channel,
    enabled: !demoMode && !!config.channel,
  })

  // Notify parent of connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange({ isConnected, error })
    }
  }, [isConnected, error, onConnectionChange])

  useEffect(() => {
    if (demoMode) return

    onMessage((msg: TwitchMessage) => {
      const trimmed = msg.message.trim().toLowerCase()
      if (trimmed !== config.command.toLowerCase()) return
      if (config.modOnly && !msg.isMod && !msg.isBroadcaster) return
      spawnDrop(msg.username)
    })
  }, [demoMode, onMessage, config.command, config.modOnly, spawnDrop])

  // ── Demo Mode: auto-spawn ──
  useEffect(() => {
    if (!demoMode) return
    // Spawn one immediately
    const fakeName = DEMO_USERNAMES[Math.floor(Math.random() * DEMO_USERNAMES.length)]
    spawnDrop(fakeName)

    const interval = setInterval(() => {
      const name = DEMO_USERNAMES[Math.floor(Math.random() * DEMO_USERNAMES.length)]
      spawnDrop(name)
    }, 3000 + Math.random() * 1000)

    return () => clearInterval(interval)
  }, [demoMode, spawnDrop])

  // ── Periodic cleanup of stale user cooldowns ──
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const maxAge = config.userCooldown * 1000 * 2
      for (const [user, ts] of userCooldownsRef.current) {
        if (now - ts > maxAge) userCooldownsRef.current.delete(user)
      }
    }, 10_000)
    return () => clearInterval(interval)
  }, [config.userCooldown])

  const orbSize = DROP_SIZE_MAP[config.dropSize]
  const textSizes = TEXT_SIZE_MAP[config.textSize]
  const rarityColors = getRarityColors(config.franchise)
  const rarityLabels = getRarityLabels(config.franchise)

  return (
    <div
      className={`${contained ? 'absolute' : 'fixed'} inset-0 overflow-hidden pointer-events-none`}
      style={{ containerType: 'size' }}
    >
      <AnimatePresence>
        {drops.map((drop) => (
          <DropInstance
            key={drop.id}
            drop={drop}
            orbSize={orbSize}
            dropSpeed={config.dropSpeed}
            beamDuration={config.beamDuration}
            particleCount={config.particleCount}
            showUsernames={config.showUsernames}
            contained={contained}
            labelFontSize={textSizes.label}
            usernameFontSize={textSizes.username}
            color={rarityColors[drop.rarity]}
            label={rarityLabels[drop.rarity]}
            onComplete={() => removeDrop(drop.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Single Drop Instance ────────────────────────────────────────────────────

function DropInstance({
  drop,
  orbSize,
  dropSpeed,
  beamDuration,
  particleCount,
  showUsernames,
  contained,
  labelFontSize,
  usernameFontSize,
  color,
  label,
  onComplete,
}: {
  drop: ActiveDrop
  orbSize: number
  dropSpeed: number
  beamDuration: number
  particleCount: number
  showUsernames: boolean
  contained: boolean
  labelFontSize: number
  usernameFontSize: number
  color: string
  label: string
  onComplete: () => void
}) {
  const { username, item } = drop
  const beamWidth = orbSize * 1.5
  const beamWidthInner = orbSize * 0.5

  // Beam height — taller beams for rarer items
  const beamHeightPct: Record<Rarity, number> = {
    common: 30,
    rare: 45,
    epic: 60,
    legendary: 75,
    gearset: 80,
    exotic: 90,
  }
  const beamH = beamHeightPct[drop.rarity]

  // Rarity-scaled intensity multiplier (exotics pop harder)
  const intensityMap: Record<Rarity, number> = {
    common: 0.6, rare: 0.75, epic: 0.9, legendary: 1, gearset: 1, exotic: 1.2,
  }
  const intensity = intensityMap[drop.rarity]

  // Generate particle trajectories once — two types: sparks + embers
  const [particles] = useState(() =>
    Array.from({ length: particleCount }, (_, i) => {
      const isSpark = i < particleCount * 0.6
      return {
        id: i,
        angle: (Math.random() - 0.5) * (isSpark ? 240 : 360),
        distance: contained
          ? (isSpark ? 15 : 8) + Math.random() * (isSpark ? 35 : 20)
          : (isSpark ? 30 : 15) + Math.random() * (isSpark ? 70 : 40),
        size: contained
          ? (isSpark ? 1.5 : 2.5) + Math.random() * (isSpark ? 2 : 3)
          : (isSpark ? 2 : 3) + Math.random() * (isSpark ? 3 : 5),
        delay: Math.random() * (isSpark ? 0.15 : 0.3),
        isSpark,
        drift: (Math.random() - 0.5) * 20,
      }
    }),
  )

  // Total lifetime = dropSpeed (impact) + beamDuration
  const totalDuration = dropSpeed + beamDuration

  // Shift label anchor near edges so text doesn't clip outside the container
  // -50 = centered. Near left edge → 0 (left-aligned), near right edge → -100 (right-aligned)
  const labelTranslateX = drop.x < 15
    ? -50 * (drop.x / 15)
    : drop.x > 85
      ? -50 - 50 * ((drop.x - 85) / 15)
      : -50

  // Pulse timing for disc layers (used via motion animate)
  const pulseDuration = 2

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${drop.x}%`,
        top: `${drop.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.2, delay: totalDuration - 1.2 }}
      onAnimationComplete={onComplete}
    >
      {/* ── Impact flash — double-ring burst ── */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: orbSize * 4 * intensity,
          height: orbSize * 4 * intensity,
          background: `radial-gradient(circle, #ffffffcc 0%, ${color}aa 15%, ${color}44 40%, transparent 65%)`,
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 1.8, 0.6], opacity: [1, 0.9, 0] }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
      {/* Secondary shockwave ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: orbSize * 6 * intensity,
          height: orbSize * 2.5 * intensity,
          border: `1px solid ${color}55`,
          boxShadow: `0 0 ${orbSize}px ${color}33`,
        }}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: [0, 1.5], opacity: [0.8, 0] }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
      />

      {/* ── Ground disc — layered with pulse ── */}
      {/* Outermost ambient ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: orbSize * 5,
          height: orbSize * 1.5,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, transparent 35%, ${color}18 55%, ${color}33 70%, ${color}11 85%, transparent 100%)`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.15, 1, 1, 1.08, 1], opacity: [0, 1, 1, 0.7, 1, 0.7] }}
        transition={{
          scale: { duration: pulseDuration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
          opacity: { duration: pulseDuration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
        }}
      />
      {/* Outer glow ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: orbSize * 3.5,
          height: orbSize * 1.1,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, transparent 30%, ${color}44 55%, ${color}66 72%, ${color}22 88%, transparent 100%)`,
          boxShadow: `0 0 ${orbSize * 2}px ${color}33`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.1, 1], opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      {/* Inner bright disc */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: orbSize * 2,
          height: orbSize * 0.65,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${color} 0%, ${color}cc 25%, ${color}55 55%, ${color}22 75%, transparent 100%)`,
          boxShadow: `0 0 ${orbSize * 1.5}px ${color}88, 0 0 ${orbSize * 3}px ${color}44`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.3, 1, 1, 1.06, 1], opacity: [0, 1, 1, 0.8, 1, 0.8] }}
        transition={{
          scale: { duration: pulseDuration * 0.75, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.2 },
          opacity: { duration: pulseDuration * 0.75, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.2 },
        }}
      />
      {/* Center hot spot — white-hot core */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: orbSize * 0.7,
          height: orbSize * 0.22,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, #fff 0%, ${color} 50%, transparent 100%)`,
          boxShadow: `0 0 ${orbSize * 0.8}px #fff, 0 0 ${orbSize * 1.5}px ${color}`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.6, 1], opacity: [0, 1, 0.9] }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />

      {/* ── Vertical loot beam — outer glow layer ── */}
      <motion.div
        className="absolute left-1/2"
        style={{
          width: beamWidth * 1.8,
          transform: 'translateX(-50%)',
          bottom: '50%',
          background: `linear-gradient(to top, ${color}44 0%, ${color}18 25%, ${color}08 60%, transparent 100%)`,
          filter: `blur(${beamWidth * 0.4}px)`,
        }}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: `${beamH}${contained ? 'cqh' : 'vh'}`, opacity: [0, 0.8, 0.8, 0.4] }}
        transition={{
          height: { duration: dropSpeed * 0.4, ease: 'easeOut' },
          opacity: { duration: totalDuration, times: [0, 0.1, 0.6, 1] },
        }}
      />
      {/* Main beam column */}
      <motion.div
        className="absolute left-1/2"
        style={{
          width: beamWidth,
          transform: 'translateX(-50%)',
          bottom: '50%',
          background: `linear-gradient(to top, ${color}cc 0%, ${color}66 15%, ${color}33 40%, ${color}11 70%, transparent 100%)`,
          boxShadow: `0 0 ${beamWidth}px ${color}33`,
        }}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: `${beamH}${contained ? 'cqh' : 'vh'}`, opacity: [0, 1, 1, 0.6] }}
        transition={{
          height: { duration: dropSpeed * 0.4, ease: 'easeOut' },
          opacity: { duration: totalDuration, times: [0, 0.1, 0.6, 1] },
        }}
      />
      {/* Inner bright core line */}
      <motion.div
        className="absolute left-1/2"
        style={{
          width: beamWidthInner,
          transform: 'translateX(-50%)',
          bottom: '50%',
          background: `linear-gradient(to top, #ffffffaa 0%, ${color}aa 10%, ${color}44 35%, transparent 70%)`,
        }}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: `${beamH * 0.7}${contained ? 'cqh' : 'vh'}`, opacity: [0, 1, 0.8, 0.3] }}
        transition={{
          height: { duration: dropSpeed * 0.35, ease: 'easeOut' },
          opacity: { duration: totalDuration, times: [0, 0.08, 0.5, 1] },
        }}
      />

      {/* ── Ground light spill ── */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: orbSize * 7,
          height: orbSize * 2.5,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${color}28, ${color}0a 50%, transparent 75%)`,
          filter: `blur(${orbSize * 1.2}px)`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.08 }}
      />

      {/* ── Particle burst — sparks + embers ── */}
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180
        const tx = Math.sin(rad) * p.distance
        const ty = Math.cos(rad) * p.distance * (p.isSpark ? 0.4 : 0.7)
        return (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: p.size,
              height: p.isSpark ? p.size : p.size * 1.5,
              backgroundColor: p.isSpark ? color : '#fff',
              boxShadow: p.isSpark
                ? `0 0 ${p.size * 3}px ${color}`
                : `0 0 ${p.size * 2}px ${color}, 0 0 ${p.size}px #fff`,
              borderRadius: p.isSpark ? '50%' : '40%',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: [0, tx * 0.6, tx + p.drift],
              y: [0, -Math.abs(ty) * 0.8, -Math.abs(ty)],
              opacity: [1, 0.9, 0],
              scale: [1, p.isSpark ? 0.8 : 1.2, 0],
            }}
            transition={{
              duration: p.isSpark ? 0.4 + Math.random() * 0.3 : 0.7 + Math.random() * 0.5,
              delay: p.delay,
              ease: 'easeOut',
            }}
          />
        )
      })}

      {/* ── Rarity label + item info ── */}
      <motion.div
        className="absolute whitespace-nowrap text-center"
        style={{
          left: '50%',
          x: `${labelTranslateX}%`,
          top: `calc(50% + ${orbSize * 1.5}px)`,
          padding: contained ? '3px 10px' : '6px 16px',
          background: `radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 60%, transparent 100%)`,
          borderRadius: 4,
        }}
        initial={{ opacity: 0, y: 12, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div
          className="font-display uppercase tracking-[0.25em] font-bold"
          style={{
            color: '#fff',
            fontSize: contained ? Math.max(labelFontSize * 0.6, 7) : labelFontSize,
            textShadow: `0 0 12px ${color}, 0 0 24px ${color}aa, 0 1px 0 rgba(0,0,0,0.8)`,
            WebkitTextStroke: `0.3px ${color}88`,
          }}
        >
          {item ? item.name : label}
        </div>
        {item && (
          <div
            className="font-mono uppercase tracking-[0.15em]"
            style={{
              color,
              fontSize: contained ? Math.max(usernameFontSize * 0.6, 6) : usernameFontSize,
              textShadow: `0 0 6px ${color}66`,
              opacity: 0.85,
            }}
          >
            {label} · {item.category}
          </div>
        )}
        {showUsernames && (
          <div
            className="font-mono mt-0.5"
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: contained ? Math.max(usernameFontSize * 0.6, 6) : usernameFontSize,
              textShadow: `0 0 4px ${color}44`,
              letterSpacing: '0.05em',
            }}
          >
            {username}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
