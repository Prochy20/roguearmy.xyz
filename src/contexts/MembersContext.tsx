'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface MemberInfo {
  discordId: string
  avatar: string | null
  username: string
  globalName: string | null
}

interface MembersContextValue {
  member: MemberInfo
}

const MembersContext = createContext<MembersContextValue | null>(null)

interface MembersProviderProps {
  children: ReactNode
  member: MemberInfo
}

export function MembersProvider({ children, member }: MembersProviderProps) {
  return (
    <MembersContext.Provider value={{ member }}>
      {children}
    </MembersContext.Provider>
  )
}

export function useMember() {
  const context = useContext(MembersContext)
  if (!context) {
    throw new Error('useMember must be used within a MembersProvider')
  }
  return context.member
}
