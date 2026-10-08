from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nombre_completo = Column(String(150))
    rol = Column(String(30), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ClienteDB(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    razon_social = Column(String(150), nullable=False)
    rfc = Column(String(13), unique=True, index=True)
    limite_credito = Column(Float, default=0.0)
    credito_utilizado = Column(Float, default=0.0)
    anticipos_registrados = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class CotizacionDB(Base):
    __tablename__ = "cotizaciones"

    id = Column(Integer, primary_key=True, index=True)
    folio = Column(String(30), unique=True, index=True, nullable=False)
    atencion = Column(String(100))
    nombre_producto = Column(String(150), nullable=False)
    cantidad_piezas = Column(Integer, nullable=False)
    precio_sugerido_unidad = Column(Float, nullable=False)
    pie_tablar_total = Column(Float)
    costo_total_unitario = Column(Float)
    utilidad_unitaria = Column(Float)
    costo_variable = Column(Float, default=50.0)
    costo_directo = Column(Float, default=20.0)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    created_at = Column(DateTime, default=datetime.utcnow)


class LoteProduccionDB(Base):
    __tablename__ = "lotes_produccion"

    id = Column(Integer, primary_key=True, index=True)
    folio_lote = Column(String(30), unique=True, index=True, nullable=False)
    producto = Column(String(150), nullable=False)
    piezas_totales = Column(Integer, nullable=False)
    piezas_completadas = Column(Integer, default=0)
    etapa_actual = Column(String(50), default="ASERRADERO")
    fecha_inicio = Column(Date)
    fecha_fin_estimada = Column(Date)
    area_asignada = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class InsumoClavadoDB(Base):
    __tablename__ = "insumos_clavado"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(30), unique=True, index=True, nullable=False)
    descripcion = Column(String(150), nullable=False)
    tipo = Column(String(30), nullable=False)
    medida = Column(String(50))
    existencia_kg = Column(Float, default=0.0)
    stock_minimo_kg = Column(Float, default=0.0)
    linea_asignada = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CertificadoFitosanitarioDB(Base):
    __tablename__ = "certificados_fitosanitarios"

    id = Column(Integer, primary_key=True, index=True)
    folio_certificado = Column(String(30), unique=True, index=True, nullable=False)
    folio_lote = Column(String(30), index=True, nullable=False)
    cliente = Column(String(150), nullable=False)
    codigo_sello_ht = Column(String(50), nullable=False)
    temperatura_alcanzada = Column(Float, nullable=False)
    tiempo_sostenimiento_min = Column(Integer, nullable=False)
    fecha_emision = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmbarqueDespachoDB(Base):
    __tablename__ = "embarques_despacho"

    id = Column(Integer, primary_key=True, index=True)
    folio_embarque = Column(String(30), unique=True, index=True, nullable=False)
    cliente = Column(String(150), nullable=False)
    chofer = Column(String(100))
    placas_trailer = Column(String(20))
    tarimas_cargadas = Column(Integer, default=0)
    fecha_despacho = Column(Date, nullable=False)
    estatus = Column(String(30), default="PROGRAMADO")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FleteTarifaDB(Base):
    __tablename__ = "fletes_tarifas"

    id = Column(Integer, primary_key=True, index=True)
    estado = Column(String(50), nullable=False)
    municipio = Column(String(100), nullable=False)
    km = Column(Integer, nullable=False)
    precio_flete = Column(Float, nullable=False)
    capacidad = Column(Integer, nullable=False)
    costo_tarima_unitario = Column(Float, nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ControlMermaDB(Base):
    __tablename__ = "control_mermas"

    id = Column(Integer, primary_key=True, index=True)
    folio_lote = Column(String(30), index=True, nullable=False)
    pt_teoricos = Column(Float, nullable=False)
    pt_reales_utilizados = Column(Float, nullable=False)
    pt_desperdicio = Column(Float, nullable=False)
    porcentaje_scrap = Column(Float, nullable=False)
    causa_principal = Column(String(150))
    created_at = Column(DateTime, default=datetime.utcnow)


class FichaNormativaDB(Base):
    __tablename__ = "fichas_normativas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    norma = Column(String(100), nullable=False)
    capacidad = Column(String(50))
    madera = Column(String(100))
    descripcion = Column(Text)
    archivo_pdf = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DestinoLogisticaDB(Base):
    __tablename__ = "destinos_logistica"

    id = Column(Integer, primary_key=True, index=True)
    estado = Column(String(100), nullable=False)
    municipio = Column(String(100), nullable=False)
    km = Column(Float, nullable=False)
    costo_gasolina = Column(Float, nullable=False)
    costo_casetas = Column(Float, nullable=False)
    precio_flete_total = Column(Float, nullable=False)
    capacidad_tarimas = Column(Integer, nullable=False)
    costo_tarima_unitario = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)