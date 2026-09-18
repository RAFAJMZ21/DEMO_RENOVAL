from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext

from app.core.database import engine, Base, get_db
from app.models.entities import UsuarioDB, ClienteDB

# Importar routers modulares completos de la carpeta app/api/v1
from app.api.v1 import (
    auth, 
    clientes, 
    cotizaciones, 
    inventario, 
    produccion,
    fitosanitario,
    logistica
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Crear tablas en MySQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RENOVAL SYS - Embalaje Industrial API",
    version="2.0.0"
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
# Endpoints Complementarios de Métricas y Consulta de Tarifas
# ------------------------------------------------------------------------------
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
            {"nombre": "Caja de Madera Industrial", "unidades": 1450}
        ],
        "ht_en_proceso_lotes": 3,
        "ht_en_proceso_piezas": 2400,
        "certificados_liberados": 15
    }

@app.get("/api/v1/logistica/fletes-destino", tags=["Logística & Despacho"])
def obtener_fletes_destino():
    """Retorna la matriz de fletes parametrizada según Costos 2026.xlsx"""
    return [
        {"estado": "CDMX", "municipio": "Miguel Hidalgo", "km": 51, "precio_flete": 4300.0, "capacidad": 200, "costo_tarima_unitario": 21.50},
        {"estado": "Querétaro", "municipio": "Parque Industrial Aerotech", "km": 205, "precio_flete": 11500.0, "capacidad": 200, "costo_tarima_unitario": 57.50},
        {"estado": "CDMX", "municipio": "Ixtapaluca", "km": 80, "precio_flete": 6000.0, "capacidad": 200, "costo_tarima_unitario": 30.00},
        {"estado": "CDMX", "municipio": "Azcapotzalco", "km": 55, "precio_flete": 4600.0, "capacidad": 200, "costo_tarima_unitario": 23.00},
        {"estado": "Edomex", "municipio": "Cuautitlán", "km": 48, "precio_flete": 9300.0, "capacidad": 480, "costo_tarima_unitario": 19.38}
    ]

# ------------------------------------------------------------------------------
# Seeder Inicial de Base de Datos MySQL
# ------------------------------------------------------------------------------
@app.on_event("startup")
def seeder_base_datos():
    db = next(get_db())
    try:
        if db.query(UsuarioDB).count() == 0:
            db.add(UsuarioDB(
                username="rafael",
                email="admin@renoval.com",
                password_hash=pwd_context.hash("admin123"),
                nombre_completo="Ing. Rafael",
                rol="ADMIN"
            ))
        if db.query(ClienteDB).count() == 0:
            db.add_all([
                ClienteDB(razon_social="Logística & Embalajes del Valle S.A.", rfc="LEV180420ABC", limite_credito=500000.0, credito_utilizado=180000.0, anticipos_registrados=50000.0),
                ClienteDB(razon_social="Automotive Freight Mexico", rfc="AFM990115XYZ", limite_credito=750000.0, credito_utilizado=320000.0, anticipos_registrados=100000.0),
            ])
        db.commit()
    finally:
        db.close()