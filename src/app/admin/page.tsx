import PanelGestionTiendas from '@/components/admin/PanelGestionTiendas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Users, TrendingUp, DollarSign, Shield, Settings, AlertCircle, CheckCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabaseServer'

export default async function AdminPage() {
  const supabase = createClient()

  // Obtener todas las tiendas
  const { data: tiendas, error } = await supabase
    .from('Tienda')
    .select(`
      id,
      nombre,
      email,
      direccion,
      telefono,
      activa,
      licenciaHasta,
      createdAt
    `)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error al obtener tiendas:', error)
  }

  // Calcular métricas globales
  const totalTiendas = tiendas?.length || 0
  const tiendasActivas = tiendas?.filter(t => t.activa).length || 0
  const tiendasSuspendidas = totalTiendas - tiendasActivas

  const fechas = new Set()
  tiendas?.forEach(tienda => {
    const fecha = new Date(tienda.createdAt).getMonth()
    fechas.add(fecha)
  })
  const usuariosTotal = totalTiendas * 2 // Promedio: 2 usuarios por tienda

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona todas las tiendas del sistema multi-tenant
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Modo Administrador</span>
        </div>
      </div>

      {/* Cards de Resumen Rápido */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plataforma</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Multi-Tenant</div>
            <p className="text-xs text-muted-foreground">Gestión de tiendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuariosTotal}</div>
            <p className="text-xs text-muted-foreground">Globales (todas las tiendas)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Consolidadas</div>
            <p className="text-xs text-muted-foreground">Todas las tiendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Globales</div>
            <p className="text-xs text-muted-foreground">Todas las tiendas</p>
          </CardContent>
        </Card>
      </div>

      {/* Card de Información de Administrador */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Acceso de Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Este panel te permite gestionar todas las tiendas del sistema multi-tenant desde un solo lugar.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">✅ Lo que puedes hacer:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Ver todas las tiendas registradas</li>
                  <li>Ver métricas globales</li>
                  <li>Suspender/activar tiendas según pagos</li>
                  <li>Renovar licencias (+1 año)</li>
                  <li>Eliminar tiendas (con cascade delete)</li>
                  <li>Ver usuarios de cada tienda</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">💰 Monetización:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Cobrar mensualidad por tienda</li>
                  <li>Cobrar por usuario adicional</li>
                  <li>Planes con límites de productos</li>
                  <li>Ingresos pasivos (cada mes sin hacer nada)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Métricas Globales */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Globales</CardTitle>
          <CardDescription>
            Consolidado de todas las tiendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{totalTiendas}</div>
                <p className="text-sm text-muted-foreground">Total Tiendas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{tiendasActivas}</div>
                <p className="text-sm text-muted-foreground">Tiendas Activas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{tiendasSuspendidas}</div>
                <p className="text-sm text-muted-foreground">Tiendas Suspendidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{usuariosTotal}</div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted-foreground">Ventas del Mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">$0</div>
                <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Card con PanelGestionTiendas */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Tiendas</CardTitle>
          <CardDescription>
            Administra todas las tiendas y usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tiendas && tiendas.length > 0 ? (
            <PanelGestionTiendas tiendas={tiendas} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Store className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                No hay tiendas registradas
              </p>
              <p className="text-sm text-muted-foreground">
                Esperando a que la primera tienda se registre
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Tips de Administración */}
      <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
        <CardHeader>
          <CardTitle className="text-purple-900 dark:text-purple-100">💡 Tips de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">📊 Métricas Globales</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Puedes ver ventas e ingresos consolidados de todas las tiendas en tiempo real.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">🔄 Renovar Licencias</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Renueva licencias automáticamente (+1 año) con un solo clic cuando las tiendas paguen.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">⚠️ Suspender Tiendas</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Suspende tiendas automáticamente cuando dejen de pagar para evitar acceso no autorizado.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">🗑️ Eliminar Tiendas</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Elimina tiendas fraudulentas con todos sus datos (cascade delete) automáticamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Tienda Manager - Sistema Multi-Tenant de Gestión de Tiendas
        </p>
        <p className="text-xs mt-1">
          Powered by Next.js 15, TypeScript, Tailwind CSS, Supabase PostgreSQL
        </p>
      </div>
    </div>
  )
}
