# Desplegar API en Render + MongoDB Atlas + APK Android

La app Android **no necesita Docker ni MongoDB**: solo se conecta por HTTPS a tu API en Render. La base de datos vive en **MongoDB Atlas** (nube).

---

## ⚠️ Seguridad urgente

Publicaste la contraseña de Atlas en un chat. **Haz esto ya:**

1. Atlas → **Database Access** → usuario `chimsamuel96_db_user` → **Edit** → **Edit Password** → nueva contraseña.
2. Actualiza la variable `MONGODB_URI` en Render con la nueva contraseña.
3. **Nunca** subas `.env` a GitHub ni pegues la URI en el código.

---

## Parte 1 — MongoDB Atlas (base de datos en la web)

### 1.1 Crear el cluster (si no lo tienes)

1. [https://cloud.mongodb.com](https://cloud.mongodb.com) → inicia sesión.
2. **Build a Database** → plan **M0 FREE**.
3. Región cercana a ti (ej. `AWS / N. Virginia` o `São Paulo`).
4. Crea el cluster.

### 1.2 Crear la base de datos (nombre de BD)

Atlas no obliga a “crear BD” antes: se crea sola al conectar.

1. Menú **Database** → tu cluster → **Browse Collections**.
2. **Create Database**:
   - **Database name:** `pareja_finanzas`
   - **Collection name:** `users` (cualquier nombre; Mongoose creará el resto).
3. Confirma.

### 1.3 Usuario y contraseña

1. **Database Access** → **Add New Database User**.
2. Usuario con contraseña fuerte (o el que ya tienes, **rotado**).
3. Rol: **Atlas admin** o **Read and write to any database** (desarrollo).

### 1.4 Permitir conexiones desde Render (red)

Render no tiene IP fija en el plan gratuito.

1. **Network Access** → **Add IP Address**.
2. **Allow Access from Anywhere** → `0.0.0.0/0`  
   (necesario para Render free; en producción seria puedes restringir más adelante).

### 1.5 URI de conexión (para Render, no para el móvil)

1. **Database** → **Connect** → **Drivers** → Node.js.
2. Copia la URI y **añade el nombre de la base de datos** antes de `?`:

```
mongodb+srv://USUARIO:CONTRASEÑA@cluster0.dmec8rq.mongodb.net/pareja_finanzas?retryWrites=true&w=majority&appName=Cluster0
```

Sustituye `USUARIO` y `CONTRASEÑA`. Si la contraseña tiene caracteres especiales (`@`, `#`, etc.), [codifícala en URL](https://www.urlencoder.org/).

**El móvil nunca usa esta URI** — solo la API en Render.

---

## Parte 2 — API separada en Render

### 2.1 Subir código a GitHub

1. Crea un repo en GitHub (solo el proyecto, sin `.env`).
2. En la raíz del proyecto:

```powershell
cd "c:\Users\samue\OneDrive\Escritorio\app control de gastos"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/pareja-finanzas.git
git push -u origin main
```

### 2.2 Crear Web Service en Render

1. [https://dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Conecta el repo de GitHub.
3. Configuración:

| Campo | Valor |
|--------|--------|
| **Name** | `pareja-finanzas-api` |
| **Root Directory** | `apps/api` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance type** | Free |

4. **Environment Variables** (Environment → Add):

| Variable | Valor |
|----------|--------|
| `MONGODB_URI` | URI completa de Atlas (paso 1.5) |
| `JWT_ACCESS_SECRET` | Cadena aleatoria ≥ 32 caracteres |
| `JWT_REFRESH_SECRET` | Otra cadena distinta ≥ 32 caracteres |
| `ENCRYPTION_KEY` | Base64 de 32 bytes (ver abajo) |
| `CORS_ORIGIN` | `*` (o deja vacío; por defecto `*`) |

Render asigna `PORT` solo — no lo definas tú.

**Generar `ENCRYPTION_KEY` en PowerShell:**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Guárdala: si la cambias, los saldos cifrados antiguos no se podrán leer.

**Generar JWT secrets:**

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

(Ejecuta dos veces para access y refresh.)

5. **Create Web Service** y espera el deploy.

6. Prueba en el navegador:

```
https://TU-SERVICIO.onrender.com/health
```

Debe responder: `{"ok":true}`.

Tu URL de API será algo como:

```
https://pareja-finanzas-api.onrender.com
```

### 2.3 Desarrollo local contra Atlas (opcional)

En `apps/api/.env` (solo en tu PC, no en Git):

```env
PORT=4000
MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster0.dmec8rq.mongodb.net/pareja_finanzas?retryWrites=true&w=majority
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ENCRYPTION_KEY=...
CORS_ORIGIN=*
```

```powershell
cd apps\api
npm run dev
```

Ya no necesitas Docker ni MongoDB local.

### 2.4 Plan free de Render

- El servicio **se duerme** tras ~15 min sin tráfico; la primera petición puede tardar ~30–60 s.
- **WebSockets** funcionan en el mismo servicio (Socket.IO).
- Para producción estable, valora un plan de pago o otro host.

---

## Parte 3 — APK Android (sin Docker, API ya en la nube)

La APK debe compilarse con la **URL pública de Render** embebida en el build.

### 3.1 Instalar EAS CLI

```powershell
npm install -g eas-cli
eas login
```

### 3.2 Configurar URL de producción

Edita `apps/mobile/eas.json` → perfil `production` → `EXPO_PUBLIC_API_URL`:

```json
"EXPO_PUBLIC_API_URL": "https://TU-SERVICIO.onrender.com"
```

(Sustituye por tu URL real de Render.)

### 3.3 Generar APK

```powershell
cd apps\mobile
eas build -p android --profile preview
```

- `preview` → APK instalable directamente (ideal para pareja / pruebas).
- `production` → AAB para Google Play.

Cuando termine, descarga el **APK** desde el enlace de Expo y instálalo en los dos Android. **No hace falta Expo Go ni Docker.**

### 3.4 Desarrollo día a día (opcional)

Sigue pudiendo usar Expo Go en local con `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000
```

Para pruebas contra Render desde Expo Go:

```env
EXPO_PUBLIC_API_URL=https://TU-SERVICIO.onrender.com
```

---

## Resumen del flujo

```
[Android APK]  ──HTTPS/WSS──►  [Render: apps/api]  ──►  [MongoDB Atlas]
     │                              │
     └── EXPO_PUBLIC_API_URL        └── MONGODB_URI (solo servidor)
```

| Componente | Dónde vive |
|------------|------------|
| Base de datos | MongoDB Atlas (`pareja_finanzas`) |
| API + WebSocket | Render (`apps/api`) |
| App | APK en cada teléfono |

---

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| API no arranca en Render | Revisa logs → suele ser `MONGODB_URI` mal formada o IP no permitida en Atlas |
| `MongoServerSelectionError` | Network Access `0.0.0.0/0` y usuario/contraseña correctos |
| App no conecta | `EXPO_PUBLIC_API_URL` debe ser `https://...onrender.com` sin barra final |
| Muy lento al abrir | Render free despierta el servicio; espera o haz ping a `/health` |
| “Sin sync” en dashboard | Misma URL en ambos móviles; token válido; WebSocket no bloqueado |

---

## Checklist rápido

- [ ] Contraseña Atlas rotada
- [ ] BD `pareja_finanzas` creada en Atlas
- [ ] Network Access `0.0.0.0/0`
- [ ] Render desplegado, `/health` OK
- [ ] Variables de entorno en Render (sin subir `.env` a Git)
- [ ] `eas.json` con URL de Render
- [ ] `eas build` APK instalado en ambos dispositivos
