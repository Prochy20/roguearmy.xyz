import { ErrorPage } from "@/components/error"

/**
 * 404 Not Found page for frontend routes.
 * Displays Ashley's terminal-style error message.
 */
export default function NotFound() {
  return <ErrorPage errorType="404" showRetryButton={false} />
}
