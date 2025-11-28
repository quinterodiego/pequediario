import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleSheetsService } from '@/lib/googleSheets'

export async function PUT(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
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

    const body = await request.json()
    const { name, isPremium, isAdmin: newAdminStatus } = body
    const userEmail = decodeURIComponent(params.email)

    // Actualizar usuario
    const result = await GoogleSheetsService.updateUser({
      email: userEmail,
      name,
      isPremium,
      isAdmin: newAdminStatus,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al actualizar usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Usuario actualizado correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

