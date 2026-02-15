'use client'

import { useState, useCallback } from 'react'
import {
  BACKGROUND_KEYS,
  BACKGROUND_OPTIONS,
  BOX_COLORS,
  DEFAULT_CONFIG,
  FONT_SIZE_MAP,
  ICON_KEYS,
  ICON_MAP,
  TEXT_ALIGN_KEYS,
  encodeBoxConfig,
  extractConfigFromUrl,
  type BoxColor,
  type BoxFontSize,
  type OverlayBoxConfig,
} from '@/lib/overlay-box-config'
import { OverlayBox } from '@/components/overlays/OverlayBox'

const COLOR_KEYS = Object.keys(BOX_COLORS) as BoxColor[]
const FONT_SIZE_KEYS = Object.keys(FONT_SIZE_MAP) as BoxFontSize[]

export default function BoxBuilderPage() {
  const [config, setConfig] = useState<OverlayBoxConfig>({ ...DEFAULT_CONFIG })
  const [loadUrl, setLoadUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const update = useCallback(<K extends keyof OverlayBoxConfig>(key: K, value: OverlayBoxConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const generatedUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/twitch/overlays/box?c=${encodeBoxConfig(config)}`
      : ''

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedUrl])

  const handleLoadFromUrl = useCallback(() => {
    if (!loadUrl.trim()) return
    const parsed = extractConfigFromUrl(loadUrl.trim())
    setConfig(parsed)
    setLoadUrl('')
  }, [loadUrl])

  return (
    <div className="min-h-screen bg-void text-text-primary font-mono">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <h1 className="text-lg font-bold tracking-wider uppercase text-rga-cyan">
          Overlay Box Builder
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Configure a cyberpunk-styled box overlay for OBS browser sources
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ── Config Panel ── */}
        <div className="lg:w-[420px] shrink-0 p-6 space-y-6 border-r border-white/10 overflow-y-auto lg:max-h-[calc(100vh-73px)]">
          {/* Color */}
          <Section label="Color">
            <div className="flex gap-2">
              {COLOR_KEYS.map((c) => (
                <button
                  key={c}
                  onClick={() => update('color', c)}
                  className="w-9 h-9 rounded-sm transition-all"
                  style={{
                    backgroundColor: BOX_COLORS[c].hex,
                    boxShadow: config.color === c ? `0 0 0 2px #030303, 0 0 0 4px ${BOX_COLORS[c].hex}` : undefined,
                    opacity: config.color === c ? 1 : 0.5,
                  }}
                  title={c}
                />
              ))}
            </div>
          </Section>

          {/* Badge Text */}
          <Section label="Badge Text">
            <input
              type="text"
              value={config.badge}
              onChange={(e) => update('badge', e.target.value)}
              placeholder="BADGE TEXT"
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rga-cyan/50"
            />
          </Section>

          {/* Badge Icon */}
          <Section label="Badge Icon">
            <div className="grid grid-cols-4 gap-2">
              {ICON_KEYS.map((iconKey) => {
                const Icon = iconKey !== 'none' ? ICON_MAP[iconKey] : null
                const isActive = config.icon === iconKey
                return (
                  <button
                    key={iconKey}
                    onClick={() => update('icon', iconKey)}
                    className="flex flex-col items-center gap-1 py-2 px-1 text-xs border transition-all"
                    style={{
                      borderColor: isActive ? BOX_COLORS[config.color].hex : 'rgba(255,255,255,0.1)',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: isActive ? BOX_COLORS[config.color].hex : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {Icon ? <Icon size={16} /> : <span className="text-base leading-none">-</span>}
                    <span className="uppercase tracking-wider" style={{ fontSize: 9 }}>
                      {iconKey}
                    </span>
                  </button>
                )
              })}
            </div>
          </Section>

          {/* Badge Size */}
          <Section label="Badge Size">
            <div className="flex gap-2">
              {FONT_SIZE_KEYS.map((size) => (
                <button
                  key={size}
                  onClick={() => update('badgeSize', size)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider border transition-all"
                  style={{
                    borderColor:
                      config.badgeSize === size
                        ? BOX_COLORS[config.color].hex
                        : 'rgba(255,255,255,0.1)',
                    backgroundColor:
                      config.badgeSize === size ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color:
                      config.badgeSize === size
                        ? BOX_COLORS[config.color].hex
                        : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </Section>

          {/* Accent Bar */}
          <Section label="Accent Bar">
            <ToggleButton
              active={config.accent}
              onToggle={() => update('accent', !config.accent)}
              color={BOX_COLORS[config.color].hex}
            />
          </Section>

          {/* Background */}
          <Section label="Background">
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUND_KEYS.map((bg) => {
                const isActive = config.background === bg
                return (
                  <button
                    key={bg}
                    onClick={() => update('background', bg)}
                    className="flex flex-col items-center gap-1 py-2 px-1 text-xs border transition-all"
                    style={{
                      borderColor: isActive ? BOX_COLORS[config.color].hex : 'rgba(255,255,255,0.1)',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: isActive ? BOX_COLORS[config.color].hex : 'rgba(255,255,255,0.5)',
                    }}
                    title={BACKGROUND_OPTIONS[bg].description}
                  >
                    <span className="uppercase tracking-wider font-bold" style={{ fontSize: 9 }}>
                      {BACKGROUND_OPTIONS[bg].label}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-[9px] text-text-muted mt-1.5">
              {BACKGROUND_OPTIONS[config.background].description}
            </p>
            {config.background !== 'none' && (
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.bgOpacity}
                  onChange={(e) => update('bgOpacity', Number(e.target.value))}
                  className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
                  style={{
                    accentColor: BOX_COLORS[config.color].hex,
                    background: `linear-gradient(to right, ${BOX_COLORS[config.color].hex} ${config.bgOpacity}%, rgba(255,255,255,0.1) ${config.bgOpacity}%)`,
                  }}
                />
                <span
                  className="text-xs tabular-nums w-10 text-right"
                  style={{ color: BOX_COLORS[config.color].hex }}
                >
                  {config.bgOpacity}%
                </span>
              </div>
            )}
          </Section>

          {/* Content Text */}
          <Section label="Content Text">
            <textarea
              value={config.text}
              onChange={(e) => update('text', e.target.value)}
              placeholder="Content text (optional)"
              rows={3}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rga-cyan/50 resize-y"
            />
          </Section>

          {/* Flicker */}
          <Section label="Flicker">
            <ToggleButton
              active={config.flicker}
              onToggle={() => update('flicker', !config.flicker)}
              color={BOX_COLORS[config.color].hex}
            />
            {config.flicker && (() => {
              // Invert so dragging right = more frequent (lower cycle duration)
              const sliderVal = 34 - config.flickerSpeed
              const fillPct = ((sliderVal - 4) / 26) * 100
              return (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[9px] uppercase tracking-widest text-text-muted shrink-0">Rare</span>
                <input
                  type="range"
                  min={4}
                  max={30}
                  step={1}
                  value={sliderVal}
                  onChange={(e) => update('flickerSpeed', 34 - Number(e.target.value))}
                  className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
                  style={{
                    accentColor: BOX_COLORS[config.color].hex,
                    background: `linear-gradient(to right, ${BOX_COLORS[config.color].hex} ${fillPct}%, rgba(255,255,255,0.1) ${fillPct}%)`,
                  }}
                />
                <span className="text-[9px] uppercase tracking-widest text-text-muted shrink-0">Often</span>
                <span
                  className="text-xs tabular-nums w-10 text-right"
                  style={{ color: BOX_COLORS[config.color].hex }}
                >
                  {config.flickerSpeed}s
                </span>
              </div>
              )
            })()}
          </Section>

          {/* Font Size */}
          <Section label="Font Size">
            <div className="flex gap-2">
              {FONT_SIZE_KEYS.map((size) => (
                <button
                  key={size}
                  onClick={() => update('fontSize', size)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider border transition-all"
                  style={{
                    borderColor:
                      config.fontSize === size
                        ? BOX_COLORS[config.color].hex
                        : 'rgba(255,255,255,0.1)',
                    backgroundColor:
                      config.fontSize === size ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color:
                      config.fontSize === size
                        ? BOX_COLORS[config.color].hex
                        : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </Section>

          {/* Text Align */}
          <Section label="Text Align">
            <div className="flex gap-2">
              {TEXT_ALIGN_KEYS.map((align) => (
                <button
                  key={align}
                  onClick={() => update('textAlign', align)}
                  className="px-3 py-1.5 text-xs uppercase tracking-wider border transition-all"
                  style={{
                    borderColor:
                      config.textAlign === align
                        ? BOX_COLORS[config.color].hex
                        : 'rgba(255,255,255,0.1)',
                    backgroundColor:
                      config.textAlign === align ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color:
                      config.textAlign === align
                        ? BOX_COLORS[config.color].hex
                        : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {align}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Preview + URL Panel ── */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto lg:max-h-[calc(100vh-73px)]">
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
              <div className="absolute inset-0" style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
                <div className="relative w-full h-full">
                  <OverlayBox {...config} />
                </div>
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
                  borderColor: BOX_COLORS[config.color].hex,
                  color: copied ? '#030303' : BOX_COLORS[config.color].hex,
                  backgroundColor: copied ? BOX_COLORS[config.color].hex : 'transparent',
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

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}

function ToggleButton({
  active,
  onToggle,
  color,
}: {
  active: boolean
  onToggle: () => void
  color: string
}) {
  return (
    <button
      onClick={onToggle}
      className="px-4 py-1.5 text-xs uppercase tracking-wider font-bold border transition-all"
      style={{
        borderColor: active ? color : 'rgba(255,255,255,0.1)',
        color: active ? color : 'rgba(255,255,255,0.4)',
        backgroundColor: active ? 'rgba(255,255,255,0.05)' : 'transparent',
      }}
    >
      {active ? 'ON' : 'OFF'}
    </button>
  )
}
