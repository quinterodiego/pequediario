import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleSheetsService } from '@/lib/googleSheets'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar si el usuario es administrador
    const isAdmin = await GoogleSheetsService.checkAdminStatus(session.user.email)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      )
    }

    // Obtener todos los usuarios para calcular estadísticas
    const users = await GoogleSheetsService.getAllUsers()

    const stats = {
      totalUsers: users.length,
      premiumUsers: users.filter(u => u.isPremium).length,
      freeUsers: users.filter(u => !u.isPremium).length,
      adminUsers: users.filter(u => u.isAdmin).length,
      regularUsers: users.filter(u => !u.isAdmin).length,
      premiumPercentage: users.length > 0 
        ? Math.round((users.filter(u => u.isPremium).length / users.length) * 100)
        : 0,
    }

    return NextResponse.json({ stats }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

