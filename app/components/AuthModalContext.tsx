'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AuthModalContextType {
  showLoginModal: boolean
  showRegisterModal: boolean
  setShowLoginModal: (show: boolean) => void
  setShowRegisterModal: (show: boolean) => void
  openLoginModal: () => void
  openRegisterModal: () => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const openLoginModal = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const openRegisterModal = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  return (
    <AuthModalContext.Provider
      value={{
        showLoginModal,
        showRegisterModal,
        setShowLoginModal,
        setShowRegisterModal,
        openLoginModal,
        openRegisterModal,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}

