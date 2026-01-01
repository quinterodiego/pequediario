'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Apple, Plus, Search, Edit, Trash2, X, Save, Clock, Calendar } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface Activity {
  id: string
  timestamp: string
  type: 'feeding'
  details: any
}

export default function AlimentacionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editForm, setEditForm] = useState({
    type: 'pecho',
    notes: '',
    date: '',
    time: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated' && session?.user) {
      setIsPremium(session.user.isPremium || false)
      loadActivities()
    }
  }, [status, session, router])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        const allActivities = data.activities || []
        const feedingActivities = allActivities.filter((a: Activity) => a.type === 'feeding')
        setActivities(feedingActivities)
      }
    } catch (error) {
      console.error('Error cargando actividades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedActivity && !isEditing) {
      const activityDate = new Date(selectedActivity.timestamp)
      setEditForm({
        type: selectedActivity.details?.type || 'pecho',
        notes: selectedActivity.details?.notes || '',
        date: activityDate.toISOString().split('T')[0],
        time: `${String(activityDate.getHours()).padStart(2, '0')}:${String(activityDate.getMinutes()).padStart(2, '0')}`,
      })
    }
  }, [selectedActivity, isEditing])

  // Filtrar actividades por búsqueda
  const filteredActivities = activities.filter(act => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const dateStr = new Date(act.timestamp).toLocaleDateString('es').toLowerCase()
    const notes = act.details?.notes?.toLowerCase() || ''
    const type = act.details?.type || ''
    return dateStr.includes(query) || notes.includes(query) || type.includes(query)
  })

  const feedingTypeLabels: Record<string, string> = {
    pecho: 'Pecho',
    mamadera: 'Mamadera',
    solido: 'Sólido',
    agua: 'Agua',
  }

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Alimentación</h1>
          <p className="text-gray-600">Registra comidas y tomas con notas</p>
        </div>
        <Button
          onClick={() => {
            // TODO: Implementar modal de registro
            alert('Funcionalidad próximamente disponible')
          }}
          className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
        >
          <Plus className="mr-2" size={18} />
          Nuevo Registro
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar registros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CCFE0]"
          />
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <Apple size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aún no hay registros
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza registrando las comidas y tomas de tu hijo
          </p>
          <Button
            onClick={() => {
              // TODO: Implementar modal de registro
              alert('Funcionalidad próximamente disponible')
            }}
            className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-[#1E293B]"
          >
            <Plus className="mr-2" size={18} />
            Registrar Alimentación
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => {
            const type = activity.details?.type || 'pecho'
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedActivity(activity)}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <Apple size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {feedingTypeLabels[type] || 'Alimentación'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleString('es', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {activity.details?.notes && (
                        <p className="text-sm text-gray-500 mt-1">{activity.details.notes}</p>
                      )}
                    </div>
                  </div>
                  {isPremium && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          const activityDate = new Date(activity.timestamp)
                          setEditForm({
                            type: activity.details?.type || 'pecho',
                            notes: activity.details?.notes || '',
                            date: activityDate.toISOString().split('T')[0],
                            time: `${String(activityDate.getHours()).padStart(2, '0')}:${String(activityDate.getMinutes()).padStart(2, '0')}`,
                          })
                          setSelectedActivity(activity)
                          setIsEditing(true)
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedActivity(activity)
                          setIsDeleting(true)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal de edición/eliminación */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (!isEditing && !isDeleting) {
                setSelectedActivity(null)
                setIsEditing(false)
                setIsDeleting(false)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Editar Registro' : isDeleting ? 'Eliminar Registro' : 'Detalles del Registro'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedActivity(null)
                    setIsEditing(false)
                    setIsDeleting(false)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {isDeleting ? (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-semibold mb-2">¿Estás seguro de que quieres eliminar este registro?</p>
                    <p className="text-sm text-red-700">Esta acción no se puede deshacer.</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setIsDeleting(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const timestamp = encodeURIComponent(selectedActivity.timestamp)
                          const response = await fetch(`/api/activities/${timestamp}`, {
                            method: 'DELETE',
                          })

                          const data = await response.json()

                          if (!response.ok) {
                            throw new Error(data.error || 'Error al eliminar')
                          }

                          await loadActivities()
                          setSelectedActivity(null)
                          setIsDeleting(false)
                        } catch (error: any) {
                          alert(error.message || 'Error al eliminar el registro')
                        }
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="mr-2" size={16} />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ) : isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pecho">Pecho</option>
                      <option value="mamadera">Mamadera</option>
                      <option value="solido">Sólido</option>
                      <option value="agua">Agua</option>
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
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="inline mr-2" size={16} />
                        Hora
                      </label>
                      <input
                        type="time"
                        value={editForm.time}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Observaciones..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        setIsEditing(false)
                        const activityDate = new Date(selectedActivity.timestamp)
                        setEditForm({
                          type: selectedActivity.details?.type || 'pecho',
                          notes: selectedActivity.details?.notes || '',
                          date: activityDate.toISOString().split('T')[0],
                          time: `${String(activityDate.getHours()).padStart(2, '0')}:${String(activityDate.getMinutes()).padStart(2, '0')}`,
                        })
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const [hours, minutes] = editForm.time.split(':')
                          const newTimestamp = new Date(editForm.date)
                          newTimestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0)

                          const timestamp = encodeURIComponent(selectedActivity.timestamp)
                          const response = await fetch(`/api/activities/${timestamp}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'feeding',
                              details: {
                                type: editForm.type,
                                notes: editForm.notes,
                              },
                              timestamp: newTimestamp.toISOString(),
                            }),
                          })

                          const data = await response.json()

                          if (!response.ok) {
                            throw new Error(data.error || 'Error al actualizar')
                          }

                          await loadActivities()
                          setIsEditing(false)
                          setSelectedActivity(null)
                        } catch (error: any) {
                          alert(error.message || 'Error al actualizar el registro')
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-white"
                    >
                      <Save className="mr-2" size={16} />
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <Apple size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {feedingTypeLabels[selectedActivity.details?.type || 'pecho']}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedActivity.timestamp).toLocaleString('es', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {selectedActivity.details?.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Notas:</p>
                      <p className="text-gray-600">{selectedActivity.details.notes}</p>
                    </div>
                  )}
                  {isPremium ? (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Edit className="mr-2" size={16} />
                        Editar
                      </Button>
                      <Button
                        onClick={() => setIsDeleting(true)}
                        variant="outline"
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2" size={16} />
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Funcionalidad Premium:</strong> Actualiza a Premium para poder editar y eliminar registros.
                      </p>
                      <Button
                        onClick={() => router.push('/premium')}
                        variant="outline"
                        size="sm"
                        className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      >
                        Ver Premium
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

