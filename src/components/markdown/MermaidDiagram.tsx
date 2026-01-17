'use client'

import { useEffect, useRef, useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'

interface MermaidDiagramProps {
  code: string
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function renderDiagram() {
      try {
        const mermaid = (await import('mermaid')).default

        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            background: 'transparent',
            mainBkg: 'transparent',

            primaryColor: 'rgba(0, 255, 65, 0.08)',
            primaryBorderColor: '#00FF41',
            primaryTextColor: '#ffffff',

            secondaryColor: 'rgba(0, 255, 255, 0.08)',
            secondaryBorderColor: '#00FFFF',
            secondaryTextColor: '#ffffff',

            tertiaryColor: 'rgba(255, 0, 255, 0.08)',
            tertiaryBorderColor: '#FF00FF',
            tertiaryTextColor: '#ffffff',

            lineColor: '#00FFFF',
            arrowheadColor: '#00FFFF',

            textColor: '#E5E5E5',
            nodeTextColor: '#ffffff',

            clusterBkg: 'rgba(0, 255, 65, 0.03)',
            clusterBorder: 'rgba(0, 255, 65, 0.4)',
            titleColor: '#00FFFF',

            noteBkgColor: 'rgba(0, 255, 255, 0.05)',
            noteTextColor: '#E5E5E5',
            noteBorderColor: 'rgba(0, 255, 255, 0.3)',

            edgeLabelBackground: 'transparent',

            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          },
          themeCSS: `
            .node rect,
            .node circle,
            .node ellipse,
            .node polygon {
              stroke-width: 1.5px;
              filter: drop-shadow(0 0 3px currentColor);
            }

            .node.default > rect,
            .node.default > polygon {
              filter: drop-shadow(0 0 4px rgba(0, 255, 65, 0.4));
            }

            .flowchart-link {
              stroke: #00FFFF !important;
              stroke-width: 1.5px;
              filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.5));
            }

            marker path {
              fill: #00FFFF !important;
            }

            .cluster rect {
              fill: rgba(0, 255, 65, 0.02) !important;
              stroke: rgba(0, 255, 65, 0.3) !important;
              stroke-width: 1px;
              stroke-dasharray: 4 2;
              rx: 4px;
              ry: 4px;
            }

            .cluster-label {
              fill: #00FFFF !important;
              font-weight: 500;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .nodeLabel {
              font-family: 'JetBrains Mono', ui-monospace, monospace;
              font-size: 13px;
              fill: #ffffff;
            }

            .edgeLabel {
              font-size: 11px;
              fill: #888888;
            }

            .edgeLabel rect {
              fill: transparent !important;
            }

            .actor {
              fill: rgba(0, 255, 65, 0.08) !important;
              stroke: #00FF41 !important;
              stroke-width: 1.5px;
              filter: drop-shadow(0 0 4px rgba(0, 255, 65, 0.3));
            }

            .actor-line {
              stroke: rgba(0, 255, 255, 0.4) !important;
              stroke-dasharray: 3 3;
            }

            .messageLine0,
            .messageLine1 {
              stroke: #00FFFF !important;
              stroke-width: 1.5px;
            }

            .messageText {
              fill: #E5E5E5 !important;
              font-size: 12px;
            }

            .note {
              fill: rgba(0, 255, 255, 0.05) !important;
              stroke: rgba(0, 255, 255, 0.3) !important;
              stroke-width: 1px;
            }

            .noteText {
              fill: #B0B0B0 !important;
              font-size: 11px;
            }

            .label-container {
              fill: transparent !important;
            }
          `,
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 13,
          securityLevel: 'loose',
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            padding: 20,
            nodeSpacing: 60,
            rankSpacing: 60,
            useMaxWidth: true,
          },
          sequence: {
            diagramMarginX: 30,
            diagramMarginY: 20,
            actorMargin: 60,
            width: 140,
            height: 55,
            boxMargin: 8,
            boxTextMargin: 4,
            noteMargin: 12,
            messageMargin: 40,
            mirrorActors: true,
            useMaxWidth: true,
          },
        })

        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
        const { svg: renderedSvg } = await mermaid.render(id, code)

        const sanitizedSvg = DOMPurify.sanitize(renderedSvg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_TAGS: ['foreignObject', 'style'],
          ADD_ATTR: [
            'class', 'style', 'transform', 'viewBox', 'xmlns',
            'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
            'd', 'x', 'y', 'width', 'height', 'rx', 'ry',
            'cx', 'cy', 'r', 'points', 'filter',
            'marker-end', 'marker-start',
            'dominant-baseline', 'text-anchor',
            'font-family', 'font-size', 'font-weight',
          ],
        })

        if (mounted) {
          setSvg(sanitizedSvg)
          setIsLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
          setIsLoading(false)
        }
      }
    }

    renderDiagram()

    return () => {
      mounted = false
    }
  }, [code])

  // Corner bracket component
  const Corner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
    const rotations = {
      tl: '',
      tr: 'rotate-90',
      bl: '-rotate-90',
      br: 'rotate-180',
    }
    const positions = {
      tl: 'top-0 left-0',
      tr: 'top-0 right-0',
      bl: 'bottom-0 left-0',
      br: 'bottom-0 right-0',
    }

    return (
      <div className={`absolute ${positions[position]} ${rotations[position]}`}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-rga-green/50"
        >
          <path
            d="M0 16V0H16"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="my-12 flex items-center justify-center py-16">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-3 h-3 bg-rga-green rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-rga-cyan rounded-full animate-ping opacity-40" />
          </div>
          <span className="text-rga-gray/60 text-xs font-mono uppercase tracking-widest">
            Rendering
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-rga-green/50 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="my-12 py-8">
        <div className="flex items-start gap-4 text-rga-magenta/80">
          <div className="w-1 h-12 bg-rga-magenta/50 rounded-full flex-shrink-0" />
          <div>
            <p className="text-xs font-mono uppercase tracking-wider mb-2 text-rga-magenta/60">
              Diagram Error
            </p>
            <p className="text-sm text-rga-gray">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative my-12 py-8 px-6 group"
    >
      {/* Corner brackets */}
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />

      {/* Label */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 bg-bg-primary">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-rga-green/40">
          Diagram
        </span>
      </div>

      {/* Main diagram container */}
      <div className="overflow-x-auto py-4">
        <div
          className="
            flex justify-center min-w-fit
            [&>svg]:max-w-full
            [&_text]:fill-[#E5E5E5]
            [&_.cluster-label]:fill-[#00FFFF]
            [&_.nodeLabel]:fill-white
          "
          dangerouslySetInnerHTML={{ __html: svg || '' }}
        />
      </div>

      {/* Subtle hover scanline effect */}
      <div
        className="
          absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500
        "
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,65,0.01) 0px, transparent 1px, transparent 3px)',
        }}
      />
    </div>
  )
}
