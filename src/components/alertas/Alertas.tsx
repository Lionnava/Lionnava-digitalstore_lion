'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Bell, BellRing, Package, AlertTriangle, TrendingUp, ShoppingCart, CheckCircle2, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface Alerta {
  id: string
  tipo: string
  titulo: string
  mensaje: string
  productoId?: string
  producto?: {
    nombre: string
  }
  leida: boolean
  createdAt: string
}

interface AlertasProps {
  iconOnly?: boolean
}

export default function Alertas({ iconOnly }: AlertasProps = {}) {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlertas()
    const interval = setInterval(fetchAlertas, 30000) // Actualizar cada 30s
    return () => clearInterval(interval)
  }, [])

  const fetchAlertas = async () => {
    try {
      const response = await fetch('/api/alertas')
      if (response.ok) {
        const data = await response.json()
        setAlertas(data)
        setNoLeidas(data.filter((a: Alerta) => !a.leida).length)
      }
    } catch (error) {
      console.error('Error fetching alertas:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLeida = async (id: string) => {
    try {
      const response = await fetch(`/api/alertas/${id}/marcar-leida`, {
        method: 'PATCH'
      })

      if (response.ok) {
        setAlertas(prev => prev.map(a =>
          a.id === id ? { ...a, leida: true } : a
        ))
        setNoLeidas(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const marcarTodasComoLeidas = async () => {
    try {
      const response = await fetch('/api/alertas/marcar-todas-leidas', {
        method: 'PATCH'
      })

      if (response.ok) {
        setAlertas(prev => prev.map(a => ({ ...a, leida: true })))
        setNoLeidas(0)
        toast.success('Todas las alertas marcadas como leídas')
      }
    } catch (error) {
      console.error('Error marking all alerts as read:', error)
      toast.error('Error al marcar alertas como leídas')
    }
  }

  const eliminarAlerta = async (id: string) => {
    try {
      const response = await fetch(`/api/alertas/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAlertas(prev => prev.filter(a => a.id !== id))
        if (!alertas.find(a => a.id === id)?.leida) {
          setNoLeidas(prev => Math.max(0, prev - 1))
        }
        toast.success('Alerta eliminada')
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
      toast.error('Error al eliminar alerta')
    }
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'stock_bajo':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'vencimiento':
        return <Package className="h-4 w-4 text-red-500" />
      case 'venta_destacada':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'compra_requerida':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'stock_bajo':
        return 'secondary'
      case 'vencimiento':
        return 'destructive'
      case 'venta_destacada':
        return 'default'
      case 'compra_requerida':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (iconOnly) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {noLeidas > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {noLeidas}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Notificaciones
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {noLeidas > 0 && (
              <Button
                onClick={marcarTodasComoLeidas}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Cargando alertas...
                  </div>
                ) : alertas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay alertas</p>
                  </div>
                ) : (
                  alertas.map((alerta) => (
                    <Card key={alerta.id} className={!alerta.leida ? 'bg-accent' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getIcon(alerta.tipo)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{alerta.titulo}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {alerta.mensaje}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(alerta.createdAt).toLocaleString('es-ES')}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {!alerta.leida && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => marcarComoLeida(alerta.id)}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Leer
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => eliminarAlerta(alerta.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alertas</h2>
          <p className="text-muted-foreground">
            {noLeidas} {noLeidas === 1 ? 'alerta no leída' : 'alertas no leídas'}
          </p>
        </div>
        {noLeidas > 0 && (
          <Button onClick={marcarTodasComoLeidas} variant="outline">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Cargando alertas...
          </div>
        ) : alertas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay alertas</p>
            </CardContent>
          </Card>
        ) : (
          alertas.map((alerta) => (
            <Card key={alerta.id} className={!alerta.leida ? 'bg-accent border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getIcon(alerta.tipo)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{alerta.titulo}</p>
                          <Badge variant={getBadgeVariant(alerta.tipo)} className="text-xs">
                            {alerta.tipo.replace('_', ' ')}
                          </Badge>
                          {!alerta.leida && (
                            <Badge className="bg-primary">Nueva</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alerta.mensaje}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(alerta.createdAt).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => eliminarAlerta(alerta.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {!alerta.leida && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => marcarComoLeida(alerta.id)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Marcar como leída
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
