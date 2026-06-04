# Pareja Finanzas

App móvil (Expo + React Native) y API (Node.js + Express + Socket.IO) para control de gastos en pareja con sincronización en tiempo real.

## Requisitos

- Node.js 20+
- **Producción:** MongoDB Atlas + Render (sin Docker en el móvil) → ver **[docs/DEPLOY.md](docs/DEPLOY.md)**
- **Desarrollo:** MongoDB local/Docker opcional, o Atlas + [Expo Go](https://expo.dev/go)

## Estructura

```
apps/
  mobile/   → Expo (React Native)
  api/      → Express + Socket.IO + MongoDB
```

## 1. Base de datos

**Opción Docker:**

```powershell
docker run -d --name pareja-mongo -p 27017:27017 mongo:7
```

**Opción local:** instala MongoDB y usa la URI por defecto en `apps/api/.env`.

## 2. API (backend)

```powershell
cd "apps\api"
copy .env.example .env
npm run dev
```

Deberías ver: `API + WebSocket en http://localhost:4000`

## 3. App móvil (Expo)

Obtén tu IP local (PowerShell):

```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' }).IPAddress
```

Crea `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://TU_IP:4000
```

Ejemplo: `EXPO_PUBLIC_API_URL=http://192.168.1.45:4000`

```powershell
cd "apps\mobile"
npm start
```

Escanea el QR con **Expo Go**. Los cambios en código se reflejan al instante (Fast Refresh).

Si el móvil no alcanza la API, prueba túnel:

```powershell
npx expo start --tunnel
```

## Flujo de uso

1. **Registro** de ambos usuarios.
2. Usuario A: **Crear pareja** → comparte el código de 6 caracteres.
3. Usuario B: **Unirse con código** (válido 24 h).
4. Dashboard sincronizado: ingresos, gastos, ahorro compartido (depósito/retiro).

## Seguridad (implementado)

- JWT access (15 min) + refresh (7 días)
- Contraseñas con bcrypt (cost 12)
- Saldos cifrados en BD (AES-256-GCM)
- Tokens en `expo-secure-store`
- Helmet, rate limit en auth, validación Zod

**Producción:** cambia todos los secretos en `.env`, usa HTTPS y restringe `CORS_ORIGIN`.

## Despliegue (Atlas + Render + APK)

Guía paso a paso: **[docs/DEPLOY.md](docs/DEPLOY.md)**

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login |
| POST | `/api/couples/create` | Crear pareja |
| POST | `/api/couples/join` | Unirse con código |
| GET | `/api/dashboard` | Dashboard completo |
| POST | `/api/transactions` | Ingreso / gasto |
| POST | `/api/savings/movement` | Depósito / retiro |

**WebSocket:** mismo host que la API, auth `{ token: accessToken }`, eventos `couple:sync`, `transaction:created`, `savings:movement`, `balance:updated`.
