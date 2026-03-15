'use client'

import { useState, useCallback } from 'react'
import {
  DEFAULT_CONFIG,
  DROP_SIZE_KEYS,
  FRANCHISE_KEYS,
  FRANCHISE_LABELS,
  RARITY_WEIGHTS,
  getRarityColors,
  getRarityLabels,
  encodeDropConfig,
  extractDropConfigFromUrl,
  type DropSize,
  type Franchise,
  type Rarity,
  type OverlayDropConfig,
} from '@/lib/overlay-drop-config'
import { LootDrop } from '@/components/overlays/LootDrop'

const ACCENT = '#00FFFF'

type PreviewMode = 'manual' | 'auto' | 'live'

export default function DropBuilderPage() {
  const [config, setConfig] = useState<OverlayDropConfig>({ ...DEFAULT_CONFIG })
  const [loadUrl, setLoadUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('manual')

  const update = useCallback(<K extends keyof OverlayDropConfig>(key: K, value: OverlayDropConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const generatedUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/twitch/overlays/drop?c=${encodeDropConfig(config)}`
      : ''

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedUrl])

  const handleLoadFromUrl = useCallback(() => {
    if (!loadUrl.trim()) return
    const parsed = extractDropConfigFromUrl(loadUrl.trim())
    setConfig(parsed)
    setLoadUrl('')
  }, [loadUrl])

  // Connection status from LootDrop's internal hook
  const [connStatus, setConnStatus] = useState<{ isConnected: boolean; error: string | null }>({
    isConnected: false,
    error: null,
  })
  const handleConnectionChange = useCallback(
    (status: { isConnected: boolean; error: string | null }) => setConnStatus(status),
    [],
  )
  const isConnected = connStatus.isConnected
  const chatError = connStatus.error

  // Preview spawn function from LootDrop
  const [spawnPreview, setSpawnPreview] = useState<((rarity: Rarity) => void) | null>(null)
  const handleReady = useCallback((fn: (rarity: Rarity) => void) => {
    setSpawnPreview(() => fn)
  }, [])

  const rarityColors = getRarityColors(config.franchise)
  const rarityLabels = getRarityLabels(config.franchise)

  return (
    <div className="min-h-screen bg-void text-text-primary font-mono">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <h1 className="text-lg font-bold tracking-wider uppercase" style={{ color: ACCENT }}>
          Loot Drop Builder
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Configure a Division 2-style loot drop overlay for your Twitch stream
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ── Config Panel ── */}
        <div className="lg:w-[420px] shrink-0 p-6 space-y-6 border-r border-white/10 overflow-y-auto lg:max-h-[calc(100vh-73px)]">
          {/* Channel */}
          <Section label="Twitch Channel" description="The channel chat to listen to for drop commands">
            <input
              type="text"
              value={config.channel}
              onChange={(e) => update('channel', e.target.value)}
              placeholder="channel_name"
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rga-cyan/50"
            />
          </Section>

          {/* Command */}
          <Section label="Trigger Command" description="Chat message that triggers a loot drop">
            <input
              type="text"
              value={config.command}
              onChange={(e) => update('command', e.target.value)}
              placeholder="!drop"
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rga-cyan/50"
            />
          </Section>

          {/* Franchise */}
          <Section label="Franchise" description="Division 2 shows real weapon/gear names. Generic shows rarity labels only.">
            <div className="flex gap-2">
              {FRANCHISE_KEYS.map((f) => (
                <button
                  key={f}
                  onClick={() => update('franchise', f as Franchise)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider border transition-all"
                  style={{
                    borderColor: config.franchise === f ? ACCENT : 'rgba(255,255,255,0.1)',
                    backgroundColor: config.franchise === f ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: config.franchise === f ? ACCENT : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {FRANCHISE_LABELS[f]}
                </button>
              ))}
            </div>
          </Section>

          {/* Global Cooldown */}
          <Section label="Global Cooldown" description="Minimum time between any two drops on screen">
            <RangeSlider
              value={config.cooldown}
              min={0}
              max={30}
              step={1}
              unit="s"
              onChange={(v) => update('cooldown', v)}
            />
          </Section>

          {/* Per-user Cooldown */}
          <Section label="Per-user Cooldown" description="How long each viewer must wait before triggering another drop">
            <RangeSlider
              value={config.userCooldown}
              min={0}
              max={60}
              step={1}
              unit="s"
              onChange={(v) => update('userCooldown', v)}
            />
          </Section>

          {/* Mod Only */}
          <Section label="Mod Only" description="Only mods and the broadcaster can trigger drops">
            <ToggleButton
              active={config.modOnly}
              onToggle={() => update('modOnly', !config.modOnly)}
            />
          </Section>

          {/* Show Usernames */}
          <Section label="Show Usernames" description="Display the viewer's name below the rarity label">
            <ToggleButton
              active={config.showUsernames}
              onToggle={() => update('showUsernames', !config.showUsernames)}
            />
          </Section>

          {/* Drop Size */}
          <Section label="Drop Size" description="Size of the ground disc, beam width, and particle effects">
            <div className="flex gap-2">
              {DROP_SIZE_KEYS.map((size) => (
                <button
                  key={size}
                  onClick={() => update('dropSize', size as DropSize)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider border transition-all"
                  style={{
                    borderColor: config.dropSize === size ? ACCENT : 'rgba(255,255,255,0.1)',
                    backgroundColor: config.dropSize === size ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: config.dropSize === size ? ACCENT : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </Section>

          {/* Text Size */}
          <Section label="Text Size" description="Font size for the rarity label and username">
            <div className="flex gap-2">
              {DROP_SIZE_KEYS.map((size) => (
                <button
                  key={size}
                  onClick={() => update('textSize', size as DropSize)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider border transition-all"
                  style={{
                    borderColor: config.textSize === size ? ACCENT : 'rgba(255,255,255,0.1)',
                    backgroundColor: config.textSize === size ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: config.textSize === size ? ACCENT : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </Section>

          {/* Impact Speed */}
          <Section label="Impact Speed" description="How fast the beam and effects appear after a drop spawns">
            <RangeSlider
              value={config.dropSpeed}
              min={1}
              max={5}
              step={0.5}
              unit="s"
              onChange={(v) => update('dropSpeed', v)}
            />
          </Section>

          {/* Beam Duration */}
          <Section label="Beam Duration" description="How long the loot beam stays visible before fading out">
            <RangeSlider
              value={config.beamDuration}
              min={1}
              max={8}
              step={0.5}
              unit="s"
              onChange={(v) => update('beamDuration', v)}
            />
          </Section>

          {/* Particle Count */}
          <Section label="Particle Count" description="Number of sparks that scatter on impact">
            <RangeSlider
              value={config.particleCount}
              min={5}
              max={30}
              step={1}
              unit=""
              onChange={(v) => update('particleCount', v)}
            />
          </Section>

          {/* Max Active Drops */}
          <Section label="Max Active Drops" description="Maximum number of drops visible at the same time">
            <RangeSlider
              value={config.maxActiveDrops}
              min={1}
              max={20}
              step={1}
              unit=""
              onChange={(v) => update('maxActiveDrops', v)}
            />
          </Section>
        </div>

        {/* ── Preview + URL Panel ── */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto lg:max-h-[calc(100vh-73px)]">
          {/* Preview Mode Toggle */}
          <Section label="Preview Mode">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('manual')}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider border transition-all"
                  style={{
                    borderColor: previewMode === 'manual' ? ACCENT : 'rgba(255,255,255,0.1)',
                    backgroundColor: previewMode === 'manual' ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: previewMode === 'manual' ? ACCENT : 'rgba(255,255,255,0.5)',
                  }}
                >
                  Demo
                </button>
                <button
                  onClick={() => setPreviewMode('auto')}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider border transition-all"
                  style={{
                    borderColor: previewMode === 'auto' ? '#C084FC' : 'rgba(255,255,255,0.1)',
                    backgroundColor: previewMode === 'auto' ? 'rgba(192,132,252,0.08)' : 'transparent',
                    color: previewMode === 'auto' ? '#C084FC' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  Auto
                </button>
                <button
                  onClick={() => setPreviewMode('live')}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider border transition-all"
                  style={{
                    borderColor: previewMode === 'live' ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                    backgroundColor: previewMode === 'live' ? 'rgba(245,158,11,0.08)' : 'transparent',
                    color: previewMode === 'live' ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  Live Debug
                </button>
              </div>

              {/* Live mode status indicator */}
              {previewMode === 'live' && (
                <div className="flex items-center gap-2 text-[10px] tracking-wider uppercase">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: !config.channel
                        ? 'rgba(255,255,255,0.3)'
                        : isConnected
                          ? '#4ADE80'
                          : chatError
                            ? '#EF4444'
                            : '#F59E0B',
                      boxShadow: isConnected
                        ? '0 0 6px #4ADE80'
                        : chatError
                          ? '0 0 6px #EF4444'
                          : undefined,
                    }}
                  />
                  <span
                    style={{
                      color: !config.channel
                        ? 'rgba(255,255,255,0.3)'
                        : isConnected
                          ? '#4ADE80'
                          : chatError
                            ? '#EF4444'
                            : '#F59E0B',
                    }}
                  >
                    {!config.channel
                      ? 'No channel'
                      : isConnected
                        ? `Connected to #${config.channel}`
                        : chatError
                          ? 'Error'
                          : 'Connecting...'}
                  </span>
                </div>
              )}
            </div>
            {previewMode === 'manual' && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {RARITY_WEIGHTS.map(({ rarity }) => (
                    <button
                      key={rarity}
                      onClick={() => spawnPreview?.(rarity)}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold border transition-all"
                      style={{
                        borderColor: rarityColors[rarity],
                        color: rarityColors[rarity],
                        backgroundColor: `${rarityColors[rarity]}11`,
                        textShadow: `0 0 8px ${rarityColors[rarity]}44`,
                      }}
                    >
                      {rarityLabels[rarity]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {previewMode === 'live' && (
              <p className="text-[9px] text-text-muted mt-2">
                Connects to Twitch chat and spawns drops when{' '}
                <span className="text-rga-cyan">{config.command || '!drop'}</span>{' '}
                is typed. Check browser console for debug logs.
              </p>
            )}
          </Section>

          {/* Preview */}
          <Section label="Preview">
            <div
              className="relative w-full overflow-hidden border border-white/10"
              style={{
                aspectRatio: '16 / 9',
                backgroundImage:
                  'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: '#111',
              }}
            >
              <div className="absolute inset-0">
                <LootDrop
                  config={config}
                  demoMode={previewMode === 'auto'}
                  contained
                  onConnectionChange={handleConnectionChange}
                  onReady={handleReady}
                />
              </div>
            </div>
          </Section>

          {/* Generated URL */}
          <Section label="OBS Browser Source URL">
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-xs text-text-secondary select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-xs uppercase tracking-wider font-bold border transition-all shrink-0"
                style={{
                  borderColor: ACCENT,
                  color: copied ? '#030303' : ACCENT,
                  backgroundColor: copied ? ACCENT : 'transparent',
                }}
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </Section>

          {/* Load from URL */}
          <Section label="Load from URL">
            <div className="flex gap-2">
              <input
                type="text"
                value={loadUrl}
                onChange={(e) => setLoadUrl(e.target.value)}
                placeholder="Paste an existing overlay URL..."
                className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rga-cyan/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLoadFromUrl()
                }}
              />
              <button
                onClick={handleLoadFromUrl}
                className="px-4 py-2 text-xs uppercase tracking-wider font-bold border border-white/20 text-text-secondary hover:text-text-primary hover:border-white/40 transition-all shrink-0"
              >
                Load
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

// ─── Shared Subcomponents ────────────────────────────────────────────────────

function Section({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
        {label}
      </label>
      {description && (
        <p className="text-[9px] text-text-muted/60 mb-2">{description}</p>
      )}
      {children}
    </div>
  )
}

function ToggleButton({
  active,
  onToggle,
}: {
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="px-4 py-1.5 text-xs uppercase tracking-wider font-bold border transition-all"
      style={{
        borderColor: active ? ACCENT : 'rgba(255,255,255,0.1)',
        color: active ? ACCENT : 'rgba(255,255,255,0.4)',
        backgroundColor: active ? 'rgba(255,255,255,0.05)' : 'transparent',
      }}
    >
      {active ? 'ON' : 'OFF'}
    </button>
  )
}

function RangeSlider({
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) {
  const fillPct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
        style={{
          accentColor: ACCENT,
          background: `linear-gradient(to right, ${ACCENT} ${fillPct}%, rgba(255,255,255,0.1) ${fillPct}%)`,
        }}
      />
      <span
        className="text-xs tabular-nums w-12 text-right"
        style={{ color: ACCENT }}
      >
        {value}{unit}
      </span>
    </div>
  )
}
