'use client'

import { useAdmin } from '../../hooks/useAdmin'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Search, Edit, Crown, Shield, Mail, User } from 'lucide-react'

interface User {
  email: string
  name?: string
  image?: string
  isPremium: boolean
  isAdmin: boolean
  registrationDate?: string
  country?: string
}

export default function UsersPage() {
  const { isAdmin, isLoading, isAuthenticated } = useAdmin()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all')
  const [filterAdmin, setFilterAdmin] = useState<'all' | 'admin' | 'user'>('all')
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
  }, [searchTerm, filterPremium, filterAdmin, users])

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

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(term) ||
        user.name?.toLowerCase().includes(term)
      )
    }

    // Filtrar por Premium
    if (filterPremium === 'premium') {
      filtered = filtered.filter(user => user.isPremium)
    } else if (filterPremium === 'free') {
      filtered = filtered.filter(user => !user.isPremium)
    }

    // Filtrar por Admin
    if (filterAdmin === 'admin') {
      filtered = filtered.filter(user => user.isAdmin)
    } else if (filterAdmin === 'user') {
      filtered = filtered.filter(user => !user.isAdmin)
    }

    setFilteredUsers(filtered)
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
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] bg-clip-text text-transparent">Gestión de</span>{' '}
                <span className="text-gray-900 dark:text-white">Usuarios</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Administra y gestiona todos los usuarios de la plataforma
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

          {/* Filtros y búsqueda */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por email o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterPremium}
                  onChange={(e) => setFilterPremium(e.target.value as any)}
                  className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos los planes</option>
                  <option value="premium">Solo Premium</option>
                  <option value="free">Solo Gratis</option>
                </select>
                <select
                  value={filterAdmin}
                  onChange={(e) => setFilterAdmin(e.target.value as any)}
                  className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Solo Administradores</option>
                  <option value="user">Solo Usuarios</option>
                </select>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  Total: {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
                </div>
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
                            <User className="h-6 w-6 text-gray-400" />
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
                            {user.isAdmin && (
                              <span title="Administrador">
                                <Shield className="h-4 w-4 text-blue-500" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.registrationDate && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Registrado: {new Date(user.registrationDate).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/users/${encodeURIComponent(user.email)}/edit`)}
                          className="border-[#8CCFE0] text-[#8CCFE0] hover:bg-[#8CCFE0]/10"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
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

