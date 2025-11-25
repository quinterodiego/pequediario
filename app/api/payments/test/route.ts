import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig } from 'mercadopago'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const hasToken = !!process.env.MERCADOPAGO_ACCESS_TOKEN
    const tokenLength = process.env.MERCADOPAGO_ACCESS_TOKEN?.length || 0
    
    // Intentar inicializar el cliente
    let clientInitialized = false
    let errorMessage = null
    
    if (hasToken) {
      try {
        const client = new MercadoPagoConfig({
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
          options: { timeout: 5000 }
        })
        clientInitialized = true
      } catch (error: any) {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({
      hasToken,
      tokenLength,
      clientInitialized,
      errorMessage,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 })
  }
}



