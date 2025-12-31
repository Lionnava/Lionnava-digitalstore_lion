'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MoreHorizontal, X, CheckCircle, Store, Users, Calendar } from 'lucide-react'
import { useState } from 'react'

interface Tienda {
  id: string
  nombre: string
  email: string
  direccion: string | null
  telefono: string | null
  activa: boolean
  licenciaHasta: string
  createdAt: string
  usuarios?: UsuarioTienda[]
}

interface UsuarioTienda {
  id: string
  nombre: string
  email: string
  rol: string
  activo: boolean
}

interface PanelGestionTiendasProps {
  tiendas: Tienda[]
}

export default function PanelGestionTiendas({ tiendas }: PanelGestionTiendasProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const suspenderTienda = (tiendaId: string) => {
    if (!confirm('¿Estás seguro de SUSPENDER esta tienda? Los usuarios no podrán acceder.')) {
      return
    }
    setLoading(tiendaId)
    setTimeout(() => {
      alert('Función de suspender tienda no disponible (demo)')
      setLoading(null)
    }, 1000)
  }

  const activarTienda = (tiendaId: string) => {
    setLoading(tiendaId)
    setTimeout(() => {
      alert('Función de activar tienda no disponible (demo)')
      setLoading(null)
    }, 1000)
  }

  const renovarLicencia = (tiendaId: string) => {
    setLoading(tiendaId)
    setTimeout(() => {
      alert('Función de renovar licencia no disponible (demo)')
      setLoading(null)
    }, 1000)
  }

  const eliminarTienda = (tiendaId: string) => {
    if (!confirm('¿Estás seguro de ELIMINAR esta tienda? Todos los datos de la tienda serán ELIMINADOS permanentemente. Esta acción NO se puede deshacer.')) {
      return
    }
    setLoading(tiendaId)
    setTimeout(() => {
      alert('Función de eliminar tienda no disponible (demo)')
      setLoading(null)
    }, 1000)
  }

  const calcularDiasRestantes = (licenciaHasta: string) => {
    const fecha = new Date(licenciaHasta)
    const hoy = new Date()
    const dias = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return dias
  }

  if (!tiendas || tiendas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Store className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay tiendas registradas</h3>
        <p className="text-sm text-muted-foreground">
          Esperando a que la primera tienda se registre
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabla de Tiendas */}
      <div className="border rounded-md">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Tienda</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Usuarios</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Licencia</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tiendas.map((tienda) => {
              const diasRestantes = calcularDiasRestantes(tienda.licenciaHasta)
              const usuarios = tienda.usuarios?.length || 0

              return (
                <tr key={tienda.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{tienda.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        {tienda.direccion || 'Sin dirección'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tienda.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{usuarios}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {tienda.activa ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">Activa</Badge>
                    ) : (
                      <Badge className="bg-red-500 hover:bg-red-600 text-white">Suspendida</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {diasRestantes > 0 ? (
                            <span className="text-green-600">Vence en {diasRestantes} días</span>
                          ) : (
                            <span className="text-red-600">Vencida hace {-diasRestantes} días</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Botón para ver detalles */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalles de la Tienda</DialogTitle>
                            <DialogDescription>
                              Información completa de {tienda.nombre}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Información Principal */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Información Principal</CardTitle>
                                <CardDescription>
                                  Datos generales de la tienda
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div>
                                    <span className="font-medium">Nombre:</span> {tienda.nombre}
                                  </div>
                                  <div>
                                    <span className="font-medium">Email:</span> {tienda.email}
                                  </div>
                                  <div>
                                    <span className="font-medium">Dirección:</span> {tienda.direccion || 'Sin dirección'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Teléfono:</span> {tienda.telefono || 'Sin teléfono'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Estado:</span> {tienda.activa ? 'Activa' : 'Suspendida'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Licencia:</span> {diasRestantes > 0 ? `Vence en ${diasRestantes} días` : `Vencida hace ${-diasRestantes} días`}
                                  </div>
                                  <div>
                                    <span className="font-medium">Fecha de Registro:</span> {new Date(tienda.createdAt).toLocaleDateString('es-ES')}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Licencia */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Licencia</CardTitle>
                                <CardDescription>
                                  Información de la licencia
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div>
                                    <span className="font-medium">Estado de Licencia:</span> {diasRestantes > 0 ? 'Activa' : 'Vencida'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Días Restantes:</span> {diasRestantes > 0 ? diasRestantes : 0}
                                  </div>
                                  <div>
                                    <span className="font-medium">Fecha de Vencimiento:</span> {new Date(tienda.licenciaHasta).toLocaleDateString('es-ES')}
                                  </div>
                                  <div>
                                    <span className="font-medium">Fecha de Registro:</span> {new Date(tienda.createdAt).toLocaleDateString('es-ES')}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Usuarios de la Tienda */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Usuarios de la Tienda</CardTitle>
                                <CardDescription>
                                  {usuarios} usuario(s) registrado(s)
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                {usuarios === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    No hay usuarios registrados en esta tienda
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {tienda.usuarios?.map((usuario) => (
                                      <div key={usuario.id} className="flex items-center justify-between p-3 border rounded-md">
                                        <div>
                                          <div className="font-medium">{usuario.nombre}</div>
                                          <div className="text-sm text-muted-foreground">{usuario.email}</div>
                                        </div>
                                        <Badge>{usuario.rol}</Badge>
                                      </div>
                                    )) || (
                                      <p className="text-sm text-muted-foreground">
                                        Cargando usuarios...
                                      </p>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* Acciones */}
                            <div className="grid gap-4 md:grid-cols-2">
                              <Button
                                onClick={() => renovarLicencia(tienda.id)}
                                disabled={loading === tienda.id}
                                className="w-full"
                              >
                                {loading === tienda.id ? 'Procesando...' : 'Renovar Licencia (1 año)'}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => eliminarTienda(tienda.id)}
                                disabled={loading === tienda.id}
                                className="w-full"
                              >
                                {loading === tienda.id ? 'Procesando...' : 'Eliminar Tienda'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Botón para suspender */}
                      {tienda.activa ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => suspenderTienda(tienda.id)}
                            disabled={loading === tienda.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                      ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => activarTienda(tienda.id)}
                            disabled={loading === tienda.id}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
