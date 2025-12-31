# 📚 Persistencia de Datos - Preguntas Frecuentes

## ❓ Si cierro la sesión o hay un apagón, ¿se pierden los datos?

### ✅ RESPUESTA: **NO, los datos guardados NO se pierden**

---

## 🗄️ Qué Datos Se Guardan Permanentemente (en SQLite):

Estos datos se guardan en el archivo `db/custom.db` y **NO se pierden** nunca:

- ✅ **Todos los productos** del inventario
- ✅ **Todas las ventas** realizadas
- ✅ **Todas las compras** registradas
- ✅ **Todas las alertas** creadas
- ✅ **Todas las configuraciones** de productos

Estos datos persisten incluso si:
- Apagas la computadora
- Tienes un corte de energía
- Cierras el navegador
- Reinicias el sistema
- Desinstalas el navegador

---

## 💾 Qué Datos Se Guardan en localStorage (navegador):

Con la implementación reciente, los siguientes datos se guardan **automáticamente** en el navegador:

### ✅ Módulo de Ventas:
- Carrito de ventas en curso
- Método de pago seleccionado
- Notas de la venta

### ✅ Módulo de Compras:
- Carrito de compras en curso
- Nombre del proveedor
- Notas de la compra

Estos datos:
- ✅ **Se recuperan automáticamente** cuando abres la aplicación nuevamente
- ✅ **Te muestran una notificación** si había una venta/compra en curso
- ✅ **Solo se borran** cuando completas la venta/compra exitosamente
- ❌ **Se borran** si borras el historial/caché del navegador

---

## 🚫 Qué Datos Se Pierden Solo en la Memoria:

Estos datos **solo están en memoria temporal** y se pierden si no se completan:

- ❌ Productos que agregas al carrito pero NO finalizas la venta/compra
- ❌ Formularios que estás llenando pero NO has enviado
- ❌ Búsquedas temporales

**PERO AHORA:** Con localStorage, estos datos se guardan automáticamente y se recuperan.

---

## 🛡️ Protecciones Implementadas:

### 1. **Auto-Save del Carrito**
```typescript
// El carrito se guarda automáticamente cada vez que cambia
useEffect(() => {
  if (carrito.length > 0) {
    localStorage.setItem('carritoVenta', JSON.stringify(carrito))
  } else {
    localStorage.removeItem('carritoVenta')
  }
}, [carrito])
```

### 2. **Alerta de Confirmación al Salir**
```typescript
// Te avisa si intentas salir con una venta/compra en curso
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (carrito.length > 0) {
      e.preventDefault()
      e.returnValue = 'Tienes una venta en curso. ¿Seguro que quieres salir?'
    }
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [carrito])
```

### 3. **Recuperación Automática**
- Al abrir la aplicación, se busca un carrito guardado
- Si existe, te avisa: *"Venta en curso recuperada: X productos"*
- Puedes continuar donde la dejaste

---

## 📊 Comparativa de Persistencia:

| Tipo de Datos | Donde se Guarda | ¿Se Pierde al Apagar? | ¿Se Recupera Automáticamente? |
|---------------|-------------------|-------------------------|-------------------------------|
| Productos      | SQLite (db/custom.db) | ❌ NO | ✅ Sí, siempre |
| Ventas         | SQLite (db/custom.db) | ❌ NO | ✅ Sí, siempre |
| Compras        | SQLite (db/custom.db) | ❌ NO | ✅ Sí, siempre |
| Carrito Ventas  | localStorage (navegador) | ❌ NO | ✅ Sí, al abrir |
| Carrito Compras | localStorage (navegador) | ❌ NO | ✅ Sí, al abrir |
| Formularios     | Memoria (RAM) | ✅ SÍ (si no se envía) | ❌ NO |

---

## 🎯 Ejemplo de Escenario Real:

### Escenario: Estás en medio de una venta y se va la luz

**Lo que pasa:**
1. ✅ La computadora se apaga
2. ✅ El carrito de venta se pierde de la memoria (RAM)
3. ✅ PERO estaba guardado en localStorage

**Al volver:**
1. ✅ Enciendes la computadora
2. ✅ Abres la aplicación
3. ✅ Ves una notificación: *"Venta en curso recuperada: 5 productos"*
4. ✅ El carrito está exactamente como lo dejaste
5. ✅ Puedes continuar la venta normalmente

**Qué NO se pierde:**
- ✅ Todas las ventas anteriores están en SQLite
- ✅ Todos los productos están en SQLite
- ✅ Todo el inventario está intacto

---

## 💡 Recomendaciones:

### Para máxima seguridad de datos:

1. **Realiza copias de seguridad** del archivo `db/custom.db` regularmente
2. **Usa una UPS** (Sistema de Alimentación Ininterrumpida) para evitar cortes
3. **Cierra las ventas/compras** completamente antes de salir
4. **No borres el caché** del navegador si tienes una venta/compra en curso
5. **Verifica** que la venta/compra se haya guardado exitosamente antes de cerrar

### Copia de seguridad manual:

```bash
# En Linux/Mac
cp db/custom.db backups/custom-$(date +%Y%m%d-%H%M%S).db

# En Windows
copy db\custom.db backups\custom-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%.db
```

### Copia de seguridad automática (crontab):

```bash
# Agrega a tu crontab para backup diario a las 2 AM
0 2 * * * cp /home/z/my-project/db/custom.db /backups/custom-$(date +\%Y\%m\%d).db
```

---

## 🔧 Solución Para Múltiples Dispositivos:

Si tienes varias computadoras y quieres que los datos se sincronicen:

### Opción 1: Base de datos en la nube (Recomendado)
- Mueve SQLite a PostgreSQL/MySQL
- Instala la aplicación en un servidor (Vercel, Railway, etc.)
- Todas las computadoras acceden a la misma base de datos
- Los datos se actualizan en tiempo real

**Lee el archivo `DESPLEGUE_MULTI_DISPOSITIVOS.md` para más detalles**

### Opción 2: Sincronización local
- Cada computadora tiene su propia base de datos
- Implementa un sistema de sincronización
- Los cambios se envían a un servidor central
- Cada computadora recibe las actualizaciones

---

## ❓ Preguntas Frecuentes:

### Q1: ¿Qué pasa si borro el historial del navegador?
**R:** Solo se pierde el carrito temporal (si está en curso). Los datos de la base de datos (SQLite) no se ven afectados.

### Q2: ¿Puedo acceder a los datos desde otra computadora?
**R:** Con la arquitectura actual (local), NO. Pero si usas la opción multi-tenant (ver `DESPLEGUE_MULTI_DISPOSITIVOS.md`), SÍ.

### Q3: ¿Cuánto espacio ocupan los datos?
**R:** Depende del volumen. Para una tienda pequeña:
- 1,000 productos: ~500 KB
- 10,000 ventas: ~2 MB
- Total aproximado: ~5-10 MB

### Q4: ¿Los datos se cifran?
**R:** Por defecto, NO. Pero puedes implementar cifrado con Prisma Encryption o encriptar el archivo de base de datos.

### Q5: ¿Qué pasa si el archivo db/custom.db se corrompe?
**R:** Perderías todos los datos. Por eso es vital hacer copias de seguridad regularmente.

---

## 📞 ¿Necesitas Ayuda?

Si tienes más preguntas sobre persistencia de datos o quieres implementar:
- Copias de seguridad automáticas
- Sincronización entre dispositivos
- Cifrado de datos
- Recuperación ante desastres

¡Pregúntame! 😊
