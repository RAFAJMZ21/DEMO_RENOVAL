import sys

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
from sqlalchemy.exc import OperationalError, SQLAlchemyError

# La consola de Windows (cp1252) no puede imprimir emojis; forzamos UTF-8 para
# que los avisos de fallback no rompan el arranque.
for _stream in (sys.stdout, sys.stderr):
    try:
        if _stream is not None:
            _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

from app.core.database import engine, Base, get_db, verificar_conexion
from app.models.entities import UsuarioDB, ClienteDB

# Importar routers modulares completos de la carpeta app/api/v1
from app.api.v1 import (
    auth,
    clientes,
    cotizaciones,
    inventario,
    produccion,
    fitosanitario,
    logistica,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MYSQL_FALLBACK_MSG = (
    "⚠️ MySQL no está disponible o las credenciales fallaron. "
    "Iniciando servidor en modo fallback..."
)

# ------------------------------------------------------------------------------
# Crear tablas en MySQL
# Si la base no responde (credenciales inválidas, servicio caído, error 1045,
# etc.) NO se debe colapsar el arranque: se avisa y el servidor sigue vivo para
# que el frontend conmute suavemente al MODO DEMO / Offline.
# ------------------------------------------------------------------------------
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Conexión a MySQL establecida. Tablas verificadas.")
except (OperationalError, SQLAlchemyError) as exc:
    print(f"{MYSQL_FALLBACK_MSG}\n   Detalle: {exc}")
except Exception as exc:  # noqa: BLE001 - nunca debe tumbar el arranque
    print(f"{MYSQL_FALLBACK_MSG}\n   Detalle inesperado: {exc}")

app = FastAPI(
    title="RENOVAL SYS - Embalaje Industrial API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Montar Routers Modulares Unificados (Sin duplicados en Swagger UI)
# ------------------------------------------------------------------------------
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(clientes.router, prefix="/api/v1/clientes", tags=["Clientes"])
app.include_router(cotizaciones.router, prefix="/api/v1/cotizaciones", tags=["Cotizaciones"])
app.include_router(inventario.router, prefix="/api/v1/almacen", tags=["Almacén e Inventario"])
app.include_router(produccion.router, prefix="/api/v1/produccion", tags=["Producción"])
app.include_router(fitosanitario.router, prefix="/api/v1/fitosanitario", tags=["Norma NOM-144"])
app.include_router(logistica.router, prefix="/api/v1/logistica", tags=["Logística & Despacho"])


# ------------------------------------------------------------------------------
# Manejo global de errores de base de datos
# Cualquier endpoint que dependa de MySQL responde 503 con un mensaje claro en
# lugar de un 500 crudo, permitiendo al frontend activar el Modo Demo.
# ------------------------------------------------------------------------------
@app.exception_handler(OperationalError)
async def manejador_operational_error(request: Request, exc: OperationalError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": (
                "MySQL no está disponible o las credenciales fallaron. "
                "Continúa en MODO DEMO / Offline."
            ),
            "error": "database_unavailable",
        },
    )


@app.exception_handler(SQLAlchemyError)
async def manejador_sqlalchemy_error(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": (
                "Ocurrió un error de base de datos. "
                "Continúa en MODO DEMO / Offline."
            ),
            "error": "database_error",
        },
    )


# ------------------------------------------------------------------------------
# Endpoints Complementarios de Métricas y Salud
# ------------------------------------------------------------------------------
@app.get("/api/v1/health", tags=["Salud"])
def estado_salud():
    """Sonda de salud: informa si MySQL responde para que el cliente decida el modo."""
    conectada = verificar_conexion()
    return {
        "status": "ok",
        "database": "online" if conectada else "offline",
        "mode": "database" if conectada else "demo",
    }


@app.get("/api/v1/dashboard/metrics", tags=["Dashboard"])
def obtener_metricas():
    return {
        "tarimas_producidas": 12450,
        "lotes_completados": 3,
        "utilidad_promedio_pct": 28.4,
        "utilidad_promedio_monto": 48.50,
        "top_modelos": [
            {"nombre": "Tarima Barrote 40\" x 48\"", "unidades": 4800},
            {"nombre": "Tarima Tacón Perimetral", "unidades": 3200},
            {"nombre": "Caja de Madera Industrial", "unidades": 1450},
        ],
        "ht_en_proceso_lotes": 3,
        "ht_en_proceso_piezas": 2400,
        "certificados_liberados": 15,
    }


# ------------------------------------------------------------------------------
# Seeder Inicial de Base de Datos MySQL
# Nunca debe colapsar el startup: si MySQL no responde se avisa y el servidor
# continúa para permitir el Modo Demo en el frontend.
# ------------------------------------------------------------------------------
@app.on_event("startup")
def seeder_base_datos():
    try:
        db = next(get_db())
    except Exception as exc:  # noqa: BLE001
        print(f"{MYSQL_FALLBACK_MSG}\n   No se pudo abrir sesión de BD: {exc}")
        return

    try:
        if db.query(UsuarioDB).count() == 0:
            db.add(
                UsuarioDB(
                    username="rafael",
                    email="admin@renoval.com",
                    password_hash=pwd_context.hash("admin123"),
                    nombre_completo="Ing. Rafael",
                    rol="ADMIN",
                )
            )
        if db.query(ClienteDB).count() == 0:
            db.add_all(
                [
                    ClienteDB(
                        razon_social="Logística & Embalajes del Valle S.A.",
                        rfc="LEV180420ABC",
                        limite_credito=500000.0,
                        credito_utilizado=180000.0,
                        anticipos_registrados=50000.0,
                    ),
                    ClienteDB(
                        razon_social="Automotive Freight Mexico",
                        rfc="AFM990115XYZ",
                        limite_credito=750000.0,
                        credito_utilizado=320000.0,
                        anticipos_registrados=100000.0,
                    ),
                ]
            )
        db.commit()
        print("✅ Seeder ejecutado: datos iniciales verificados.")
    except (OperationalError, SQLAlchemyError) as exc:
        db.rollback()
        print(f"{MYSQL_FALLBACK_MSG}\n   Seeder omitido (SQLAlchemyError): {exc}")
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        print(f"{MYSQL_FALLBACK_MSG}\n   Seeder omitido (error inesperado): {exc}")
    finally:
        db.close()
