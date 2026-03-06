'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  ANCHOR_TRANSFORM,
  BG_KEYS,
  PARAGRAPH_ALIGN_KEYS,
  TEXT_ANCHOR_KEYS,
  TEXT_COLOR_KEYS,
  TEXT_COLOR_MAP,
  createParagraphLayer,
  createTextLayer,
  encodeHeroConfig,
  extractHeroConfigFromUrl,
  type HeroBgKey,
  type HeroLogoLayer,
  type HeroOverlayConfig,
  type HeroParagraphAlign,
  type HeroParagraphLayer,
  type HeroTextAnchor,
  type HeroTextColor,
  type HeroTextLayer,
} from '@/lib/overlay-hero-config'
import { OverlayHero } from '@/components/overlays/OverlayHero'

const INITIAL_CONFIG: HeroOverlayConfig = {
  bg: 'Bg_01',
  bgTransparent: false,
  bgOpacity: 50,
  texts: [
    createTextLayer({ content: 'ROGUE ARMY', x: 50, y: 50, size: 80, color: 'green', anchor: 'center', flicker: true }),
    createTextLayer({ content: 'We are the', x: 50, y: 41, size: 40, color: 'white', anchor: 'center', flicker: true }),
  ],
  paragraphs: [
    createParagraphLayer({ content: 'www.roguearmy.xyz', x: 50, y: 55, size: 24, color: 'cyan', align: 'center', maxWidth: 50 }),
  ],
  logo: { enabled: true, x: 50, y: 27, size: 15, flicker: true, flickerMin: 4, flickerMax: 10, flickerIntensity: 7 },
}

type SelectedElement =
  | { type: 'text'; id: string }
  | { type: 'paragraph'; id: string }
  | { type: 'logo' }
  | null

export default function HeroBuilderPage() {
  const [config, setConfig] = useState<HeroOverlayConfig>(() => structuredClone(INITIAL_CONFIG))
  const [selected, setSelected] = useState<SelectedElement>({ type: 'text', id: config.texts[0]?.id ?? '' })
  const [copied, setCopied] = useState(false)
  const [loadUrl, setLoadUrl] = useState('')

  // ─── Derived ────────────────────────────────────────────────────────────────

  const selectedTextLayer =
    selected?.type === 'text'
      ? config.texts.find((t) => t.id === selected.id) ?? null
      : null

  const selectedParagraphLayer =
    selected?.type === 'paragraph'
      ? config.paragraphs.find((p) => p.id === selected.id) ?? null
      : null

  const generatedUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/twitch/overlays/hero?c=${encodeHeroConfig(config)}`
      : ''

  // ─── Config Updaters ────────────────────────────────────────────────────────

  const setBg = useCallback((bg: HeroBgKey) => {
    setConfig((prev) => ({ ...prev, bg }))
  }, [])

  const updateTextLayer = useCallback((id: string, patch: Partial<HeroTextLayer>) => {
    setConfig((prev) => ({
      ...prev,
      texts: prev.texts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }, [])

  const addTextLayer = useCallback(() => {
    const layer = createTextLayer({ content: 'NEW TEXT', y: 30 + Math.random() * 40 })
    setConfig((prev) => ({ ...prev, texts: [...prev.texts, layer] }))
    setSelected({ type: 'text', id: layer.id })
  }, [])

  const removeTextLayer = useCallback((id: string) => {
    setConfig((prev) => {
      const texts = prev.texts.filter((t) => t.id !== id)
      return { ...prev, texts }
    })
    setSelected((prev) => (prev?.type === 'text' && prev.id === id ? null : prev))
  }, [])

  const updateLogo = useCallback((patch: Partial<HeroLogoLayer>) => {
    setConfig((prev) => ({ ...prev, logo: { ...prev.logo, ...patch } }))
  }, [])

  const updateParagraphLayer = useCallback((id: string, patch: Partial<HeroParagraphLayer>) => {
    setConfig((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }, [])

  const addParagraphLayer = useCallback(() => {
    const layer = createParagraphLayer({ y: 30 + Math.random() * 40 })
    setConfig((prev) => ({ ...prev, paragraphs: [...prev.paragraphs, layer] }))
    setSelected({ type: 'paragraph', id: layer.id })
  }, [])

  const removeParagraphLayer = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((p) => p.id !== id),
    }))
    setSelected((prev) => (prev?.type === 'paragraph' && prev.id === id ? null : prev))
  }, [])

  const handleClearAll = useCallback(() => {
    setConfig({
      bg: 'none',
      bgTransparent: false,
      bgOpacity: 100,
      texts: [],
      paragraphs: [],
      logo: { enabled: false, x: 50, y: 50, size: 15, flicker: false, flickerMin: 4, flickerMax: 10, flickerIntensity: 7 },
    })
    setSelected(null)
  }, [])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedUrl])

  const handleLoadFromUrl = useCallback(() => {
    if (!loadUrl.trim()) return
    const parsed = extractHeroConfigFromUrl(loadUrl.trim())
    setConfig(parsed)
    setSelected(
      parsed.texts[0] ? { type: 'text', id: parsed.texts[0].id }
      : parsed.paragraphs[0] ? { type: 'paragraph', id: parsed.paragraphs[0].id }
      : null
    )
    setLoadUrl('')
  }, [loadUrl])

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-void text-text-primary font-mono">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-wider uppercase text-rga-cyan">
            Hero Overlay Builder
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Background + text layers with glitch effects for OBS browser sources
          </p>
        </div>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 text-xs uppercase tracking-wider font-bold border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all shrink-0"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ── Config Panel ── */}
        <div className="lg:w-[420px] shrink-0 p-6 space-y-6 border-r border-white/10 overflow-y-auto lg:max-h-[calc(100vh-73px)]">
          {/* Background */}
          <Section label="Background">
            <div className="grid grid-cols-3 gap-2">
              {BG_KEYS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBg(bg)}
                  className="relative overflow-hidden border transition-all aspect-16/9"
                  style={{
                    borderColor: config.bg === bg ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                    boxShadow: config.bg === bg ? '0 0 8px rgba(0,255,255,0.3)' : undefined,
                  }}
                >
                  {bg === 'none' ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <span className="text-[9px] uppercase tracking-widest text-text-muted">None</span>
                    </div>
                  ) : (
                    <Image
                      src={`/images/bg/${bg}.jpg`}
                      alt={bg}
                      fill
                      className="object-cover"
                      sizes="130px"
                    />
                  )}
                </button>
              ))}
            </div>
          </Section>

          {/* Background Base */}
          <Section label="Background Base">
            <div className="flex gap-2">
              <button
                onClick={() => setConfig((prev) => ({ ...prev, bgTransparent: false }))}
                className="flex-1 px-3 py-1.5 text-[9px] uppercase tracking-wider border transition-all"
                style={{
                  borderColor: !config.bgTransparent ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                  backgroundColor: !config.bgTransparent ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: !config.bgTransparent ? '#00FFFF' : 'rgba(255,255,255,0.4)',
                }}
              >
                Solid Black
              </button>
              <button
                onClick={() => setConfig((prev) => ({ ...prev, bgTransparent: true }))}
                className="flex-1 px-3 py-1.5 text-[9px] uppercase tracking-wider border transition-all"
                style={{
                  borderColor: config.bgTransparent ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                  backgroundColor: config.bgTransparent ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: config.bgTransparent ? '#00FFFF' : 'rgba(255,255,255,0.4)',
                }}
              >
                Transparent
              </button>
            </div>
            <p className="text-[9px] text-text-muted mt-1.5">
              {config.bgTransparent
                ? 'Base is transparent — stream content shows through where the image is faded'
                : 'Base is solid black — fading the image darkens toward black'}
            </p>
          </Section>

          {/* Image Opacity / Tint */}
          {config.bg !== 'none' && (
            <Section label="Image Darkness">
              <SliderRow
                label="Opacity"
                value={config.bgOpacity}
                min={0}
                max={100}
                suffix="%"
                color="#00FFFF"
                onChange={(v) => setConfig((prev) => ({ ...prev, bgOpacity: v }))}
              />
              <p className="text-[9px] text-text-muted mt-1.5">
                Lower = darker / more tinted. 100% = full brightness.
              </p>
            </Section>
          )}

          {/* Logo */}
          <Section label="Logo">
            <ToggleButton
              active={config.logo.enabled}
              onToggle={() => {
                updateLogo({ enabled: !config.logo.enabled })
                if (!config.logo.enabled) setSelected({ type: 'logo' })
              }}
              color="#00FF41"
            />
            {config.logo.enabled && (
              <div className="space-y-3 mt-3">
                <SliderRow
                  label="Size"
                  value={config.logo.size}
                  min={2}
                  max={60}
                  suffix="%"
                  color="#00FF41"
                  onChange={(v) => updateLogo({ size: v })}
                />
                <SliderRow
                  label="X"
                  value={config.logo.x}
                  min={0}
                  max={100}
                  suffix="%"
                  color="#00FF41"
                  onChange={(v) => updateLogo({ x: v })}
                />
                <SliderRow
                  label="Y"
                  value={config.logo.y}
                  min={0}
                  max={100}
                  suffix="%"
                  color="#00FF41"
                  onChange={(v) => updateLogo({ y: v })}
                />
                <LogoPositionPresets
                  currentX={config.logo.x}
                  currentY={config.logo.y}
                  color="#00FF41"
                  onSelect={(x, y) => updateLogo({ x, y })}
                />
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
                    Glitch Flicker
                  </label>
                  <ToggleButton
                    active={config.logo.flicker}
                    onToggle={() => updateLogo({ flicker: !config.logo.flicker })}
                    color="#00FF41"
                  />
                  {config.logo.flicker && (
                    <div className="space-y-3 mt-3">
                      <SliderRow
                        label="Min Interval"
                        value={config.logo.flickerMin}
                        min={1}
                        max={30}
                        suffix="s"
                        color="#00FF41"
                        onChange={(v) => updateLogo({ flickerMin: v })}
                      />
                      <SliderRow
                        label="Max Interval"
                        value={config.logo.flickerMax}
                        min={1}
                        max={30}
                        suffix="s"
                        color="#00FF41"
                        onChange={(v) => updateLogo({ flickerMax: v })}
                      />
                      <SliderRow
                        label="Intensity"
                        value={config.logo.flickerIntensity}
                        min={1}
                        max={10}
                        suffix=""
                        color="#00FF41"
                        onChange={(v) => updateLogo({ flickerIntensity: v })}
                      />
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-text-muted">
                  Or drag the logo in the preview to reposition
                </p>
              </div>
            )}
          </Section>

          {/* Text Layers */}
          <Section label="Text Layers">
            {/* Layer list */}
            <div className="space-y-1 mb-3">
              {config.texts.map((layer, i) => (
                <div
                  key={layer.id}
                  className="flex items-center gap-2 px-3 py-2 border cursor-pointer transition-all"
                  style={{
                    borderColor:
                      selected?.type === 'text' && selected.id === layer.id
                        ? TEXT_COLOR_MAP[layer.color].hex
                        : 'rgba(255,255,255,0.1)',
                    backgroundColor:
                      selected?.type === 'text' && selected.id === layer.id
                        ? 'rgba(255,255,255,0.05)'
                        : 'transparent',
                  }}
                  onClick={() => setSelected({ type: 'text', id: layer.id })}
                >
                  <div
                    className="w-3 h-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: TEXT_COLOR_MAP[layer.color].hex }}
                  />
                  <span className="text-xs truncate flex-1" style={{ color: TEXT_COLOR_MAP[layer.color].hex }}>
                    {layer.content || `Layer ${i + 1}`}
                  </span>
                  {config.texts.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTextLayer(layer.id)
                      }}
                      className="text-text-muted hover:text-red-400 text-xs px-1 transition-colors"
                      title="Remove layer"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addTextLayer}
              className="w-full px-3 py-2 text-xs uppercase tracking-wider border border-dashed border-white/20 text-text-muted hover:text-rga-cyan hover:border-rga-cyan/40 transition-all"
            >
              + Add Text Layer
            </button>
          </Section>

          {/* Paragraph Layers */}
          <Section label="Paragraph Layers">
            <div className="space-y-1 mb-3">
              {config.paragraphs.map((layer, i) => (
                <div
                  key={layer.id}
                  className="flex items-center gap-2 px-3 py-2 border cursor-pointer transition-all"
                  style={{
                    borderColor:
                      selected?.type === 'paragraph' && selected.id === layer.id
                        ? TEXT_COLOR_MAP[layer.color].hex
                        : 'rgba(255,255,255,0.1)',
                    backgroundColor:
                      selected?.type === 'paragraph' && selected.id === layer.id
                        ? 'rgba(255,255,255,0.05)'
                        : 'transparent',
                  }}
                  onClick={() => setSelected({ type: 'paragraph', id: layer.id })}
                >
                  <div
                    className="w-3 h-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: TEXT_COLOR_MAP[layer.color].hex }}
                  />
                  <span className="text-xs truncate flex-1 font-mono" style={{ color: TEXT_COLOR_MAP[layer.color].hex }}>
                    {layer.content.split('\n')[0] || `Paragraph ${i + 1}`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeParagraphLayer(layer.id)
                    }}
                    className="text-text-muted hover:text-red-400 text-xs px-1 transition-colors"
                    title="Remove layer"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addParagraphLayer}
              className="w-full px-3 py-2 text-xs uppercase tracking-wider border border-dashed border-white/20 text-text-muted hover:text-rga-cyan hover:border-rga-cyan/40 transition-all"
            >
              + Add Paragraph Layer
            </button>
          </Section>

          {/* Selected paragraph layer editor */}
          {selectedParagraphLayer && (
            <Section label={`Edit: ${selectedParagraphLayer.content.split('\n')[0] || 'Paragraph'}`}>
              <div className="space-y-4">
                {/* Content */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
                    Content
                  </label>
                  <textarea
                    value={selectedParagraphLayer.content}
                    onChange={(e) => updateParagraphLayer(selectedParagraphLayer.id, { content: e.target.value })}
                    placeholder="Enter paragraph text..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rga-cyan/50 font-mono resize-y"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {TEXT_COLOR_KEYS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateParagraphLayer(selectedParagraphLayer.id, { color: c })}
                        className="w-9 h-9 rounded-sm transition-all"
                        style={{
                          backgroundColor: TEXT_COLOR_MAP[c].hex,
                          boxShadow:
                            selectedParagraphLayer.color === c
                              ? `0 0 0 2px #030303, 0 0 0 4px ${TEXT_COLOR_MAP[c].hex}`
                              : undefined,
                          opacity: selectedParagraphLayer.color === c ? 1 : 0.5,
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <SliderRow
                  label="Font Size"
                  value={selectedParagraphLayer.size}
                  min={12}
                  max={72}
                  suffix="px"
                  color={TEXT_COLOR_MAP[selectedParagraphLayer.color].hex}
                  onChange={(v) => updateParagraphLayer(selectedParagraphLayer.id, { size: v })}
                />

                {/* Max Width */}
                <SliderRow
                  label="Max Width"
                  value={selectedParagraphLayer.maxWidth}
                  min={10}
                  max={100}
                  suffix="%"
                  color={TEXT_COLOR_MAP[selectedParagraphLayer.color].hex}
                  onChange={(v) => updateParagraphLayer(selectedParagraphLayer.id, { maxWidth: v })}
                />

                {/* Position */}
                <SliderRow
                  label="X Position"
                  value={selectedParagraphLayer.x}
                  min={0}
                  max={100}
                  suffix="%"
                  color={TEXT_COLOR_MAP[selectedParagraphLayer.color].hex}
                  onChange={(v) => updateParagraphLayer(selectedParagraphLayer.id, { x: v })}
                />
                <SliderRow
                  label="Y Position"
                  value={selectedParagraphLayer.y}
                  min={0}
                  max={100}
                  suffix="%"
                  color={TEXT_COLOR_MAP[selectedParagraphLayer.color].hex}
                  onChange={(v) => updateParagraphLayer(selectedParagraphLayer.id, { y: v })}
                />

                {/* Text Align */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
                    Text Align
                  </label>
                  <div className="flex gap-2">
                    {PARAGRAPH_ALIGN_KEYS.map((a) => (
                      <button
                        key={a}
                        onClick={() => updateParagraphLayer(selectedParagraphLayer.id, { align: a })}
                        className="flex-1 px-3 py-1.5 text-[9px] uppercase tracking-wider border transition-all"
                        style={{
                          borderColor:
                            selectedParagraphLayer.align === a
                              ? TEXT_COLOR_MAP[selectedParagraphLayer.color].hex
                              : 'rgba(255,255,255,0.1)',
                          backgroundColor:
                            selectedParagraphLayer.align === a ? 'rgba(255,255,255,0.05)' : 'transparent',
                          color:
                            selectedParagraphLayer.align === a
                              ? TEXT_COLOR_MAP[selectedParagraphLayer.color].hex
                              : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position Presets */}
                <ParagraphPositionPresets
                  currentX={selectedParagraphLayer.x}
                  currentY={selectedParagraphLayer.y}
                  color={TEXT_COLOR_MAP[selectedParagraphLayer.color].hex}
                  onSelect={(x, y) => updateParagraphLayer(selectedParagraphLayer.id, { x, y })}
                />

                <p className="text-[9px] text-text-muted">
                  Drag the paragraph in the preview to reposition
                </p>
              </div>
            </Section>
          )}

          {/* Selected text layer editor */}
          {selectedTextLayer && (
            <Section label={`Edit: ${selectedTextLayer.content || 'Text Layer'}`}>
              <div className="space-y-4">
                {/* Content */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
                    Text
                  </label>
                  <input
                    type="text"
                    value={selectedTextLayer.content}
                    onChange={(e) => updateTextLayer(selectedTextLayer.id, { content: e.target.value })}
                    placeholder="ENTER TEXT"
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-rga-cyan/50"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {TEXT_COLOR_KEYS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateTextLayer(selectedTextLayer.id, { color: c })}
                        className="w-9 h-9 rounded-sm transition-all"
                        style={{
                          backgroundColor: TEXT_COLOR_MAP[c].hex,
                          boxShadow:
                            selectedTextLayer.color === c
                              ? `0 0 0 2px #030303, 0 0 0 4px ${TEXT_COLOR_MAP[c].hex}`
                              : undefined,
                          opacity: selectedTextLayer.color === c ? 1 : 0.5,
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Size */}
                <SliderRow
                  label="Font Size"
                  value={selectedTextLayer.size}
                  min={16}
                  max={300}
                  suffix="px"
                  color={TEXT_COLOR_MAP[selectedTextLayer.color].hex}
                  onChange={(v) => updateTextLayer(selectedTextLayer.id, { size: v })}
                />

                {/* Position */}
                <SliderRow
                  label="X Position"
                  value={selectedTextLayer.x}
                  min={0}
                  max={100}
                  suffix="%"
                  color={TEXT_COLOR_MAP[selectedTextLayer.color].hex}
                  onChange={(v) => updateTextLayer(selectedTextLayer.id, { x: v })}
                />
                <SliderRow
                  label="Y Position"
                  value={selectedTextLayer.y}
                  min={0}
                  max={100}
                  suffix="%"
                  color={TEXT_COLOR_MAP[selectedTextLayer.color].hex}
                  onChange={(v) => updateTextLayer(selectedTextLayer.id, { y: v })}
                />

                {/* Anchor (text alignment origin) */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
                    Text Anchor
                  </label>
                  <div className="flex gap-2">
                    {TEXT_ANCHOR_KEYS.map((a) => (
                      <button
                        key={a}
                        onClick={() => updateTextLayer(selectedTextLayer.id, { anchor: a })}
                        className="flex-1 px-3 py-1.5 text-[9px] uppercase tracking-wider border transition-all"
                        style={{
                          borderColor:
                            selectedTextLayer.anchor === a
                              ? TEXT_COLOR_MAP[selectedTextLayer.color].hex
                              : 'rgba(255,255,255,0.1)',
                          backgroundColor:
                            selectedTextLayer.anchor === a ? 'rgba(255,255,255,0.05)' : 'transparent',
                          color:
                            selectedTextLayer.anchor === a
                              ? TEXT_COLOR_MAP[selectedTextLayer.color].hex
                              : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position Presets */}
                <TextPositionPresets
                  currentX={selectedTextLayer.x}
                  currentY={selectedTextLayer.y}
                  color={TEXT_COLOR_MAP[selectedTextLayer.color].hex}
                  onSelect={(x, y, anchor) => updateTextLayer(selectedTextLayer.id, { x, y, anchor })}
                />

                {/* Flicker */}
                <div>
                  <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
                    Glitch Flicker
                  </label>
                  <ToggleButton
                    active={selectedTextLayer.flicker}
                    onToggle={() =>
                      updateTextLayer(selectedTextLayer.id, { flicker: !selectedTextLayer.flicker })
                    }
                    color={TEXT_COLOR_MAP[selectedTextLayer.color].hex}
                  />
                  {selectedTextLayer.flicker && (
                    <div className="space-y-3 mt-3">
                      <SliderRow
                        label="Min Interval"
                        value={selectedTextLayer.flickerMin}
                        min={1}
                        max={30}
                        suffix="s"
                        color={TEXT_COLOR_MAP[selectedTextLayer.color].hex}
                        onChange={(v) => updateTextLayer(selectedTextLayer.id, { flickerMin: v })}
                      />
                      <SliderRow
                        label="Max Interval"
                        value={selectedTextLayer.flickerMax}
                        min={1}
                        max={30}
                        suffix="s"
                        color={TEXT_COLOR_MAP[selectedTextLayer.color].hex}
                        onChange={(v) => updateTextLayer(selectedTextLayer.id, { flickerMax: v })}
                      />
                      <SliderRow
                        label="Intensity"
                        value={selectedTextLayer.flickerIntensity}
                        min={1}
                        max={10}
                        suffix=""
                        color={TEXT_COLOR_MAP[selectedTextLayer.color].hex}
                        onChange={(v) => updateTextLayer(selectedTextLayer.id, { flickerIntensity: v })}
                      />
                    </div>
                  )}
                </div>

                <p className="text-[9px] text-text-muted">
                  Drag the text in the preview to reposition
                </p>
              </div>
            </Section>
          )}
        </div>

        {/* ── Preview + URL Panel ── */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto lg:max-h-[calc(100vh-73px)]">
          {/* Preview */}
          <Section label="Preview (drag elements to reposition)">
            <DraggablePreview
              config={config}
              selected={selected}
              onSelect={setSelected}
              onMoveText={(id, x, y) => updateTextLayer(id, { x, y })}
              onMoveParagraph={(id, x, y) => updateParagraphLayer(id, { x, y })}
              onMoveLogo={(x, y) => updateLogo({ x, y })}
            />
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
                  borderColor: '#00FFFF',
                  color: copied ? '#030303' : '#00FFFF',
                  backgroundColor: copied ? '#00FFFF' : 'transparent',
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
                placeholder="Paste an existing hero overlay URL..."
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

// ─── Draggable Preview ──────────────────────────────────────────────────────

interface DraggablePreviewProps {
  config: HeroOverlayConfig
  selected: SelectedElement
  onSelect: (el: SelectedElement) => void
  onMoveText: (id: string, x: number, y: number) => void
  onMoveParagraph: (id: string, x: number, y: number) => void
  onMoveLogo: (x: number, y: number) => void
}

const REF_WIDTH = 1920

function DraggablePreview({ config, selected, onSelect, onMoveText, onMoveParagraph, onMoveLogo }: DraggablePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<{ type: 'text'; id: string } | { type: 'paragraph'; id: string } | { type: 'logo' } | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / REF_WIDTH)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const getPercent = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 50, y: 50 }
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
  }, [])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging.current) return
      e.preventDefault()
      const { x, y } = getPercent(e.clientX, e.clientY)
      if (dragging.current.type === 'text') {
        onMoveText(dragging.current.id, x, y)
      } else if (dragging.current.type === 'paragraph') {
        onMoveParagraph(dragging.current.id, x, y)
      } else {
        onMoveLogo(x, y)
      }
    }
    const handleUp = () => {
      dragging.current = null
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [getPercent, onMoveText, onMoveParagraph, onMoveLogo])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden border border-white/10 select-none"
      style={{ aspectRatio: '16 / 9' }}
    >
      {/* Live preview (non-interactive background) */}
      <div className="absolute inset-0 pointer-events-none">
        <OverlayHero config={config} />
      </div>

      {/* Draggable text handles */}
      {config.texts.map((layer) => {
        const isSelected = selected?.type === 'text' && selected.id === layer.id
        const colorHex = TEXT_COLOR_MAP[layer.color].hex
        return (
          <div
            key={layer.id}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              transform: ANCHOR_TRANSFORM[layer.anchor],
              zIndex: isSelected ? 20 : 10,
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect({ type: 'text', id: layer.id })
              dragging.current = { type: 'text', id: layer.id }
            }}
          >
            {/* Invisible larger hit area */}
            <div
              className="absolute -inset-2 border border-dashed transition-opacity"
              style={{
                borderColor: isSelected ? colorHex : 'transparent',
                opacity: isSelected ? 0.6 : 0,
              }}
            />
            {/* Transparent text sized to match actual rendering */}
            <span
              className="font-display uppercase whitespace-nowrap pointer-events-none"
              style={{
                fontSize: `${layer.size * scale}px`,
                lineHeight: 1,
                color: 'transparent',
              }}
            >
              {layer.content}
            </span>
          </div>
        )
      })}

      {/* Draggable paragraph handles */}
      {config.paragraphs.map((layer) => {
        const isSelected = selected?.type === 'paragraph' && selected.id === layer.id
        const colorHex = TEXT_COLOR_MAP[layer.color].hex
        return (
          <div
            key={layer.id}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              width: `${layer.maxWidth}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isSelected ? 20 : 10,
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect({ type: 'paragraph', id: layer.id })
              dragging.current = { type: 'paragraph', id: layer.id }
            }}
          >
            <div
              className="absolute -inset-2 border border-dashed transition-opacity"
              style={{
                borderColor: isSelected ? colorHex : 'transparent',
                opacity: isSelected ? 0.6 : 0,
              }}
            />
            <span
              className="font-mono whitespace-pre-wrap block pointer-events-none"
              style={{
                fontSize: `${layer.size * scale}px`,
                lineHeight: 1.4,
                color: 'transparent',
                textAlign: layer.align,
              }}
            >
              {layer.content}
            </span>
          </div>
        )
      })}

      {/* Draggable logo handle */}
      {config.logo.enabled && (
        <div
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: `${config.logo.x}%`,
            top: `${config.logo.y}%`,
            width: `${config.logo.size}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: selected?.type === 'logo' ? 20 : 10,
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect({ type: 'logo' })
            dragging.current = { type: 'logo' }
          }}
        >
          <div
            className="absolute -inset-2 border border-dashed transition-opacity"
            style={{
              borderColor: selected?.type === 'logo' ? '#00FF41' : 'transparent',
              opacity: selected?.type === 'logo' ? 0.6 : 0,
            }}
          />
          {/* Invisible sizer matching logo aspect ratio */}
          <div style={{ paddingBottom: '100%' }} />
        </div>
      )}
    </div>
  )
}

// ─── Shared Subcomponents ───────────────────────────────────────────────────

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

/** Text presets set anchor so left-column text starts at the edge, right-column ends at the edge */
const TEXT_POSITION_PRESETS: { label: string; short: string; x: number; y: number; anchor: HeroTextAnchor }[] = [
  { label: 'Top Left',      short: 'TL', x: 5,  y: 15, anchor: 'left' },
  { label: 'Top Center',    short: 'TC', x: 50, y: 15, anchor: 'center' },
  { label: 'Top Right',     short: 'TR', x: 95, y: 15, anchor: 'right' },
  { label: 'Center Left',   short: 'CL', x: 5,  y: 50, anchor: 'left' },
  { label: 'Center',        short: 'C',  x: 50, y: 50, anchor: 'center' },
  { label: 'Center Right',  short: 'CR', x: 95, y: 50, anchor: 'right' },
  { label: 'Bottom Left',   short: 'BL', x: 5,  y: 85, anchor: 'left' },
  { label: 'Bottom Center', short: 'BC', x: 50, y: 85, anchor: 'center' },
  { label: 'Bottom Right',  short: 'BR', x: 95, y: 85, anchor: 'right' },
]

/** Logo presets always stay center-anchored */
const LOGO_POSITION_PRESETS: { label: string; short: string; x: number; y: number }[] = [
  { label: 'Top Left',      short: 'TL', x: 15, y: 15 },
  { label: 'Top Center',    short: 'TC', x: 50, y: 15 },
  { label: 'Top Right',     short: 'TR', x: 85, y: 15 },
  { label: 'Center Left',   short: 'CL', x: 15, y: 50 },
  { label: 'Center',        short: 'C',  x: 50, y: 50 },
  { label: 'Center Right',  short: 'CR', x: 85, y: 50 },
  { label: 'Bottom Left',   short: 'BL', x: 15, y: 85 },
  { label: 'Bottom Center', short: 'BC', x: 50, y: 85 },
  { label: 'Bottom Right',  short: 'BR', x: 85, y: 85 },
]

function TextPositionPresets({
  currentX,
  currentY,
  color,
  onSelect,
}: {
  currentX: number
  currentY: number
  color: string
  onSelect: (x: number, y: number, anchor: HeroTextAnchor) => void
}) {
  return (
    <div>
      <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
        Snap to Position
      </label>
      <div className="grid grid-cols-3 gap-1">
        {TEXT_POSITION_PRESETS.map((p) => {
          const isActive = Math.abs(currentX - p.x) < 2 && Math.abs(currentY - p.y) < 2
          return (
            <button
              key={p.short}
              onClick={() => onSelect(p.x, p.y, p.anchor)}
              className="px-2 py-1.5 text-[9px] uppercase tracking-wider border transition-all"
              style={{
                borderColor: isActive ? color : 'rgba(255,255,255,0.1)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: isActive ? color : 'rgba(255,255,255,0.4)',
              }}
              title={p.label}
            >
              {p.short}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LogoPositionPresets({
  currentX,
  currentY,
  color,
  onSelect,
}: {
  currentX: number
  currentY: number
  color: string
  onSelect: (x: number, y: number) => void
}) {
  return (
    <div>
      <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
        Snap to Position
      </label>
      <div className="grid grid-cols-3 gap-1">
        {LOGO_POSITION_PRESETS.map((p) => {
          const isActive = Math.abs(currentX - p.x) < 2 && Math.abs(currentY - p.y) < 2
          return (
            <button
              key={p.short}
              onClick={() => onSelect(p.x, p.y)}
              className="px-2 py-1.5 text-[9px] uppercase tracking-wider border transition-all"
              style={{
                borderColor: isActive ? color : 'rgba(255,255,255,0.1)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: isActive ? color : 'rgba(255,255,255,0.4)',
              }}
              title={p.label}
            >
              {p.short}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ParagraphPositionPresets({
  currentX,
  currentY,
  color,
  onSelect,
}: {
  currentX: number
  currentY: number
  color: string
  onSelect: (x: number, y: number) => void
}) {
  return (
    <div>
      <label className="block text-[9px] uppercase tracking-widest text-text-muted mb-1">
        Snap to Position
      </label>
      <div className="grid grid-cols-3 gap-1">
        {LOGO_POSITION_PRESETS.map((p) => {
          const isActive = Math.abs(currentX - p.x) < 2 && Math.abs(currentY - p.y) < 2
          return (
            <button
              key={p.short}
              onClick={() => onSelect(p.x, p.y)}
              className="px-2 py-1.5 text-[9px] uppercase tracking-wider border transition-all"
              style={{
                borderColor: isActive ? color : 'rgba(255,255,255,0.1)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: isActive ? color : 'rgba(255,255,255,0.4)',
              }}
              title={p.label}
            >
              {p.short}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  min,
  max,
  suffix,
  color,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix: string
  color: string
  onChange: (v: number) => void
}) {
  const fillPct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] uppercase tracking-widest text-text-muted shrink-0 w-16">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
        style={{
          accentColor: color,
          background: `linear-gradient(to right, ${color} ${fillPct}%, rgba(255,255,255,0.1) ${fillPct}%)`,
        }}
      />
      <span className="text-xs tabular-nums w-12 text-right" style={{ color }}>
        {value}{suffix}
      </span>
    </div>
  )
}
