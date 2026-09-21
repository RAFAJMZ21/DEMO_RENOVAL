# 🚀 Guía de Despliegue: Frontend en Vercel + Backend en Railway/Render

## ⚠️ IMPORTANTE: Vercel NO soporta Python/FastAPI

Vercel solo sirve **frontend estático** (React, Next.js, Vue, etc.). Tu backend FastAPI necesita un hosting separado.

---

## 📦 Opción 1: Backend en Railway (Recomendado - Más fácil)

### 1. Crear cuenta en Railway
- Ve a [railway.app](https://railway.app) → "Start a New Project" → "Deploy from GitHub repo"
- Selecciona tu repo: `RAFAJMZ21/DEMO_RENOVAL` → Rama: `tony`
- Root Directory: `DEMO_SYSTEM/backend`

### 2. Configurar Variables de Entorno en Railway
```
DATABASE_URL=sqlite:///./renoval_system.db
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
PYTHON_VERSION=3.9
```

### 3. Configurar Build/Start Commands
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 4. Railway detecta automáticamente el puerto con `$PORT`

---

## 📦 Opción 2: Backend en Render

### 1. Crear Web Service en Render
- [render.com](https://render.com) → "New Web Service" → Conecta GitHub
- Repo: `RAFAJMZ21/DEMO_RENOVAL` → Branch: `tony`
- Root Directory: `DEMO_SYSTEM/backend`

### 2. Configuración
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment**: Python 3.9

### 3. Variables de Entorno
```
DATABASE_URL=sqlite:///./renoval_system.db
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura_aqui
```

---

## 🌐 Frontend en Vercel

### 1. Importar Proyecto en Vercel
- [vercel.com](https://vercel.com) → "Add New Project" → Import Git Repository
- Selecciona: `RAFAJMZ21/DEMO_RENOVAL`
- **Framework Preset**: Vite
- **Root Directory**: `DEMO_SYSTEM/frontend`

### 2. Configurar Variables de Entorno en Vercel
En Settings → Environment Variables:
```
VITE_API_BASE_URL=https://tu-backend.railway.app/api/
```
(O la URL que te dé Railway/Render)

### 3. Deploy
- Vercel detecta automáticamente: `npm run build` → `dist/`
- El `vercel.json` ya está configurado para SPA routing

---

## 🔧 Archivos Creados/Modificados

### Frontend (`DEMO_SYSTEM/frontend/`)
- ✅ `vercel.json` - Configuración SPA + cache
- ✅ `.env` - Desarrollo local
- ✅ `.env.example` - Template para producción
- ✅ `src/api/axios.ts` - Usa `import.meta.env.VITE_API_BASE_URL`

### Backend (`DEMO_SYSTEM/backend/`)
- ✅ `requirements.txt` - **¡NECESARIO CREARLO!** (ver abajo)

---

## 📝 Crear requirements.txt para el Backend

Ejecuta en tu backend local:
```bash
cd DEMO_SYSTEM/backend
.\venv\Scripts\python.exe -m pip freeze > requirements.txt
```

O crea manualmente:
```
fastapi==0.128.8
uvicorn[standard]==0.39.0
sqlalchemy==2.0.54
pymysql==1.2.3
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.5.0
python-multipart==0.0.20
email-validator==2.3.0
bcrypt==3.2.2
dnspython==2.7.0
```

---

## ✅ Checklist Pre-Deploy

- [ ] Crear `requirements.txt` en `DEMO_SYSTEM/backend/`
- [ ] Push cambios a rama `tony`: `git add . && git commit -m "config deploy" && git push origin tony`
- [ ] Deploy Backend en Railway/Render → Obtener URL pública
- [ ] Deploy Frontend en Vercel con `VITE_API_BASE_URL=https://tu-backend.url/api/`
- [ ] Verificar CORS en backend permite el dominio de Vercel
- [ ] Probar login y navegación por roles

---

## 🔧 CORS en Backend (main.py)

Ya está configurado para permitir todo (`allow_origins=["*"]`), pero en producción deberías restringirlo:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tu-frontend.vercel.app"],  # Tu dominio Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 💡 Alternativa: Todo en Railway

Railway puede servir **ambos**: backend (Python) + frontend (Static)
- Agrega tu frontend como "Static Site" en el mismo proyecto
- Build: `npm run build` | Output: `dist/`
- Ventaja: Mismo dominio, sin CORS, variables de entorno compartidas