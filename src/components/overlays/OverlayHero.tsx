'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { HeroGlitch } from '@/components/effects/HeroGlitch'
import type { HeroOverlayConfig, HeroTextLayer, HeroParagraphLayer } from '@/lib/overlay-hero-config'
import { TEXT_COLOR_MAP, ANCHOR_TRANSFORM } from '@/lib/overlay-hero-config'

/** All px values in the config are authored against this reference width */
const REF_WIDTH = 1920

interface OverlayHeroProps {
  config: HeroOverlayConfig
}

export function OverlayHero({ config }: OverlayHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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

  const bgSrc = config.bg !== 'none' ? `/images/bg/${config.bg}.jpg` : null

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: config.bgTransparent ? 'transparent' : '#000' }}
    >
      {/* Background image */}
      {bgSrc && (
        <Image
          src={bgSrc}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
          quality={85}
          style={{ opacity: config.bgOpacity / 100 }}
        />
      )}

      {/* Text layers */}
      {config.texts.map((layer) => (
        <TextLayerRenderer key={layer.id} layer={layer} scale={scale} />
      ))}

      {/* Paragraph layers */}
      {config.paragraphs.map((layer) => (
        <ParagraphLayerRenderer key={layer.id} layer={layer} scale={scale} />
      ))}

      {/* Logo layer */}
      {config.logo.enabled && (
        <div
          className="absolute"
          style={{
            left: `${config.logo.x}%`,
            top: `${config.logo.y}%`,
            width: `${config.logo.size}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {config.logo.flicker ? (
            <HeroGlitch
              minInterval={config.logo.flickerMin}
              maxInterval={config.logo.flickerMax}
              intensity={config.logo.flickerIntensity}
              dataCorruption={false}
              scanlines={false}
              colors={['#00ffff', '#ff00ff']}
            >
              <Image
                src="/logo.png"
                alt="RGA Logo"
                width={512}
                height={512}
                className="w-full h-auto drop-shadow-[0_0_30px_rgba(0,255,65,0.5)]"
                sizes={`${config.logo.size}vw`}
              />
            </HeroGlitch>
          ) : (
            <Image
              src="/logo.png"
              alt="RGA Logo"
              width={512}
              height={512}
              className="w-full h-auto drop-shadow-[0_0_30px_rgba(0,255,65,0.5)]"
              sizes={`${config.logo.size}vw`}
            />
          )}
        </div>
      )}
    </div>
  )
}

function ParagraphLayerRenderer({ layer, scale }: { layer: HeroParagraphLayer; scale: number }) {
  const colorDef = TEXT_COLOR_MAP[layer.color]
  const scaledSize = layer.size * scale

  return (
    <div
      className="absolute"
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${layer.maxWidth}%`,
      }}
    >
      <span
        className="font-mono whitespace-pre-wrap block"
        style={{
          fontSize: `${scaledSize}px`,
          lineHeight: 1.4,
          color: colorDef.hex,
          textShadow: `0 0 ${10 * scale}px ${colorDef.glow}`,
          textAlign: layer.align,
        }}
      >
        {layer.content}
      </span>
    </div>
  )
}

function TextLayerRenderer({ layer, scale }: { layer: HeroTextLayer; scale: number }) {
  const colorDef = TEXT_COLOR_MAP[layer.color]
  const scaledSize = layer.size * scale

  const textElement = (
    <span
      className="font-display uppercase whitespace-nowrap"
      style={{
        fontSize: `${scaledSize}px`,
        lineHeight: 1,
        color: colorDef.hex,
        textShadow: `0 0 ${20 * scale}px ${colorDef.glow}, 0 0 ${40 * scale}px ${colorDef.glow}`,
      }}
    >
      {layer.content}
    </span>
  )

  return (
    <div
      className="absolute"
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        transform: ANCHOR_TRANSFORM[layer.anchor],
      }}
    >
      {layer.flicker ? (
        <HeroGlitch
          minInterval={layer.flickerMin}
          maxInterval={layer.flickerMax}
          intensity={layer.flickerIntensity}
          dataCorruption={false}
          scanlines
          colors={
            layer.color === 'magenta'
              ? ['#ff00ff', '#00ffff']
              : ['#00ffff', '#ff00ff']
          }
        >
          {textElement}
        </HeroGlitch>
      ) : (
        textElement
      )}
    </div>
  )
}
