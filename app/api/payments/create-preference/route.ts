import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // Detectar si es token de prueba o producción
    // Los tokens de prueba pueden empezar con TEST- o APP_USR- (en versiones recientes)
    // Usamos una variable de entorno para forzar el modo de prueba si es necesario
    const forceTestMode = process.env.MERCADOPAGO_TEST_MODE === 'true'
    const isTestToken = forceTestMode || process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-')
    console.log('Tipo de token:', isTestToken ? 'PRUEBA' : 'PRODUCCIÓN', {
      tokenStartsWith: process.env.MERCADOPAGO_ACCESS_TOKEN.substring(0, 10),
      forceTestMode
    })

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si ya es Premium
    if (session.user.isPremium === true) {
      return NextResponse.json({ error: 'Ya eres usuario Premium' }, { status: 400 })
    }

    let price = 14999
    try {
      const body = await request.json()
      price = body.price || 14999
    } catch (e) {
      // Si no hay body, usar precio por defecto
    }

    // Construir URLs base - asegurar que sean URLs válidas
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // Validar que las URLs sean válidas
    const isValidUrl = (url: string) => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    const successUrl = `${baseUrl}/premium?payment=success`
    const failureUrl = `${baseUrl}/premium?payment=failure`
    const pendingUrl = `${baseUrl}/premium?payment=pending`
    const webhookUrl = `${baseUrl}/api/payments/webhook`

    // Validar URLs
    if (!isValidUrl(successUrl) || !isValidUrl(failureUrl) || !isValidUrl(pendingUrl)) {
      throw new Error('Las URLs de retorno no son válidas')
    }

    // Crear preferencia de pago
    const preferenceData: any = {
      items: [
        {
          title: 'Peque Diario Premium',
          description: 'Pago único - Acceso Premium de por vida',
          quantity: 1,
          unit_price: Number(price),
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: session.user.email,
        name: session.user.name || 'Usuario',
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      external_reference: session.user.email, // Usar email como referencia para identificar el usuario
      notification_url: webhookUrl,
      statement_descriptor: 'Peque Diario Premium',
      metadata: {
        user_email: session.user.email,
        user_name: session.user.name || 'Usuario',
      },
    }

    // Solo agregar auto_return si no estamos en localhost y las URLs son válidas
    if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
      preferenceData.auto_return = 'approved'
    }

    console.log('URLs configuradas:', {
      success: successUrl,
      failure: failureUrl,
      pending: pendingUrl,
      webhook: webhookUrl,
    })

    // Importar dinámicamente Mercado Pago para evitar problemas con webpack
    const { MercadoPagoConfig, Preference } = await import('mercadopago')
    
    // Inicializar cliente de Mercado Pago dentro de la función
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    })

    const preference = new Preference(client)

    console.log('Creando preferencia de pago con datos:', {
      email: session.user.email,
      price,
      hasToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      preferenceData: JSON.stringify(preferenceData, null, 2),
    })

    // Intentar crear la preferencia
    let response
    try {
      response = await preference.create({ body: preferenceData })
    } catch (mpError: any) {
      console.error('Error de Mercado Pago:', mpError)
      console.error('Error details:', mpError.cause || mpError.message)
      throw new Error(`Error de Mercado Pago: ${mpError.message || 'Error desconocido'}`)
    }

    console.log('Preferencia creada exitosamente:', response)
    console.log('Response keys:', Object.keys(response))

    // Verificar que la respuesta tenga los campos esperados
    if (!response || !response.id) {
      throw new Error('La respuesta de Mercado Pago no contiene los datos esperados')
    }

    // Determinar qué URL usar: si es token de prueba, usar sandbox_init_point
    // Si es producción, usar init_point
    const checkoutUrl = isTestToken 
      ? response.sandbox_init_point || response.init_point
      : response.init_point

    console.log('URLs disponibles:', {
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      usando: checkoutUrl,
      esTokenPrueba: isTestToken
    })

    return NextResponse.json({
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
      checkoutUrl: checkoutUrl, // URL recomendada según el tipo de token
      isTestToken: isTestToken,
    })
  } catch (error: any) {
    console.error('Error creando preferencia de pago:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    return NextResponse.json(
      { 
        error: 'Error al crear la preferencia de pago', 
        details: error.message || 'Error desconocido',
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}

