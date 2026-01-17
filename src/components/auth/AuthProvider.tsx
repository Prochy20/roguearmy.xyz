'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthState, MemberSession } from '@/lib/auth/types'

interface AuthContextType extends AuthState {
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    member: null,
  })

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      setState({
        isAuthenticated: data.authenticated,
        isLoading: false,
        member: data.member as MemberSession | null,
      })
    } catch {
      setState({
        isAuthenticated: false,
        isLoading: false,
        member: null,
      })
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setState({
      isAuthenticated: false,
      isLoading: false,
      member: null,
    })
  }

  const refresh = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    await fetchSession()
  }

  useEffect(() => {
    fetchSession()
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, logout, refresh }}>
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
