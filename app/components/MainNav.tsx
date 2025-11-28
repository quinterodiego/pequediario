'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Ruler, Moon, Apple, Star, Droplet, Settings } from 'lucide-react'
import { Button } from './ui/button'

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Inicio' },
  { path: '/dashboard/crecimiento', icon: Ruler, label: 'Crecimiento' },
  { path: '/dashboard/sueno', icon: Moon, label: 'Sueño' },
  { path: '/dashboard/alimentacion', icon: Apple, label: 'Alimentación' },
  { path: '/dashboard/hitos', icon: Star, label: 'Hitos' },
  { path: '/dashboard/esfinteres', icon: Droplet, label: 'Chau Pañal' },
  { path: '/dashboard/perfil', icon: Settings, label: 'Perfil' },
]

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav id="tour-main-nav" className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
      <div className="container mx-auto px-1 sm:px-2">
        <div className="flex justify-around items-center h-14 sm:h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            // Para /dashboard, debe ser exactamente igual
            // Para otras rutas, debe empezar con el path
            const isActive = item.path === '/dashboard' 
              ? pathname === '/dashboard' || pathname === '/dashboard/'
              : pathname?.startsWith(item.path)
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.path)}
                className={`relative flex flex-col items-center justify-center gap-0.5 sm:gap-1 h-full w-full rounded-none px-0.5 sm:px-1 transition-all ${
                  isActive 
                    ? 'text-[#8CCFE0] dark:text-[#8CCFE0] bg-[#8CCFE0]/15 dark:bg-[#8CCFE0]/25 font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#8CCFE0] dark:bg-[#8CCFE0] rounded-b-full" />
                )}
                <Icon size={18} className={`sm:w-5 sm:h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] sm:text-xs font-medium leading-tight">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

