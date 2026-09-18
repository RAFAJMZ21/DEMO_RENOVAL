# RENOVAL SYS - Sistema de Gestión de Tarimas y Embalaje Industrial

Plataforma web integral para la cotización paramétrica, control de inventarios, seguimiento de producción (Gantt) y certificación fitosanitaria (NOM-144) para la industria de tarimas de madera.

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Python 3.10+, FastAPI, Uvicorn, SQLAlchemy.
* **Frontend:** React, TypeScript, Vite, Tailwind CSS / Lucide Icons.
* **Base de Datos:** MySQL 8.0+.

---

## 📂 Estructura del Proyecto

```text
DEMO_RENOVAL/
└── DEMO_SYSTEM/
    ├── backend/      # API Rest construida con FastAPI
    └── frontend/     # Interfaz de usuario con React + TypeScript
```

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (v18.0 o superior)
* [Python](https://www.python.org/) (v3.10 o superior)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)

---

## 💻 Guía de Instalación y Despliegue Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/RAFAJMZ21/DEMO_RENOVAL.git
cd DEMO_RENOVAL/DEMO_SYSTEM
```

---

### 2. Configuración del Backend (FastAPI)

Navega a la carpeta de backend e instala las dependencias:

```bash
# Entrar a la carpeta backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

#### Base de Datos
1. Crea la base de datos en MySQL ejecutando el script `schema.sql` disponible en la carpeta de backend.
2. Configura tus credenciales de base de datos en el archivo `.env` dentro de `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=renoval_system_db
```

#### Iniciar el servidor backend:
```bash
uvicorn main:app --reload --port 8000
```
> La API estará disponible en: `http://localhost:8000`  
> Documentación Swagger: `http://localhost:8000/docs`

---

### 3. Configuración del Frontend (React + TypeScript)

Abre una nueva terminal y navega a la carpeta del frontend:

```bash
# Desde la raíz del proyecto (DEMO_RENOVAL/DEMO_SYSTEM)
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

> La aplicación web estará disponible en: `http://localhost:5173`

---

## 📌 Funcionalidades Principales

* **Panel Principal (Dashboard):** Vista ejecutiva de KPIs y métricas de producción.
* **Cotizador Paramétrico:** Cálculo dinámico de madera (Pies Tablares), fletes y margen de ganancia.
* **Control de Inventarios:** Monitoreo de stock de madera verde/estufada e insumos de clavado.
* **Gantt de Producción:** Seguimiento de lotes de fabricación y fases de taller.
* **Módulo Fitosanitario (NOM-144):** Control del horno HT y emisión de certificados en PDF.

---

## 📌 Fuentes de Información y Reglas de Negocio

* **Catálogo y Productos:** Basado en la información oficial de [Empresas RENOVAL](https://renovaltarimas.mx/).
* **Costos y Logística:** Algoritmos de cubicación y matrices de fletes basados en `Costos 2026.xlsx`.