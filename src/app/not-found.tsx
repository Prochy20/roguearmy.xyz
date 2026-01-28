import { ErrorPage } from "@/components/error/ErrorPage"
import { ScanlineOverlay } from "@/components/effects/ScanlineOverlay"

/**
 * Root 404 Not Found page.
 * Catches all unmatched routes across the entire app.
 */
export default function NotFound() {
  return (
    <>
      <ErrorPage errorType="404" showRetryButton={false} />
      <ScanlineOverlay intensity="low" />
    </>
  )
}
