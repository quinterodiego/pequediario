'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { 
  Crown, CheckCircle, ArrowRight, Shield, 
  Calendar, Users, FileText, TrendingUp,
  MessageCircle, Lightbulb, Droplet, Star,
  ChevronDown, ChevronUp, Clock
} from 'lucide-react'
import { formatNumberAR } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Feature {
  name: string
  free: string | React.ReactNode
  premium: string | React.ReactNode
  description: string
}

export default function PremiumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  // Verificar parámetros de URL para mensajes de pago
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentParam = params.get('payment')
    if (paymentParam) {
      setPaymentStatus(paymentParam)
      // Limpiar URL después de mostrar el mensaje
      window.history.replaceState({}, '', '/premium')
      
      // Si el pago fue exitoso, refrescar la sesión después de un momento
      if (paymentParam === 'success') {
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    }
  }, [])

  const toggleFeature = (featureName: string) => {
    const newExpanded = new Set(expandedFeatures)
    if (newExpanded.has(featureName)) {
      newExpanded.delete(featureName)
    } else {
      newExpanded.add(featureName)
    }
    setExpandedFeatures(newExpanded)
  }

  const features: Feature[] = [
    {
      name: 'Registro de esfínteres',
      free: 'Hasta 50/mes',
      premium: 'Ilimitado',
      description: 'En la versión gratuita puedes registrar hasta 50 eventos de esfínteres por mes. Con Premium, registra todos los eventos que necesites sin límites. Ideal para seguimientos detallados y análisis completos del progreso de tu hijo.'
    },
    {
      name: 'Historial de registros',
      free: '30 días',
      premium: 'Completo',
      description: 'La versión gratuita muestra solo los últimos 30 días de registros. Con Premium, accede a todo el historial completo desde el primer día que comenzaste a usar la aplicación. Perfecto para ver tendencias a largo plazo y el progreso completo del proceso.'
    },
    {
      name: 'Calendario de progreso',
      free: '30 días',
      premium: 'Completo',
      description: 'Visualiza el progreso de tu hijo en un calendario interactivo. La versión gratuita muestra solo los últimos 30 días. Con Premium, accede a todo el calendario histórico completo, permitiéndote ver patrones, rachas y progreso a lo largo del tiempo.'
    },
    {
      name: 'Estadísticas avanzadas',
      free: 'Básicas',
      premium: 'Avanzadas',
      description: 'Las estadísticas básicas incluyen conteos simples y promedios. Con Premium, obtienes análisis avanzados: gráficos de tendencias, patrones horarios, comparativas mensuales, predicciones y insights detallados que te ayudan a entender mejor el proceso de tu hijo.'
    },
    {
      name: 'Gestión de familia',
      free: <span className="text-gray-400">—</span>,
      premium: <CheckCircle className="inline text-green-600" size={20} />,
      description: 'Con Premium puedes personalizar el nombre de tu hijo/a en todos los registros y compartir el acceso con tu pareja. Ambos pueden ver y agregar registros en tiempo real, facilitando el seguimiento conjunto del proceso de control de esfínteres.'
    },
    {
      name: 'Múltiples bebés',
      free: <span className="text-gray-400">—</span>,
      premium: <CheckCircle className="inline text-green-600" size={20} />,
      description: 'Si tienes más de un hijo, Premium te permite gestionar los registros de múltiples niños desde una sola cuenta. Cada niño tiene su propio perfil, historial y estadísticas independientes, facilitando el seguimiento de cada uno.'
    },
    {
      name: 'Compartir con familiares',
      free: <span className="text-gray-400">—</span>,
      premium: <CheckCircle className="inline text-green-600" size={20} />,
      description: 'Invita a tu pareja, abuelos o cuidadores a acceder a los registros. Todos pueden ver el progreso en tiempo real y agregar nuevos registros. Perfecto para familias donde múltiples personas cuidan del niño y necesitan estar al tanto del proceso.'
    },
    {
      name: 'Exportar PDF para pediatra',
      free: <span className="text-gray-400">—</span>,
      premium: <CheckCircle className="inline text-green-600" size={20} />,
      description: 'Genera reportes profesionales en PDF con todos los registros, estadísticas y gráficos. Ideal para compartir con el pediatra durante las consultas, facilitando el seguimiento médico y permitiendo decisiones informadas basadas en datos precisos.'
    },
    {
      name: 'Modo oscuro',
      free: <span className="text-gray-400">—</span>,
      premium: <CheckCircle className="inline text-green-600" size={20} />,
      description: 'Protege tus ojos durante las noches con el modo oscuro. Cambia entre tema claro y oscuro según tu preferencia o la hora del día. Especialmente útil cuando necesitas registrar eventos durante la noche sin molestar a tu vista.'
    },
    {
      name: 'Tips diarios',
      free: <CheckCircle className="inline text-green-600" size={20} />,
      premium: <CheckCircle className="inline text-green-600" size={20} />,
      description: 'Recibe consejos y tips diarios basados en la edad de tu hijo y su progreso. Estos tips están disponibles tanto en la versión gratuita como en Premium, ayudándote con estrategias, técnicas y recomendaciones para el proceso de control de esfínteres.'
    },
    {
      name: 'Comunidad de padres',
      free: <CheckCircle className="inline text-green-600" size={20} />,
      premium: <CheckCircle className="inline text-green-600" size={20} />,
      description: 'Accede a una comunidad activa de padres donde puedes compartir experiencias, hacer preguntas y recibir apoyo. Disponible en ambas versiones, la comunidad es un espacio de apoyo mutuo durante este importante proceso de desarrollo.'
    }
  ]

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  const handleUpgrade = async () => {
    if (!session?.user?.email) {
      router.push('/auth/signin')
      return
    }

    if (session.user.isPremium === true) {
      return
    }

    try {
      setIsProcessing(true)
      
      // Crear preferencia de pago
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: 14999 }),
      })

      // Verificar el tipo de contenido de la respuesta
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Respuesta no es JSON:', text.substring(0, 200))
        throw new Error('El servidor devolvió una respuesta inesperada. Por favor verifica la configuración.')
      }

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Error al crear la preferencia de pago'
        console.error('Error del servidor:', data)
        throw new Error(errorMsg)
      }

      // Redirigir al checkout de Mercado Pago
      // Usar checkoutUrl si está disponible (ya determina si es sandbox o producción)
      // Si no, usar sandboxInitPoint para desarrollo o initPoint para producción
      const checkoutUrl = data.checkoutUrl || 
        (data.isTestToken ? data.sandboxInitPoint : data.initPoint) ||
        data.sandboxInitPoint || 
        data.initPoint

      if (checkoutUrl) {
        console.log('Redirigiendo a checkout:', checkoutUrl)
        window.location.href = checkoutUrl
      } else {
        throw new Error('No se recibió URL de checkout')
      }
    } catch (error: any) {
      console.error('Error iniciando pago:', error)
      const errorMessage = error.message || 'Por favor intenta nuevamente'
      alert(`Error al iniciar el pago: ${errorMessage}`)
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Mensajes de estado de pago */}
        {paymentStatus === 'success' && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">¡Pago exitoso!</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Tu cuenta ha sido actualizada a Premium. Recargando la página...
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'failure' && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="text-red-600 dark:text-red-400" size={24} />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Pago no completado</h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  El pago no pudo ser procesado. Por favor intenta nuevamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'pending' && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Pago pendiente</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Tu pago está siendo procesado. Te notificaremos cuando se complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
              <Crown className="text-yellow-300" size={20} />
              Actualiza a Premium
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="gradient-text">Peque</span>{' '}
            <span className="text-gray-700">Diario Premium</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8">
            Desbloquea todas las funcionalidades y acompaña el crecimiento de tu hijo sin límites
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch mb-16">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-200 flex flex-col">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-gray-700">Gratis</h3>
              <div className="text-5xl font-bold text-gray-700 mb-2">
                $0
              </div>
              <p className="text-gray-700">Siempre gratis</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Registro de esfínteres (hasta 50 por mes)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Historial de últimos 30 días</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Estadísticas básicas (contadores diarios)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Vista de calendario (últimos 30 días)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Editar y eliminar registros</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Búsqueda y filtros de registros</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Tips diarios sobre control de esfínteres</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Comunidad de padres</span>
              </li>
            </ul>
            
            <Button 
              className="w-full mt-auto" 
              size="lg"
              variant="outline"
              onClick={handleGetStarted}
            >
              {session ? 'Ir al Dashboard' : 'Comenzar Gratis'}
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-[#8CCFE0] to-[#E9A5B4] rounded-3xl shadow-2xl p-8 border-4 border-yellow-300 relative flex flex-col">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-gray-700 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                ⭐ Más Popular
              </span>
            </div>
            
            <div className="text-center mb-8 text-gray-700">
              <div className="flex items-center justify-center mb-2">
                <Crown className="text-yellow-500 mr-2" size={24} />
                <h3 className="text-2xl font-bold">Premium</h3>
              </div>
              <div className="text-5xl font-bold mb-2">
                ${formatNumberAR(14999, 0)}
              </div>
              <p className="text-gray-700">Pago único - Para siempre</p>
            </div>
            
            <ul className="space-y-4 mb-8 text-gray-700 flex-grow">
              <li className="flex items-start">
                <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-700"><strong>Todo lo gratis +</strong></span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Registros ilimitados (sin límite mensual)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Historial completo (sin límite de días)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Calendario completo de progreso</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Gestión de familia (múltiples bebés)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Compartir registros con familiares</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Exportar registros para pediatra (PDF)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                <span>Modo oscuro</span>
              </li>
            </ul>
            
            <Button 
              className="w-full mt-auto bg-white text-gray-700 hover:bg-gray-100 font-bold" 
              size="lg"
              onClick={handleUpgrade}
              disabled={isProcessing || session?.user?.isPremium === true}
            >
              {session?.user?.isPremium === true ? (
                <>
                  <Crown className="mr-2" size={20} />
                  Ya eres Premium
                </>
              ) : isProcessing ? (
                <>
                  <Clock className="mr-2 animate-spin" size={20} />
                  Procesando...
                </>
              ) : (
                <>
                  Actualizar a Premium
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-12">
            Comparación de funcionalidades
          </h2>
          
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header de la tabla */}
            <div className="grid grid-cols-12 gap-4 p-6 border-b-2 border-gray-200 bg-gray-50">
              <div className="col-span-5 font-bold text-gray-700">Funcionalidad</div>
              <div className="col-span-3 text-center font-bold text-gray-700">Gratis</div>
              <div className="col-span-3 text-center font-bold text-gray-700">Premium</div>
              <div className="col-span-1"></div>
            </div>

            {/* Acordeones de características */}
            <div className="divide-y divide-gray-100">
              {features.map((feature, index) => {
                const isExpanded = expandedFeatures.has(feature.name)
                return (
                  <div key={feature.name} className="transition-colors hover:bg-gray-50">
                    <button
                      onClick={() => toggleFeature(feature.name)}
                      className="w-full grid grid-cols-12 gap-4 p-6 items-center text-left"
                    >
                      <div className="col-span-5 font-semibold text-gray-700">
                        {feature.name}
                      </div>
                      <div className="col-span-3 text-center text-gray-600">
                        {feature.free}
                      </div>
                      <div className="col-span-3 text-center text-green-600 font-semibold">
                        {feature.premium}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {isExpanded ? (
                          <ChevronUp className="text-gray-400" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-400" size={20} />
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                              <p className="text-gray-700 leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-700 mb-12">
            Preguntas frecuentes
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-700 mb-2">¿Es realmente un pago único?</h3>
              <p className="text-gray-600 leading-relaxed">
                Sí, Premium es un pago único de ${formatNumberAR(14999, 0)} ARS. No hay suscripciones ni renovaciones. Una vez que lo compras, es tuyo para siempre.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-700 mb-2">¿Puedo cancelar y obtener reembolso?</h3>
              <p className="text-gray-600 leading-relaxed">
                Como Premium es un pago único, no hay cancelaciones. Sin embargo, si tienes algún problema, contáctanos y estaremos encantados de ayudarte.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-700 mb-2">¿Qué pasa si ya tengo registros en la versión gratis?</h3>
              <p className="text-gray-600 leading-relaxed">
                Todos tus registros existentes se mantienen intactos. Al actualizar a Premium, simplemente desbloquearás todas las funcionalidades adicionales sin perder ningún dato.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-700 mb-2">¿Los datos están seguros?</h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutamente. Todos los datos están encriptados y almacenados de forma segura. Nunca compartimos información con terceros.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] rounded-3xl p-12 text-gray-700">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para actualizar a Premium?
          </h2>
          <p className="text-xl mb-8 text-gray-700">
            Únete a miles de padres que ya están disfrutando de todas las funcionalidades
          </p>
          <Button 
            size="lg" 
            className="bg-white text-gray-700 hover:bg-gray-100 text-lg px-8 py-6 font-bold"
            onClick={handleUpgrade}
            disabled={isProcessing || session?.user?.isPremium === true}
          >
            {session?.user?.isPremium === true ? (
              <>
                <Crown className="mr-2" size={20} />
                Ya eres Premium
              </>
            ) : isProcessing ? (
              <>
                <Clock className="mr-2 animate-spin" size={20} />
                Procesando...
              </>
            ) : (
              <>
                Actualizar a Premium Ahora
                <ArrowRight className="ml-2" size={20} />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}

