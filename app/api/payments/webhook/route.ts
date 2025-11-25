import { NextRequest, NextResponse } from 'next/server'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verificar que el access token esté configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN no está configurado')
      return NextResponse.json(
        { error: 'Configuración de Mercado Pago no encontrada' },
        { status: 500 }
      )
    }

    // Importar dinámicamente Mercado Pago para evitar problemas con webpack
    const { MercadoPagoConfig, Payment } = await import('mercadopago')
    
    // Inicializar cliente de Mercado Pago dentro de la función
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    })

    const payment = new Payment(client)

    const body = await request.json()
    
    // Mercado Pago envía diferentes tipos de notificaciones
    const { type, data } = body

    if (type === 'payment') {
      const paymentId = data.id
      
      // Obtener información del pago
      const paymentInfo = await payment.get({ id: paymentId })
      
      // Verificar que el pago esté aprobado
      if (paymentInfo.status === 'approved') {
        // Obtener el email del usuario desde external_reference o metadata
        const userEmail = paymentInfo.external_reference || paymentInfo.metadata?.user_email
        
        if (!userEmail) {
          console.error('No se encontró email del usuario en el pago:', paymentId)
          return NextResponse.json({ error: 'Email no encontrado' }, { status: 400 })
        }

        // Actualizar usuario a Premium
        const result = await GoogleSheetsService.upgradeToPremium(userEmail)
        
        if (!result.success) {
          console.error('Error actualizando usuario a Premium:', result.error)
          return NextResponse.json(
            { error: 'Error al actualizar usuario' },
            { status: 500 }
          )
        }

        console.log(`Usuario ${userEmail} actualizado a Premium exitosamente`)
        
        return NextResponse.json({ 
          success: true, 
          message: 'Usuario actualizado a Premium',
          paymentId,
          userEmail 
        })
      } else {
        console.log(`Pago ${paymentId} no está aprobado. Estado: ${paymentInfo.status}`)
        return NextResponse.json({ 
          message: 'Pago no aprobado',
          status: paymentInfo.status 
        })
      }
    }

    return NextResponse.json({ message: 'Notificación recibida' })
  } catch (error: any) {
    console.error('Error procesando webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook', details: error.message },
      { status: 500 }
    )
  }
}

// GET para verificar que el endpoint funciona (útil para testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint activo',
    timestamp: new Date().toISOString()
  })
}

