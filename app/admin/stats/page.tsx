'use client'

import { useAdmin } from '../../hooks/useAdmin'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Users, Crown, UserCheck, Shield, TrendingUp, Percent } from 'lucide-react'

interface Stats {
  totalUsers: number
  premiumUsers: number
  freeUsers: number
  adminUsers: number
  regularUsers: number
  premiumPercentage: number
}

export default function StatsPage() {
  const { isAdmin, isLoading, isAuthenticated } = useAdmin()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [isAdmin, isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        console.error('Error obteniendo estadísticas')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
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
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#8CCFE0] to-[#E9A5B4] bg-clip-text text-transparent">Estadísticas y</span>{' '}
                <span className="text-gray-900 dark:text-white">Métricas</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Visión general de la plataforma
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios registrados en total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Premium</CardTitle>
                <Crown className="h-4 w-4 text-[#D6A63A]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#D6A63A]">{stats?.premiumUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.premiumPercentage || 0}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Gratis</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.freeUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios con plan gratuito
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats?.adminUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios con permisos de admin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Regulares</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.regularUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios sin permisos de admin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats?.premiumPercentage || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Porcentaje de usuarios Premium
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                Distribución de usuarios en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Usuarios Premium</span>
                    <span className="font-semibold">{stats?.premiumUsers || 0} / {stats?.totalUsers || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-[linear-gradient(135deg,#F8D77E,#F2C94C_40%,#D6A63A)] h-2 rounded-full"
                      style={{ width: `${stats?.premiumPercentage || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Usuarios Gratis</span>
                    <span className="font-semibold">{stats?.freeUsers || 0} / {stats?.totalUsers || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: `${stats?.totalUsers ? Math.round((stats.freeUsers / stats.totalUsers) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

