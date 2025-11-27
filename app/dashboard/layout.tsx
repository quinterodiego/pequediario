'use client'

import { MainNav } from '../components/MainNav'
import { Header } from '../components/Header'
import { Onboarding } from '../components/Onboarding'
import { Tour } from '../components/Tour'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated' && session?.user) {
      checkProfile()
    }
  }, [status, session, router])

  const checkProfile = async () => {
    try {
      const response = await fetch('/api/child-profile')
      if (response.ok) {
        const data = await response.json()
        setHasProfile(data.hasProfile === true)
      } else {
        setHasProfile(false)
      }
    } catch (error) {
      console.error('Error verificando perfil:', error)
      setHasProfile(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboardingComplete = async (data: { name: string; birthDate: string }) => {
    try {
      const response = await fetch('/api/child-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          birthDate: data.birthDate,
        }),
      })

      if (response.ok) {
        setHasProfile(true)
        // Iniciar el tour después de completar el onboarding
        // Esperar un momento para que el DOM se actualice
        setTimeout(() => {
          setShowTour(true)
        }, 500)
      } else {
        alert('Error al guardar el perfil. Por favor, intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error guardando perfil:', error)
      alert('Error al guardar el perfil. Por favor, intenta nuevamente.')
    }
  }

  useEffect(() => {
    // Verificar si el usuario ya completó el tour
    if (hasProfile === true) {
      const tourCompleted = localStorage.getItem('tour-completed')
      // Si no completó el tour y no está en proceso de onboarding, iniciarlo
      if (!tourCompleted && !isLoading) {
        // Esperar un momento para que el DOM se cargue completamente
        const timer = setTimeout(() => {
          setShowTour(true)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [hasProfile, isLoading])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Mostrar onboarding si no tiene perfil
  if (hasProfile === false) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-24">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </main>
      <MainNav />
      <Tour run={showTour} onComplete={() => setShowTour(false)} />
    </div>
  )
}

