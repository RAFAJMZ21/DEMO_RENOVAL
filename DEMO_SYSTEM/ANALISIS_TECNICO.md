# Análisis Técnico — DEMO_SYSTEM (RENOVAL SYS)

- **Fecha:** 08-10-2026
- **Rama analizada:** `steph` (`d61ebb1`) — es la que está en el working tree.
- **Ramas comparadas:** `tony` (`250092e`), `main` (`df305c7`), `feature/panel-operador-cotizaciones` (`128a7bc`).
- **Verificaciones ejecutadas:** `tsc -b`, `eslint .`, `vite build`, volcado real de rutas FastAPI, importación de módulos Python y prueba de conexión a MySQL.

---

## 0. Hallazgos críticos (P0)

| # | Hallazgo | Evidencia | Impacto |
|---|----------|-----------|---------|
| C1 | **El backend no arranca.** Credenciales MySQL hardcodeadas `root:1234` no válidas; `.env` vacío (0 bytes); `config.py` vacío; `python-dotenv` nunca se importa. | `backend/app/core/database.py:6`, `backend/main.py:22` | `import main` lanza `OperationalError (1045) Access denied for user 'root'@'localhost'`. Uvicorn no levanta → el frontend reporta "servidor backend apagado". |
| C2 | **Cero autenticación real.** El login devuelve el literal `"token_renoval_2026"`. No hay JWT, ni `OAuth2PasswordBearer`, ni `HTTPBearer`, ni un solo `Depends` de seguridad en los 13 endpoints. | `backend/app/api/v1/auth.py:46` | Cualquier llamada sin token funciona; el `Authorization: Bearer` de Axios se ignora por completo. |
| C3 | **Backdoor en el login.** Acepta la contraseña si coincide literalmente con el `password_hash` almacenado **o** si passlib la verifica. | `backend/app/api/v1/auth.py:42` | Quien conozca el hash (o lea la BD) entra sin conocer la contraseña. |
| C4 | **`venv/` roto y commiteado.** `pyvenv.cfg` apunta a `/usr/bin/python3` (Linux, usuario `stephany_reyes`); de 2037 piezas en `site-packages`, solo 411 son `.py` (pip) y 1597 son `.pyc` huérfanos sin fuente. 450 archivos de `venv/` están en git. | `backend/venv/pyvenv.cfg` | `venv\Scripts\python.exe` falla con "No Python at '/usr/bin/python.exe'". El runtime real es el Python 3.12 global. |
| C5 | **Desfase de ramas.** El frontend de `steph` llama a endpoints que solo existen en la rama `tony`. | §2.3 | 3 funciones apuntan a rutas inexistentes; varias vistas quedaron como stubs. |
| C6 | **`requirements.txt` incompleto.** Faltan `passlib`, `bcrypt` y `email-validator`, los tres importados en runtime. | `requirements.txt` vs `main.py:3`, `auth.py:3-4` | Instalación limpia con `pip install -r requirements.txt` → `ModuleNotFoundError` al arrancar. |

---

## 1. BACKEND (FastAPI / Python)

### 1.1 Estructura de carpetas

```text
backend/
├── main.py                    # App, CORS, montaje de routers, métricas, seeder
├── requirements.txt
├── .env                       # VACÍO (0 bytes), gitignored
├── venv/                      # ROTO (paths Linux + .pyc sin fuente), commiteado
└── app/
    ├── api/v1/                # 7 routers — SIN __init__.py
    │   ├── auth.py            # 2 endpoints
    │   ├── clientes.py        # 2 endpoints
    │   ├── cotizaciones.py    # 1 endpoint
    │   ├── inventario.py      # 1 endpoint (mock, sin DB)
    │   ├── produccion.py      # 1 endpoint (mock, sin DB)
    │   ├── fitosanitario.py   # 1 endpoint (mock, sin DB)
    │   └── logistica.py       # 4 endpoints (CRUD completo)
    ├── core/
    │   ├── config.py          # ARCHIVO VACÍO (0 líneas)
    │   └── database.py        # engine + SessionLocal + get_db
    ├── models/
    │   └── entities.py        # 5 entidades SQLAlchemy
    └── schemas/               # SIN .py — solo __pycache__ huérfano
```

Notas estructurales:

- **No existe ningún `__init__.py`** en el backend. Funciona por *namespace packages*, pero es frágil (colisión con cualquier paquete instalado llamado `app`).
- `app/schemas/` contiene solo `__pycache__/{__init__,cotizacion,logistica}.cpython-312.pyc` **sin fuente**; esos `.py` existen únicamente en la rama `tony`. No rompe nada porque nadie hace `import app.schemas`.
- Igual caso: `app/models/__pycache__/usuario.cpython-312.pyc` huérfano (`usuario.py` solo en `tony`).
- El `__pycache__` de `main.py` y de los routers está desactualizado respecto al HEAD.
- El patrón `schemas/` del proyecto está abandonado: **los esquemas Pydantic están inline en cada router** (`DestinoCreateSchema`, `InventarioRespuesta`, `CotizacionSchema`, etc.).

### 1.2 Endpoints disponibles (volcado real de `router.routes`)

| Método | Ruta | Módulo | Persistencia |
|--------|------|--------|--------------|
| POST | `/api/v1/auth/registro` | Auth | MySQL `usuarios` |
| POST | `/api/v1/auth/login` | Auth | MySQL `usuarios` |
| GET | `/api/v1/clientes/` | Clientes | MySQL `clientes` |
| GET | `/api/v1/clientes/{cliente_id}/estado-cuenta` | Clientes | MySQL `clientes` |
| POST | `/api/v1/cotizaciones/calcular` | Cotizador | MySQL `cotizaciones` |
| GET | `/api/v1/almacen/inventario-materia-prima` | Inventario | **Mock hardcodeado** |
| GET | `/api/v1/produccion/gantt` | Producción | **Mock hardcodeado** (ignora `LoteProduccionDB`) |
| GET | `/api/v1/fitosanitario/certificados` | Fitosanitario | **Mock hardcodeado** |
| GET | `/api/v1/logistica/fletes-destino` | Logística | MySQL `destinos_logistica` |
| POST | `/api/v1/logistica/fletes-destino` | Logística | MySQL `destinos_logistica` |
| PUT | `/api/v1/logistica/fletes-destino/{destino_id}` | Logística | MySQL `destinos_logistica` |
| DELETE | `/api/v1/logistica/fletes-destino/{destino_id}` | Logística | MySQL `destinos_logistica` |
| GET | `/api/v1/dashboard/metrics` | Dashboard (`main.py:52`) | **Mock hardcodeado** |

Endpoints ausentes en `steph` pero presentes en `tony`:
`GET /almacen/insumos-clavado/`, `GET /produccion/mermas-scrap/`, `GET /logistica/embarques/`,
`GET|POST /logistica/tarifas/`, `PATCH|DELETE /logistica/tarifas/{id}`,
`POST|GET /logistica/viajes/`, `GET /logistica/viajes/pendientes/`, `PATCH /logistica/viajes/{id}/aprobar`.

### 1.3 Modelos de entidad y esquemas vs MySQL

| Entidad (`entities.py`) | Tabla | Uso real |
|---|---|---|
| `UsuarioDB` | `usuarios` (username y email únicos) | Auth |
| `ClienteDB` | `clientes` (rfc único) | Clientes + FK de cotizaciones |
| `CotizacionDB` | `cotizaciones` (folio único) | Cotizaciones |
| `LoteProduccionDB` | `lotes_produccion` | **Creada por `create_all` y jamás consultada** |
| `DestinoLogisticaDB` | `destinos_logistica` | CRUD de fletes |

Inconsistencias detectadas:

1. **La cotización no se persiste completa.** `CotizacionSchema` recibe 11 campos de costo + `elementos[]`, pero `CotizacionDB` solo guarda `costo_total_unitario`. No hay tabla de detalle de elementos → la cotización no es reproducible ni auditable (`cotizaciones.py:65-75`).
2. **`rol` es `String(30)` sin enum.** El comentario de `entities.py:14` dice `OPERADOR`; el frontend envía `OPERADOR_PLANTA` (`types/index.ts:6`); `tony` compara contra `'OPERADOR'`. Sin `CHECK` ni `Enum`, los valores divergen libremente.
3. **Tipos TS sin backend:** `InsumoClavado`, `ControlMerma`, `EmbarqueDespacho` no tienen entidad ni endpoint en `steph`.
4. **`FleteTarifa` (TS) ≠ `DestinoResponseSchema` (Pydantic):**

| TS — `modulos.ts:12-19` | Pydantic — `logistica.py:20-25` |
|---|---|
| `precio_flete` | `precio_flete_total` |
| `capacidad` | `capacidad_tarimas` |
| — | `costo_gasolina`, `costo_casetas` |
| `costo_tarima_unitario` | `costo_tarima_unitario` ✔ |

Solo se consumen `municipio`, `estado` y `costo_tarima_unitario`, por eso **no hay error en runtime**, pero el tipo es incorrecto.

5. **Discrepancia de cálculo FE vs BE en el cotizador.** El frontend suma madera + 4 costos indirectos (`CotizadorForm.tsx:83-85`); el backend además suma `costo_variable` (50) y `costo_directo` (20) que el FE nunca envía y toma los defaults (`cotizaciones.py:30-31,49-59`). **La utilidad mostrada en pantalla difiere en $70 de la utilidad devuelta en el `alert`.**

### 1.4 Dependencias

| Paquete | En `requirements.txt` | Importado en código | Estado |
|---|---|---|---|
| `passlib` | NO | `main.py:3`, `auth.py:4` | **FALTA → `ModuleNotFoundError`** |
| `bcrypt` | NO | requerido por `CryptContext(schemes=["bcrypt"])` | **FALTA → error al hashear** |
| `email-validator` | NO | `auth.py:3` (`EmailStr`) | **FALTA → `ImportError` al importar auth** |
| `pydantic-settings` | sí | no (`config.py` vacío) | muerto |
| `python-dotenv` | sí | no | muerto — por eso `.env` se ignora |
| `reportlab` | sí | no | muerto — el "Descargar PDF" es un `alert()` |
| `openpyxl` | sí | no | muerto (ni siquiera instalado) |
| `pandas` / `httpx` | sí | no | muertos |
| `python-multipart` | sí | no | innecesario (no hay formularios) |

Instalación limpia reproducible: **no**. Solo funciona porque el Python global 3.12 tiene los paquetes instalados a mano.

### 1.5 Incoherencias en códigos HTTP

| Escenario | Código actual | Código correcto | Evidencia |
|---|---|---|---|
| Email ya registrado | `400` | `409` | `auth.py:26` |
| **Username duplicado** | **`500`** (`IntegrityError` sin `try/except`) | `409` | `auth.py:28-36` |
| Credenciales inválidas | `401` | `401` ✔ | `auth.py:43` |
| `cliente_id` inexistente en cotización | **`500`** (FK violation) | `404`/`422` | `cotizaciones.py:77-79` |
| **Dos cotizaciones en el mismo segundo** | **`500`** (`folio` = timestamp `%Y%m%d%H%M%S`, unique) | `409` o folio incremental | `cotizaciones.py:62`, `entities.py:31` |
| `capacidad_tarimas <= 0` | `400` | `422` (validación Pydantic) | `logistica.py:34,62` |
| `destino_id` inexistente | `404` ✔ | `404` | `logistica.py:60,84` |
| Path con `/` final (6 llamadas del FE) | `307` + doble request | ruta canónica | §2.3 |
| **DB caída / credenciales mal** | **la app entera no arranca** | `503` + healthcheck | `main.py:22` |

Además:

- **No hay `try/except` ni `db.rollback()`** en `auth.py`, `cotizaciones.py` ni `logistica.py`: cualquier `IntegrityError` se escapa como `500` sin `detail`.
- **Sin `response_model`** en `auth/registro`, `auth/login`, `cotizaciones/calcular`, `clientes/{id}/estado-cuenta`, `dashboard/metrics` y `logistica` DELETE → la forma de la respuesta no está garantizada ni documentada en OpenAPI.
- `@app.on_event("startup")` está **deprecado** (`main.py:72`); debe migrarse a `lifespan`.
- `CORS` con `allow_origins=["*"]` **y** `allow_credentials=True` (`main.py:29-35`) → el `Origin` se refleja para cualquier cliente.
- `Base.metadata.create_all()` en tiempo de import (`main.py:22`): sin DB no hay app.
- **No hay endpoint `GET` de listado de cotizaciones**, ni de usuarios, ni de lotes reales.

---

## 2. FRONTEND (React 19 / TypeScript / Vite 8)

### 2.1 Estructura de `src/`

```text
src/
├── main.tsx                    # mount + index.css
├── App.tsx                     # estado 'activeView' (SIN react-router)
├── App.css                     # muerto: nunca se importa
├── index.css                   # Tailwind v4
├── api/
│   ├── axios.ts                # baseURL http://127.0.0.1:8000/api/ + interceptor Bearer
│   ├── auth.ts                 # login / registro
│   ├── cotizaciones.ts         # POST calcular
│   ├── dashboard.ts            # GET metrics
│   └── modulos.ts              # 8 helpers (5 MUERTOS)
├── components/                 # 14 vistas
├── data/plantillasTarimas.ts   # plantillas paramétricas
├── types/index.ts              # 15 interfaces
├── assets/
└── NO EXISTE: context/ | views/ | components/Sidebar.tsx
```

- **`Sidebar.tsx` no existe en ninguna rama.** La navegación vive en el `<aside>` de `components/DashboardLayout.tsx:115-227`.
- **`src/context/` y `src/views/` solo existen en la rama `tony`**: `AuthContext.tsx`, `AuthProvider.tsx`, `views/{LogisticaAdminView,LogisticaOperadorView,PanelOperadorView,CotizacionesView}.tsx` y `api/logistica.ts`.

### 2.2 Rutas (`App.tsx`) y navegación

**No hay router.** `react-router-dom@7` está en `package.json` pero **no se importa en ningún archivo**. `App.tsx:35` maneja `useState<string>('dashboard')` y `DashboardLayout` renderiza por `activeView`:

| `activeView` | Componente | ¿Consume API? |
|---|---|---|
| `dashboard` | inline en `DashboardLayout.tsx:276-375` | SI `v1/dashboard/metrics` |
| `cotizador` | `CotizadorForm` | SI `v1/cotizaciones/calcular` + `v1/logistica/fletes-destino/` |
| `inventario_madera` | `InventarioMaderaView` | NO — 100% mock |
| `insumos_clavado` | `InsumosClavadoView` | NO — 100% mock |
| `lotes` | `GanttProduccion` | SI `v1/produccion/gantt/` |
| `fitosanitario` | `FitosanitarioView` | NO — 100% mock |
| `certificados` | `CertificadosView` | SI `v1/fitosanitario/certificados/` |
| `logistica` | `LogisticaDespachoView` | NO — 100% mock |
| `clientes` | `ClientesView` | NO — 100% mock |
| `usuarios` | `GestionUsuariosView` | NO — stub vacío |
| `fichas` | `FichasNormativasView` | NO — 100% mock |

Consecuencias: sin deep-linking, sin back/forward, sin guard por rol (en `steph`) y sin code-splitting (bundle único de 345 kB).

Estructura del sidebar (`DashboardLayout.tsx`), 4 grupos / 11 items:
`OPERACIONES` (dashboard, cotizador) · `MATERIA PRIMA & ALMACÉN` (inventario_madera, insumos_clavado) · `PRODUCCIÓN & NORMATIVA` (lotes, fitosanitario, certificados) · `LOGÍSTICA & DESPACHO` (logistica) · `ADMINISTRACIÓN` (clientes, usuarios, fichas).

### 2.3 Matriz de correspondencia Frontend ↔ Backend

`baseURL = http://127.0.0.1:8000/api/` + path.

| Origen | Llamada | Backend `steph` | Resultado |
|---|---|---|---|
| `auth.ts:5` | POST `v1/auth/login/` | `/api/v1/auth/login` | 307 por `/` final |
| `auth.ts:10` | POST `v1/auth/registro/` | `/api/v1/auth/registro` | 307 por `/` final |
| `cotizaciones.ts:5` | POST `v1/cotizaciones/calcular` | `/api/v1/cotizaciones/calcular` | OK |
| `dashboard.ts:5` | GET `v1/dashboard/metrics` | `/api/v1/dashboard/metrics` | OK |
| `modulos.ts:22` | GET `v1/produccion/gantt/` | `/api/v1/produccion/gantt` | 307 |
| `modulos.ts:27` | GET `v1/clientes/{id}/estado-cuenta/` | `/api/v1/clientes/{id}/estado-cuenta` | 307 (nunca se invoca) |
| `modulos.ts:32` | GET `v1/almacen/inventario-materia-prima/` | `/api/v1/almacen/inventario-materia-prima` | 307 (nunca se invoca) |
| **`modulos.ts:37`** | GET `v1/almacen/insumos-clavado/` | **NO EXISTE** | **404** (nunca se invoca) |
| **`modulos.ts:42`** | GET `v1/produccion/mermas-scrap/` | **NO EXISTE** | **404** (nunca se invoca) |
| **`modulos.ts:47`** | GET `v1/logistica/embarques/` | **NO EXISTE** | **404** (nunca se invoca) |
| `modulos.ts:52` | GET `v1/fitosanitario/certificados/` | `/api/v1/fitosanitario/certificados` | 307 |
| `modulos.ts:57` | GET `v1/logistica/fletes-destino/` | `/api/v1/logistica/fletes-destino` | 307 |

- **5 de 8 funciones de `modulos.ts` están muertas** (exportadas, cero importaciones): `getEstadoCuenta`, `getInventarioAlmacen`, `getInsumosClavado`, `getControlMermas`, `getEmbarquesDespacho`.
- **6 de 12 llamadas usan `/` final** y las rutas de `steph` están declaradas **sin** `/` → `307` extra en cada una. (En `tony` las rutas sí llevan `/`, por eso allí el frontend es consistente.)
- **`GET /api/v1/clientes/` tiene cero consumidores.**
- **Endpoints de `steph` sin consumidor:** `GET /clientes/`, `POST|PUT|DELETE /logistica/fletes-destino`.

### 2.4 Componentes mockeados / handlers incompletos

| Componente | Problema |
|---|---|
| **`LogisticaDespachoView.tsx`** | **El más crítico.** Tabla con **1 fila en duro** (`EMB-2026-881`), sin `useQuery`, sin CRUD y sin aprobar/rechazar. El backend de `steph` expone CRUD completo de `fletes-destino` (POST/PUT/DELETE) que **nadie consume**. El commit `d61ebb1 "feat: CRUD de fletes"` solo toca archivos del backend. |
| **`GestionUsuariosView.tsx`** | 20 líneas: encabezado + botón **"Nuevo Usuario" SIN `onClick`**. No consume `POST /auth/registro` ni lista usuarios (no existe `GET /auth/usuarios`). |
| **`InventarioMaderaView.tsx`** | KPIs en duro (`450 m³`, `125 m³`) + botón **"Registrar Entrada Madera" SIN `onClick`**. Ignora `getInventarioAlmacen`, que sí tiene endpoint. |
| **`InsumosClavadoView.tsx`** | 2 tarjetas en duro. Su endpoint existe solo en `tony`. |
| **`ClientesView.tsx`** | Array de **3** clientes en duro; el seeder crea **2**. No usa `GET /clientes/` ni `getEstadoCuenta`. |
| **`FitosanitarioView.tsx`** | Telemetría de horno 100% en duro (`58.4 °C`, `42 min`). |
| **`FichasNormativasView.tsx`** | 3 fichas en duro + botón **"Descargar Ficha PDF" SIN `onClick`**. |
| **`CertificadosView.tsx`** | SI consume la API, pero **"Descargar Certificado PDF" → `alert()`** (`:12-14`). `reportlab` está en requirements y nunca se usa. |
| **`CotizadorForm.tsx`** | `cliente_id: 1` **hardcodeado** (`:90`); no hay selector de cliente. |
| **`DashboardLayout.tsx`** | Buscador Ctrl+K es UI sin lógica: `searchQuery` se guarda y **nunca se consulta**, prometiendo "conectado a MySQL" (`:102`). Campana sin handler. |
| **`App.tsx`** | Al refrescar la página reconstruye la sesión con identidad inventada (§3.2). |
| **`App.css`** | Archivo muerto, nunca importado. |

---

## 3. INTEGRACIÓN Y AUTENTICACIÓN

### 3.1 Manejo de tokens JWT / Bearer

```ts
// src/api/axios.ts — correcto en el lado del cliente
baseURL: 'http://127.0.0.1:8000/api/'
interceptors.request -> config.headers.Authorization = `Bearer ${token}`
```

| Capa | Estado |
|---|---|
| FE envía `Bearer` | SI — `axios.ts:10-19` |
| BE emite JWT firmado | NO — literal `"token_renoval_2026"` (`auth.py:46`) |
| BE valida el token | NO — ningún router tiene dependencia de seguridad |
| BE devuelve `401` fuera de login | NO — nunca |
| FE interceptor de **respuesta** para `401` → logout | NO — existe solo el de request; sesión "activa" infinita con token inválido |
| Persistencia de sesión | `localStorage['access_token']`; en `steph` **no se guarda `user_info`** |
| Refresh token / expiración / revocación | NO existen (imposible: no es un JWT) |

### 3.2 Discrepancias de tipos e identidad

1. **Identidad falsa al refrescar** — `App.tsx:21-33`: si existe `access_token` en `localStorage`, devuelve `user_info` **hardcodeado** (`admin@renoval.com`, `Ing. Rafael`, `ADMIN`, `Planta`). Cualquier cadena en `localStorage` produce una sesión ADMIN; el `rol` real del backend se descarta.
2. **Credenciales por defecto que no funcionan** — `LoginForm.tsx:11-12` precarga `admin@renoval.com` / `123456`, pero el seeder crea `admin123` (`main.py:80`). El primer intento de login falla siempre con `401`.
3. **Roles divergentes** — TS envía `OPERADOR_PLANTA` (`types/index.ts:6`), `entities.py` documenta `OPERADOR`, `tony` exige `rol === 'OPERADOR'`. Sin enum en el backend, el control de acceso por rol es frágil.
4. **`FleteTarifa` TS ≠ `DestinoResponseSchema` Pydantic** (ver §1.3.4).
5. **Utilidad del cotizador difiere en $70 entre lo mostrado y lo persistido** (ver §1.3.5).
6. **Tipos TS sin contraparte backend:** `InsumoClavado`, `ControlMerma`, `EmbarqueDespacho`.

---

## 4. Verificaciones ejecutadas

| Prueba | Resultado |
|---|---|
| `npx tsc -b` | Sin errores |
| `npm run lint` (ESLint) | Sin errores |
| `npm run build` (Vite) | OK — 1926 módulos, `dist/` 345 kB JS + 38 kB CSS |
| `tsconfig.app.json` | **No tiene `"strict": true`** (solo `noUnusedLocals/Parameters`) |
| Importación de los 7 routers | OK |
| `import main` | **FALLA**: `OperationalError (1045) Access denied for user 'root'@'localhost'` |
| `venv\Scripts\python.exe` | **FALLA**: "No Python at '/usr/bin/python.exe'" |
| `schema.sql` (referenciado en `readme_md.md`) | **No existe en el repositorio** |
| Archivos fuente | Todos valid UTF-8 (sin mojibake real) |

---

## 5. Recomendaciones priorizadas

### P0 — Sin esto nada funciona

1. **Conexión a BD:** migrar `database.py` a `pydantic-settings` + `.env` (`DB_HOST/PORT/USER/PASSWORD/NAME`), poblar `.env` con la contraseña real de MySQL y eliminar el hardcode `root:1234`. Mover `create_all` a un evento de lifespan con manejo de error, y crear el `schema.sql` que exige el README.
2. **`requirements.txt`:** añadir `passlib`, `bcrypt`, `email-validator`; eliminar `pydantic-settings`/`python-dotenv`/`reportlab`/`openpyxl`/`pandas`/`httpx` si no se usan, o implementar su uso.
3. **Eliminar `venv/` del repositorio** (`git rm -r --cached DEMO_SYSTEM/backend/venv`), añadir `venv/` al `.gitignore` y recrear el entorno en Windows.
4. **Auth real:** emitir JWT (`python-jose` o `PyJWT`) con expiración y rol; crear `get_current_user` con `HTTPBearer` y aplicarlo a todos los routers salvo `auth/login` y `auth/registro`. **Borrar la comparación en texto plano** de `auth.py:42`.
5. **Sesión en el FE:** guardar `user_info` en `localStorage` (o usar el `AuthProvider` de `tony`) en lugar de la identidad inventada de `App.tsx:21-33`; corregir la contraseña por defecto a `admin123`. Añadir interceptor de respuesta que haga `logout` ante `401`.

### P1 — Coherencia FE ↔ BE

6. **Unificar ramas:** fusionar `tony` (backend completo: `insumos-clavado`, `mermas-scrap`, `embarques`, `tarifas`, `viajes/aprobar`, `app/schemas/`, `models/usuario.py` + frontend con `context/`, `views/`, `api/logistica.ts`) sobre `steph`, o eliminar del frontend las llamadas que `steph` no soporta.
7. **Normalizar rutas:** eliminar el `/` final de las 6 llamadas de `api/modulos.ts` y `api/auth.ts` (o declararlas con `/` en FastAPI) para evitar los `307`.
8. **Borrar código muerto:** `getEstadoCuenta`, `getInventarioAlmacen`, `getInsumosClavado`, `getControlMermas`, `getEmbarquesDespacho`, `App.css`, `react-router-dom`, `clsx`, `tailwind-merge` — o implementarlos.
9. **Tipos:** corregir `FleteTarifa` (`precio_flete_total`, `capacidad_tarimas`) y añadir `"strict": true` a `tsconfig.app.json`.

### P2 — Calidad y completitud

10. **Endpoints faltantes:** `GET /clientes/` sin consumidor y sin UI; `GET /cotizaciones/`; `GET /auth/usuarios`; `POST /almacen/entradas`; generación de PDF con `reportlab` para certificados y fichas.
11. **UI stub:** implementar `LogisticaDespachoView` (CRUD de fletes + aprobar/rechazar viajes, reutilizando `LogisticaAdminView` de `tony`), `GestionUsuariosView`, `InventarioMaderaView` y `ClientesView` (consumir `GET /clientes/`).
12. **Corregir códigos HTTP:** `409` para duplicados, `404/422` para `cliente_id` inválido, folio incremental para evitar colisiones de segundo, y `try/except` + `db.rollback()` en todos los `commit()`.
13. **Endurecer:** `allow_origins` explícito, migrar `on_event("startup")` a `lifespan`, añadir `response_model` a todos los endpoints, añadir `GET /health`.
14. **Frontend:** sustituir el estado por `react-router-dom` (ya instalado) con guards por rol, o eliminar la dependencia.

