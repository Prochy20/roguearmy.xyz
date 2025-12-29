import { ErrorPage } from "@/components/error"
import { ScanlineOverlay } from "@/components/effects"

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
