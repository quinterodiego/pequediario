# Configuración de Usuarios Administradores

## Cómo marcar un usuario como administrador

Para convertir un usuario en administrador, necesitas actualizar el campo `Es_Admin` (columna H) en la hoja de Google Sheets `Usuarios`.

### Pasos:

1. Abre tu Google Sheet de la aplicación
2. Ve a la hoja llamada `Usuarios`
3. Encuentra la fila del usuario que quieres hacer administrador
4. En la columna **H** (Es_Admin), escribe `TRUE` o `true`
5. Guarda los cambios

### Estructura de columnas en la hoja Usuarios:

- **A**: Fecha_Registro
- **B**: Email
- **C**: Nombre
- **D**: Imagen
- **E**: Es_Premium
- **F**: País
- **G**: Password_Hash
- **H**: Es_Admin ← **Nueva columna**

### Notas importantes:

- El valor debe ser exactamente `TRUE`, `true`, `1`, o el booleano `true` para que el usuario sea reconocido como administrador
- Cualquier otro valor (incluyendo vacío) será tratado como `false`
- Después de actualizar el valor, el usuario debe cerrar sesión y volver a iniciar sesión para que los cambios surtan efecto
- Los administradores tienen acceso al panel de administración en `/admin`

## Funcionalidades de administrador

Los usuarios administradores tienen acceso a:

- Panel de administración (`/admin`)
- Gestión de usuarios (próximamente)
- Gestión de suscripciones Premium (próximamente)
- Estadísticas y reportes (próximamente)

## Verificación

Para verificar si un usuario es administrador:

1. El usuario debe iniciar sesión
2. Si es administrador, verá un botón "Admin" en el header
3. Puede acceder a `/admin` para ver el panel de administración

