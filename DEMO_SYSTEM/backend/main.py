from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlalchemy
from sqlalchemy import text

from app.core.database import engine, Base, get_db
from app.models.usuario import UsuarioDB
from app.models.entities import ClienteDB, CotizacionDB, FleteTarifaDB, ViajeLogisticaDB
from app.api.v1.auth import hash_password

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

# Crear tablas en MySQL
Base.metadata.create_all(bind=engine)


def _sync_columna_faltantes():
    """Migración liviana: agrega columnas faltantes a tablas existentes.

    ``Base.metadata.create_all`` no modifica tablas ya creadas, por lo que si
    ``cotizaciones`` existía con el esquema previo, los nuevos campos del modelo
    v2 (cliente, items, tipo_madera, subtotal, iva, total, estado, ...) no
    existirían en MySQL y el INSERT fallaría. Esta rutina las agrega vía ALTER.
    """
    inspector = sqlalchemy.inspect(engine)
    for table in Base.metadata.sorted_tables:
        if not inspector.has_table(table.name):
            continue
        columnas_existentes = {c["name"] for c in inspector.get_columns(table.name)}
        for col in table.columns:
            if col.name in columnas_existentes:
                continue
            declaracion = sqlalchemy.schema.CreateColumn(col).compile(dialect=engine.dialect)
            with engine.connect() as conn:
                conn.execute(text(f"ALTER TABLE {table.name} ADD COLUMN {declaracion}"))
                conn.commit()
            columnas_existentes.add(col.name)


_sync_columna_faltantes()


def _backfill_cotizaciones_legacy():
    """Rellena los campos v2 de filas legacy cuyos nuevos campos quedaron NULL.

    Las cotizaciones creadas con el esquema anterior (folio, atencion,
    nombre_producto, ...) no tenían cliente/tipo_madera/cantidad/subtotal/etc.
    Propagar las columnas antiguas evita el error de serialización del GET.
    """
    from app.models.entities import CotizacionDB
    from sqlalchemy.orm import sessionmaker
    Session = sessionmaker(bind=engine)
    with Session() as db:
        filas = db.query(CotizacionDB).order_by(CotizacionDB.id).all()
        cambios = 0
        for cot in filas:
            if cot.cliente is not None:
                continue
            cot.cliente = cot.atencion or "Sin cliente"
            cot.tipo_madera = cot.tipo_madera or "Sin especificar"
            cot.dimensiones = cot.dimensiones or ""
            cot.items = cot.items if cot.items is not None else []
            cot.precio_unitario = cot.precio_unitario if cot.precio_unitario is not None else (cot.precio_sugerido_unidad or 0.0)
            cot.cantidad = cot.cantidad if cot.cantidad is not None else (cot.cantidad_piezas or 1)
            cot.costo_mano_obra = cot.costo_mano_obra if cot.costo_mano_obra is not None else 0.0
            cot.flete = cot.flete if cot.flete is not None else 0.0
            cot.subtotal = cot.subtotal if cot.subtotal is not None else (cot.costo_total_unitario or 0.0)
            cot.iva = cot.iva if cot.iva is not None else 0.0
            cot.total = cot.total if cot.total is not None else (cot.total or cot.subtotal)
            cot.estado = cot.estado if cot.estado is not None else "Borrador"
            cambios += 1
        if cambios:
            db.commit()
            print(f"[backfill] cotizaciones actualizadas: {cambios}")


_backfill_cotizaciones_legacy()

app = FastAPI(
    title="RENOVAL SYS - Embalaje Industrial API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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

# ------------------------------------------------------------------------------
# Seeder Inicial de Base de Datos MySQL
# ------------------------------------------------------------------------------

app = FastAPI(
    title="RENOVAL SYS - Embalaje Industrial API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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


def _ensure_usuario(db, username, email, password, rol, nombre_completo):
    """Crea un usuario por defecto únicamente si el username no existe."""
    if db.query(UsuarioDB).filter(UsuarioDB.username == username).first():
        return False
    db.add(UsuarioDB(
        username=username,
        email=email,
        password_hash=hash_password(password),
        nombre_completo=nombre_completo,
        rol=rol,
    ))
    return True


@app.on_event("startup")
def seeder_base_datos():
    db = next(get_db())
    try:
        creados = []
        if _ensure_usuario(db, "admin", "admin@renoval.mx", "admin123", "ADMIN", "Administrador RENOVAL"):
            creados.append("admin")
        if _ensure_usuario(db, "operador", "operador@renoval.mx", "operador123", "OPERADOR", "Operador de Transporte"):
            creados.append("operador")
        if db.query(ClienteDB).count() == 0:
            db.add_all([
                ClienteDB(razon_social="Logística & Embalajes del Valle S.A.", rfc="LEV180420ABC", limite_credito=500000.0, credito_utilizado=180000.0, anticipos_registrados=50000.0),
                ClienteDB(razon_social="Automotive Freight Mexico", rfc="AFM990115XYZ", limite_credito=750000.0, credito_utilizado=320000.0, anticipos_registrados=100000.0),
            ])
        if db.query(FleteTarifaDB).count() == 0:
            db.add_all([
                FleteTarifaDB(estado="CDMX", municipio="Miguel Hidalgo", empresa="Transportes RENOVAL", kilometros=51.0, precio_flete=4300.0, costo_km=84.31, capacidad_tarimas=200, precio_unitario=21.50, precio_reducido=20.43),
                FleteTarifaDB(estado="Querétaro", municipio="Parque Industrial Aerotech", empresa="Transportes RENOVAL", kilometros=205.0, precio_flete=11500.0, costo_km=56.10, capacidad_tarimas=200, precio_unitario=57.50, precio_reducido=54.63),
                FleteTarifaDB(estado="CDMX", municipio="Ixtapaluca", empresa="Transportes RENOVAL", kilometros=80.0, precio_flete=6000.0, costo_km=75.00, capacidad_tarimas=200, precio_unitario=30.00, precio_reducido=28.50),
                FleteTarifaDB(estado="CDMX", municipio="Azcapotzalco", empresa="Transportes RENOVAL", kilometros=55.0, precio_flete=4600.0, costo_km=83.64, capacidad_tarimas=200, precio_unitario=23.00, precio_reducido=21.85),
                FleteTarifaDB(estado="CDMX", municipio="Atizapán", empresa="Transportes RENOVAL", kilometros=59.0, precio_flete=4800.0, costo_km=81.36, capacidad_tarimas=200, precio_unitario=24.00, precio_reducido=22.80),
                FleteTarifaDB(estado="Edomex", municipio="Cuautitlán", empresa="Transportes RENOVAL", kilometros=48.0, precio_flete=9300.0, costo_km=193.75, capacidad_tarimas=480, precio_unitario=19.38, precio_reducido=18.41),
            ])
        if creados:
            print(f"[seeder] usuarios por defecto creados: {', '.join(creados)}")
        db.commit()
    finally:
        db.close()