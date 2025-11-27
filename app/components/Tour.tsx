'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'

interface Step {
  target: string
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

interface TourProps {
  run: boolean
  onComplete: () => void
}

export function Tour({ run, onComplete }: TourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  const steps: Step[] = [
    {
      target: '#tour-header',
      title: '¡Bienvenido a Peque Diario! 👋',
      content: 'Desde aquí puedes acceder a tu perfil, configuraciones y actualizar a Premium.',
      placement: 'bottom',
    },
    {
      target: '#tour-premium-banner',
      title: '✨ Plan Premium',
      content: 'Desbloquea todas las funcionalidades: registros ilimitados, historial completo, exportar PDF y más.',
      placement: 'bottom',
    },
    {
      target: '#tour-quick-access',
      title: '🚀 Accesos Rápidos',
      content: 'Desde aquí puedes acceder rápidamente a todas las secciones: Crecimiento, Sueño, Alimentación, Hitos y Control de Esfínteres.',
      placement: 'top',
    },
    {
      target: '#tour-main-nav',
      title: '📝 Crear Registros',
      content: 'Usa esta barra de navegación para acceder a todas las secciones y crear registros: Crecimiento, Sueño, Alimentación, Hitos y Control de Esfínteres. Cada sección te permite registrar información importante sobre tu pequeño.',
      placement: 'top',
    },
  ]

  const handleComplete = useCallback(() => {
    setIsVisible(false)
    localStorage.setItem('tour-completed', 'true')
    onComplete()
  }, [onComplete])

  // Bloquear scroll cuando el tour está activo usando una clase CSS
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (run) {
      // Agregar clase al html para bloquear scroll
      document.documentElement.classList.add('tour-active')
    } else {
      // Remover clase cuando el tour termina
      document.documentElement.classList.remove('tour-active')
    }
    
    return () => {
      // Limpiar al desmontar
      document.documentElement.classList.remove('tour-active')
    }
  }, [run])

  useEffect(() => {
    if (run && currentStep < steps.length) {
      const step = steps[currentStep]
      const element = document.querySelector(step.target) as HTMLElement
      
      if (element) {
        setTargetElement(element)
        // No hacer scroll automático, solo mostrar el elemento
        // Pequeño delay para asegurar que el DOM se actualice
        setTimeout(() => {
          setIsVisible(true)
        }, 100)
      } else {
        // Si el elemento no existe, avanzar al siguiente paso
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1)
        } else {
          handleComplete()
        }
      }
    } else if (run && currentStep >= steps.length) {
      handleComplete()
    }
  }, [run, currentStep, handleComplete])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setIsVisible(false)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setIsVisible(false)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!run || !isVisible || !targetElement) {
    return null
  }

  const step = steps[currentStep]
  const rect = targetElement.getBoundingClientRect()
  
  // Para elementos fijos (como la navegación), usar viewport coordinates
  const isFixed = window.getComputedStyle(targetElement).position === 'fixed'
  const scrollY = isFixed ? 0 : window.scrollY
  const scrollX = isFixed ? 0 : window.scrollX

  // Para el paso de "Accesos Rápidos", buscar el título dentro del contenedor para posicionar el tooltip
  let tooltipRect = rect
  if (step.target === '#tour-quick-access') {
    const titleElement = targetElement.querySelector('h2') as HTMLElement
    if (titleElement) {
      tooltipRect = titleElement.getBoundingClientRect()
    }
  }

  // Calcular posición del tooltip
  let tooltipStyle: React.CSSProperties = {}
  const tooltipWidth = Math.min(360, window.innerWidth - 20) // max-w-sm, pero ajustado al ancho de pantalla
  const tooltipHeight = 220 // estimado
  const spacing = 16 // espacio entre elemento y tooltip
  
  // Calcular espacio disponible arriba y abajo (usando tooltipRect para el cálculo)
  const spaceAbove = tooltipRect.top + (isFixed ? 0 : scrollY)
  const spaceBelow = window.innerHeight - tooltipRect.bottom - (isFixed ? 0 : scrollY)
  
  // Calcular posición horizontal centrada (usando el contenedor completo para centrar)
  const elementCenterX = rect.left + scrollX + rect.width / 2
  const leftPos = Math.max(10, Math.min(elementCenterX - tooltipWidth / 2, window.innerWidth - tooltipWidth - 10))
  
  if (step.placement === 'bottom') {
    tooltipStyle = {
      top: `${tooltipRect.bottom + (isFixed ? 0 : scrollY) + spacing}px`,
      left: `${leftPos}px`,
    }
  } else if (step.placement === 'top') {
    // Siempre intentar poner el tooltip arriba del título
    const topPos = tooltipRect.top + (isFixed ? 0 : scrollY) - tooltipHeight - spacing
    const minTop = 10
    
    // Si no hay suficiente espacio arriba, ponerlo lo más arriba posible
    if (topPos < minTop) {
      // Si realmente no hay espacio, ponerlo abajo pero solo como último recurso
      if (spaceAbove < 50) {
        tooltipStyle = {
          top: `${tooltipRect.bottom + (isFixed ? 0 : scrollY) + spacing}px`,
          left: `${leftPos}px`,
        }
      } else {
        // Ponerlo lo más arriba posible
        tooltipStyle = {
          top: `${minTop}px`,
          left: `${leftPos}px`,
        }
      }
    } else {
      // Hay suficiente espacio, ponerlo arriba normalmente
      tooltipStyle = {
        top: `${topPos}px`,
        left: `${leftPos}px`,
      }
    }
  } else {
    tooltipStyle = {
      top: `${rect.top + scrollY + rect.height / 2}px`,
      left: `${rect.right + scrollX + 20}px`,
      transform: 'translateY(-50%)',
    }
  }

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={handleSkip}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Highlight del elemento objetivo */}
      {(() => {
        // Para "Accesos Rápidos", ajustar el highlight para incluir mejor el título
        let highlightTop = rect.top + scrollY
        let highlightHeight = rect.height
        let highlightLeft = rect.left + scrollX
        let highlightWidth = rect.width
        
        if (step.target === '#tour-quick-access') {
          // Agregar un poco de espacio arriba para incluir mejor el título
          const titlePadding = 8
          highlightTop = highlightTop - titlePadding
          highlightHeight = highlightHeight + titlePadding
        }
        
        return (
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: `${highlightTop}px`,
              left: `${highlightLeft}px`,
              width: `${highlightWidth}px`,
              height: `${highlightHeight}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              borderRadius: '8px',
              border: '2px solid #8CCFE0',
            }}
          />
        )
      })()}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-sm w-[calc(100vw-20px)] sm:w-[90vw] border-2 border-[#8CCFE0]"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {step.content}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentStep + 1} de {steps.length}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="text-gray-700 dark:text-gray-300"
              >
                <ChevronLeft size={16} className="mr-1" />
                Atrás
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-[#8CCFE0] hover:bg-[#7CBFD0] text-[#1E293B] dark:text-white"
              size="sm"
            >
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
              {currentStep < steps.length - 1 && <ChevronRight size={16} className="ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
