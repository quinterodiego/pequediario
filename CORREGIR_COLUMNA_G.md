# 🔧 Corrección: Agregar Columna G al Sheet de Usuarios

## Problema

Si los datos se están desfasando al crear nuevos usuarios, es porque falta la columna G (Password_Hash) en el sheet de "Usuarios".

## Solución

### Paso 1: Abrir el Sheet de Usuarios

1. Ve a tu Google Sheet
2. Abre la hoja "Usuarios"

### Paso 2: Agregar la Columna G

1. **Si la columna G no existe:**
   - Haz clic en la columna F (País)
   - Haz clic derecho → "Insertar 1 columna a la derecha"
   - O simplemente haz clic en la celda G1 y escribe el header

2. **En la celda G1, escribe:**
   ```
   Password_Hash
   ```

### Paso 3: Verificar la Estructura

Tu hoja "Usuarios" debería verse así:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Fecha_Registro | Email | Nombre | Imagen | Es_Premium | País | Password_Hash |

### Paso 4: Corregir Datos Desfasados (si es necesario)

Si ya tienes usuarios con datos desfasados:

1. **Identifica las filas afectadas:**
   - Los datos estarán en columnas incorrectas
   - Por ejemplo, el Password_Hash podría estar en la columna H en lugar de G

2. **Corrige manualmente:**
   - Mueve los datos a sus columnas correctas
   - Asegúrate de que cada columna tenga el dato correcto

3. **O crea un script de corrección:**
   - Puedes usar Google Apps Script para corregir múltiples filas automáticamente

### Paso 5: Verificar

1. Crea un nuevo usuario de prueba
2. Verifica que los datos se guarden en las columnas correctas:
   - A: Fecha_Registro
   - B: Email
   - C: Nombre
   - D: Imagen
   - E: Es_Premium
   - F: País
   - G: Password_Hash (debería tener un hash largo)

## Estructura Correcta Final

```
A1: Fecha_Registro
B1: Email
C1: Nombre
D1: Imagen
E1: Es_Premium
F1: País
G1: Password_Hash
```

## Notas

- La columna G (Password_Hash) almacena las contraseñas hasheadas con bcrypt
- Si un usuario se registra sin contraseña (login con Google), esta columna estará vacía
- Los hashes son largos (alrededor de 60 caracteres) y empiezan con `$2a$` o `$2b$`




