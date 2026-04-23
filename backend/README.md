

Sistema fullstack para gestionar recargas de diamantes de Free Fire con panel de administración.

## 📦 Stack Tecnológico

| Backend | Frontend |
|---------|----------|
| NestJS 11 | React 18 |
| TypeORM | Vite 6 |
| PostgreSQL 14+ | React Router 7 |
| JWT | Axios |
| Swagger | React Toastify |

## 🚀 Instalación Rápida

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd fullstack
```

### 2. Configurar la base de datos PostgreSQL

```sql
CREATE DATABASE recargas_gaming;
```

### 3. Backend

```bash
cd be
npm install
cp .env.example .env
```

Editar be/.env:
```
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=recargas_gaming
JWT_SECRET=tu_secret_key_seguro
JWT_EXPIRES_IN=3600s
```

```bash
npm run start:dev
```

Backend: http://localhost:4000
Swagger: http://localhost:4000/api

### 4. Frontend

```bash
cd fe/recargas-app
npm install
npm run dev
```

Frontend: http://localhost:5173

### 5. Crear usuario administrador

Ejecutar en PostgreSQL:
```sql
INSERT INTO users (uuid, email, phone, first_name, last_name, password_hash, role, status, balance, email_verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  '0000000000',
  'Admin',
  'Sistema',
  '$2b$10$z2G.vltfXbHG9DvJGFyJyO1iWP2yR8MEln2RDyxE12unzyJHAUcSO',
  'ADMIN',
  'ACTIVE',
  0,
  true,
  NOW(),
  NOW()
);
```

Credenciales admin:
- Email: admin@test.com
- Password: german

## 📁 Estructura

```
fullstack/
├── be/                      # Backend NestJS
│   ├── src/
│   │   ├── users/          # Autenticación
│   │   ├── recharges/      # Recargas
│   │   ├── transactions/   # Transacciones
│   │   ├── support/        # Tickets
│   │   └── common/         # Enums, guards
│   └── uploads/proofs/     # Comprobantes
│
├── fe/recargas-app/         # Frontend React
│   └── src/
│       ├── pages/Admin/    # Panel admin
│       ├── pages/Recharges/# Recargas
│       ├── services/       # API
│       └── components/     # Componentes
```

## 🔐 Roles

| Rol | Acceso |
|-----|--------|
| USER | Dashboard, recargas, soporte |
| ADMIN | Panel admin, gestión completa |

## 📱 Funcionalidades

### Usuario
- Registro e inicio de sesión
- Crear recargas con comprobante
- Cancelar recargas (10 min límite)
- Ver historial
- Tickets de soporte

### Administrador
- Dashboard con estadísticas
- Gestionar usuarios y recargas
- Aprobar/rechazar recargas
- Gestionar tickets
- Búsqueda en todas las secciones

## 📝 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /auth/register | Registrar |
| POST | /auth/login | Login |
| GET | /recharges | Listar recargas |
| POST | /recharges | Crear recarga |
| PATCH | /recharges/:uuid/cancel | Cancelar |
| GET | /support/tickets | Listar tickets |
| GET | /users | Listar usuarios |

Documentación completa: http://localhost:4000/api

## 🧪 Tests

```bash
cd be && npm run test:e2e
cd fe/recargas-app && npm run test
``
