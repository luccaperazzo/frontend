# 📋 Lista de Verificación Manual - FitConnect

## 🚀 Pre-requisitos
- [X] Backend corriendo en puerto 3001
- [X] Frontend corriendo en puerto 3000
- [X] MongoDB conectado
- [X] Variables de entorno configuradas
- [X] Base de datos poblada con datos de prueba
- [X] Servicios de email configurados (Nodemailer)
- [X] Stripe configurado para pagos

## 🔐 Autenticación

### Registro
- [X] Registro como cliente funciona
- [X] Registro como entrenador funciona (con zona, idiomas, presentación)
- [X] Upload de avatar funciona
- [ ] Validaciones de password funcionan
  - [X] ❌ Contraseña muy corta (< 8 caracteres): `123`, `abc45`, `Test12`
  - [X] ❌ Sin números: `Password!`, `TestingPass@`, `MiContraseña#`
  - [X] ❌ Sin mayúsculas: `password123!`, `testing456@`, `mipass789#`
  - [X] ❌ Sin símbolos: `Test1234`, `Pass5678`, `MiPassword1`
  - [X] ❌ Solo números: `12345678`, `98765432`
  - [X] ✅ Con espacios: `Test 123!`, `Mi Password1@`
  - [X] ✅ Sin minúsculas: `PASSWORD123!`, `TESTING456@`, `MIPASS789#`
  - [X] ✅ Mínimo válido: `Test123!`, `Pass456@`
  - [X] ✅ Normales: `MiPassword1@`, `Testing123!`, `FitConnect2025#`
  - [X] ✅ Con símbolos variados: `Test123!`, `MiPass@2024`, `Secure#456`, `Strong$789`
  - [X] ✅ Largas: `MiContraseñaSuperSegura123!`, `Password@VeryLong2025`
- [X] Emails duplicados son rechazados

### Login
- [X] Login con credenciales correctas funciona
- [X] Login con credenciales incorrectas falla
- [X] Redirección según rol funciona (cliente → /trainers, entrenador → /dashboard)
- [X] Avatar se muestra en header después del login
- [X] LocalStorage se actualiza correctamente
- [X] Mensaje de bienvenida aparece
- [X] Links del navbar cambian según el rol

### Recuperación de Password
- [X] "Olvidé mi contraseña" envía email
- [X] Link de reset funciona
- [X] Nueva contraseña se guarda correctamente
- [X] Token de reset expira correctamente
- [X] Validaciones de nueva password funcionan
- [X] Redirección a login después de reset exitoso

## 🏋️ Funcionalidades de Entrenador

### Gestión de Servicios
- [ ] Crear nuevo servicio funciona
    - [X] Validaciones básicas de campos
    - [X] hora de inicio debe ser menor a la hora de fin
    - [X] El bloque de horarios elegidos debe ser multiplo de la duracion
    - [X] El rango de disponibilidad no puede ser menor a la duracion del servicio
    - [ ] Verificar que no se superponga a nivel horario con un servicio ya creado
    - [ ] Otro error es que como se muestra en al foto adjuntada, se pueda agregar varios bloques de horario que se solapan en el creado del servicio.![alt text](image.png). Esto es un error.



- [ ] Editar servicio existente funciona
    - [ ] Cuando updeteas el servicio que creaste, le podes cambiar la duracion de modo que no correlaciona con la disponibilidad horaria
    - [ ] Pasa lo mismo con la disponibilidad
    - [ ] Que pasa si yo edito la disponibilidad horaria? Cambian los bloques cuando voy a reservar?

- [X] Eliminar servicio funciona
- [X] Publicar/despublicar servicio funciona
- [X] Disponibilidad se configura correctamente

### Gestión de Reservas
- [X] Ver reservas pendientes
- [X] Confirmar reserva funciona
- [X] Cancelar reserva funciona
- [ ] Reprogramar reserva funciona
- [X] Estados de reserva se actualizan correctamente

### Documentos
- [X] Subir documento PDF funciona ** HAY QUE DAR F5 para ver la reserva.. raro.. 
- [X] Cliente puede descargar documento
- [X] Eliminar documento funciona

### Métricas
- [X] Estadísticas generales se muestran
- [X] Métricas de servicios se cargan
- [X] Reseñas de clientes se muestran
- [X] Responder a reseñas funciona

## 👤 Funcionalidades de Cliente - ILAN

### Búsqueda de Entrenadores
- [X] Lista de entrenadores se carga
- [X] Filtros funcionan (categoría, zona, precio, etc.)
- [X] Paginación funciona
- [ ] Avatares/iniciales se muestran correctamente

### Perfil de Entrenador
- [X] Información del entrenador se muestra correctamente
- [ ] Avatar/iniciales se muestran
- [X] Lista de servicios se carga
- [X] Tab de reseñas funciona
- [X] Navegación a detalle de servicio funciona - 

### Reservas y Pagos
- [ ] Detalle de servicio se carga correctamente
- [ ] Calendario muestra disponibilidad
- [ ] Selección de horario funciona
- [ ] Integración con Stripe funciona
- [ ] Pago exitoso crea reserva
- [ ] Emails de confirmación se envían

### Mi Espacio Cliente
- [ ] Lista de sesiones se carga
- [ ] Cancelar reserva funciona
- [ ] Ver entrenadores con sesiones completadas
- [ ] Escribir reseña funciona
- [ ] Descargar documentos compartidos funciona

## 🎨 Interfaz de Usuario - JONA

### Navegación
- [ ] Todos los links del navbar funcionan
- [ ] Redirecciones automáticas funcionan
- [ ] Logout funciona y limpia localStorage
- [ ] Rutas protegidas funcionan correctamente

### Responsive Design
- [ ] Se ve bien en desktop
- [ ] Se ve bien en tablet
- [ ] Se ve bien en móvil

### Avatares
- [ ] Avatares se cargan en LandingPage
- [ ] Avatares se cargan en BusquedaEntrenadores
- [ ] Avatares se cargan en PerfilEntrenador
- [ ] Iniciales se muestran cuando no hay avatar
- [ ] Avatar se muestra en header cuando está logueado

## 🗄️ Base de Datos - JONA

### Seed Data
- [X] Botón "Poblar Base de Datos" funciona
- [X] Se crean entrenadores con avatares
- [X] Se crean servicios de ejemplo
- [X] Se crean estadísticas de ejemplo
- [ ] Solo funciona en desarrollo

## 📧 Sistema de Emails - JONA

### Notificaciones
- [ ] Email de registro se envía
- [ ] Email de recuperación se envía
- [ ] Email de confirmación de reserva se envía
- [ ] Email de cancelación se envía

## 🔄 Sistema de Estados - ILAN

### Reservas
- [ ] Estados cambian correctamente (Pendiente → Aceptado → Finalizado)
- [ ] Cron job finaliza reservas automáticamente
- [ ] Transiciones de estado respetan roles

## ⚡ Performance - JONA PLUS

### Carga
- [ ] Páginas cargan en menos de 3 segundos
- [ ] Imágenes se optimizan correctamente
- [ ] No hay memory leaks evidentes
- [ ] Estados de loading se muestran apropiadamente

## 🛡️ Seguridad - ILAN

### Autenticación
- [ ] Rutas protegidas requieren token
- [ ] Tokens expiran correctamente
- [ ] Solo entrenadores pueden crear servicios
- [ ] Solo clientes pueden hacer reservas
- [ ] Usuarios solo ven sus propios datos

## 🐛 Manejo de Errores

### Frontend - JONA
- [ ] Errores de red se manejan apropiadamente
- [ ] Mensajes de error son claros para el usuario
- [ ] No hay crashes por datos faltantes

### Backend - ILAN
- [ ] Errores de validación retornan mensajes claros
- [ ] Errores 500 no exponen información sensible
- [ ] Rate limiting funciona (si implementado)

---

## ✅ Resultado Final

**Total de elementos verificados:** ___/___

**Estado del proyecto:** 
- [ ] ✅ Excelente (90-100%)
- [ ] 🟡 Bueno (70-89%)
- [ ] 🔴 Necesita trabajo (<70%)

**Notas adicionales:**
```
Fecha de testing: _______________
Tester: _______________________
Observaciones: ________________
```
