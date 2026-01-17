'use client'

import { useEffect, useState, useCallback } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { MermaidDiagram } from './MermaidDiagram'

interface CodeBlockProps {
  className?: string
  children?: React.ReactNode
}

// Language display names
const languageNames: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  jsx: 'JSX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  csharp: 'C#',
  java: 'Java',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  sql: 'SQL',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  md: 'Markdown',
  markdown: 'Markdown',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  fish: 'Fish',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  prisma: 'Prisma',
  text: 'Plain Text',
  txt: 'Plain Text',
}

function SyntaxHighlightedCode({ code, language }: { code: string; language: string }) {
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const displayLanguage = languageNames[language.toLowerCase()] || language.toUpperCase()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }, [code])

  useEffect(() => {
    let mounted = true

    async function highlight() {
      try {
        const { codeToHtml } = await import('shiki')

        const html = await codeToHtml(code, {
          lang: language,
          theme: 'tokyo-night',
        })

        // Sanitize the HTML output for security
        const sanitizedHtml = DOMPurify.sanitize(html, {
          USE_PROFILES: { html: true },
          ADD_TAGS: ['span'],
          ADD_ATTR: ['class', 'style'],
        })

        if (mounted) {
          setHighlightedCode(sanitizedHtml)
          setIsLoading(false)
        }
      } catch (err) {
        // Fallback for unsupported languages
        console.warn(`Shiki highlight failed for language "${language}":`, err)
        if (mounted) {
          setHighlightedCode(null)
          setIsLoading(false)
        }
      }
    }

    highlight()

    return () => {
      mounted = false
    }
  }, [code, language])

  if (isLoading) {
    return (
      <div className="my-6 overflow-hidden rounded-lg border border-rga-green/20 bg-bg-surface/50">
        <div className="px-4 py-2 border-b border-rga-green/20 flex items-center justify-between bg-bg-surface/80">
          <span className="text-xs font-mono text-rga-gray">{displayLanguage}</span>
        </div>
        <div className="p-4 animate-pulse">
          <div className="h-4 bg-rga-gray/10 rounded w-3/4 mb-2" />
          <div className="h-4 bg-rga-gray/10 rounded w-1/2 mb-2" />
          <div className="h-4 bg-rga-gray/10 rounded w-5/6" />
        </div>
      </div>
    )
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-rga-green/20 bg-[#1a1b26]">
      {/* Header with language badge and copy button */}
      <div className="px-4 py-2 border-b border-rga-green/20 flex items-center justify-between bg-bg-surface/80">
        <span className="text-xs font-mono text-rga-cyan">{displayLanguage}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-rga-gray hover:text-rga-green transition-colors rounded hover:bg-rga-green/10"
          title="Copy code"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content - HTML is sanitized with DOMPurify */}
      <div className="overflow-x-auto">
        {highlightedCode ? (
          <div
            className="p-4 text-sm font-mono leading-relaxed [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          <pre className="p-4 text-sm font-mono leading-relaxed text-text-secondary overflow-x-auto">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  // Extract language from className (e.g., "language-typescript" -> "typescript")
  const language = className?.replace(/language-/, '') || 'text'
  const code = String(children).replace(/\n$/, '')

  // Handle mermaid diagrams separately (support both "mermaid" and "mermaidjs")
  if (language === 'mermaid' || language === 'mermaidjs') {
    return <MermaidDiagram code={code} />
  }

  return <SyntaxHighlightedCode code={code} language={language} />
}
