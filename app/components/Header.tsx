'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { LogOut, Crown, MessageCircle } from 'lucide-react'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'
import { useAuthModal } from './AuthModalContext'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showLoginModal, showRegisterModal, setShowLoginModal, setShowRegisterModal } = useAuthModal()

  if (status === 'loading') {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 backdrop-blur supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-gray-900/95 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-3 sm:px-4">
        <div 
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group flex-shrink-0"
          onClick={() => router.push('/')}
        >
          <img src="/logo.png" alt="Peque Diario" width={40} height={40} />
          
          <div className="flex flex-col">
            <h1 className="text-base sm:text-xl font-extrabold">
              <span className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] bg-clip-text text-transparent">Peque</span>{' '}
              <span className="text-gray-700 dark:text-gray-200">Diario</span>
            </h1>
            <p className="text-xs text-gray-700 dark:text-gray-300 hidden sm:block">Acompañando el crecimiento de tu hijo</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {session ? (
            <>
              {!session.user?.isPremium && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/premium')}
                  className="hidden sm:flex items-center gap-2 border-yellow-600 bg-white text-yellow-600 hover:text-yellow-600 hover:bg-gray-100 px-2 sm:px-3 mr-3"
                >
                  <Crown size={14} className="text-yellow-600" />
                  <span className="text-xs sm:text-sm">Premium</span>
                </Button>
              )}
              {session.user?.isPremium && (
                <ThemeToggle />
              )}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-primary-200 hover:ring-primary-400 transition-all"
                    />
                  )}
                  <span className="hidden lg:block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                    ¡Hola, {session.user?.name?.split(' ')[0]}!
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline text-xs sm:text-sm">Dashboard</span>
                  <span className="sm:hidden text-xs">Dash</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/community')}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3"
                >
                  <MessageCircle size={16} className="sm:mr-2 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Comunidad</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => signOut()}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 sm:px-3"
                >
                  <LogOut size={16} className="sm:w-4 sm:h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setShowLoginModal(true)}
                  variant="outline"
                  className="border-[#CBD5E1] dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Ingresar</span>
                  <span className="sm:hidden">Entrar</span>
                </Button>
                
                <Button 
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-gray-700 dark:text-gray-100 shadow-md hover:shadow-lg transition-all px-2 sm:px-3 text-xs sm:text-sm font-medium"
                >
                  <span className="hidden sm:inline">Registrarse</span>
                  <span className="sm:hidden">Reg</span>
                </Button>
              </div>
              <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
              <RegisterModal open={showRegisterModal} onOpenChange={setShowRegisterModal} />
            </>
          )}
        </div>
      </div>
    </header>
  )
}