# 🗄️ Migración de Google Sheets a MongoDB

## 📊 Análisis de la Estructura Actual

### Datos Almacenados en Google Sheets

#### 1. **Usuarios** (Hoja "Usuarios")
```
- Fecha_Registro: Date
- Email: string (único, índice)
- Nombre: string
- Imagen: string (URL)
- Es_Premium: boolean
- País: string (opcional)
- Password_Hash: string (bcrypt)
```

#### 2. **Actividades** (Hoja "Actividades")
```
- Timestamp: Date
- Email_Usuario: string (referencia a Usuario)
- Nombre_Bebé: string
- Tipo_Actividad: string ('esfinteres', 'crecimiento', 'sueño', etc.)
- Detalles_JSON: string (JSON parseado)
```

#### 3. **Familias** (Hoja "Familias")
```
- FamilyID: string (único)
- UserEmail: string (referencia a Usuario)
- BabyName: string
- IsOwner: boolean
- Role: string (opcional)
- BirthDate: Date (opcional)
```

## 🎯 Ventajas de Migrar a MongoDB

### ✅ Ventajas

1. **Rendimiento**
   - Consultas más rápidas con índices
   - Mejor para grandes volúmenes de datos
   - Soporte nativo para agregaciones complejas

2. **Escalabilidad**
   - Mejor manejo de crecimiento de datos
   - Replicación y sharding nativos
   - Sin límites de filas como en Sheets

3. **Funcionalidades**
   - Transacciones ACID
   - Validación de esquemas con Mongoose
   - Consultas más complejas (aggregation pipeline)
   - Mejor soporte para relaciones (referencias/embebidos)

4. **Mantenimiento**
   - No depende de proyectos de Google Cloud
   - Mejor para producción
   - Herramientas de monitoreo y backup

5. **Desarrollo**
   - Tipado fuerte con TypeScript
   - Mejor debugging
   - Migraciones versionadas

### ❌ Desventajas

1. **Complejidad**
   - Requiere servidor de base de datos
   - Configuración adicional
   - Curva de aprendizaje

2. **Costos**
   - Hosting de MongoDB (Atlas o servidor propio)
   - Posibles costos adicionales

3. **Migración**
   - Necesita script de migración de datos
   - Tiempo de desarrollo
   - Testing exhaustivo

## 📋 Plan de Migración

### Fase 1: Preparación

#### 1.1 Instalar Dependencias

```bash
npm install mongoose
npm install --save-dev @types/mongoose
```

#### 1.2 Configurar MongoDB

**Opción A: MongoDB Atlas (Recomendado para producción)**
- Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Crear cluster gratuito (M0)
- Obtener connection string

**Opción B: MongoDB Local**
- Instalar MongoDB localmente
- Connection string: `mongodb://localhost:27017/pequediario`

#### 1.3 Variables de Entorno

Agregar a `.env.local`:
```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/pequediario?retryWrites=true&w=majority
# O para local:
# MONGODB_URI=mongodb://localhost:27017/pequediario
```

### Fase 2: Crear Modelos Mongoose

#### 2.1 Estructura de Modelos

```typescript
// lib/models/User.ts
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  isPremium: { type: Boolean, default: false, index: true },
  country: { type: String, default: '' },
  passwordHash: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
```

```typescript
// lib/models/Activity.ts
import mongoose from 'mongoose'

const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userEmail: { type: String, required: true, index: true }, // Para compatibilidad durante migración
  babyName: { type: String, required: true },
  activityType: { type: String, required: true, index: true },
  details: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Date, required: true, default: Date.now, index: true }
}, {
  timestamps: true
})

// Índice compuesto para consultas frecuentes
ActivitySchema.index({ userId: 1, timestamp: -1 })
ActivitySchema.index({ userEmail: 1, timestamp: -1 })

export const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema)
```

```typescript
// lib/models/Family.ts
import mongoose from 'mongoose'

const FamilySchema = new mongoose.Schema({
  familyId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true, index: true },
  babyName: { type: String, required: true },
  isOwner: { type: Boolean, required: true, default: false },
  role: { type: String, default: '' },
  birthDate: { type: Date, default: null }
}, {
  timestamps: true
})

// Índice compuesto para búsquedas por familia
FamilySchema.index({ familyId: 1, userEmail: 1 })

export const Family = mongoose.models.Family || mongoose.model('Family', FamilySchema)
```

### Fase 3: Crear Servicio MongoDB

#### 3.1 Conexión a MongoDB

```typescript
// lib/mongodb.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Por favor define MONGODB_URI en las variables de entorno')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
```

#### 3.2 Servicio MongoDB (Reemplazo de GoogleSheetsService)

```typescript
// lib/mongodbService.ts
import connectDB from './mongodb'
import { User } from './models/User'
import { Activity } from './models/Activity'
import { Family } from './models/Family'
import bcrypt from 'bcryptjs'

export class MongoDBService {
  // ========== USUARIOS ==========
  
  static async saveUser(userData: {
    email: string
    name: string
    image?: string
    isPremium?: boolean
    password?: string
  }) {
    try {
      await connectDB()
      
      const hashedPassword = userData.password 
        ? await bcrypt.hash(userData.password, 10)
        : ''

      const user = new User({
        email: userData.email,
        name: userData.name,
        image: userData.image || '',
        isPremium: userData.isPremium || false,
        passwordHash: hashedPassword,
      })

      await user.save()
      return { success: true }
    } catch (error: any) {
      if (error.code === 11000) {
        // Usuario ya existe
        return { success: false, error: 'Usuario ya existe' }
      }
      console.error('Error guardando usuario:', error)
      return { success: false, error }
    }
  }

  static async getUserByEmail(email: string) {
    try {
      await connectDB()
      const user = await User.findOne({ email })
      
      if (!user) {
        return { exists: false, isPremium: false }
      }

      return {
        exists: true,
        isPremium: user.isPremium,
        name: user.name,
        image: user.image,
        passwordHash: user.passwordHash,
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      return { exists: false, isPremium: false }
    }
  }

  static async updateUser(userData: {
    email: string
    name?: string
    image?: string
    isPremium?: boolean
  }) {
    try {
      await connectDB()
      const user = await User.findOneAndUpdate(
        { email: userData.email },
        { 
          ...userData,
          updatedAt: new Date()
        },
        { new: true }
      )

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      return { success: false, error }
    }
  }

  static async upgradeToPremium(email: string) {
    try {
      await connectDB()
      const user = await User.findOneAndUpdate(
        { email },
        { isPremium: true, updatedAt: new Date() },
        { new: true }
      )

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error actualizando a Premium:', error)
      return { success: false, error }
    }
  }

  // ========== ACTIVIDADES ==========

  static async saveActivity(activityData: {
    userEmail: string
    babyName: string
    activityType: string
    details: any
    timestamp?: Date
  }) {
    try {
      await connectDB()
      
      // Obtener userId del usuario
      const user = await User.findOne({ email: activityData.userEmail })
      if (!user) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      const activity = new Activity({
        userId: user._id,
        userEmail: activityData.userEmail,
        babyName: activityData.babyName,
        activityType: activityData.activityType,
        details: activityData.details,
        timestamp: activityData.timestamp || new Date(),
      })

      await activity.save()
      return { success: true }
    } catch (error) {
      console.error('Error guardando actividad:', error)
      return { success: false, error }
    }
  }

  static async getActivities(userEmail: string, filters?: {
    activityType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }) {
    try {
      await connectDB()
      
      const query: any = { userEmail }
      
      if (filters?.activityType) {
        query.activityType = filters.activityType
      }
      
      if (filters?.startDate || filters?.endDate) {
        query.timestamp = {}
        if (filters.startDate) query.timestamp.$gte = filters.startDate
        if (filters.endDate) query.timestamp.$lte = filters.endDate
      }

      const activities = await Activity.find(query)
        .sort({ timestamp: -1 })
        .limit(filters?.limit || 1000)
        .lean()

      return { success: true, activities }
    } catch (error) {
      console.error('Error obteniendo actividades:', error)
      return { success: false, activities: [] }
    }
  }

  // ========== FAMILIAS ==========

  static async createFamily(userEmail: string, babyName: string) {
    try {
      await connectDB()
      
      const user = await User.findOne({ email: userEmail })
      if (!user) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      const familyId = `family-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const family = new Family({
        familyId,
        userId: user._id,
        userEmail,
        babyName,
        isOwner: true,
      })

      await family.save()
      return { success: true, familyId }
    } catch (error) {
      console.error('Error creando familia:', error)
      return { success: false, error }
    }
  }

  static async getFamilyInfo(userEmail: string) {
    try {
      await connectDB()
      
      const family = await Family.findOne({ userEmail })
      
      if (!family) {
        return { familyId: null, babyName: null }
      }

      return {
        familyId: family.familyId,
        babyName: family.babyName,
      }
    } catch (error) {
      console.error('Error obteniendo información de familia:', error)
      return { familyId: null, babyName: null }
    }
  }

  static async updateBabyName(userEmail: string, babyName: string) {
    try {
      await connectDB()
      
      const family = await Family.findOne({ userEmail })
      if (!family) {
        return { success: false, error: 'Familia no encontrada' }
      }

      // Actualizar en todos los miembros de la familia
      await Family.updateMany(
        { familyId: family.familyId },
        { babyName, updatedAt: new Date() }
      )

      return { success: true }
    } catch (error) {
      console.error('Error actualizando nombre del bebé:', error)
      return { success: false, error }
    }
  }
}
```

### Fase 4: Script de Migración

```typescript
// scripts/migrate-to-mongodb.ts
import { GoogleSheetsService } from '../lib/googleSheets'
import { MongoDBService } from '../lib/mongodbService'
import connectDB from '../lib/mongodb'

async function migrate() {
  try {
    console.log('Conectando a MongoDB...')
    await connectDB()
    
    console.log('Migrando usuarios...')
    // Leer usuarios de Google Sheets y guardar en MongoDB
    // (Implementar lógica de lectura desde Sheets)
    
    console.log('Migrando actividades...')
    // Leer actividades de Google Sheets y guardar en MongoDB
    
    console.log('Migrando familias...')
    // Leer familias de Google Sheets y guardar en MongoDB
    
    console.log('Migración completada!')
  } catch (error) {
    console.error('Error en migración:', error)
  }
}

migrate()
```

### Fase 5: Actualizar Código Existente

#### 5.1 Reemplazar Imports

Buscar y reemplazar en todo el código:
```typescript
// Antes
import { GoogleSheetsService } from '@/lib/googleSheets'

// Después
import { MongoDBService } from '@/lib/mongodbService'
```

#### 5.2 Actualizar Llamadas

```typescript
// Antes
await GoogleSheetsService.saveUser(userData)

// Después
await MongoDBService.saveUser(userData)
```

### Fase 6: Testing

1. **Testing Unitario**
   - Probar cada método del servicio
   - Verificar validaciones
   - Probar casos de error

2. **Testing de Integración**
   - Probar flujos completos
   - Verificar que los datos se guarden correctamente
   - Probar consultas complejas

3. **Testing de Migración**
   - Verificar que todos los datos se migren
   - Comparar conteos
   - Validar integridad de datos

## 🔄 Estrategia de Migración Gradual

### Opción 1: Migración Completa (Big Bang)
- Migrar todo de una vez
- Más rápido pero más riesgoso
- Requiere downtime

### Opción 2: Migración Dual-Write (Recomendado)
1. Mantener ambos sistemas funcionando
2. Escribir en ambos (Sheets y MongoDB)
3. Leer desde MongoDB
4. Una vez validado, dejar de escribir en Sheets
5. Migrar datos históricos
6. Eliminar código de Sheets

### Opción 3: Migración por Feature
1. Migrar usuarios primero
2. Migrar actividades después
3. Migrar familias al final
4. Validar cada paso antes de continuar

## 📝 Checklist de Migración

### Pre-Migración
- [ ] Instalar MongoDB y Mongoose
- [ ] Configurar MongoDB Atlas o servidor local
- [ ] Crear modelos Mongoose
- [ ] Crear servicio MongoDBService
- [ ] Escribir tests unitarios

### Migración
- [ ] Crear script de migración de datos
- [ ] Ejecutar migración en ambiente de desarrollo
- [ ] Validar integridad de datos
- [ ] Actualizar código para usar MongoDBService
- [ ] Testing exhaustivo

### Post-Migración
- [ ] Actualizar documentación
- [ ] Configurar backups de MongoDB
- [ ] Configurar monitoreo
- [ ] Eliminar código de Google Sheets (opcional)
- [ ] Actualizar variables de entorno en producción

## ⚠️ Consideraciones Importantes

### 1. Índices
Asegúrate de crear índices para:
- `email` en Users (único)
- `userEmail` y `timestamp` en Activities
- `familyId` en Families
- `isPremium` en Users (para consultas Premium)

### 2. Validaciones
- Usar Mongoose validators
- Validar emails únicos
- Validar tipos de datos

### 3. Relaciones
- Usar `ObjectId` para referencias
- Considerar usar `populate()` para joins
- O mantener `userEmail` para compatibilidad

### 4. Performance
- Usar `lean()` para consultas de solo lectura
- Implementar paginación
- Usar agregaciones para reportes complejos

### 5. Seguridad
- Validar inputs
- Sanitizar datos
- Usar prepared statements (Mongoose lo hace automáticamente)

## 💰 Servicios y Pricing de MongoDB

### MongoDB Atlas (Recomendado - Servicio Cloud Oficial)

MongoDB Atlas es el servicio cloud oficial de MongoDB, disponible en AWS, Azure y Google Cloud.

#### Planes Disponibles

##### 1. **Free Tier (M0)** - GRATIS
- **Storage**: 512 MB
- **RAM**: Compartida
- **vCPU**: Compartida
- **Ideal para**: Desarrollo, pruebas, proyectos pequeños
- **Limitaciones**: 
  - Solo 1 cluster
  - Sin backups automáticos (solo snapshots manuales)
  - Sin soporte premium
- **Perfecto para**: Empezar, desarrollo local, MVP

##### 2. **Shared (M2/M5)** - Desde $9/mes
- **M2**: 
  - Storage: 2 GB
  - RAM: Compartida
  - Precio: ~$9/mes
- **M5**:
  - Storage: 5 GB
  - RAM: Compartida
  - Precio: ~$25/mes
- **Ideal para**: Aplicaciones pequeñas-medianas en producción
- **Incluye**: Backups automáticos, soporte básico

##### 3. **Dedicated (M10+)** - Desde ~$57/mes
- **M10**:
  - Storage: 10 GB
  - RAM: 2 GB dedicada
  - vCPU: 2 dedicados
  - Precio: ~$57/mes
- **M20**:
  - Storage: 20 GB
  - RAM: 4 GB dedicada
  - vCPU: 4 dedicados
  - Precio: ~$120/mes
- **M30+**: Hasta 768 GB RAM, 4 TB storage
- **Ideal para**: Producción, alta carga, aplicaciones empresariales
- **Incluye**: 
  - Replicación automática (3 nodos)
  - Backups automáticos
  - Soporte 24/7
  - Alertas y monitoreo avanzado

#### Características Adicionales (Pueden tener costo extra)

- **Backups Automáticos**: Incluido en planes M10+
- **Data Transfer**: Primeros 100 GB/mes gratis, luego $0.10/GB
- **Storage Adicional**: $0.25/GB/mes
- **MongoDB Charts**: Gratis hasta 5 usuarios
- **MongoDB Realm**: Incluido en todos los planes

#### Estimación de Costos para Peque Diario

**Escenario 1: Desarrollo/Pruebas**
- **Plan**: Free Tier (M0)
- **Costo**: $0/mes
- **Adecuado para**: Hasta ~1000 usuarios, desarrollo

**Escenario 2: Producción Pequeña**
- **Plan**: M2 Shared
- **Costo**: ~$9/mes
- **Adecuado para**: Hasta ~10,000 usuarios activos

**Escenario 3: Producción Mediana**
- **Plan**: M10 Dedicated
- **Costo**: ~$57/mes
- **Adecuado para**: Hasta ~100,000 usuarios activos

**Escenario 4: Producción Grande**
- **Plan**: M30+ Dedicated
- **Costo**: Desde ~$300/mes
- **Adecuado para**: Cientos de miles de usuarios

### Alternativas a MongoDB Atlas

#### 1. **MongoDB Local (Self-Hosted)**
- **Costo**: Gratis (solo costo del servidor)
- **Ventajas**: Control total, sin límites
- **Desventajas**: 
  - Necesitas administrar el servidor
  - Configurar backups manualmente
  - Mantenimiento y actualizaciones
- **Ideal para**: Si ya tienes infraestructura propia

#### 2. **Amazon DocumentDB**
- **Compatibilidad**: Compatible con MongoDB API
- **Precio**: Desde ~$200/mes (instancia db.t3.medium)
- **Ventajas**: Integración con AWS
- **Desventajas**: Más caro, no es MongoDB real

#### 3. **Azure Cosmos DB (MongoDB API)**
- **Compatibilidad**: Compatible con MongoDB API
- **Precio**: Desde ~$25/mes (400 RU/s)
- **Ventajas**: Integración con Azure
- **Desventajas**: Pricing complejo basado en RU/s

#### 4. **Servicios de Terceros**

**Arsys (España)**
- MongoDB Playground: 26€/mes (2 GB RAM, 50 GB storage)
- MongoDB Business: Hasta 1,778€/mes

**IONOS Cloud**
- Desde 51€/mes (2 vCPU, 4 GB RAM, 80 GB storage)

### Comparación de Opciones

| Opción | Precio/mes | Storage | RAM | Mejor Para |
|--------|-----------|---------|-----|------------|
| **MongoDB Atlas M0** | $0 | 512 MB | Compartida | Desarrollo |
| **MongoDB Atlas M2** | $9 | 2 GB | Compartida | Producción pequeña |
| **MongoDB Atlas M10** | $57 | 10 GB | 2 GB | Producción mediana |
| **MongoDB Local** | $0* | Ilimitado | Depende | Si tienes servidor |
| **DocumentDB** | $200+ | Variable | Variable | Si usas AWS |
| **Cosmos DB** | $25+ | Variable | Variable | Si usas Azure |

*Solo costo del servidor/hosting

### Recomendación para Peque Diario

#### Fase 1: Desarrollo (Ahora)
- **Plan**: MongoDB Atlas M0 (Free)
- **Costo**: $0/mes
- **Razón**: Suficiente para desarrollo y pruebas iniciales

#### Fase 2: Producción Inicial
- **Plan**: MongoDB Atlas M2
- **Costo**: ~$9/mes
- **Razón**: 
  - Suficiente para primeros usuarios
  - Backups automáticos
  - Fácil escalar después

#### Fase 3: Crecimiento
- **Plan**: MongoDB Atlas M10
- **Costo**: ~$57/mes
- **Razón**: 
  - Replicación automática (alta disponibilidad)
  - Mejor rendimiento
  - Soporte incluido

#### Fase 4: Escala
- **Plan**: MongoDB Atlas M30+
- **Costo**: Desde ~$300/mes
- **Razón**: Para cientos de miles de usuarios

### Costos Adicionales a Considerar

1. **Data Transfer**: Primeros 100 GB/mes gratis
2. **Backups**: Incluido en M10+, extra en M2/M5
3. **Storage Extra**: $0.25/GB/mes si excedes el plan
4. **Soporte Premium**: Desde $100/mes (opcional)

### Tips para Optimizar Costos

1. **Empezar con Free Tier**: Perfecto para desarrollo
2. **Monitorear Uso**: Usar métricas de Atlas para optimizar
3. **Índices Eficientes**: Reducen uso de RAM y storage
4. **Archivar Datos Antiguos**: Mover a storage más barato
5. **Usar Compresión**: MongoDB comprime datos automáticamente

### Enlaces Útiles

- [MongoDB Atlas Pricing](https://www.mongodb.com/pricing)
- [MongoDB Atlas Calculator](https://www.mongodb.com/pricing/calculator)
- [MongoDB Free Tier](https://www.mongodb.com/cloud/atlas/register)

## 🚀 Próximos Pasos

1. **Decidir estrategia de migración** (dual-write recomendado)
2. **Configurar MongoDB** (Atlas o local)
3. **Crear modelos y servicio** (usar código de ejemplo)
4. **Implementar migración gradual**
5. **Testing exhaustivo**
6. **Deploy a producción**

## 📚 Recursos

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Next.js + MongoDB](https://nextjs.org/docs/api-routes/introduction)

