"use client"

import { useEffect } from "react"
import { ErrorPage } from "@/components/error/ErrorPage"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary for frontend routes.
 * Catches runtime errors and displays Ashley's terminal-style error message.
 * Must be a client component.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Frontend error:", error)
  }, [error])

  return <ErrorPage errorType="500" reset={reset} />
}
