import { createClient } from "@/lib/supabaseServer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Database } from "lucide-react";

export default async function AdminPage() {
  // Conectamos a Supabase para obtener datos reales
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Bienvenido de nuevo, {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Tarjeta Usuario */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuario Actual</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{user?.email}</div>
            <p className="text-xs text-muted-foreground">
              ID: {user?.id.slice(0, 8)}...
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta Base de Datos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexión DB</CardTitle>
            <Database className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Conectada</div>
            <p className="text-xs text-muted-foreground">
              Supabase PostgreSQL
            </p>
          </CardContent>
        </Card>

      </div>
      
      {/* Área de contenido principal */}
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Gestión de Tiendas</h3>
        <p className="text-muted-foreground">
          Aquí irán las tablas de productos, ventas y configuración.
        </p>
      </div>
    </div>
  );
}
