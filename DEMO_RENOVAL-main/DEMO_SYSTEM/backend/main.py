from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import engine, Base, get_db
from app.models.entities import (
    UsuarioDB, ClienteDB, CotizacionDB, LoteProduccionDB,
    InsumoClavadoDB, CertificadoFitosanitarioDB, EmbarqueDespachoDB,
    FleteTarifaDB, ControlMermaDB, FichaNormativaDB, DestinoLogisticaDB
)

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

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RENOVAL SYS - Embalaje Industrial API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
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
app.include_router(inventario.router, prefix="/v1/almacen", tags=["Almacén e Inventario"])
app.include_router(produccion.router, prefix="/api/v1/produccion", tags=["Producción"])
app.include_router(fitosanitario.router, prefix="/api/v1/fitosanitario", tags=["Norma NOM-144"])
app.include_router(logistica.router, prefix="/api/v1/logistica", tags=["Logística & Despacho"])


# ------------------------------------------------------------------------------
# Endpoints Complementarios de Métricas y Consulta de Tarifas
# ------------------------------------------------------------------------------
@app.get("/api/v1/dashboard/metrics", tags=["Dashboard"])
def obtener_metricas(db: Session = Depends(get_db)):
    from sqlalchemy import func
    from sqlalchemy.orm import Session
    total_tarimas = db.query(func.sum(LoteProduccionDB.piezas_completadas)).scalar() or 0
    lotes_completados = db.query(LoteProduccionDB).filter(LoteProduccionDB.etapa_actual == "EMBARQUE").count()
    
    cotizaciones = db.query(CotizacionDB).all()
    utilidad_promedio = sum(c.utilidad_unitaria for c in cotizaciones) / len(cotizaciones) if cotizaciones else 0
    precio_promedio = sum(c.precio_sugerido_unidad for c in cotizaciones) / len(cotizaciones) if cotizaciones else 0
    
    top_modelos = db.query(
        CotizacionDB.nombre_producto,
        func.sum(CotizacionDB.cantidad_piezas).label('total')
    ).group_by(CotizacionDB.nombre_producto).order_by(func.sum(CotizacionDB.cantidad_piezas).desc()).limit(3).all()
    
    ht_en_proceso = db.query(LoteProduccionDB).filter(LoteProduccionDB.etapa_actual == "HT_FITOSANITARIO").all()
    ht_lotes = len(ht_en_proceso)
    ht_piezas = sum(l.piezas_totales for l in ht_en_proceso)
    
    certificados_liberados = db.query(CertificadoFitosanitarioDB).count()

    return {
        "tarimas_producidas": int(total_tarimas),
        "lotes_completados": lotes_completados,
        "utilidad_promedio_pct": round((utilidad_promedio / precio_promedio * 100) if precio_promedio else 0, 1),
        "utilidad_promedio_monto": round(utilidad_promedio, 2),
        "top_modelos": [
            {"nombre": m.nombre_producto, "unidades": int(m.total)} for m in top_modelos
        ],
        "ht_en_proceso_lotes": ht_lotes,
        "ht_en_proceso_piezas": ht_piezas,
        "certificados_liberados": certificados_liberados
    }


# ------------------------------------------------------------------------------
# Seeder Inicial de Base de Datos
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
                ClienteDB(razon_social="Empaques Industriales Lerma", rfc="EIL050812PQR", limite_credito=300000.0, credito_utilizado=45000.0, anticipos_registrados=0.0),
            ])
        if db.query(InsumoClavadoDB).count() == 0:
            db.add_all([
                InsumoClavadoDB(codigo="CLV-ESPIRAL-2.5", descripcion="Clavo Espiral en Rollo 2 1/2\"", tipo="CLAVO_ESPIRAL", medida="2.5 in", existencia_kg=1200.0, stock_minimo_kg=500.0, linea_asignada="Línea A de Clavado"),
                InsumoClavadoDB(codigo="CLV-EST-3", descripcion="Clavo Estándar 3\"", tipo="CLAVO_ESTANDAR", medida="3 in", existencia_kg=250.0, stock_minimo_kg=500.0, linea_asignada="Línea B de Clavado"),
                InsumoClavadoDB(codigo="GRP-1", descripcion="Grapas de Sujeción 1\"", tipo="GRAPA", medida="1 in", existencia_kg=400.0, stock_minimo_kg=200.0, linea_asignada="Línea A de Clavado"),
            ])
        if db.query(CertificadoFitosanitarioDB).count() == 0:
            from datetime import date
            db.add_all([
                CertificadoFitosanitarioDB(folio_certificado="CERT-HT-2026-001", folio_lote="LOT-2026-001", cliente="Logística & Embalajes del Valle S.A.", codigo_sello_ht="MX-144-HT-089", temperatura_alcanzada=58.4, tiempo_sostenimiento_min=42, fecha_emision=date(2026, 9, 17)),
                CertificadoFitosanitarioDB(folio_certificado="CERT-HT-2026-002", folio_lote="LOT-2026-003", cliente="Automotive Freight Mexico", codigo_sello_ht="MX-144-HT-089", temperatura_alcanzada=61.2, tiempo_sostenimiento_min=55, fecha_emision=date(2026, 9, 15)),
            ])
        if db.query(EmbarqueDespachoDB).count() == 0:
            from datetime import date
            db.add_all([
                EmbarqueDespachoDB(folio_embarque="EMB-2026-881", cliente="Logística & Embalajes del Valle S.A.", chofer="Carlos Mendoza", placas_trailer="77-AB-9X", tarimas_cargadas=600, fecha_despacho=date(2026, 9, 17), estatus="EN_TRANSITO"),
                EmbarqueDespachoDB(folio_embarque="EMB-2026-882", cliente="Automotive Freight Mexico", chofer="Roberto Silva", placas_trailer="45-CD-7Z", tarimas_cargadas=400, fecha_despacho=date(2026, 9, 18), estatus="PROGRAMADO"),
            ])
        if db.query(FleteTarifaDB).count() == 0:
            db.add_all([
                FleteTarifaDB(estado="CDMX", municipio="Miguel Hidalgo", km=51, precio_flete=4300.0, capacidad=200, costo_tarima_unitario=21.50),
                FleteTarifaDB(estado="Querétaro", municipio="Parque Industrial Aerotech", km=205, precio_flete=11500.0, capacidad=200, costo_tarima_unitario=57.50),
                FleteTarifaDB(estado="CDMX", municipio="Ixtapaluca", km=80, precio_flete=6000.0, capacidad=200, costo_tarima_unitario=30.00),
                FleteTarifaDB(estado="CDMX", municipio="Azcapotzalco", km=55, precio_flete=4600.0, capacidad=200, costo_tarima_unitario=23.00),
                FleteTarifaDB(estado="Edomex", municipio="Cuautitlán", km=48, precio_flete=9300.0, capacidad=480, costo_tarima_unitario=19.38),
            ])
        if db.query(DestinoLogisticaDB).count() == 0:
            db.add_all([
                DestinoLogisticaDB(estado="CDMX", municipio="Miguel Hidalgo", km=51.0, costo_gasolina=1200.0, costo_casetas=3100.0, precio_flete_total=4300.0, capacidad_tarimas=200, costo_tarima_unitario=21.50),
                DestinoLogisticaDB(estado="Querétaro", municipio="Parque Industrial Aerotech", km=205.0, costo_gasolina=4800.0, costo_casetas=6700.0, precio_flete_total=11500.0, capacidad_tarimas=200, costo_tarima_unitario=57.50),
                DestinoLogisticaDB(estado="CDMX", municipio="Ixtapaluca", km=80.0, costo_gasolina=1800.0, costo_casetas=4200.0, precio_flete_total=6000.0, capacidad_tarimas=200, costo_tarima_unitario=30.00),
                DestinoLogisticaDB(estado="CDMX", municipio="Azcapotzalco", km=55.0, costo_gasolina=1300.0, costo_casetas=3300.0, precio_flete_total=4600.0, capacidad_tarimas=200, costo_tarima_unitario=23.00),
                DestinoLogisticaDB(estado="Edomex", municipio="Cuautitlán", km=48.0, costo_gasolina=2200.0, costo_casetas=7100.0, precio_flete_total=9300.0, capacidad_tarimas=480, costo_tarima_unitario=19.38),
            ])
        if db.query(LoteProduccionDB).count() == 0:
            from datetime import date
            db.add_all([
                LoteProduccionDB(folio_lote="LOT-2026-001", producto="Tarima Barrote 40\" x 48\" (NOM-144)", piezas_totales=1200, piezas_completadas=850, etapa_actual="HT_FITOSANITARIO", fecha_inicio=date(2026, 9, 14), fecha_fin_estimada=date(2026, 9, 19), area_asignada="Horno de Estufado HT-01"),
                LoteProduccionDB(folio_lote="LOT-2026-002", producto="Tarima Tacón Perimetral 1200x1000mm", piezas_totales=800, piezas_completadas=320, etapa_actual="ARMADO", fecha_inicio=date(2026, 9, 16), fecha_fin_estimada=date(2026, 9, 21), area_asignada="Línea de Clavado B"),
                LoteProduccionDB(folio_lote="LOT-2026-003", producto="Caja Industrial Madera Reforzada", piezas_totales=450, piezas_completadas=450, etapa_actual="EMBARQUE", fecha_inicio=date(2026, 9, 10), fecha_fin_estimada=date(2026, 9, 17), area_asignada="Almacén PT"),
            ])
        if db.query(FichaNormativaDB).count() == 0:
            db.add_all([
                FichaNormativaDB(titulo="Tarima Estándar 40\" x 48\" Barrote Saque", norma="GMA / NOM-144", capacidad="1,500 kg", madera="Pino estufado", descripcion="Tarima de barrote con saque para uso general"),
                FichaNormativaDB(titulo="Tarima Perimetral Tipo Euro (1200 x 1000)", norma="EPAL / ISO 6780", capacidad="2,000 kg", madera="Pino de primera", descripcion="Tarima perimetral estándar europea"),
                FichaNormativaDB(titulo="Caja Embalaje Industrial Cerrada", norma="Exportación Pesada", capacidad="3,500 kg", madera="Triplay + Pino reforzado", descripcion="Caja cerrada reforzada para exportación"),
            ])
        db.commit()
    finally:
        db.close()