'use client'

import { useEffect, useState } from 'react'
import {
  readStorage,
  writeStorage,
  designatePoint,
  clearPoint,
  recordVisit,
  updatePointSeen,
  dismissSuggestion,
  emptyStorage,
  type FormationStorage,
  type PointDesignation,
} from '@/lib/formation/storage'

export interface UseFormationStorage {
  /** Current storage state. Returns EMPTY until the first useEffect tick post-mount. */
  state: FormationStorage
  /** True after the post-mount hydration tick — gate render variants that depend on storage. */
  hydrated: boolean
  designate: (point: PointDesignation) => void
  clear: () => void
  recordVisit: (rank: number, xp: number) => void
  updateSeenPoint: (rank: number, xp: number) => void
  dismiss: (discordId: string) => void
}

/**
 * Reactive wrapper around storage.ts. Hydrates from localStorage on mount;
 * each mutator uses functional setState so successive calls compose cleanly
 * (no stale-closure pitfall when callbacks fire in quick succession).
 *
 * Renders return the EMPTY storage pre-hydration. Consumers should use
 * `hydrated` to decide whether storage-dependent UI is ready.
 */
export function useFormationStorage(): UseFormationStorage {
  const [state, setState] = useState<FormationStorage>(emptyStorage)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(readStorage())
    setHydrated(true)
  }, [])

  return {
    state,
    hydrated,
    designate: (point) => {
      setState((prev) => {
        const next = designatePoint(prev, point)
        writeStorage(next)
        return next
      })
    },
    clear: () => {
      setState((prev) => {
        const next = clearPoint(prev)
        writeStorage(next)
        return next
      })
    },
    recordVisit: (rank, xp) => {
      setState((prev) => {
        const next = recordVisit(prev, rank, xp)
        writeStorage(next)
        return next
      })
    },
    updateSeenPoint: (rank, xp) => {
      setState((prev) => {
        const next = updatePointSeen(prev, rank, xp)
        writeStorage(next)
        return next
      })
    },
    dismiss: (discordId) => {
      setState((prev) => {
        const next = dismissSuggestion(prev, discordId)
        writeStorage(next)
        return next
      })
    },
  }
}
