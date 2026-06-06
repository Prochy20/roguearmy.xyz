'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthState, MemberSession } from '@/lib/auth/types'
import type { RoleGateMap } from '@/lib/auth/roleGate.types'

interface AuthContextType extends AuthState {
  /**
   * Resolved role-gate states keyed by Settings field (e.g. `division2Role`).
   * Computed server-side once per request and threaded through `initialState`
   * to avoid a flash of un-gated nav on first paint.
   */
  roleGates: RoleGateMap
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
  /**
   * Initial auth state from server. When provided, skips the client-side
   * /api/auth/me fetch, eliminating a round-trip on page load.
   */
  initialState?: {
    isAuthenticated: boolean
    member: MemberSession | null
    roleGates?: RoleGateMap
  }
}

export function AuthProvider({ children, initialState }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(() => {
    // If server provided initial state, use it and skip loading
    if (initialState) {
      return {
        isAuthenticated: initialState.isAuthenticated,
        isLoading: false,
        member: initialState.member,
      }
    }
    // Otherwise, start in loading state
    return {
      isAuthenticated: false,
      isLoading: true,
      member: null,
    }
  })

  const [roleGates, setRoleGates] = useState<RoleGateMap>(() => initialState?.roleGates ?? {})

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      setState({
        isAuthenticated: data.authenticated,
        isLoading: false,
        member: data.member as MemberSession | null,
      })
      if (data.roleGates) setRoleGates(data.roleGates as RoleGateMap)
    } catch {
      setState({
        isAuthenticated: false,
        isLoading: false,
        member: null,
      })
      setRoleGates({})
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    // Hard navigate so any cached client state tied to the now-defunct
    // session is discarded. Server components on the homepage will also
    // re-render with the cleared cookies.
    window.location.href = '/'
  }

  const refresh = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    await fetchSession()
  }

  useEffect(() => {
    // Only fetch if no initial state was provided
    if (!initialState) {
      fetchSession()
    }
  }, [initialState])

  return (
    <AuthContext.Provider value={{ ...state, roleGates, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
