'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Home, Ruler, Moon, Apple, Star, Baby, Droplet, Clock, TrendingUp, Plus, ArrowRight, Crown } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { QuickRecordModals } from '../components/QuickRecordModals'

interface Activity {
  id: string
  timestamp: string
  type: 'esfinteres' | 'feeding' | 'sleep' | 'milestone' | 'growth'
  details: any
  babyName?: string
}

export default function InicioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [openQuickModal, setOpenQuickModal] = useState<'esfinteres' | 'crecimiento' | 'sueno' | 'alimentacion' | 'hitos' | null>(null)
  const hasLoadedRef = useRef(false)
  const lastUserEmailRef = useRef<string | null>(null)

  // Cargar actividades solo cuando cambia el estado de autenticación o el usuario
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      hasLoadedRef.current = false
      lastUserEmailRef.current = null
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      const currentEmail = session.user.email
      
      // Solo cargar si es la primera vez o si cambió el usuario
      if (!hasLoadedRef.current || lastUserEmailRef.current !== currentEmail) {
        // Verificar explícitamente si es Premium (puede ser undefined, null, false o true)
        const premiumStatus = Boolean(session.user.isPremium === true)
        console.log('Premium status check:', {
          raw: session.user.isPremium,
          boolean: premiumStatus,
          user: session.user
        })
        setIsPremium(premiumStatus)
        loadActivities()
        hasLoadedRef.current = true
        lastUserEmailRef.current = currentEmail
      } else {
        // Si ya se cargó y es el mismo usuario, solo actualizar el estado de Premium si cambió
        const premiumStatus = Boolean(session.user.isPremium === true)
        setIsPremium(premiumStatus)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.email])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        const allActivities = data.activities || []
        setActivities(allActivities)
        // Debug: ver qué tipos de actividades tenemos
        console.log('Actividades cargadas:', {
          total: allActivities.length,
          porTipo: {
            esfinteres: allActivities.filter((a: Activity) => a.type === 'esfinteres').length,
            feeding: allActivities.filter((a: Activity) => a.type === 'feeding').length,
            sleep: allActivities.filter((a: Activity) => a.type === 'sleep').length,
            growth: allActivities.filter((a: Activity) => a.type === 'growth').length,
            milestone: allActivities.filter((a: Activity) => a.type === 'milestone').length,
          },
          todas: allActivities.map((a: Activity) => ({ type: a.type, timestamp: a.timestamp }))
        })
      }
    } catch (error) {
      console.error('Error cargando actividades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Calcular estadísticas del día
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const todayActivities = activities.filter(act => {
    const actDate = new Date(act.timestamp)
    actDate.setHours(0, 0, 0, 0) // Normalizar la fecha de la actividad
    return actDate.getTime() === today.getTime()
  })
  
  // Debug: ver qué actividades hay hoy
  console.log('Actividades de hoy:', {
    total: todayActivities.length,
    porTipo: {
      esfinteres: todayActivities.filter((a: Activity) => a.type === 'esfinteres').length,
      feeding: todayActivities.filter((a: Activity) => a.type === 'feeding').length,
      sleep: todayActivities.filter((a: Activity) => a.type === 'sleep').length,
      growth: todayActivities.filter((a: Activity) => a.type === 'growth').length,
      milestone: todayActivities.filter((a: Activity) => a.type === 'milestone').length,
    },
    todas: todayActivities.map((a: Activity) => ({ type: a.type, timestamp: a.timestamp }))
  })
  
  const todayStats = {
    esfinteres: todayActivities.filter(a => a.type === 'esfinteres').length,
    pis: todayActivities.filter(a => a.type === 'esfinteres' && (a.details?.type === 'pipi' || a.details?.type === 'húmedo')).length,
    caca: todayActivities.filter(a => a.type === 'esfinteres' && (a.details?.type === 'caca' || a.details?.type === 'sucio')).length,
    seco: todayActivities.filter(a => a.type === 'esfinteres' && a.details?.type === 'seco').length,
    alimentacion: todayActivities.filter(a => a.type === 'feeding').length,
    sueno: todayActivities.filter(a => a.type === 'sleep').length,
    crecimiento: todayActivities.filter(a => a.type === 'growth').length,
    hitos: todayActivities.filter(a => a.type === 'milestone').length,
  }

  // Últimos registros (máximo 5)
  const recentActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  // Secciones de navegación
  const sections = [
    {
      name: 'Crecimiento',
      href: '/dashboard/crecimiento',
      modalType: 'crecimiento' as const,
      icon: Ruler,
      iconColor: 'text-blue-500',
      description: 'Peso, altura y perímetro cefálico',
    },
    {
      name: 'Sueño',
      href: '/dashboard/sueno',
      modalType: 'sueno' as const,
      icon: Moon,
      iconColor: 'text-indigo-500',
      description: 'Siestas y horas nocturnas',
    },
    {
      name: 'Alimentación',
      href: '/dashboard/alimentacion',
      modalType: 'alimentacion' as const,
      icon: Apple,
      iconColor: 'text-green-500',
      description: 'Comidas y tomas',
    },
    {
      name: 'Hitos',
      href: '/dashboard/hitos',
      modalType: 'hitos' as const,
      icon: Star,
      iconColor: 'text-purple-500',
      description: 'Logros y recuerdos',
    },
    {
      name: 'Chau Pañal',
      href: '/dashboard/esfinteres',
      modalType: 'esfinteres' as const,
      icon: Baby,
      iconColor: 'text-pink-500',
      description: 'Control de esfínteres',
    },
  ]

  return (
    <div>
      {/* Premium Banner (si no es premium) - Prominente al inicio */}
      {!isPremium && (
        <motion.div
          id="tour-premium-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[linear-gradient(135deg,#F8D77E,#F2C94C_40%,#D6A63A)] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8 border-2 sm:border-4 border-[#D6A63A]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1">
              <div className="bg-white/25 rounded-full p-2 sm:p-3 backdrop-blur-sm flex-shrink-0">
                <Crown className="text-white" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white mb-1 sm:mb-2 drop-shadow-lg [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
                  ✨ Desbloquea todas las funcionalidades Premium
                </h3>
                <p className="text-white text-xs sm:text-sm md:text-base mb-2 sm:mb-3 font-semibold drop-shadow-md [text-shadow:0_1px_4px_rgba(0,0,0,0.25)]">
                  Registros ilimitados, historial completo, calendario sin límites, gestión de familia y más
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm">
                  <span className="bg-white/20 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-bold text-white drop-shadow-md [text-shadow:0_1px_3px_rgba(0,0,0,0.3)] border border-white/20">✓ Sin límites</span>
                  <span className="bg-white/20 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-bold text-white drop-shadow-md [text-shadow:0_1px_3px_rgba(0,0,0,0.3)] border border-white/20">✓ Historial completo</span>
                  <span className="bg-white/20 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-bold text-white drop-shadow-md [text-shadow:0_1px_3px_rgba(0,0,0,0.3)] border border-white/20">✓ Exportar PDF</span>
                  <span className="bg-white/20 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-bold text-white drop-shadow-md [text-shadow:0_1px_3px_rgba(0,0,0,0.3)] border border-white/20">✓ Gestión familiar</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push('/premium')}
              className="bg-white text-[#D6A63A] hover:bg-gray-100 font-bold px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base shadow-lg whitespace-nowrap w-full sm:w-auto"
            >
              Ver Premium
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      {/* <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2">
          Inicio
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Resumen del día • {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div> */}

      {/* Accesos Rápidos */}
      <div id="tour-quick-access" className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Button
                  onClick={() => setOpenQuickModal(section.modalType)}
                  className="w-full h-16 sm:h-24 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-0.5 sm:gap-2 px-1 sm:px-2 py-1 sm:py-1.5 active:scale-95 transition-transform"
                  variant="outline"
                >
                  <Icon className={section.iconColor} size={18} />
                  <div className="text-center w-full">
                    <p className="font-semibold text-[10px] sm:text-sm leading-tight">{section.name}</p>
                    <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight hidden sm:block">{section.description}</p>
                  </div>
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Resumen del día - Todas las actividades */}
      {(todayStats.esfinteres > 0 || todayStats.alimentacion > 0 || todayStats.sueno > 0 || todayStats.crecimiento > 0 || todayStats.hitos > 0) && (
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Resumen del día</h2>
          
          {/* Esfínteres */}
          {todayStats.esfinteres > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Baby className="text-pink-500 flex-shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">Chau Pañal - Control de Esfínteres</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{todayStats.esfinteres} registro{todayStats.esfinteres !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/esfinteres')}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0"
                >
                  <span className="hidden sm:inline">Ver todo</span>
                  <span className="sm:hidden">Ver</span>
                  <ArrowRight className="ml-1 sm:ml-2" size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{todayStats.pis}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Pis</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{todayStats.caca}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Caca</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{todayStats.seco}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Seco</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Alimentación */}
          {todayStats.alimentacion > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Apple className="text-green-500 flex-shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">Alimentación</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{todayStats.alimentacion} registro{todayStats.alimentacion !== 1 ? 's' : ''} de hoy</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/alimentacion')}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0"
                >
                  <span className="hidden sm:inline">Ver todo</span>
                  <span className="sm:hidden">Ver</span>
                  <ArrowRight className="ml-1 sm:ml-2" size={14} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Sueño */}
          {todayStats.sueno > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Moon className="text-indigo-500 flex-shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">Sueño</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{todayStats.sueno} registro{todayStats.sueno !== 1 ? 's' : ''} de hoy</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/sueno')}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0"
                >
                  <span className="hidden sm:inline">Ver todo</span>
                  <span className="sm:hidden">Ver</span>
                  <ArrowRight className="ml-1 sm:ml-2" size={14} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Crecimiento */}
          {todayStats.crecimiento > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Ruler className="text-blue-500 flex-shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">Crecimiento</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{todayStats.crecimiento} registro{todayStats.crecimiento !== 1 ? 's' : ''} de hoy</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/crecimiento')}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0"
                >
                  <span className="hidden sm:inline">Ver todo</span>
                  <span className="sm:hidden">Ver</span>
                  <ArrowRight className="ml-1 sm:ml-2" size={14} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Hitos */}
          {todayStats.hitos > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Star className="text-purple-500 flex-shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">Hitos</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{todayStats.hitos} hito{todayStats.hitos !== 1 ? 's' : ''} registrado{todayStats.hitos !== 1 ? 's' : ''} hoy</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/hitos')}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0"
                >
                  <span className="hidden sm:inline">Ver todo</span>
                  <span className="sm:hidden">Ver</span>
                  <ArrowRight className="ml-1 sm:ml-2" size={14} />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Últimos Registros */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Últimos Registros</h2>
        </div>
        {recentActivities.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md sm:shadow-lg text-center border border-gray-200 dark:border-gray-700">
            <Droplet className="mx-auto text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" size={40} />
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">Aún no hay registros</p>
            <Button
              id="tour-first-record"
              onClick={() => setOpenQuickModal('esfinteres')}
              className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] dark:text-gray-100 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            >
              <Plus className="mr-2" size={16} />
              Crear Primer Registro
            </Button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {recentActivities.map((activity, index) => {
              const getActivityInfo = () => {
                switch (activity.type) {
                  case 'esfinteres':
                    const esfinterType = activity.details?.type || 'seco'
                    const isPipi = esfinterType === 'pipi' || esfinterType === 'húmedo'
                    const isCaca = esfinterType === 'caca' || esfinterType === 'sucio'
                    const isSeco = esfinterType === 'seco'
                    return {
                      icon: Droplet,
                      iconBg: isPipi ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' :
                               isCaca ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' :
                               'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
                      title: isPipi ? 'Pis' : isCaca ? 'Caca' : isSeco ? 'Seco' : esfinterType === 'pipi-caca' ? 'Pis y Caca' : 'Esfínteres',
                      href: '/dashboard/esfinteres',
                    }
                  case 'feeding':
                    const feedingType = activity.details?.type || 'pecho'
                    const feedingTypeLabels: Record<string, string> = {
                      pecho: 'Pecho',
                      mamadera: 'Mamadera',
                      solido: 'Sólido',
                      agua: 'Agua',
                    }
                    return {
                      icon: Apple,
                      iconBg: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
                      title: feedingTypeLabels[feedingType] || 'Alimentación',
                      href: '/dashboard/alimentacion',
                    }
                  case 'sleep':
                    const sleepType = activity.details?.type || 'siesta'
                    return {
                      icon: Moon,
                      iconBg: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
                      title: sleepType === 'siesta' ? 'Siesta' : 'Sueño Nocturno',
                      href: '/dashboard/sueno',
                    }
                  case 'growth':
                    return {
                      icon: Ruler,
                      iconBg: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
                      title: 'Crecimiento',
                      href: '/dashboard/crecimiento',
                    }
                  case 'milestone':
                    return {
                      icon: Star,
                      iconBg: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
                      title: activity.details?.title || 'Hito',
                      href: '/dashboard/hitos',
                    }
                  default:
                    return {
                      icon: Clock,
                      iconBg: 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300',
                      title: 'Registro',
                      href: '/dashboard',
                    }
                }
              }

              const activityInfo = getActivityInfo()
              const Icon = activityInfo.icon
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(activityInfo.href)}
                  className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${activityInfo.iconBg}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 truncate">
                        {activityInfo.title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString('es', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Clock className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={16} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modales de registro rápido */}
      <QuickRecordModals
        openModal={openQuickModal}
        onClose={() => setOpenQuickModal(null)}
        onSuccess={() => {
          loadActivities()
        }}
      />
    </div>
  )
}
