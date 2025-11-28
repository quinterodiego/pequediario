'use client'

import { useAdmin } from '../../hooks/useAdmin'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Search, Crown, Check, X } from 'lucide-react'

interface User {
  email: string
  name?: string
  image?: string
  isPremium: boolean
  isAdmin: boolean
}

export default function PremiumPage() {
  const { isAdmin, isLoading, isAuthenticated } = useAdmin()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [isAdmin, isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        console.error('Error obteniendo usuarios')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(term) ||
        user.name?.toLowerCase().includes(term)
      )
    }

    setFilteredUsers(filtered)
  }

  const togglePremium = async (userEmail: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPremium: !currentStatus,
        }),
      })

      if (response.ok) {
        // Actualizar la lista local
        setUsers(users.map(user =>
          user.email === userEmail
            ? { ...user, isPremium: !currentStatus }
            : user
        ))
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar suscripción')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar suscripción')
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

  const premiumUsers = filteredUsers.filter(u => u.isPremium)
  const freeUsers = filteredUsers.filter(u => !u.isPremium)

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] bg-clip-text text-transparent">Gestión de Suscripciones</span>{' '}
                <span className="bg-[linear-gradient(135deg,#F8D77E,#F2C94C_40%,#D6A63A)] bg-clip-text text-transparent">Premium</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Activa o desactiva suscripciones Premium para usuarios
              </p>
            </div>
            <Button 
              onClick={() => router.push('/admin')} 
              variant="outline"
              className="border-[#8CCFE0] text-[#8CCFE0] hover:bg-[#8CCFE0]/10"
            >
              Volver al Panel
            </Button>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-[#D6A63A]" />
                  Usuarios Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#D6A63A]">{premiumUsers.length}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredUsers.length > 0 
                    ? Math.round((premiumUsers.length / filteredUsers.length) * 100)
                    : 0}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios Gratis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{freeUsers.length}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredUsers.length > 0 
                    ? Math.round((freeUsers.length / filteredUsers.length) * 100)
                    : 0}% del total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Búsqueda */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de usuarios */}
          <div className="grid gap-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  No se encontraron usuarios
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.email}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || user.email}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400 text-lg">
                              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {user.name || 'Sin nombre'}
                            </h3>
                            {user.isPremium && (
                              <span title="Premium">
                                <Crown className="h-4 w-4 text-yellow-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${user.isPremium ? 'text-[#D6A63A]' : 'text-gray-600'}`}>
                            {user.isPremium ? 'Premium' : 'Gratis'}
                          </div>
                        </div>
                        <Button
                          variant={user.isPremium ? "outline" : "default"}
                          size="sm"
                          onClick={() => togglePremium(user.email, user.isPremium)}
                          className={user.isPremium 
                            ? "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "bg-[linear-gradient(135deg,#F8D77E,#F2C94C_40%,#D6A63A)] hover:opacity-90 text-white border-2 border-[#D6A63A]"
                          }
                        >
                          {user.isPremium ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Activar Premium
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

