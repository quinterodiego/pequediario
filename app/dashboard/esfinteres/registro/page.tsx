'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { ArrowLeft, Droplet, Calendar, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function RegistroPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formulario de esfínteres
  const [esfinterType, setEsfinterType] = useState('pipi')
  const [esfinterNotes, setEsfinterNotes] = useState('')
  
  // Helper para obtener fecha en formato YYYY-MM-DD en zona horaria local
  const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Helper para obtener hora en formato HH:MM en zona horaria local
  const getLocalTimeString = (date: Date = new Date()): string => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Fecha y hora del registro (por defecto: ahora)
  const getNow = () => new Date()
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString())
  const [selectedTime, setSelectedTime] = useState(() => getLocalTimeString())
  
  // Obtener fecha máxima (hoy) para el datepicker
  const maxDate = getLocalDateString()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    // Combinar fecha y hora seleccionadas en zona horaria local
    const [year, month, day] = selectedDate.split('-').map(Number)
    const [hours, minutes] = selectedTime.split(':').map(Number)
    // Crear fecha directamente en hora local para evitar problemas de UTC
    const customTimestamp = new Date(year, month - 1, day, hours, minutes, 0, 0)

    const details = {
      type: esfinterType,
      notes: esfinterNotes,
    }

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'esfinteres',
          details,
          babyName: 'Bebé', // Por ahora fijo, luego permitir múltiples bebés
          timestamp: customTimestamp.toISOString(), // Enviar timestamp personalizado
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          setError('Has alcanzado el límite de registros gratuitos. Actualiza a Premium para continuar.')
          setTimeout(() => {
            router.push('/premium')
          }, 3000)
          return
        }
        throw new Error(data.error || 'Error al guardar')
      }

      // Éxito - redirigir al dashboard de esfínteres
      router.push('/dashboard/esfinteres')
    } catch (err: any) {
      setError(err.message || 'Error al guardar la actividad')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  if (!session) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          onClick={() => router.push('/dashboard/esfinteres')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="mr-2" size={16} />
          Volver
        </Button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Registrar Esfínteres
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {error}
        </div>
      )}

      {/* Formulario de Esfínteres */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-6">Registrar Control de Esfínteres</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de registro
            </label>
            <select
              value={esfinterType}
              onChange={(e) => setEsfinterType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pipi">Pis</option>
              <option value="caca">Caca</option>
              <option value="pipi-caca">Pis y Caca</option>
              <option value="seco">Seco (sin nada)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={maxDate} // No permitir fechas futuras
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline mr-2" size={16} />
                Hora
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={esfinterNotes}
              onChange={(e) => setEsfinterNotes(e.target.value)}
              placeholder="Observaciones adicionales... (ej: en el baño, en el orinal, etc.)"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => router.push('/dashboard/esfinteres')}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

