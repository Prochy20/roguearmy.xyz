"use client"

import { useEffect } from "react"
import { ErrorPage } from "@/components/error/ErrorPage"
import { ScanlineOverlay } from "@/components/effects/ScanlineOverlay"
import "@/app/globals.css"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root-level error boundary.
 * Catches errors in the root layout and must include its own html/body tags.
 * Fonts are loaded via globals.css imports.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-void text-foreground font-body antialiased">
        <ErrorPage errorType="500" reset={reset} />
        <ScanlineOverlay intensity="low" />
      </body>
    </html>
  )
}
