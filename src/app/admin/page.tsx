import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Store } from 'lucide-react'

export default function AdminPage() {
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
      </div>

      {/* Card de Bienvenida */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">✅ Panel de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              El sistema de gestión de tiendas multi-tenant está funcionando correctamente.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">🔧 Estado:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Sistema operativo</li>
                  <li>Base de datos conectada</li>
                  <li>API funcionando</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">📊 Métricas:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Tiendas registradas</li>
                  <li>Usuarios activos</li>
                  <li>Ventas consolidadas</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Tiendas */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Tiendas</CardTitle>
          <CardDescription>
            Administra todas las tiendas y usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Store className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Sistema en construcción
            </p>
            <p className="text-sm text-muted-foreground">
              Pronto se habilitará la gestión de tiendas
            </p>
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
