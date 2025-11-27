# 🔧 Corregir Usuarios Desfasados en Google Sheets

## Problema

Si los usuarios se están creando desfasados (escribiendo desde la columna G en lugar de A), esto puede deberse a:

1. **Datos desalineados en filas anteriores**: Si hay filas con datos en columnas incorrectas, Google Sheets puede interpretar mal dónde insertar nuevos datos
2. **Falta de la columna G (Password_Hash)**: Si la columna G no existe, los datos se pueden desalinear

## ✅ Solución Implementada

El código ahora:
- ✅ Encuentra la última fila con datos en la columna A
- ✅ Inserta nuevos usuarios en la siguiente fila disponible
- ✅ Usa `update` con rango específico `A{row}:G{row}` para asegurar alineación correcta

## 🔍 Cómo Verificar que Está Corregido

1. **Verifica la estructura del Sheet**:
   - Abre tu Google Sheet "Usuarios"
   - Asegúrate de que la fila 1 tenga estos headers:
     - A1: `Fecha_Registro`
     - B1: `Email`
     - C1: `Nombre`
     - D1: `Imagen`
     - E1: `Es_Premium`
     - F1: `País`
     - G1: `Password_Hash` ⚠️ **IMPORTANTE: Esta columna debe existir**

2. **Crea un usuario de prueba**:
   - Registra un nuevo usuario desde la aplicación
   - Verifica que se escriba correctamente desde la columna A

## 🛠️ Cómo Corregir Datos Desfasados Existentes

Si ya tienes usuarios desfasados en tu Sheet, sigue estos pasos:

### Paso 1: Identificar Usuarios Desfasados

1. Abre tu Google Sheet "Usuarios"
2. Busca filas donde:
   - La columna A está vacía pero hay datos en otras columnas
   - Los datos empiezan en la columna G o posterior

### Paso 2: Corregir Manualmente

Para cada usuario desfasado:

1. **Identifica los datos correctos**:
   - Email (debería estar en B, pero puede estar en H)
   - Nombre (debería estar en C, pero puede estar en I)
   - Imagen (debería estar en D, pero puede estar en J)
   - Es_Premium (debería estar en E, pero puede estar en K)
   - Password_Hash (debería estar en G, pero puede estar en otra columna)

2. **Mueve los datos a las columnas correctas**:
   - **Columna A**: Fecha de registro (puedes usar la fecha actual si no la tienes)
   - **Columna B**: Email
   - **Columna C**: Nombre
   - **Columna D**: Imagen (URL o vacío)
   - **Columna E**: Es_Premium (TRUE/FALSE)
   - **Columna F**: País (puede estar vacío)
   - **Columna G**: Password_Hash

3. **Limpia las columnas incorrectas**:
   - Borra los datos de las columnas H, I, J, K, etc. que contenían datos desfasados

### Paso 3: Ejemplo de Corrección

**Antes (Desfasado):**
```
A5: (vacío)
B5: (vacío)
...
G5: 2025-11-26T00:...
H5: d86webs@gmail.com
I5: Diego Quintero
J5: https://lh3.google...
K5: FALSE
```

**Después (Corregido):**
```
A5: 2025-11-26T00:00:00.000Z
B5: d86webs@gmail.com
C5: Diego Quintero
D5: https://lh3.googleusercontent.com/...
E5: FALSE
F5: (vacío)
G5: (password hash si existe, o vacío)
```

### Paso 4: Verificar Estructura

Después de corregir, verifica que:
- ✅ Todas las filas tengan datos empezando desde la columna A
- ✅ No haya datos en columnas después de G (a menos que sean columnas adicionales que agregaste)
- ✅ La columna G (Password_Hash) existe y tiene el header correcto

## 📋 Checklist de Verificación

- [ ] La columna G (Password_Hash) existe en el Sheet
- [ ] El header de la fila 1 está correcto (A1-G1)
- [ ] Todos los usuarios existentes están alineados desde la columna A
- [ ] No hay datos desfasados en columnas H, I, J, K, etc.
- [ ] Los nuevos usuarios se crean correctamente desde la columna A

## ⚠️ Prevención

Para evitar que esto vuelva a pasar:

1. **Nunca borres la columna G** del Sheet
2. **No muevas manualmente datos** entre columnas sin actualizar el código
3. **Verifica la estructura** antes de hacer cambios manuales en el Sheet
4. **Usa siempre el código** para crear/actualizar usuarios, no lo hagas manualmente

## 🔄 Si el Problema Persiste

Si después de corregir los datos, los nuevos usuarios siguen creándose desfasados:

1. **Verifica las variables de entorno** en Vercel:
   - `GOOGLE_SHEETS_SPREADSHEET_ID` está correcto
   - El Service Account tiene acceso al Sheet

2. **Verifica los permisos**:
   - El Service Account debe tener acceso de "Editor" al Sheet
   - El Sheet debe estar compartido con el email del Service Account

3. **Revisa los logs**:
   - En Vercel, ve a Function Logs
   - Busca errores relacionados con Google Sheets API

4. **Prueba crear un usuario de prueba**:
   - Registra un nuevo usuario
   - Verifica inmediatamente en el Sheet dónde se escribió

---

## 📝 Nota Importante

El código ahora está corregido para escribir siempre desde la columna A. Sin embargo, si tienes datos desfasados existentes, necesitas corregirlos manualmente siguiendo los pasos anteriores.


