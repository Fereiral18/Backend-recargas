# 🤝 Guía de Contribución

## Para Desarrolladores Frontend

### 🚀 Setup Inicial

1. **Clonar y configurar el backend**
```bash
git clone <repo-url>
cd be
npm install
cp .env.example .env
# Editar .env con tus credenciales locales
```

2. **Levantar la base de datos**
```bash
# Asegúrate de tener PostgreSQL instalado y corriendo
createdb recharges_gaming_db
```

3. **Iniciar el servidor**
```bash
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

---

## 📖 Documentación

- **Swagger/OpenAPI**: http://localhost:3000/api
- **Guía de Integración Frontend**: [docs/FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md)

---

## 🔐 Autenticación en Desarrollo

### Crear usuario de prueba:
```bash
POST http://localhost:3000/auth/register
Body: {
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "password": "test123"
}
```

Guarda el `access_token` que recibes y úsalo en todas las peticiones:
```
Authorization: Bearer <token>
```

---

## 🧪 Probar la API

### Opción 1: Swagger UI
1. Ir a http://localhost:3000/api
2. Hacer login en `/auth/login`
3. Copiar el token
4. Click en "Authorize" y pegar: `Bearer <token>`
5. Probar cualquier endpoint

### Opción 2: Postman/Insomnia
Importar colección desde Swagger: http://localhost:3000/api-json

---

## 💡 Tips

### Manejo de Errores Comunes

**401 Unauthorized**
- Token expirado → Hacer login nuevamente
- Token faltante → Verificar header `Authorization`

**400 Bad Request**
- Datos inválidos → Revisar formato en Swagger
- Campos requeridos faltantes

**500 Internal Server Error**
- Revisar logs del backend
- Puede ser un bug → Reportar issue

---

¡Listo para comenzar! 🚀
