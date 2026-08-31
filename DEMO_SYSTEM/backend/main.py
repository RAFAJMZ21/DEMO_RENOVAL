from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Importaciones del ORM y Conexión
from app.core.database import engine, Base, get_db
from app.models.entities import UsuarioDB, CotizacionDB, ClienteDB, LoteProduccionDB

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Crear tablas en MySQL automáticamente
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RENOVAL SYS - Embalaje Industrial API",
    version="2.0.0",
    docs_url="/swagger",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Poblado Automático de Datos de Prueba en MySQL
# ------------------------------------------------------------------------------
@app.on_event("startup")
def seeder_base_datos():
    db = next(get_db())
    try:
        # 1. Sembrar Usuario Admin Inicial
        if db.query(UsuarioDB).count() == 0:
            user_admin = UsuarioDB(
                username="rafael",
                email="admin@renoval.com",
                password_hash=pwd_context.hash("admin123"),
                nombre_completo="Ing. Rafael",
                rol="ADMIN"
            )
            db.add(user_admin)

        # 2. Sembrar Clientes Iniciales
        if db.query(ClienteDB).count() == 0:
            clientes = [
                ClienteDB(razon_social="Logística & Embalajes del Valle S.A.", rfc="LEV180420ABC", limite_credito=500000.0, credito_utilizado=180000.0, anticipos_registrados=50000.0),
                ClienteDB(razon_social="Automotive Freight Mexico", rfc="AFM990115XYZ", limite_credito=750000.0, credito_utilizado=320000.0, anticipos_registrados=100000.0),
                ClienteDB(razon_social="Empaques Industriales Lerma", rfc="EIL050812PQR", limite_credito=300000.0, credito_utilizado=45000.0, anticipos_registrados=0.0),
            ]
            db.add_all(clientes)

        # 3. Sembrar Lotes de Producción (Gantt y NOM-144)
        if db.query(LoteProduccionDB).count() == 0:
            lotes = [
                LoteProduccionDB(folio_lote="LOT-2026-001", producto="Tarima Barrote 40\" x 48\" (NOM-144)", piezas_totales=1200, piezas_completadas=850, etapa_actual="HT_FITOSANITARIO", fecha_inicio=date(2026, 8, 25), fecha_fin_estimada=date(2026, 8, 30), area_asignada="Horno de Estufado HT-01"),
                LoteProduccionDB(folio_lote="LOT-2026-002", producto="Tarima Tacón Perimetral 1200x1000mm", piezas_totales=800, piezas_completadas=320, etapa_actual="ARMADO", fecha_inicio=date(2026, 8, 27), fecha_fin_estimada=date(2026, 9, 2), area_asignada="Línea de Clavado Mecanizado B"),
                LoteProduccionDB(folio_lote="LOT-2026-003", producto="Caja Industrial Madera Reforzada", piezas_totales=450, piezas_completadas=450, etapa_actual="EMBARQUE", fecha_inicio=date(2026, 8, 20), fecha_fin_estimada=date(2026, 8, 28), area_asignada="Almacén de Producto Terminado"),
            ]
            db.add_all(lotes)

        # 4. Sembrar Cotización de Prueba
        if db.query(CotizacionDB).count() == 0:
            cotizacion = CotizacionDB(
                folio="COT-2026-101",
                atencion="Ing. Jorge",
                nombre_producto="Tarima de barrote con saque 40\" x 48\"",
                cantidad_piezas=800,
                precio_sugerido_unidad=380.0,
                pie_tablar_total=13.5,
                costo_total_unitario=285.0,
                utilidad_unitaria=95.0,
                cliente_id=1
            )
            db.add(cotizacion)

        db.commit()
    finally:
        db.close()

# ------------------------------------------------------------------------------
# Schemas Pydantic
# ------------------------------------------------------------------------------
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    nombre_completo: str
    rol: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_info: dict

class ElementoMadera(BaseModel):
    nombre_elemento: str
    ancho_in: float
    grueso_in: float
    largo_in: float
    piezas_por_tarima: int
    precio_pie_tabla: float

class CotizacionCreate(BaseModel):
    cliente_id: int
    atencion: str
    nombre_producto: str
    cantidad_piezas: int
    precio_sugerido_unidad: float
    costo_estufa_ht: float
    costo_saque: float
    costo_cepillado: float
    costo_transporte: float
    elementos: List[ElementoMadera]

class LoteProduccionGantt(BaseModel):
    id: int
    folio_lote: str
    producto: str
    piezas_totales: int
    piezas_completadas: int
    etapa_actual: str
    fecha_inicio: date
    fecha_fin_estimada: date
    porcentaje_avance: float
    area_asignada: str

# ------------------------------------------------------------------------------
# Endpoints de la API
# ------------------------------------------------------------------------------
@app.post("/api/v1/auth/registro", tags=["Autenticación"])
@app.post("/api/v1/auth/registro/", tags=["Autenticación"])
def registrar_usuario(usuario: UserRegister, db: Session = Depends(get_db)):
    if db.query(UsuarioDB).filter(UsuarioDB.email == usuario.email).first():
        raise HTTPException(status_code=400, detail="El correo ya se encuentra registrado.")
    
    nuevo_user = UsuarioDB(
        username=usuario.username,
        email=usuario.email,
        password_hash=pwd_context.hash(usuario.password),
        nombre_completo=usuario.nombre_completo,
        rol=usuario.rol
    )
    db.add(nuevo_user)
    db.commit()
    return {"status": "exito", "mensaje": "Usuario creado correctamente"}

@app.post("/api/v1/auth/login", response_model=TokenResponse, tags=["Autenticación"])
@app.post("/api/v1/auth/login/", response_model=TokenResponse, tags=["Autenticación"])
def iniciar_sesion(credenciales: UserLogin, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioDB).filter(UsuarioDB.email == credenciales.email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    es_valido = usuario.password_hash == credenciales.password or pwd_context.verify(credenciales.password, usuario.password_hash)
    if not es_valido:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return {
        "access_token": "token_renoval_2026",
        "token_type": "bearer",
        "user_info": {
            "email": usuario.email,
            "nombre": usuario.nombre_completo,
            "rol": usuario.rol,
            "area": "Planta Lerma"
        }
    }

@app.get("/api/v1/dashboard/metrics", tags=["Dashboard"])
@app.get("/api/v1/dashboard/metrics/", tags=["Dashboard"])
def obtener_metricas(db: Session = Depends(get_db)):
    return {
        "tarimas_producidas": 12450,
        "lotes_completados": db.query(LoteProduccionDB).count(),
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

@app.get("/api/v1/produccion/gantt", response_model=List[LoteProduccionGantt], tags=["Producción"])
@app.get("/api/v1/produccion/gantt/", response_model=List[LoteProduccionGantt], tags=["Producción"])
def obtener_gantt(db: Session = Depends(get_db)):
    lotes = db.query(LoteProduccionDB).all()
    resultado = []
    for l in lotes:
        pct = round((l.piezas_completadas / l.piezas_totales) * 100, 1) if l.piezas_totales > 0 else 0
        resultado.append({
            "id": l.id,
            "folio_lote": l.folio_lote,
            "producto": l.producto,
            "piezas_totales": l.piezas_totales,
            "piezas_completadas": l.piezas_completadas,
            "etapa_actual": l.etapa_actual,
            "fecha_inicio": l.fecha_inicio,
            "fecha_fin_estimada": l.fecha_fin_estimada,
            "porcentaje_avance": pct,
            "area_asignada": l.area_asignada
        })
    return resultado

@app.get("/api/v1/clientes", tags=["Clientes"])
@app.get("/api/v1/clientes/", tags=["Clientes"])
def obtener_clientes(db: Session = Depends(get_db)):
    return db.query(ClienteDB).all()