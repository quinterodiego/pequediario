# Configuración de Mercado Pago

## Variables de Entorno Requeridas

Agrega las siguientes variables de entorno a tu archivo `.env.local`:

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_de_mercadopago

# Modo de Prueba (opcional, pero recomendado para desarrollo)
# Si estás usando credenciales de prueba, establece esto en 'true'
MERCADOPAGO_TEST_MODE=true

# URL Base (para producción, usa tu dominio)
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

## Cómo obtener el Access Token de Mercado Pago

1. **Crear una cuenta en Mercado Pago:**
   - Ve a https://www.mercadopago.com.ar/developers
   - Crea una cuenta o inicia sesión

2. **Crear una aplicación:**
   - Ve a "Tus integraciones" → "Crear nueva aplicación"
   - Completa el formulario con los datos de tu aplicación

3. **Obtener el Access Token:**
   - En la página de tu aplicación, encontrarás dos secciones:
     - **Credenciales de Prueba**: Para desarrollo y pruebas (pueden empezar con "TEST-" o "APP_USR-")
     - **Credenciales de Producción**: Para pagos reales (empiezan con "APP_USR-")
   - **IMPORTANTE**: 
     - Si estás en la sección "Credenciales de Prueba", copia ese Access Token
     - Aunque el token de prueba pueda empezar con "APP_USR-", si está en la sección de prueba, es un token de prueba
     - Para usar tarjetas de prueba, DEBES usar el Access Token de la sección "Credenciales de Prueba"
   - Copia el token de la sección correspondiente y pégala en la variable `MERCADOPAGO_ACCESS_TOKEN`
   - **Para desarrollo local**: 
     - Usa siempre el token de "Credenciales de Prueba"
     - Agrega `MERCADOPAGO_TEST_MODE=true` a tu `.env.local` para asegurar que se use el modo de prueba

4. **Configurar Webhooks:**
   - En la configuración de tu aplicación, agrega la URL del webhook:
   - `https://tu-dominio.com/api/payments/webhook`
   - O para desarrollo local, usa un servicio como ngrok para exponer tu servidor local

## Modo de Prueba vs Producción

- **Modo de Prueba:** Usa el Access Token de prueba. Los pagos no serán reales.
- **Modo de Producción:** Usa el Access Token de producción. Los pagos serán reales.

El código automáticamente detecta el entorno y usa `sandbox_init_point` en desarrollo y `init_point` en producción.

## Tarjetas de Prueba

**⚠️ IMPORTANTE**: Las tarjetas de prueba SOLO funcionan con el Access Token de Prueba. Si usas el token de producción, recibirás el error "No es posible continuar el pago con esta tarjeta".

Para probar pagos en modo de prueba, asegúrate de:
1. Usar el Access Token de Prueba (de la sección "Credenciales de Prueba")
2. Configurar `MERCADOPAGO_TEST_MODE=true` en tu `.env.local`
3. Usar estas tarjetas de prueba (con CVV de 3 dígitos):

### Tarjetas Recomendadas (CVV de 3 dígitos)

- **Visa (Aprobada):** 4509 9535 6623 3704
  - CVV: 123 (cualquier número de 3 dígitos)
  - Vencimiento: 11/30 (cualquier fecha futura)
  - Nombre: APRO o cualquier nombre

- **Mastercard (Aprobada):** 5031 7557 3453 0604
  - CVV: 123 (cualquier número de 3 dígitos)
  - Vencimiento: 11/30 (cualquier fecha futura)
  - Nombre: APRO o cualquier nombre

### Tarjetas de Prueba Adicionales

- **Visa (Rechazada):** 4013 5406 8274 6260
- **Mastercard (Rechazada):** 5031 4332 1540 6351

### ⚠️ Problema con Tarjetas American Express

**Nota importante**: Algunas tarjetas de prueba de American Express tienen un código de seguridad de 4 dígitos, pero el checkout de Mercado Pago solo acepta 3 dígitos en el campo CVV. 

**Solución**: Usa tarjetas Visa o Mastercard de prueba que tienen CVV de 3 dígitos, o intenta ingresar solo los primeros 3 dígitos del CVV de American Express (aunque esto puede no funcionar en todos los casos).

## Flujo de Pago

1. Usuario hace clic en "Actualizar a Premium"
2. Se crea una preferencia de pago en Mercado Pago
3. Usuario es redirigido al checkout de Mercado Pago
4. Usuario completa el pago
5. Mercado Pago redirige de vuelta a `/premium?payment=success`
6. Mercado Pago envía un webhook a `/api/payments/webhook`
7. El webhook actualiza el estado del usuario a Premium en Google Sheets
8. La sesión se refresca y el usuario ve su nuevo estado Premium

## Precio

El precio actual está configurado en $14,999 ARS (pago único). Puedes cambiarlo en:
- `app/premium/page.tsx` (precio mostrado)
- `app/api/payments/create-preference/route.ts` (precio por defecto)

## Troubleshooting

### El webhook no se está ejecutando
- Verifica que la URL del webhook esté correctamente configurada en Mercado Pago
- Asegúrate de que tu servidor sea accesible desde internet (usa ngrok para desarrollo local)
- Revisa los logs del servidor para ver si hay errores

### El usuario no se actualiza a Premium después del pago
- Verifica que el webhook se esté ejecutando correctamente
- Revisa los logs de Google Sheets para ver si hay errores al actualizar
- Verifica que el `external_reference` en la preferencia de pago sea el email del usuario

### Error al crear la preferencia de pago
- Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté correctamente configurado
- Verifica que el token sea válido y tenga los permisos necesarios
- Revisa los logs del servidor para más detalles del error

### Error "No es posible continuar el pago con esta tarjeta" con tarjetas de prueba
- **Causa más común**: Estás usando el Access Token de producción en lugar del de prueba
- **Solución**: Asegúrate de usar el Access Token de Prueba (que empieza con "TEST-")
- Verifica en tu `.env.local` que el token empiece con "TEST-"
- Las tarjetas de prueba SOLO funcionan con tokens de prueba
- Si necesitas usar el token de producción, deberás usar tarjetas reales

### Error 401 en cookies-preferences de Mercado Pago
- **Causa**: Este es un error interno de la interfaz de Mercado Pago al intentar guardar preferencias de cookies
- **Impacto**: Generalmente NO afecta el proceso de pago. Es un error cosmético de la interfaz
- **Solución**: Puedes ignorar este error si el pago se completa correctamente
- Si el pago no se completa, verifica:
  - Que el Access Token sea válido y tenga los permisos correctos
  - Que la aplicación esté correctamente configurada en el panel de Mercado Pago
  - Que estés usando el token correcto (prueba vs producción)

