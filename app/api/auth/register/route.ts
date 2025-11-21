import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/googleSheets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await GoogleSheetsService.getUserByEmail(email)
    
    if (existingUser.exists) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Crear el nuevo usuario
    const result = await GoogleSheetsService.saveUser({
      email,
      name,
      password,
      isPremium: false,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Error al crear la cuenta. Por favor intenta nuevamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Cuenta creada exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error al crear la cuenta. Por favor intenta nuevamente.' },
      { status: 500 }
    )
  }
}

