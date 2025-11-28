'use client'

import { useAdmin } from '../../../../hooks/useAdmin'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function EditUserPage() {
  const { isAdmin, isLoading, isAuthenticated } = useAdmin()
  const router = useRouter()
  const params = useParams()
  const userEmail = decodeURIComponent(params.email as string)

  const [name, setName] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [isAdmin, isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAdmin) {
      fetchUserData()
    }
  }, [isAdmin, userEmail])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        const user = data.users.find((u: any) => u.email === userEmail)
        if (user) {
          setName(user.name || '')
          setIsPremium(user.isPremium || false)
          setIsAdminUser(user.isAdmin || false)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          isPremium,
          isAdmin: isAdminUser,
        }),
      })

      if (response.ok) {
        router.push('/admin/users')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar cambios')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/users')}
            className="mb-4 text-[#8CCFE0] hover:text-[#7CBFD0] hover:bg-[#8CCFE0]/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Usuarios
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] bg-clip-text text-transparent">Editar</span>{' '}
            <span className="text-gray-900 dark:text-white">Usuario</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {userEmail}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              Modifica los datos del usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userEmail}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del usuario"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-4 h-4 text-[#D6A63A] border-gray-300 rounded focus:ring-[#D6A63A]"
                />
                <Label htmlFor="isPremium" className="cursor-pointer">
                  Usuario Premium
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={isAdminUser}
                  onChange={(e) => setIsAdminUser(e.target.checked)}
                  className="w-4 h-4 text-[#8CCFE0] border-gray-300 rounded focus:ring-[#8CCFE0]"
                />
                <Label htmlFor="isAdmin" className="cursor-pointer">
                  Administrador
                </Label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/users')}
                disabled={saving}
                className="border-[#8CCFE0] text-[#8CCFE0] hover:bg-[#8CCFE0]/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] hover:from-[#7CBFD0] hover:to-[#D995A4] text-gray-700 dark:text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

