'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface MemberInfo {
  discordId: string
  avatar: string | null
  username: string
  globalName: string | null
}

export interface BlogAuthState {
  authenticated: boolean
  member: MemberInfo | null
  memberId: string | null
}

interface BlogAuthContextValue {
  authState: BlogAuthState
  isAuthenticated: boolean
  member: MemberInfo | null
}

const BlogAuthContext = createContext<BlogAuthContextValue | null>(null)

interface BlogAuthProviderProps {
  children: ReactNode
  authState: BlogAuthState
}

export function BlogAuthProvider({ children, authState }: BlogAuthProviderProps) {
  const value: BlogAuthContextValue = {
    authState,
    isAuthenticated: authState.authenticated,
    member: authState.member,
  }

  return (
    <BlogAuthContext.Provider value={value}>
      {children}
    </BlogAuthContext.Provider>
  )
}

export function useBlogAuth() {
  const context = useContext(BlogAuthContext)
  if (!context) {
    throw new Error('useBlogAuth must be used within a BlogAuthProvider')
  }
  return context
}

/**
 * Hook to get member info, returns null if not authenticated
 */
export function useOptionalMember(): MemberInfo | null {
  const context = useContext(BlogAuthContext)
  return context?.member ?? null
}
