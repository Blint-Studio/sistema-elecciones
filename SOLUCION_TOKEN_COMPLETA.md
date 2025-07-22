# SOLUCIÓN COMPLETA PARA EL ERROR DE "TOKEN INVÁLIDO"

## PROBLEMAS IDENTIFICADOS Y SOLUCIONADOS

### 1. **Middleware de autenticación mejorado**
- Acepta tokens con formato "Bearer " o directamente
- Mejor manejo de errores y mensajes más descriptivos

### 2. **Middleware de roles corregido**
- Ahora usa `req.user` en lugar de `req.usuario` (consistente con el middleware de auth)
- Mensajes de error más claros

### 3. **Rutas protegidas correctamente**
- `/api/escuelas` requiere autenticación
- `/api/mesas` requiere autenticación
- `/api/resultados` requiere autenticación y roles específicos

### 4. **Frontend con servicio centralizado**
- Nuevo `apiService.js` para manejar todas las peticiones HTTP
- Formato correcto de tokens: `Bearer {token}`
- Manejo automático de errores 401 (sesión expirada)
- Redirección automática al login cuando el token expira

## ARCHIVOS MODIFICADOS

### Backend:
1. `backend/middlewares/auth.js` - Middleware de autenticación mejorado
2. `backend/middlewares/roles.js` - Corregido para usar `req.user`
3. `backend/routes/escuelasRoutes.js` - Agregada autenticación
4. `backend/routes/mesasRoutes.js` - Agregada autenticación

### Frontend:
1. `frontend/src/services/apiService.js` - **NUEVO ARCHIVO** - Servicio centralizado
2. `frontend/src/pages/CargarResultadosPage.js` - Actualizado para usar apiService

### Base de datos:
1. `database/create_test_users.sql` - **NUEVO ARCHIVO** - Usuarios de prueba

## PASOS PARA IMPLEMENTAR LA SOLUCIÓN

### 1. Actualizar archivos del backend
Copia y pega todos los archivos modificados del backend.

### 2. Actualizar archivos del frontend
```bash
# Crear el directorio services si no existe
mkdir frontend/src/services

# Copiar los archivos actualizados
```

### 3. Crear usuarios de prueba en la base de datos
```sql
-- Ejecutar el archivo create_test_users.sql
-- Esto creará:
-- Usuario: admin@test.com, Password: admin123, Rol: admin
-- Usuario: operador@test.com, Password: operador123, Rol: operador
```

### 4. Reiniciar el servidor backend
```bash
cd backend
npm restart
```

### 5. Probar la aplicación

1. **Login**: Usa `admin@test.com` con password `admin123`
2. **Cargar escuelas**: Debería cargar automáticamente
3. **Seleccionar escuela**: Debería cargar las mesas
4. **Enviar resultado**: Debería funcionar sin errores de token

## FLUJO DE AUTENTICACIÓN CORREGIDO

### Login:
1. Usuario envía credenciales a `/api/auth/login`
2. Backend valida y devuelve JWT token
3. Frontend guarda token en localStorage

### Peticiones protegidas:
1. Frontend obtiene token de localStorage
2. Envía petición con header: `Authorization: Bearer {token}`
3. Backend valida token con middleware `auth.js`
4. Si hay roles específicos, valida con middleware `roles.js`
5. Procesa la petición o devuelve error 401/403

### Manejo de errores:
- **401**: Token inválido/expirado → Redirige a login
- **403**: Sin permisos → Muestra mensaje de error
- **Otros**: Muestra mensaje específico del servidor

## VERIFICACIÓN

Para verificar que todo funciona:

1. **Abrir consola del navegador** (F12)
2. **Ver logs** durante el login y carga de datos
3. **Verificar** que no aparezcan errores de token
4. **Confirmar** que las peticiones incluyen el header Authorization

## USUARIOS DE PRUEBA

```
Admin:
Email: admin@test.com
Password: admin123
Permisos: Crear, editar, eliminar resultados

Operador:
Email: operador@test.com
Password: operador123
Permisos: Crear resultados
```

## ESTRUCTURA DEL TOKEN

El token JWT contiene:
```json
{
  "id": 1,
  "rol": "admin",
  "iat": 1234567890,
  "exp": 1234596690
}
```

El token expira en 8 horas después de creado.

## TROUBLESHOOTING

### Si aún aparece "Token inválido":

1. **Verificar en la base de datos** que el usuario existe:
   ```sql
   SELECT * FROM usuarios WHERE email = 'admin@test.com';
   ```

2. **Verificar en el navegador** que el token se guarda:
   ```javascript
   console.log(localStorage.getItem('token'));
   ```

3. **Verificar en Network tab** que se envía el header Authorization

4. **Verificar logs del backend** para ver qué error específico está ocurriendo

### Si el token expira muy rápido:
- Cambiar `expiresIn: '8h'` a `expiresIn: '24h'` en `authController.js`

### Si no puede hacer login:
- Verificar que la tabla usuarios existe y tiene datos
- Ejecutar el script `create_test_users.sql`
- Verificar que bcrypt está instalado: `npm install bcryptjs`
