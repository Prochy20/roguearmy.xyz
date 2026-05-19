import { notFound } from 'next/navigation'
import { checkRoleGate } from '@/lib/auth/roleGate'
import { EmptyDossier } from '@/components/shared/EmptyDossier'

/**
 * Layout-level access gate for the entire `/division-2` subtree. Every page
 * underneath inherits the same three-tier behavior:
 *
 *  - anonymous     → `notFound()` (the tool is invisible to logged-out visitors)
 *  - unconfigured  → `FEATURE_PENDING` dossier (Settings has no game-roles entry)
 *  - denied        → `ROLE_REQUIRED` dossier with a route to Discord role-help
 *  - allowed       → render children
 *
 * Adding a second D2 tool? Drop it under `/division-2/<tool>/page.tsx`; the
 * gate already covers it.
 */
export default async function Division2Layout({ children }: { children: React.ReactNode }) {
  const gate = await checkRoleGate('division2Role')

  if (gate.state === 'anonymous') notFound()

  if (gate.state === 'unconfigured') {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
        <EmptyDossier kind="FEATURE_PENDING" />
      </div>
    )
  }

  if (gate.state === 'denied') {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
        <EmptyDossier kind="ROLE_REQUIRED" />
      </div>
    )
  }

  return <>{children}</>
}
