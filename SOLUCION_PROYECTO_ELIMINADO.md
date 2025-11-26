# 🔧 Solución: Project #112836110920 has been deleted

## Problema

El proyecto de Google Cloud asociado con tu Service Account ha sido eliminado. Por eso todas las llamadas a Google Sheets fallan con el error:

```
Project #112836110920 has been deleted.
```

## Solución: Crear Nuevo Proyecto y Service Account

### Paso 1: Crear un Nuevo Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (arriba a la izquierda)
3. Haz clic en **"Nuevo Proyecto"**
4. Ingresa un nombre para el proyecto (ej: "peque-diario")
5. Haz clic en **"Crear"**

### Paso 2: Habilitar Google Sheets API

1. En el nuevo proyecto, ve a **"APIs y Servicios"** → **"Biblioteca"**
2. Busca **"Google Sheets API"**
3. Haz clic en **"Habilitar"**

### Paso 3: Crear un Service Account

1. Ve a **"APIs y Servicios"** → **"Credenciales"**
2. Haz clic en **"Crear credenciales"** → **"Cuenta de servicio"**
3. Ingresa un nombre (ej: "peque-diario-service")
4. Haz clic en **"Crear y continuar"**
5. En "Otorgar acceso a este proyecto", puedes saltar este paso o asignar roles (opcional)
6. Haz clic en **"Listo"**

### Paso 4: Crear y Descargar la Clave JSON

1. En la lista de cuentas de servicio, haz clic en la que acabas de crear
2. Ve a la pestaña **"Claves"**
3. Haz clic en **"Agregar clave"** → **"Crear nueva clave"**
4. Selecciona **"JSON"**
5. Haz clic en **"Crear"**
6. Se descargará un archivo JSON con las credenciales

### Paso 5: Obtener las Credenciales del JSON

Abre el archivo JSON descargado. Necesitarás estos valores:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "tu-service-account@tu-proyecto.iam.gserviceaccount.com",
  ...
}
```

**Valores importantes:**
- `client_email`: El email del Service Account
- `private_key`: La clave privada completa (incluye los headers)

### Paso 6: Actualizar Variables de Entorno

Abre tu archivo `.env.local` y actualiza estas variables:

```env
GOOGLE_SHEETS_CLIENT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=tu-spreadsheet-id-aqui
```

**⚠️ IMPORTANTE sobre GOOGLE_SHEETS_PRIVATE_KEY:**
- Debe estar entre comillas dobles `"`
- Debe incluir `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Los saltos de línea deben ser `\n` (no saltos de línea reales)
- Copia el valor completo de `private_key` del JSON

### Paso 7: Compartir el Google Sheet con el Nuevo Service Account

1. Abre tu Google Sheet
2. Haz clic en el botón **"Compartir"** (arriba a la derecha)
3. En el campo de email, pega el **`client_email`** del nuevo Service Account
4. **IMPORTANTE:** Dale permisos de **"Editor"** (no solo "Lector")
5. Desmarca la opción **"Notificar a las personas"** (no es necesario)
6. Haz clic en **"Compartir"**

### Paso 8: Reiniciar el Servidor

Después de actualizar las variables de entorno:

```bash
# Detén el servidor (Ctrl+C)
# Luego reinícialo
npm run dev
```

## Verificación

Después de completar estos pasos, intenta:

1. Iniciar sesión en la aplicación
2. Completar el onboarding
3. Verificar que no aparezcan más errores de "Project has been deleted"

## Notas Adicionales

- El `GOOGLE_SHEETS_SPREADSHEET_ID` no cambia, es el mismo que antes
- Solo necesitas actualizar `GOOGLE_SHEETS_CLIENT_EMAIL` y `GOOGLE_SHEETS_PRIVATE_KEY`
- Asegúrate de que el nuevo Service Account tenga permisos de "Editor" en el Sheet

