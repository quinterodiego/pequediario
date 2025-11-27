'use client'

import React, { useEffect } from 'react'
import { Header } from './components/Header'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from './components/ui/button'
import { 
  Baby, Calendar, Users, Heart, Crown, CheckCircle, 
  Shield, Clock, Star, ArrowRight, Smartphone, 
  FileText, MessageCircle, TrendingUp, Award, Droplet, Lightbulb
} from 'lucide-react'
import { formatNumberAR } from '@/lib/utils'
import { useAuthModal } from './components/AuthModalContext'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { openRegisterModal } = useAuthModal()

  // Redirigir usuarios autenticados al dashboard
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard')
    } else {
      // Abrir modal de registro
      openRegisterModal()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative container mx-auto px-4 py-20 md:py-32 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#8CCFE0] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E9A5B4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#9CDFF0] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="inline-block mb-4 sm:mb-6 animate-slide-in">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md border border-[#8CCFE0]/30">
                👶 <span className="hidden sm:inline">Acompañando el crecimiento desde el nacimiento</span>
                <span className="sm:hidden">Acompañando el crecimiento</span>
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 sm:mb-6 px-2 break-words">
              <span className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] bg-clip-text text-transparent">Peque</span>{' '}
              <span className="text-gray-700 dark:text-gray-200">Diario</span>{' '}
            </h1>
            
            <p className="text-sm sm:text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-light px-4 break-words">
              La app integral para padres que acompaña el{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">crecimiento de tu hijo</span>.
              <br className="hidden md:block" />
              <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl">Crecimiento, sueño, alimentación, hitos y control de esfínteres en un solo lugar.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              {!session ? (
                <>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-gray-700 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 font-semibold"
                    onClick={handleGetStarted}
                  >
                    🚀 Comenzar Gratis
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 border-2 border-[#CBD5E1] dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:scale-105 font-semibold"
                    onClick={() => router.push('/premium')}
                  >
                    <Crown className="mr-2" size={18} />
                    Ver Premium
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 font-semibold"
                  onClick={() => router.push('/dashboard')}
                >
                  Ir al Dashboard
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 md:gap-8 max-w-3xl mx-auto mt-12 sm:mt-20 px-2 sm:px-4">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg sm:rounded-2xl p-2 sm:p-6 shadow-lg border border-white/20 dark:border-gray-700/20 hover-lift overflow-hidden">
                <div className="text-lg sm:text-4xl md:text-5xl font-extrabold gradient-text mb-1 sm:mb-2 truncate">1000+</div>
                <div className="text-[10px] sm:text-sm text-gray-700 dark:text-gray-300 font-medium break-words leading-tight">Padres activos</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg sm:rounded-2xl p-2 sm:p-6 shadow-lg border border-white/20 dark:border-gray-700/20 hover-lift overflow-hidden">
                <div className="text-lg sm:text-4xl md:text-5xl font-extrabold gradient-text mb-1 sm:mb-2 truncate">5000+</div>
                <div className="text-[10px] sm:text-sm text-gray-700 dark:text-gray-300 font-medium break-words leading-tight">Registros totales</div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg sm:rounded-2xl p-2 sm:p-6 shadow-lg border border-white/20 dark:border-gray-700/20 hover-lift overflow-hidden">
                <div className="text-lg sm:text-4xl md:text-5xl font-extrabold gradient-text mb-1 sm:mb-2 truncate">4.9★</div>
                <div className="text-[10px] sm:text-sm text-gray-700 dark:text-gray-300 font-medium break-words leading-tight">Valoración</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative container mx-auto px-3 sm:px-4 py-12 sm:py-24 bg-gray-50 overflow-hidden">
          <div className="text-center mb-8 sm:mb-16 animate-fade-in px-2">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-gray-700 mb-4 sm:mb-6 tracking-tight break-words">
              Todo para acompañar el crecimiento
            </h2>
            <p className="text-base sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-light px-2">
              Funcionalidades diseñadas para acompañar a tu hijo desde el nacimiento
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto px-2">
            <FeatureCard
              icon={<Droplet />}
              title="Registro de esfínteres"
              description="Registra cada vez que tu bebé usa el baño. Historial de 30 días en gratis, ilimitado en Premium."
              free={true}
            />
            <FeatureCard
              icon={<TrendingUp />}
              title="Estadísticas básicas"
              description="Visualiza el progreso con contadores diarios de esfínteres. Estadísticas disponibles en ambos planes."
              free={true}
            />
            <FeatureCard
              icon={<Calendar />}
              title="Calendario de progreso"
              description="Vista de calendario con últimos 30 días (gratis) o calendario completo sin límites (Premium)."
              free={true}
              premium={true}
            />
            <FeatureCard
              icon={<Users />}
              title="Gestión de familia"
              description="Comparte registros con familiares y gestiona múltiples bebés. Solo disponible en Premium."
              premium={true}
            />
            <FeatureCard
              icon={<Lightbulb />}
              title="Tips diarios"
              description="Consejos prácticos diarios sobre control de esfínteres para acompañar el proceso."
              free={true}
            />
            <FeatureCard
              icon={<MessageCircle />}
              title="Comunidad de padres"
              description="Conecta con otros padres. Comparte experiencias y consejos sobre control de esfínteres."
              free={true}
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 bg-gray-50">
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-700 mb-3 sm:mb-4 break-words">
              Planes que se adaptan a ti
            </h2>
            <p className="text-base sm:text-xl text-gray-700 max-w-2xl mx-auto break-words">
              Comienza gratis y actualiza cuando lo necesites
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto items-start px-2">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border-2 border-gray-200 flex flex-col h-full">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-700">Gratis</h3>
                <div className="text-3xl sm:text-5xl font-bold text-gray-700 mb-2">
                  $0
                </div>
                <p className="text-sm sm:text-base text-gray-700">Siempre gratis</p>
              </div>
              
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow text-sm sm:text-base">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="break-words">Registro de esfínteres (hasta 50 por mes)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="break-words">Historial de últimos 30 días</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="break-words">Estadísticas básicas (contadores diarios)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="break-words">Vista de calendario (últimos 30 días)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="break-words">Editar y eliminar registros</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="break-words">Búsqueda y filtros de registros</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="break-words">Tips diarios sobre control de esfínteres</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="break-words">Comunidad de padres</span>
                </li>
              </ul>
              
              <Button 
                className="w-full mt-auto" 
                size="lg"
                variant="outline"
                onClick={handleGetStarted}
              >
                Comenzar Gratis
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-[linear-gradient(135deg,#F8D77E,#F2C94C_40%,#D6A63A)] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-4 border-[#D6A63A] relative flex flex-col h-full">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-white text-[#D6A63A] px-3 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap">
                  ⭐ Más Popular
                </span>
              </div>
              
              <div className="text-center mb-6 sm:mb-8 text-white mt-2 sm:mt-0">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="text-white mr-2" size={20} />
                  <h3 className="text-xl sm:text-2xl font-bold">Premium</h3>
                </div>
                <div className="text-3xl sm:text-5xl font-bold mb-2 break-words">
                  ${formatNumberAR(14999, 0)}
                </div>
                <p className="text-sm sm:text-base text-white/95">Pago único - Para siempre</p>
              </div>
              
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-white flex-grow text-sm sm:text-base">
                <li className="flex items-start">
                  <CheckCircle className="text-white mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-white break-words"><strong>Todo lo gratis +</strong></span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-white mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-white break-words">Registros ilimitados (sin límite mensual)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-white mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-white break-words">Historial completo (sin límite de días)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-white mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-white break-words">Calendario completo de progreso</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-white mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-white break-words">Gestión de familia (múltiples bebés)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-white mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-white break-words">Compartir registros con familiares</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-white mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-white break-words">Exportar registros para pediatra (PDF)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-white mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-white break-words">Modo oscuro</span>
                </li>
              </ul>
              
              <Button 
                className="w-full mt-auto bg-white text-[#D6A63A] hover:bg-gray-100 font-bold" 
                size="lg"
                onClick={() => router.push('/premium')}
              >
                Actualizar a Premium
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 bg-gray-50 overflow-hidden">
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-700 mb-3 sm:mb-4 break-words">
              Lo que dicen los padres
            </h2>
            <p className="text-base sm:text-xl text-gray-700 max-w-2xl mx-auto break-words">
              Miles de padres confían en Chau Pañal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto px-2">
            <TestimonialCard
              name="María González"
              location="Buenos Aires"
              rating={5}
              text="Increíble app para el control de esfínteres. Me ayuda a llevar el registro de cada vez que mi bebé usa el baño. Los recordatorios son geniales. La recomiendo 100%."
            />
            <TestimonialCard
              name="Juan Pérez"
              location="Córdoba"
              rating={5}
              text="Como padre primerizo, esta app me salvó en el proceso de control de esfínteres. Los recordatorios y la comunidad de padres son geniales. Vale cada peso."
            />
            <TestimonialCard
              name="Ana Martínez"
              location="Rosario"
              rating={5}
              text="Los gráficos y estadísticas de Premium son increíbles. Puedo ver el progreso del control de esfínteres día a día. Muy útil para entender cuándo mi bebé está listo."
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 bg-gray-50 overflow-hidden">
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-700 mb-3 sm:mb-4 break-words">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-2">
            <FAQItem
              question="¿Es realmente gratis?"
              answer="Sí, la versión gratuita es completamente gratis para siempre. Incluye registro de esfínteres (hasta 50 por mes), historial de últimos 30 días, estadísticas básicas, vista de calendario (30 días), edición y eliminación de registros, búsqueda y filtros, tips diarios y acceso a la comunidad."
            />
            <FAQItem
              question="¿Qué incluye Premium?"
              answer="Premium incluye todo lo gratis más: registros ilimitados (sin límite mensual), historial completo (sin límite de días), calendario completo de progreso, gestión de familia (múltiples bebés), compartir registros con familiares, exportar registros para pediatra en formato PDF y modo oscuro."
            />
            <FAQItem
              question="¿Puedo usar la app sin internet?"
              answer="Sí, la app funciona offline de forma básica. Puedes ver tus últimos registros y crear nuevos que se sincronizarán cuando tengas conexión."
            />
            <FAQItem
              question="¿Los datos están seguros?"
              answer="Absolutamente. Todos los datos están encriptados y almacenados de forma segura. Nunca compartimos información con terceros."
            />
            <FAQItem
              question="¿Puedo cancelar Premium?"
              answer="Premium es un pago único, no una suscripción. Una vez que lo compras, es tuyo para siempre. No hay cancelaciones porque no hay renovaciones."
            />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-20 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] text-gray-700 text-center overflow-hidden">
          <div className="max-w-3xl mx-auto px-2">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 break-words">
              ¿Listo para comenzar?
            </h2>
            <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-700 break-words">
              Únete a miles de padres que ya están acompañando el crecimiento de sus hijos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session ? (
                <>
                  <Button 
                    size="lg" 
                    className="bg-white text-gray-700 hover:bg-gray-100 text-lg px-8 py-6 font-bold"
                    onClick={handleGetStarted}
                  >
                    🚀 Comenzar Gratis Ahora
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                  <Button 
                    size="lg" 
                    className="bg-[linear-gradient(135deg,#F8D77E,#F2C94C_40%,#D6A63A)] hover:opacity-90 text-white border-2 border-[#D6A63A] text-lg px-8 py-6 font-bold shadow-lg"
                    onClick={() => router.push('/premium')}
                  >
                    <Crown className="mr-2" size={20} />
                    Ver Premium
                  </Button>
                </>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-white text-gray-700 hover:bg-gray-100 text-lg px-8 py-6 font-bold"
                  onClick={() => router.push('/dashboard')}
                >
                  Ir al Dashboard
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  free?: boolean
  premium?: boolean
}

function FeatureCard({ icon, title, description, free, premium }: FeatureCardProps) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-3xl p-4 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover-lift overflow-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="text-primary-600 bg-gradient-to-br from-primary-50 to-primary-100 p-2 sm:p-4 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-md">
          {icon}
        </div>
        {free && (
          <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-[10px] sm:text-xs px-2 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold shadow-sm border border-green-200 whitespace-nowrap">
            Gratis
          </span>
        )}
        {premium && (
          <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-[10px] sm:text-xs px-2 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold shadow-sm border border-purple-200 whitespace-nowrap">
            Premium
          </span>
        )}
      </div>
      <h4 className="font-bold text-base sm:text-xl mb-2 sm:mb-3 text-gray-700 group-hover:text-primary-600 transition-colors break-words">{title}</h4>
      <p className="text-gray-700 text-xs sm:text-sm leading-relaxed break-words">{description}</p>
    </div>
  )
}

interface TestimonialCardProps {
  name: string
  location: string
  rating: number
  text: string
}

function TestimonialCard({ name, location, rating, text }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 overflow-hidden">
      <div className="flex items-center mb-3 sm:mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="text-yellow-400 fill-yellow-400" size={16} />
        ))}
      </div>
      <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed italic break-words">"{text}"</p>
      <div className="border-t border-gray-100 pt-3 sm:pt-4">
        <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{name}</p>
        <p className="text-xs sm:text-sm text-gray-700 break-words">{location}</p>
      </div>
    </div>
  )
}

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors gap-2"
      >
        <span className="font-semibold text-sm sm:text-base text-gray-700 break-words flex-1 text-left">{question}</span>
        <span className={`text-gray-700 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
          {answer}
        </div>
      )}
    </div>
  )
}