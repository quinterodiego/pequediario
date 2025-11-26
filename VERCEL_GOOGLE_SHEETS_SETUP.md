# 🔧 Configuración de Google Sheets en Vercel

## Problema Común: Error `ERR_OSSL_UNSUPPORTED`

Si ves este error en Vercel:
```
Error: error:1E08010C:DECODER routines::unsupported
ERR_OSSL_UNSUPPORTED
```

Significa que la clave privada de Google Sheets no está correctamente formateada en las variables de entorno de Vercel.

## ✅ Solución: Configurar la Clave Privada en Vercel

### Paso 1: Obtener la Clave Privada

1. Descarga el archivo JSON de credenciales desde Google Cloud Console
2. Abre el archivo JSON
3. Copia el valor completo de `private_key` (incluye los headers)

### Paso 2: Formatear para Vercel

En Vercel, la clave privada debe estar en **una sola línea** con `\n` para los saltos de línea.

**Formato correcto en Vercel:**

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

### Paso 3: Configurar en Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega estas variables:

#### Variable 1: `GOOGLE_SHEETS_CLIENT_EMAIL`
```
tu-service-account@tu-proyecto.iam.gserviceaccount.com
```

#### Variable 2: `GOOGLE_SHEETS_PRIVATE_KEY`
**⚠️ IMPORTANTE:** Pega la clave privada completa en una sola línea con `\n`:

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS0+f6Fm+5U9b+LvF8B5U9F5v5F5v5F5v5F5v5F5v5F5v5F\n...\n-----END PRIVATE KEY-----\n
```

**Ejemplo completo:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS0+f6Fm+5U9b+LvF8B5U9F5v5F5v5F5v5F5v5F5v5F5v5F\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS0+f6Fm+5U9b+LvF8B5U9F5v5F5v5F5v5F5v5F5v5F5v5F\n-----END PRIVATE KEY-----\n
```

#### Variable 3: `GOOGLE_SHEETS_SPREADSHEET_ID`
```
tu-spreadsheet-id-aqui
```

### Paso 4: Seleccionar Entornos

Asegúrate de seleccionar los entornos correctos para cada variable:
- ✅ **Production**
- ✅ **Preview** (opcional, pero recomendado)
- ✅ **Development** (opcional)

### Paso 5: Redeploy

Después de agregar las variables:
1. Ve a **Deployments**
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **Redeploy**
4. Espera a que se complete el deployment

## 🔍 Verificación

Para verificar que la configuración es correcta:

1. Ve a tu aplicación en Vercel
2. Abre los **Function Logs** en el dashboard
3. Intenta usar una funcionalidad que requiera Google Sheets
4. Si no ves el error `ERR_OSSL_UNSUPPORTED`, la configuración es correcta

## ⚠️ Errores Comunes

### Error: "DECODER routines::unsupported"

**Causa:** La clave privada no está correctamente formateada

**Solución:**
- Asegúrate de que la clave esté en una sola línea
- Verifica que tenga `\n` (no saltos de línea reales)
- Verifica que incluya `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- No agregues comillas alrededor del valor en Vercel

### Error: "Invalid key format"

**Causa:** La clave privada está incompleta o corrupta

**Solución:**
- Descarga nuevamente el archivo JSON desde Google Cloud Console
- Copia el valor completo de `private_key`
- Asegúrate de no cortar ninguna parte de la clave

### Error: "Service account not found"

**Causa:** El `client_email` no coincide con el Service Account

**Solución:**
- Verifica que el `GOOGLE_SHEETS_CLIENT_EMAIL` sea exactamente igual al del archivo JSON
- No agregues espacios extra

## 📝 Notas Importantes

1. **Nunca** subas el archivo JSON de credenciales a GitHub
2. La clave privada es sensible - mantén las variables de entorno seguras
3. Si expones la clave, revócala inmediatamente en Google Cloud Console
4. El código ahora maneja automáticamente diferentes formatos de clave privada
5. Si cambias las variables de entorno, necesitas hacer un redeploy

## 🔄 Alternativa: Usar Base64 (No recomendado)

Si el problema persiste, puedes intentar codificar la clave privada en Base64:

1. Codifica la clave privada completa (con headers) en Base64
2. Guarda el valor Base64 en Vercel
3. Decodifica en el código antes de usar

**Nota:** Esto no es necesario con la función mejorada de formateo.

---

## ✅ Checklist

- [ ] Archivo JSON descargado desde Google Cloud Console
- [ ] `GOOGLE_SHEETS_CLIENT_EMAIL` configurado en Vercel
- [ ] `GOOGLE_SHEETS_PRIVATE_KEY` configurado en Vercel (una sola línea con `\n`)
- [ ] `GOOGLE_SHEETS_SPREADSHEET_ID` configurado en Vercel
- [ ] Variables configuradas para Production (y Preview si es necesario)
- [ ] Redeploy realizado
- [ ] Verificado que no hay errores en los logs

