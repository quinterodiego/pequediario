'use client'

import { useSession } from 'next-auth/react'

export function useAdmin() {
  const { data: session, status } = useSession()
  
  const isAdmin = session?.user?.isAdmin === true
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  
  return {
    isAdmin,
    isLoading,
    isAuthenticated,
    user: session?.user,
  }
}

