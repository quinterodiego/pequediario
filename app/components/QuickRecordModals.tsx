'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { X, Calendar, Clock, Droplet, Ruler, Moon, Apple, Star, Scale, Gauge, Circle, Loader2, Save } from 'lucide-react'
import { toast } from './ui/toaster'

interface QuickRecordModalsProps {
  openModal: 'esfinteres' | 'crecimiento' | 'sueno' | 'alimentacion' | 'hitos' | null
  onClose: () => void
  onSuccess?: () => void
}

export function QuickRecordModals({ openModal, onClose, onSuccess }: QuickRecordModalsProps) {
  const router = useRouter()

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

  // Estados para esfínteres
  const [esfinterType, setEsfinterType] = useState('pipi')
  const [esfinterNotes, setEsfinterNotes] = useState('')
  const [esfinterDate, setEsfinterDate] = useState(getLocalDateString())
  const [esfinterTime, setEsfinterTime] = useState(getLocalTimeString())
  const [isSubmittingEsfinteres, setIsSubmittingEsfinteres] = useState(false)

  // Estados para crecimiento
  const [formDataCrecimiento, setFormDataCrecimiento] = useState({
    date: getLocalDateString(),
    time: getLocalTimeString(),
    weight: '',
    height: '',
    headCircumference: '',
    notes: '',
  })
  const [isSubmittingCrecimiento, setIsSubmittingCrecimiento] = useState(false)

  // Estados para sueño
  const [formDataSueno, setFormDataSueno] = useState({
    date: getLocalDateString(),
    startTime: getLocalTimeString(),
    endTime: '',
    type: 'siesta',
    notes: '',
  })
  const [isSubmittingSueno, setIsSubmittingSueno] = useState(false)

  // Estados para alimentación
  const [formDataAlimentacion, setFormDataAlimentacion] = useState({
    date: getLocalDateString(),
    time: getLocalTimeString(),
    type: 'pecho',
    amount: '',
    notes: '',
  })
  const [isSubmittingAlimentacion, setIsSubmittingAlimentacion] = useState(false)

  // Estados para hitos
  const [formDataHitos, setFormDataHitos] = useState({
    date: getLocalDateString(),
    time: getLocalTimeString(),
    title: '',
    description: '',
  })
  const [isSubmittingHitos, setIsSubmittingHitos] = useState(false)

  const getNow = () => new Date()
  const maxDate = getLocalDateString()

  // Helper para parsear números argentinos
  const parseNumberAR = (value: string): number | null => {
    if (!value) return null
    const normalized = value.replace(/\./g, '').replace(',', '.')
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? null : parsed
  }

  // Helper para crear fecha en zona horaria local sin problemas de UTC
  const createLocalDate = (dateString: string, timeString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    const [hours, minutes] = timeString.split(':').map(Number)
    // Crear fecha directamente en hora local
    return new Date(year, month - 1, day, hours, minutes, 0, 0)
  }

  // Handler para esfínteres
  const handleSubmitEsfinteres = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingEsfinteres(true)

    const customTimestamp = createLocalDate(esfinterDate, esfinterTime)

    const details = {
      type: esfinterType,
      notes: esfinterNotes,
    }

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'esfinteres',
          details,
          babyName: 'Bebé',
          timestamp: customTimestamp.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          toast('Límite alcanzado', 'Has alcanzado el límite de registros gratuitos. Actualiza a Premium para continuar.', 'error')
          setTimeout(() => router.push('/premium'), 2000)
          return
        }
        throw new Error(data.error || 'Error al guardar')
      }

      toast('Registro guardado', 'El registro de esfínteres se guardó correctamente.', 'success')
      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast('Error', err.message || 'Error al guardar el registro', 'error')
    } finally {
      setIsSubmittingEsfinteres(false)
    }
  }

  // Handler para crecimiento
  const handleSubmitCrecimiento = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formDataCrecimiento.weight && !formDataCrecimiento.height && !formDataCrecimiento.headCircumference) {
      toast('Error', 'Debes ingresar al menos un valor (peso, altura o perímetro cefálico)', 'error')
      return
    }

    setIsSubmittingCrecimiento(true)

    // Crear timestamp en hora local
    const customTimestamp = createLocalDate(formDataCrecimiento.date, formDataCrecimiento.time)

    const submitData = {
      ...formDataCrecimiento,
      weight: formDataCrecimiento.weight ? parseNumberAR(formDataCrecimiento.weight)?.toString() || '' : '',
      height: formDataCrecimiento.height ? parseNumberAR(formDataCrecimiento.height)?.toString() || '' : '',
      headCircumference: formDataCrecimiento.headCircumference ? parseNumberAR(formDataCrecimiento.headCircumference)?.toString() || '' : '',
      date: formDataCrecimiento.date,
      time: formDataCrecimiento.time,
      timestamp: customTimestamp.toISOString(),
    }

    try {
      const response = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el registro')
      }

      toast('Registro guardado', 'El registro de crecimiento se guardó correctamente.', 'success')
      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast('Error', err.message || 'Error al guardar el registro', 'error')
    } finally {
      setIsSubmittingCrecimiento(false)
    }
  }

  // Handler para sueño
  const handleSubmitSueno = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formDataSueno.endTime) {
      toast('Error', 'Debes ingresar la hora de finalización', 'error')
      return
    }

    setIsSubmittingSueno(true)

    const startTimestamp = createLocalDate(formDataSueno.date, formDataSueno.startTime)
    const endTimestamp = createLocalDate(formDataSueno.date, formDataSueno.endTime)

    const details = {
      type: formDataSueno.type,
      startTime: startTimestamp.toISOString(),
      endTime: endTimestamp.toISOString(),
      duration: Math.round((endTimestamp.getTime() - startTimestamp.getTime()) / (1000 * 60)), // minutos
      notes: formDataSueno.notes,
    }

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sleep',
          details,
          babyName: 'Bebé',
          timestamp: startTimestamp.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          toast('Límite alcanzado', 'Has alcanzado el límite de registros gratuitos. Actualiza a Premium para continuar.', 'error')
          setTimeout(() => router.push('/premium'), 2000)
          return
        }
        throw new Error(data.error || 'Error al guardar')
      }

      toast('Registro guardado', 'El registro de sueño se guardó correctamente.', 'success')
      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast('Error', err.message || 'Error al guardar el registro', 'error')
    } finally {
      setIsSubmittingSueno(false)
    }
  }

  // Handler para alimentación
  const handleSubmitAlimentacion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingAlimentacion(true)

    const customTimestamp = createLocalDate(formDataAlimentacion.date, formDataAlimentacion.time)

    const details = {
      type: formDataAlimentacion.type,
      amount: formDataAlimentacion.amount || null,
      notes: formDataAlimentacion.notes,
    }

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feeding',
          details,
          babyName: 'Bebé',
          timestamp: customTimestamp.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          toast('Límite alcanzado', 'Has alcanzado el límite de registros gratuitos. Actualiza a Premium para continuar.', 'error')
          setTimeout(() => router.push('/premium'), 2000)
          return
        }
        throw new Error(data.error || 'Error al guardar')
      }

      toast('Registro guardado', 'El registro de alimentación se guardó correctamente.', 'success')
      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast('Error', err.message || 'Error al guardar el registro', 'error')
    } finally {
      setIsSubmittingAlimentacion(false)
    }
  }

  // Handler para hitos
  const handleSubmitHitos = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formDataHitos.title) {
      toast('Error', 'Debes ingresar un título para el hito', 'error')
      return
    }

    setIsSubmittingHitos(true)

    const customTimestamp = createLocalDate(formDataHitos.date, formDataHitos.time)

    const details = {
      title: formDataHitos.title,
      description: formDataHitos.description,
    }

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'milestone',
          details,
          babyName: 'Bebé',
          timestamp: customTimestamp.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.limitReached) {
          toast('Límite alcanzado', 'Has alcanzado el límite de registros gratuitos. Actualiza a Premium para continuar.', 'error')
          setTimeout(() => router.push('/premium'), 2000)
          return
        }
        throw new Error(data.error || 'Error al guardar')
      }

      toast('Registro guardado', 'El hito se guardó correctamente.', 'success')
      onClose()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast('Error', err.message || 'Error al guardar el registro', 'error')
    } finally {
      setIsSubmittingHitos(false)
    }
  }

  return (
    <AnimatePresence>
      {openModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal de Esfínteres */}
            {openModal === 'esfinteres' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Registro Rápido - Esfínteres
                  </h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X size={24} />
                  </Button>
                </div>
                <form onSubmit={handleSubmitEsfinteres} className="space-y-4">
                  <div>
                    <Label>Tipo de registro</Label>
                    <select
                      value={esfinterType}
                      onChange={(e) => setEsfinterType(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8CCFE0] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    >
                      <option value="pipi">Pis</option>
                      <option value="caca">Caca</option>
                      <option value="pipi-caca">Pis y Caca</option>
                      <option value="seco">Seco (sin nada)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        <Calendar className="inline mr-2" size={16} />
                        Fecha
                      </Label>
                      <Input
                        type="date"
                        value={esfinterDate}
                        onChange={(e) => setEsfinterDate(e.target.value)}
                        max={maxDate}
                        required
                      />
                    </div>
                    <div>
                      <Label>
                        <Clock className="inline mr-2" size={16} />
                        Hora
                      </Label>
                      <Input
                        type="time"
                        value={esfinterTime}
                        onChange={(e) => setEsfinterTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Notas (opcional)</Label>
                    <textarea
                      value={esfinterNotes}
                      onChange={(e) => setEsfinterNotes(e.target.value)}
                      placeholder="Observaciones adicionales..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8CCFE0] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingEsfinteres}
                      className="flex-1 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] dark:text-gray-100"
                    >
                      {isSubmittingEsfinteres ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={18} />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={18} />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Modal de Crecimiento */}
            {openModal === 'crecimiento' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Registro Rápido - Crecimiento
                  </h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X size={24} />
                  </Button>
                </div>
                <form onSubmit={handleSubmitCrecimiento} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        <Calendar className="inline mr-2" size={16} />
                        Fecha
                      </Label>
                      <Input
                        type="date"
                        value={formDataCrecimiento.date}
                        onChange={(e) => setFormDataCrecimiento({ ...formDataCrecimiento, date: e.target.value })}
                        max={maxDate}
                        required
                      />
                    </div>
                    <div>
                      <Label>
                        <Clock className="inline mr-2" size={16} />
                        Hora
                      </Label>
                      <Input
                        type="time"
                        value={formDataCrecimiento.time}
                        onChange={(e) => setFormDataCrecimiento({ ...formDataCrecimiento, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>
                      <Scale className="inline mr-2" size={16} />
                      Peso (kg)
                    </Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={formDataCrecimiento.weight}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d,.-]/g, '')
                        const normalized = value.replace(/\./g, ',')
                        const parts = normalized.split(',')
                        const finalValue = parts.length > 2 ? parts[0] + ',' + parts.slice(1).join('') : normalized
                        setFormDataCrecimiento({ ...formDataCrecimiento, weight: finalValue })
                      }}
                      placeholder="Ej: 3,5"
                    />
                  </div>
                  <div>
                    <Label>
                      <Gauge className="inline mr-2" size={16} />
                      Altura (cm)
                    </Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={formDataCrecimiento.height}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d,.-]/g, '')
                        const normalized = value.replace(/\./g, ',')
                        const parts = normalized.split(',')
                        const finalValue = parts.length > 2 ? parts[0] + ',' + parts.slice(1).join('') : normalized
                        setFormDataCrecimiento({ ...formDataCrecimiento, height: finalValue })
                      }}
                      placeholder="Ej: 50,5"
                    />
                  </div>
                  <div>
                    <Label>
                      <Circle className="inline mr-2" size={16} />
                      Perímetro Cefálico (cm)
                    </Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={formDataCrecimiento.headCircumference}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d,.-]/g, '')
                        const normalized = value.replace(/\./g, ',')
                        const parts = normalized.split(',')
                        const finalValue = parts.length > 2 ? parts[0] + ',' + parts.slice(1).join('') : normalized
                        setFormDataCrecimiento({ ...formDataCrecimiento, headCircumference: finalValue })
                      }}
                      placeholder="Ej: 35,0"
                    />
                  </div>
                  <div>
                    <Label>Notas (opcional)</Label>
                    <textarea
                      value={formDataCrecimiento.notes}
                      onChange={(e) => setFormDataCrecimiento({ ...formDataCrecimiento, notes: e.target.value })}
                      placeholder="Observaciones adicionales..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8CCFE0] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingCrecimiento || (!formDataCrecimiento.weight && !formDataCrecimiento.height && !formDataCrecimiento.headCircumference)}
                      className="flex-1 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] dark:text-gray-100 disabled:opacity-50"
                    >
                      {isSubmittingCrecimiento ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={18} />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={18} />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Modal de Sueño */}
            {openModal === 'sueno' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Registro Rápido - Sueño
                  </h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X size={24} />
                  </Button>
                </div>
                <form onSubmit={handleSubmitSueno} className="space-y-4">
                  <div>
                    <Label>Tipo</Label>
                    <select
                      value={formDataSueno.type}
                      onChange={(e) => setFormDataSueno({ ...formDataSueno, type: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8CCFE0] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    >
                      <option value="siesta">Siesta</option>
                      <option value="nocturno">Nocturno</option>
                    </select>
                  </div>
                  <div>
                    <Label>
                      <Calendar className="inline mr-2" size={16} />
                      Fecha
                    </Label>
                    <Input
                      type="date"
                      value={formDataSueno.date}
                      onChange={(e) => setFormDataSueno({ ...formDataSueno, date: e.target.value })}
                      max={maxDate}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        <Clock className="inline mr-2" size={16} />
                        Hora inicio
                      </Label>
                      <Input
                        type="time"
                        value={formDataSueno.startTime}
                        onChange={(e) => setFormDataSueno({ ...formDataSueno, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>
                        <Clock className="inline mr-2" size={16} />
                        Hora fin
                      </Label>
                      <Input
                        type="time"
                        value={formDataSueno.endTime}
                        onChange={(e) => setFormDataSueno({ ...formDataSueno, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Notas (opcional)</Label>
                    <textarea
                      value={formDataSueno.notes}
                      onChange={(e) => setFormDataSueno({ ...formDataSueno, notes: e.target.value })}
                      placeholder="Observaciones adicionales..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8CCFE0] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingSueno}
                      className="flex-1 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] dark:text-gray-100"
                    >
                      {isSubmittingSueno ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={18} />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={18} />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Modal de Alimentación */}
            {openModal === 'alimentacion' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Registro Rápido - Alimentación
                  </h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X size={24} />
                  </Button>
                </div>
                <form onSubmit={handleSubmitAlimentacion} className="space-y-4">
                  <div>
                    <Label>Tipo</Label>
                    <select
                      value={formDataAlimentacion.type}
                      onChange={(e) => setFormDataAlimentacion({ ...formDataAlimentacion, type: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8CCFE0] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    >
                      <option value="pecho">Pecho</option>
                      <option value="mamadera">Mamadera</option>
                      <option value="solido">Sólido</option>
                      <option value="agua">Agua</option>
                    </select>
                  </div>
                  <div>
                    <Label>
                      <Calendar className="inline mr-2" size={16} />
                      Fecha
                    </Label>
                    <Input
                      type="date"
                      value={formDataAlimentacion.date}
                      onChange={(e) => setFormDataAlimentacion({ ...formDataAlimentacion, date: e.target.value })}
                      max={maxDate}
                      required
                    />
                  </div>
                  <div>
                    <Label>
                      <Clock className="inline mr-2" size={16} />
                      Hora
                    </Label>
                    <Input
                      type="time"
                      value={formDataAlimentacion.time}
                      onChange={(e) => setFormDataAlimentacion({ ...formDataAlimentacion, time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Cantidad (opcional)</Label>
                    <Input
                      type="text"
                      value={formDataAlimentacion.amount}
                      onChange={(e) => setFormDataAlimentacion({ ...formDataAlimentacion, amount: e.target.value })}
                      placeholder="Ej: 150ml, 1 taza, etc."
                    />
                  </div>
                  <div>
                    <Label>Notas (opcional)</Label>
                    <textarea
                      value={formDataAlimentacion.notes}
                      onChange={(e) => setFormDataAlimentacion({ ...formDataAlimentacion, notes: e.target.value })}
                      placeholder="Observaciones adicionales..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8CCFE0] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingAlimentacion}
                      className="flex-1 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] dark:text-gray-100"
                    >
                      {isSubmittingAlimentacion ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={18} />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={18} />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Modal de Hitos */}
            {openModal === 'hitos' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Registro Rápido - Hito
                  </h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X size={24} />
                  </Button>
                </div>
                <form onSubmit={handleSubmitHitos} className="space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input
                      type="text"
                      value={formDataHitos.title}
                      onChange={(e) => setFormDataHitos({ ...formDataHitos, title: e.target.value })}
                      placeholder="Ej: Primera sonrisa, Primer paso, etc."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>
                        <Calendar className="inline mr-2" size={16} />
                        Fecha
                      </Label>
                      <Input
                        type="date"
                        value={formDataHitos.date}
                        onChange={(e) => setFormDataHitos({ ...formDataHitos, date: e.target.value })}
                        max={maxDate}
                        required
                      />
                    </div>
                    <div>
                      <Label>
                        <Clock className="inline mr-2" size={16} />
                        Hora
                      </Label>
                      <Input
                        type="time"
                        value={formDataHitos.time}
                        onChange={(e) => setFormDataHitos({ ...formDataHitos, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Descripción (opcional)</Label>
                    <textarea
                      value={formDataHitos.description}
                      onChange={(e) => setFormDataHitos({ ...formDataHitos, description: e.target.value })}
                      placeholder="Cuéntanos más sobre este momento especial..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8CCFE0] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingHitos || !formDataHitos.title}
                      className="flex-1 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B] dark:text-gray-100 disabled:opacity-50"
                    >
                      {isSubmittingHitos ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={18} />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={18} />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

