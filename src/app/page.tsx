'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Package, ShoppingBasket, Bell, BarChart3, FileText } from 'lucide-react'
import Dashboard from '@/components/dashboard/Dashboard'
import Inventario from '@/components/inventario/Inventario'
import Ventas from '@/components/ventas/Ventas'
import Compras from '@/components/compras/Compras'
import Alertas from '@/components/alertas/Alertas'
import Reportes from '@/components/reportes/Reportes'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Tienda Manager</h1>
            </div>
            <Alertas iconOnly />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-auto mb-4">
            <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="inventario" className="flex flex-col gap-1 py-2">
              <Package className="h-4 w-4" />
              <span className="text-xs">Inventario</span>
            </TabsTrigger>
            <TabsTrigger value="ventas" className="flex flex-col gap-1 py-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs">Ventas</span>
            </TabsTrigger>
            <TabsTrigger value="compras" className="flex flex-col gap-1 py-2">
              <ShoppingBasket className="h-4 w-4" />
              <span className="text-xs">Compras</span>
            </TabsTrigger>
            <TabsTrigger value="reportes" className="flex flex-col gap-1 py-2">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Reportes</span>
            </TabsTrigger>
            <TabsTrigger value="alertas" className="flex flex-col gap-1 py-2">
              <Bell className="h-4 w-4" />
              <span className="text-xs">Alertas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <Dashboard />
          </TabsContent>

          <TabsContent value="inventario" className="mt-0">
            <Inventario />
          </TabsContent>

          <TabsContent value="ventas" className="mt-0">
            <Ventas />
          </TabsContent>

          <TabsContent value="compras" className="mt-0">
            <Compras />
          </TabsContent>

          <TabsContent value="reportes" className="mt-0">
            <Reportes />
          </TabsContent>

          <TabsContent value="alertas" className="mt-0">
            <Alertas />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
