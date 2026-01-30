Backen de la app de recargas

# 🎮 Backend API - Sistema de Recargas de Juegos

> **Backend NestJS completo y listo para producción** para un sistema de recargas de juegos móviles con autenticación JWT, gestión de transacciones y soporte técnico.

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Resumen Ejecutivo

Este proyecto proporciona una **API REST completa** para un sistema de recargas de videojuegos móviles. Está diseñado específicamente para ser usado como backend por equipos frontend que quieran construir aplicaciones web o móviles para venta de recargas.

### ✨ ¿Qué ofrece este backend?

- ✅ **API REST documentada** con Swagger/OpenAPI en `/api`
- ✅ **Autenticación segura** con JWT y sistema de roles
- ✅ **Base de datos configurada** con TypeORM y PostgreSQL
- ✅ **Tests incluidos** (unitarios y E2E)
- ✅ **CORS habilitado** para desarrollo frontend
- ✅ **Validaciones automáticas** en todos los endpoints
- ✅ **Código TypeScript** tipado y documentado

### 🚀 Quick Start (3 pasos)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env (copiar .env.example y editar)
cp .env.example .env

# 3. Iniciar servidor
npm run start:dev
```

**Servidor corriendo en:** http://localhost:3000  
**Documentación Swagger:** http://localhost:3000/api

---

## 📖 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Instalación Completa](#-instalación-completa)
- [Configuración](#-configuración)
- [Ejecutar el Proyecto](#-ejecutar-el-proyecto)
- [Documentación API](#-documentación-api)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Endpoints Principales](#-endpoints-principales)
- [Integración Frontend](#-integración-frontend)
- [Testing](#-testing)
- [Contribuir](#-contribuir)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Características Principales

### Sistema Completo de Recargas
- 💎 **Múltiples Juegos**: Free Fire, PUBG Mobile, Mobile Legends, Genshin Impact, etc.
- 💰 **Tipos de Recarga**: Diamantes, UC, Monedas, Cristales, Battle Pass, etc.
- 📊 **Cálculo Automático**: Fees y totales calculados automáticamente
- 🔄 **Estados**: PENDING, COMPLETED, FAILED, CANCELLED

### Autenticación y Seguridad
- 🔐 **JWT Tokens**: Autenticación stateless y segura
- 👥 **Sistema de Roles**: USER y ADMIN con permisos diferenciados
- 🛡️ **Guards**: Protección de rutas automática
- 🔒 **Passwords**: Hasheados con bcryptjs

### Gestión Financiera
- 💵 **Transacciones**: DEPOSIT, WITHDRAWAL, PURCHASE, REFUND, FEE
- 📈 **Balance de Usuario**: Cálculo en tiempo real
- 📝 **Referencias Únicas**: Sistema de tracking por operación

### Soporte al Cliente
- 🎫 **Sistema de Tickets**: Con prioridades y estados
- 💬 **Mensajes**: Conversación entre usuario y admin
- 📊 **Estadísticas**: Dashboard de soporte

---

## 🚀 Tecnologías

### Core
- **NestJS 11**: Framework backend progresivo
- **TypeScript 5**: JavaScript tipado para mayor seguridad
- **Node.js 18+**: Runtime de JavaScript

### Base de Datos
- **PostgreSQL 14+**: Base de datos relacional
- **TypeORM**: ORM para TypeScript/JavaScript
- **Auto-sincronización**: Tablas creadas automáticamente

### Autenticación
- **Passport**: Middleware de autenticación
- **JWT**: JSON Web Tokens
- **bcryptjs**: Hash de contraseñas

### Validación y Documentación
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos
- **Swagger/OpenAPI**: Documentación interactiva de API

### Testing
- **Jest**: Framework de testing
- **Supertest**: Testing de API HTTP

---

## 🛠️ Instalación Completa

### Prerrequisitos

Asegúrate de tener instalado:

```bash
# Node.js 18 o superior
node --version  # debe mostrar v18.x.x o superior

# PostgreSQL 14 o superior
psql --version  # debe mostrar PostgreSQL 14.x o superior

# npm (viene con Node.js)
npm --version   # debe mostrar 9.x.x o superior
```

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Fereiral18/Backend-recargas.git
cd Backend-recargas
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias (~100MB).

### Paso 3: Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb recargas_gaming_db

# O con psql
psql -U postgres
CREATE DATABASE recargas_gaming_db;
\q
```

### Paso 4: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tus credenciales reales:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_aqui  # ← CAMBIAR
DB_NAME=rechargas_gaming_db

# JWT
JWT_SECRET=cambia-esto-por-un-secreto-largo-y-seguro-minimo-32-caracteres  # ← CAMBIAR
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANTE**: Cambia `DB_PASSWORD` y `JWT_SECRET` por valores seguros.

---

## ⚙️ Configuración

### Variables de Entorno Obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | `tu_password` |
| `DB_NAME` | Nombre de la base de datos | `rechargas_gaming_db` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `min-32-caracteres` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `24h`, `7d`, `3600s` |
| `PORT` | Puerto del servidor | `3000` |

### Variables Opcionales

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:3001` |
| `NODE_ENV` | Entorno de ejecución | `development` |

---

## 🎯 Ejecutar el Proyecto

### Modo Desarrollo (recomendado)

```bash
npm run start:dev
```

- ✅ Hot-reload automático al guardar cambios
- ✅ Logs detallados en consola
- ✅ Mejor para debugging

### Modo Producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

### Verificar que Funciona

```bash
# Test rápido
curl http://localhost:3000

# Debería responder: "Backend para la app de recargas"
```

---

## 📚 Documentación API

### Swagger UI (Documentación Interactiva)

Abre en tu navegador: **http://localhost:3000/api**

Aquí encontrarás:
- 📋 **Lista completa de endpoints**
- 📝 **Modelos de datos (schemas)**
- 🧪 **Probar peticiones en vivo**
- 🔐 **Sistema de autenticación integrado**
- 📖 **Descripciones detalladas**

### Cómo Usar Swagger

1. **Registrar usuario**: `POST /auth/register`
2. **Hacer login**: `POST /auth/login` → copiar el `access_token`
3. **Autorizar**: Click en botón "Authorize" (arriba derecha)
4. **Pegar token**: `Bearer tu_token_aqui`
5. **Probar endpoints**: Ya puedes hacer peticiones a rutas protegidas

### Guía para Frontend

Ver documentación completa en: **[docs/FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md)**

Incluye:
- ✅ Ejemplos con Axios
- ✅ Flow de autenticación
- ✅ Manejo de errores
- ✅ Tips de integración
- ✅ Todos los enum values

---

## 📁 Estructura del Proyecto

```
backend-recargas/
├── src/
│   ├── common/                  # Código compartido
│   │   ├── decorators/          # @CurrentUser, @Roles
│   │   └── enums/               # 11 enums del sistema
│   ├── core/                    # Configuración central
│   │   ├── core.module.ts
│   │   ├── typeorm.config.ts    # Config de base de datos
│   │   └── swagger.config.ts    # Config de Swagger
│   ├── users/                   # 👤 Módulo de usuarios
│   │   ├── auth.module.ts
│   │   ├── users.module.ts
│   │   ├── controllers/         # auth.controller, users.controller
│   │   ├── services/            # auth.service, users.service
│   │   ├── guards/              # jwt-auth.guard, roles.guard
│   │   ├── strategies/          # jwt.strategy
│   │   ├── dto/                 # register, login, update
│   │   ├── entities/            # user.entity
│   │   ├── repositories/        # users.repository
│   │   └── interfaces/
│   ├── recharges/               # 💎 Módulo de recargas
│   │   ├── recharges.module.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   └── entities/
│   ├── transactions/            # 💰 Módulo de transacciones
│   │   ├── transactions.module.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   └── entities/
│   ├── support/                 # 🎫 Módulo de soporte
│   │   ├── support.module.ts
│   │   ├── controllers/         # tickets, messages
│   │   ├── services/
│   │   ├── dto/
│   │   └── entities/            # ticket, message
│   ├── app.module.ts            # Módulo raíz
│   └── main.ts                  # Entry point
├── test/                        # Tests E2E
│   ├── auth.e2e-spec.ts
│   ├── recharges.e2e-spec.ts
│   ├── transactions.e2e-spec.ts
│   └── support.e2e-spec.ts
├── docs/                        # Documentación
│   └── FRONTEND_INTEGRATION.md
├── .env.example                 # Template de variables
├── CONTRIBUTING.md              # Guía de contribución
├── LICENSE                      # MIT License
└── README.md                    # Este archivo
```

---

## 🔗 Endpoints Principales

### 🔐 Autenticación (Públicos)

```http
POST /auth/register              # Registrar nuevo usuario
POST /auth/login                 # Iniciar sesión
```

### 👤 Usuarios (Protegidos)

```http
GET    /users/me                 # Perfil del usuario actual
GET    /users/dashboard          # Dashboard con estadísticas
PATCH  /users/me                 # Actualizar perfil
```

### 💎 Recargas (Protegidos)

```http
POST   /recharges                # Crear nueva recarga
GET    /recharges                # Listar recargas (con filtros)
GET    /recharges/:uuid          # Detalle de una recarga
GET    /recharges/stats          # Estadísticas de recargas
PATCH  /recharges/:uuid          # Actualizar recarga (admin)
```

### 💰 Transacciones (Protegidos)

```http
POST   /transactions             # Crear transacción
GET    /transactions             # Listar transacciones (con filtros)
GET    /transactions/:uuid       # Detalle de transacción
GET    /transactions/balance/:user_id  # Balance del usuario
PATCH  /transactions/:uuid       # Actualizar transacción (admin)
```

### 🎫 Soporte (Protegidos)

```http
POST   /support/tickets          # Crear ticket de soporte
GET    /support/tickets          # Listar tickets del usuario
GET    /support/tickets/:uuid    # Detalle del ticket con mensajes
GET    /support/tickets/stats    # Estadísticas de tickets
PATCH  /support/tickets/:uuid    # Actualizar ticket

POST   /support/messages/:ticket_id     # Enviar mensaje
GET    /support/messages/ticket/:ticket_id  # Ver mensajes
PATCH  /support/messages/:uuid/read     # Marcar como leído
```

---

## 💻 Integración Frontend

### Configurar Axios

```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Ejemplo de Registro

```javascript
import api from './api';

async function register(userData) {
  try {
    const response = await api.post('/auth/register', {
      email: userData.email,
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
    });
    
    // Guardar token
    localStorage.setItem('access_token', response.data.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Error al registrar:', error.response?.data);
    throw error;
  }
}
```

### Ejemplo de Crear Recarga

```javascript
async function createRecharge(rechargeData) {
  try {
    const response = await api.post('/recharges', {
      user_id: rechargeData.userId,
      type: 'DIAMONDS',  // Ver enums en docs
      operator: 'FREE_FIRE',
      amount: 100,
      game_id: 'PLAYER123',
      phone_number: '+1234567890',
    });
    
    return response.data.data;  // Retorna la recarga creada
  } catch (error) {
    console.error('Error:', error.response?.data);
    throw error;
  }
}
```

---

## 🧪 Testing

### Tests Unitarios

```bash
# Todos los tests
npm test

# Con coverage
npm run test:cov

# Watch mode
npm run test:watch

# Archivo específico
npm test src/users/services/auth.service.spec.ts
```

### Tests E2E (End-to-End)

```bash
# Todos los tests E2E
npm run test:e2e

# Test específico
npm run test:e2e -- test/auth.e2e-spec.ts
```

**Tests incluidos:**
- ✅ AuthService: 11 tests
- ✅ RechargesService: 13 tests
- ✅ TransactionsService: 15 tests
- ✅ SupportService: 8 tests
- ✅ Controllers: 11 tests
- ✅ E2E flows: 25+ tests

---

## 🤝 Contribuir

Este es un proyecto colaborativo. ¡Las contribuciones son bienvenidas!

### Proceso

1. **Fork** el repositorio
2. **Crea un branch** desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Haz tus cambios** y commitea:
   ```bash
   git add .
   git commit -m "feat: agregar nueva funcionalidad"
   ```
4. **Push** a tu fork:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Abre un Pull Request** a `develop`

### Convención de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, espacios, etc (no afecta código)
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

### Guías

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Si no está corriendo
sudo systemctl start postgresql

# Verificar credenciales en .env
cat .env | grep DB_
```

### Error: "Port 3000 is already in use"

```bash
# Encontrar proceso usando el puerto
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O cambiar puerto en .env
PORT=3001
```

### Error: "Cannot find module"

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de compilación TypeScript

```bash
# Limpiar build y recompilar
rm -rf dist
npm run build
```

### Tests fallando

```bash
# Asegurarse de que .env está configurado
cp .env.example .env

# Los tests E2E necesitan base de datos
createdb recargas_gaming_test
```

---

## 📝 Notas Importantes para Desarrolladores

### CORS
- Por defecto habilitado para `http://localhost:3001`
- Configurable en `.env` con `FRONTEND_URL`
- Incluye `credentials: true` para cookies

### Validación
- Todos los DTOs tienen validación automática
- Errores 400 incluyen detalles de validación
- Ver `class-validator` docs para más info

### Autenticación
- JWT expira en 24h (configurable)
- Refresh tokens no implementado aún
- Tokens en header: `Authorization: Bearer <token>`

### Base de Datos
- TypeORM sincroniza automáticamente en desarrollo
- **⚠️ En producción**: usar migraciones
- Todas las tablas usan UUID como primary key

### Roles y Permisos
- `USER`: Puede gestionar sus propias recargas/transacciones
- `ADMIN`: Acceso completo a todos los recursos
- Guards aplicados automáticamente

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Equipo y Contacto

- **Desarrollador**: Luis Fereira Team
- **Repositorio**: https://github.com/Fereiral18/Backend-recargas
- **Issues**: https://github.com/Fereiral18/Backend-recargas/issues
- **Rama de desarrollo**: `develop`
- **Rama de producción**: `main`

---

## 🎓 Recursos Adicionales

### Documentación
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)

### Frontend Integration
- Ver [docs/FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md)
- Ejemplos con React, Vue, Angular
- Manejo de errores y estados
- Best practices

---

<div align="center">

**⭐ Si este proyecto te ayuda, considera darle una estrella en GitHub ⭐**

[Reportar Bug](https://github.com/Fereiral18/Backend-recargas/issues) · [Solicitar Feature](https://github.com/Fereiral18/Backend-recargas/issues) · [Contribuir](CONTRIBUTING.md)

</div>
>>>>>>> develop
