# Guía de Despliegue en Múltiples Dispositivos con Gestión Remota

## 🎯 Arquitectura Recomendada

### Opción 1: Aplicación Web Multi-Tenant (Recomendada)

Esta opción permite que una sola instancia de la aplicación gestione múltiples tiendas de forma centralizada.

#### Estructura:
```
┌─────────────────────────────────────────┐
│   Servidor Central (Cloud)            │
│   - Base de datos compartida          │
│   - Sistema de autenticación          │
│   - API centralizada                  │
└─────────────────────────────────────────┘
         ▲         ▲         ▲
         │         │         │
    ┌────┴─┐  ┌──┴───┐  ┌─┴────┐
    │Tienda │  │Tienda │  │Tienda │
    │  A    │  │   B   │  │   C   │
    └───────┘  └───────┘  └──────┘
```

### Opción 2: Instalaciones Independientes con Panel de Gestión Central

Cada dispositivo tiene su propia base de datos local (SQLite) y se sincroniza con un panel central.

#### Estructura:
```
┌─────────────────────────────────────────┐
│   Panel de Gestión Remota              │
│   - Registro de dispositivos           │
│   - Estado de cada tienda             │
│   - Actualizaciones de software       │
│   - Estadísticas consolidadas         │
└─────────────────────────────────────────┘
         ▲         ▲         ▲
         │         │         │
    ┌────┴─┐  ┌──┴───┐  ┌─┴────┐
    │Local  │  │Local  │  │Local │
    │ DB    │  │  DB   │  │  DB  │
    └───────┘  └───────┘  └──────┘
```

---

## 🚀 Implementación de la Opción 1 (Multi-Tenant)

### Paso 1: Modificar el esquema de base de datos

Necesitamos agregar un modelo de `Tienda` y modificar los modelos existentes:

```prisma
model Tienda {
  id          String   @id @default(cuid())
  nombre      String
  direccion   String?
  telefono    String?
  email       String?
  activa      Boolean  @default(true)
  licenciaHasta DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  productos   Producto[]
  ventas      Venta[]
  compras     Compra[]
  usuarios    UsuarioTienda[]
}

model UsuarioTienda {
  id         String   @id @default(cuid())
  tiendaId   String
  nombre     String
  email      String   @unique
  password   String
  rol        String   // 'admin', 'cajero', 'empleado'
  activo     Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  tienda     Tienda   @relation(fields: [tiendaId], references: [id], onDelete: Cascade)
}
```

### Paso 2: Desplegar en Vercel (Opción Gratuita)

```bash
# Instalar Vercel CLI
bun install -g vercel

# Desplegar
vercel
```

### Paso 3: Configurar Base de Datos PostgreSQL (Para producción)

Para múltiples dispositivos, PostgreSQL es mejor que SQLite.

```bash
# Usar Supabase o Neon (Ambos tienen tier gratuito)
# 1. Crear cuenta en https://supabase.com o https://neon.tech
# 2. Crear una base de datos PostgreSQL
# 3. Obtener la URL de conexión
# 4. Actualizar el archivo .env:

DATABASE_URL="postgresql://usuario:password@host:5432/database"
```

### Paso 4: Crear Sistema de Autenticación

Instalar NextAuth.js:

```bash
bun add next-auth @auth/prisma-adapter
```

Configurar en `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        const usuario = await db.usuarioTienda.findUnique({
          where: { email: credentials?.email },
          include: { tienda: true }
        })

        if (usuario && usuario.activo && usuario.tienda.activa) {
          // Verificar contraseña (usar bcrypt)
          return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.nombre,
            role: usuario.rol,
            tiendaId: usuario.tiendaId
          }
        }
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.tiendaId = user.tiendaId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.tiendaId = token.tiendaId
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

---

## 🔧 Panel de Gestión Remota (Dashboard Admin)

Crear un nuevo componente para administración:

### Archivo: `src/app/admin/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Tienda {
  id: string
  nombre: string
  direccion?: string
  activa: boolean
  licenciaHasta: string
  usuarios: { id: string }[]
  productos: { id: string }[]
}

export default function AdminPanel() {
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTiendas()
  }, [])

  const fetchTiendas = async () => {
    // Solo accesible para administradores globales
    const response = await fetch('/api/admin/tiendas')
    if (response.ok) {
      const data = await response.json()
      setTiendas(data)
    }
    setLoading(false)
  }

  const suspenderTienda = async (tiendaId: string) => {
    if (!confirm('¿Suspender esta tienda?')) return

    await fetch(`/api/admin/tiendas/${tiendaId}/suspender`, {
      method: 'PATCH'
    })
    fetchTiendas()
  }

  const activarTienda = async (tiendaId: string) => {
    await fetch(`/api/admin/tiendas/${tiendaId}/activar`, {
      method: 'PATCH'
    })
    fetchTiendas()
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de Gestión Remota</h1>
        <p className="text-muted-foreground">Administra todas las tiendas</p>
      </div>

      <div className="grid gap-4">
        {tiendas.map((tienda) => (
          <Card key={tienda.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tienda.nombre}</CardTitle>
                <Badge variant={tienda.activa ? 'default' : 'destructive'}>
                  {tienda.activa ? 'Activa' : 'Suspendida'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Dirección:</strong> {tienda.direccion || 'No especificada'}</p>
                <p><strong>Usuarios:</strong> {tienda.usuarios.length}</p>
                <p><strong>Productos:</strong> {tienda.productos.length}</p>
                <p><strong>Licencia hasta:</strong> {new Date(tienda.licenciaHasta).toLocaleDateString()}</p>

                <div className="flex gap-2 mt-4">
                  {tienda.activa ? (
                    <Button
                      variant="destructive"
                      onClick={() => suspenderTienda(tienda.id)}
                    >
                      Suspender Tienda
                    </Button>
                  ) : (
                    <Button
                      onClick={() => activarTienda(tienda.id)}
                    >
                      Activar Tienda
                    </Button>
                  )}
                  <Button variant="outline">
                    Ver Estadísticas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## 📱 Instalación en Dispositivos

### Para cada tienda:

1. **Crear un usuario y asignar a una tienda** (desde el panel admin)
2. **Proporcionar la URL de la aplicación** (ej: https://tiendamanager.vercel.app)
3. **El usuario inicia sesión** con sus credenciales
4. **El sistema filtra automáticamente los datos por tienda**

### Alternativa: Aplicación Mobile (PWA)

Convertir la aplicación en una PWA (Progressive Web App):

1. Crear `public/manifest.json`:

```json
{
  "name": "Tienda Manager",
  "short_name": "Tienda",
  "description": "Gestión de tiendas de barrio",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. Agregar al layout:

```typescript
import './manifest.json'
```

3. Instalar la aplicación desde el navegador:
   - Chrome/Edge: Click en "Instalar" en la barra de dirección
   - Safari: Compartir → "Agregar a inicio"

---

## 🔐 Seguridad y Control de Licencias

### Validación de licencia en el backend:

Crear `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Verificar token con el servidor de licencias
  const response = await fetch('https://tu-servidor-licencias.com/verify', {
    method: 'POST',
    body: JSON.stringify({ token })
  })

  const result = await response.json()

  if (!result.valid) {
    return NextResponse.json({ error: 'Licencia inválida o expirada' }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

---

## 📊 Sincronización de Datos (Opción 2)

Para la opción de bases de datos locales con sincronización:

### API de Sincronización:

```typescript
// src/app/api/sync/pull/route.ts
export async function GET(request: Request) {
  const tiendaId = request.headers.get('x-tienda-id')
  const lastSync = request.headers.get('x-last-sync')

  // Obtener cambios desde la última sincronización
  const cambios = await db.cambio.findMany({
    where: {
      tiendaId,
      createdAt: { gte: new Date(lastSync) }
    }
  })

  return NextResponse.json(cambios)
}

// src/app/api/sync/push/route.ts
export async function POST(request: Request) {
  const cambios = await request.json()

  // Procesar cambios del dispositivo local
  for (const cambio of cambios) {
    await procesarCambio(cambio)
  }

  return NextResponse.json({ success: true })
}
```

---

## 🔄 Actualizaciones Automáticas

### Detectar actualizaciones:

```typescript
// Agregar al componente principal
useEffect(() => {
  const checkUpdates = async () => {
    const response = await fetch('/api/version')
    const { currentVersion, latestVersion } = await response.json()

    if (currentVersion !== latestVersion) {
      toast.success('Nueva versión disponible. Recarga la página.')
    }
  }

  checkUpdates()
  const interval = setInterval(checkUpdates, 300000) // Cada 5 minutos
  return () => clearInterval(interval)
}, [])
```

---

## 📋 Checklist de Implementación

### Opción 1 (Recomendada - Multi-Tenant Web):
- [ ] Actualizar esquema de Prisma con modelo Tienda y UsuarioTienda
- [ ] Configurar base de datos PostgreSQL (Supabase/Neon)
- [ ] Implementar NextAuth.js para autenticación
- [ ] Modificar todas las APIs para filtrar por tiendaId
- [ ] Crear panel de administración remota
- [ ] Desplegar en Vercel o similar

### Opción 2 (Local + Panel Central):
- [ ] Crear sistema de cambios para sincronización
- [ ] Implementar API de pull/push
- [ ] Crear panel de gestión remota
- [ ] Configurar servicio central para licencias
- [ ] Empaquetar aplicación para instalación local

---

## 💰 Costos Estimados

### Opción 1 (Multi-Tenant Web):
- **Vercel**: Gratis hasta cierto límite, luego $20-40/mes
- **Supabase PostgreSQL**: Gratis hasta 500MB, luego ~$25/mes
- **Total**: $0-65/mes dependiendo del uso

### Opción 2 (Local + Panel Central):
- **Servidor para panel**: $5-10/mes (DigitalOcean, AWS Lightsail)
- **Total**: $5-10/mes

---

## 🎓 Recursos Adicionales

- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **NextAuth.js**: https://next-auth.js.org
- **Prisma**: https://www.prisma.io/docs

---

¿Necesitas que implemente alguna de estas opciones específicamente?
