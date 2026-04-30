# OneChance — Setup via CLI (registro completo)

Todo el setup se hace desde terminal. Este doc registra cada comando ejecutado y su resultado.

---

## Pre-requisitos verificados

```bash
node --version   # v24.14.0
npm --version    # 11.9.0
firebase --version  # 15.6.0
```

---

## 1. Firebase — Login

```bash
firebase login:list
# → Logged in as alberdimoreno0@gmail.com
```

Si necesitás cambiar de cuenta:
```bash
firebase login --reauth
```

---

## 2. Firebase — Crear proyecto

```bash
firebase projects:create onechance-platform --display-name "OneChance" --json
```

**Resultado:**
- Project ID: `onechance-platform`
- Project Number: `733213084123`
- Display name: `OneChance`

---

## 3. Next.js — Crear app

```bash
cd OneChance/
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Stack generado:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- ESLint
- Carpeta `src/`
- Import alias `@/*`

---

## 4. Firebase — Instalar SDK

```bash
cd web/
npm install firebase
```

---

## 5. Firebase — Registrar web app y obtener config

```bash
firebase apps:create web "OneChance Web" --project onechance-platform --json
# → appId: 1:733213084123:web:5d1b7c29da58fc2df77ffe

firebase apps:sdkconfig web 1:733213084123:web:5d1b7c29da58fc2df77ffe --project onechance-platform --json
```

**Config obtenida** (guardada en `.env.local`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDwqXp7pNswrgcWi50NGY73KYK5DteRFtU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=onechance-platform.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=onechance-platform
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=onechance-platform.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=733213084123
NEXT_PUBLIC_FIREBASE_APP_ID=1:733213084123:web:5d1b7c29da58fc2df77ffe
```

---

## 6. Firebase Console — Activar servicios (pasos manuales requeridos)

> El CLI no puede habilitar APIs desde cero sin gcloud. Se hace una sola vez desde la consola.

### 6.1 Activar Authentication

1. Ir a: https://console.firebase.google.com/project/onechance-platform/authentication
2. Click **"Comenzar"**
3. En la pestaña **"Método de inicio de sesión"**, habilitar **"Correo electrónico/contraseña"**
4. Guardar

### 6.2 Crear Firestore Database

1. Ir a: https://console.firebase.google.com/project/onechance-platform/firestore
2. Click **"Crear base de datos"**
3. Elegir modo: **"Iniciar en modo de prueba"** (las reglas reales están en `firestore.rules`)
4. Ubicación: **`nam5 (us-central)`**
5. Click **"Listo"**

### 6.3 Crear Realtime Database

1. Ir a: https://console.firebase.google.com/project/onechance-platform/database
2. Click **"Crear base de datos"**
3. Ubicación: **`us-central1`**
4. Modo: **"Iniciar en modo bloqueado"** (las reglas reales están en `database.rules.json`)
5. Click **"Listo"**

---

## 7. Firebase CLI — Deployar reglas

```bash
cd web/
firebase use onechance-platform
firebase deploy --only firestore:rules,database
```

**Resultado:**
```
✅ database: rules released → onechance-platform-default-rtdb
✅ firestore: rules released → cloud.firestore
```

---

## 8. Archivos generados por el setup

```
web/
  .env.local              ← Variables de entorno (NO se commitea — en .gitignore)
  .firebaserc             ← Proyecto Firebase activo
  firebase.json           ← Config de servicios Firebase
  firestore.rules         ← Reglas de seguridad Firestore
  firestore.indexes.json  ← Índices Firestore
  database.rules.json     ← Reglas de seguridad Realtime DB
  src/lib/firebase.ts     ← Inicialización del SDK para Next.js
```

---

## 9. Verificar que todo funciona

```bash
cd web/
npm run dev
# → http://localhost:3000
```

---

## Próximo paso — Cloudinary (storage de imágenes/videos)

1. Crear cuenta en https://cloudinary.com (plan gratuito)
2. Desde el dashboard obtener: Cloud Name + API Key + API Secret
3. Crear un **Upload Preset** sin firma (unsigned) para uploads desde el frontend
4. Agregar al `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu-preset
   ```
