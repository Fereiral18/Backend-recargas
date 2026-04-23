# 🔌 Guía de Integración Frontend

## 🚀 Setup Rápido

### 1. Levantar el Backend
```bash
npm install
cp .env.example .env
# Configurar variables en .env
npm run start:dev
```

El backend correrá en: `http://localhost:3000`

### 2. Documentación Interactiva
Swagger UI disponible en: `http://localhost:3000/api`

---

## 🔐 Autenticación

### Flow de Autenticación:

1. **Usuario se registra o hace login**
2. **Backend devuelve un JWT token**
3. **Frontend guarda el token** (localStorage/cookies)
4. **Todas las peticiones incluyen el token** en headers

### Ejemplo Registro:
```javascript
POST http://localhost:3000/auth/register

Body:
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123"
}

Response:
{
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "USER",
      "balance": 0
    }
  }
}
```

### Ejemplo Login:
```javascript
POST http://localhost:3000/auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: (igual que registro)
```

---

## 📡 Headers para Rutas Protegidas

**TODAS las rutas excepto `/auth/register` y `/auth/login` requieren autenticación:**

```javascript
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

### Ejemplo en Axios:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uso
const user = await api.get('/users/me');
```

---

## 🎯 Endpoints Principales

Ver Swagger UI para documentación completa: `http://localhost:3000/api`

### 👤 Usuarios

- `GET /users/me` - Perfil del usuario actual
- `GET /users/dashboard` - Dashboard con estadísticas
- `PATCH /users/me` - Actualizar perfil

### 💎 Recargas

- `POST /recharges` - Crear nueva recarga
- `GET /recharges` - Listar recargas con filtros
- `GET /recharges/:uuid` - Ver detalle de recarga
- `GET /recharges/stats` - Estadísticas de recargas

### 💰 Transacciones

- `POST /transactions` - Crear transacción
- `GET /transactions` - Listar transacciones
- `GET /transactions/balance/:user_id` - Ver balance del usuario

### 🎫 Soporte

- `POST /support/tickets` - Crear ticket
- `GET /support/tickets` - Listar tickets
- `GET /support/tickets/:uuid` - Ver ticket con mensajes
- `POST /support/messages/:ticket_id` - Enviar mensaje en ticket

---

## 📊 Enums y Valores Válidos

### UserRole
- `USER` - Usuario regular
- `ADMIN` - Administrador

### UserStatus
- `ACTIVE` - Usuario activo
- `INACTIVE` - Usuario inactivo
- `SUSPENDED` - Usuario suspendido
- `BANNED` - Usuario baneado

### RechargeType
- `DIAMONDS` - Diamantes
- `COINS` - Monedas
- `UC` - UC Points
- `CRYSTALS` - Cristales
- `BATTLE_PASS` - Battle Pass
- `BUNDLE` - Paquete
- `OTHER` - Otro

### GameOperator
- `FREE_FIRE` - Free Fire
- `PUBG_MOBILE` - PUBG Mobile
- `MOBILE_LEGENDS` - Mobile Legends
- `GENSHIN_IMPACT` - Genshin Impact
- `COD_MOBILE` - Call of Duty Mobile
- `FORTNITE` - Fortnite
- `ROBLOX` - Roblox
- `OTHER` - Otro

### RechargeStatus
- `PENDING` - Pendiente
- `COMPLETED` - Completada
- `FAILED` - Fallida
- `CANCELLED` - Cancelada

### TransactionType
- `DEPOSIT` - Depósito
- `WITHDRAWAL` - Retiro
- `PURCHASE` - Compra
- `REFUND` - Reembolso
- `FEE` - Comisión

### TransactionStatus
- `PENDING` - Pendiente
- `COMPLETED` - Completada
- `FAILED` - Fallida
- `CANCELLED` - Cancelada

### TicketStatus
- `OPEN` - Abierto
- `IN_PROGRESS` - En progreso
- `RESOLVED` - Resuelto
- `CLOSED` - Cerrado

### TicketPriority
- `LOW` - Baja
- `MEDIUM` - Media
- `HIGH` - Alta
- `URGENT` - Urgente

### MessageType
- `USER_MESSAGE` - Mensaje de usuario
- `ADMIN_RESPONSE` - Respuesta de admin
- `SYSTEM_MESSAGE` - Mensaje del sistema

---

## 🔄 Formato de Respuestas

Todas las respuestas exitosas tienen este formato:
```javascript
{
  "message": "Descripción de la operación",
  "data": { /* datos */ }
}
```

### Errores
```javascript
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

## 💡 Tips para el Frontend

### 1. Guardar Token
```javascript
// Después del login exitoso
localStorage.setItem('token', response.data.access_token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

### 2. Interceptor de Errores
```javascript
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🧪 Testing

### Probar endpoints con Swagger:
1. Ir a `http://localhost:3000/api`
2. Hacer login en `/auth/login`
3. Copiar el `access_token`
4. Click en "Authorize" (arriba a la derecha)
5. Pegar: `Bearer <tu-token>`
6. Ahora puedes probar todos los endpoints

---

## 🔧 Variables de Entorno del Frontend

Crear archivo `.env` en el frontend:
```env
VITE_API_URL=http://localhost:3000
# o
REACT_APP_API_URL=http://localhost:3000
# o
NEXT_PUBLIC_API_URL=http://localhost:3000
```
