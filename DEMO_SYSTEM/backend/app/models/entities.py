from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Date, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

from app.models.usuario import UsuarioDB

class ClienteDB(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    razon_social = Column(String(150), nullable=False)
    rfc = Column(String(13), unique=True, index=True)
    limite_credito = Column(Float, default=0.0)
    credito_utilizado = Column(Float, default=0.0)
    anticipos_registrados = Column(Float, default=0.0)

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
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Campos del módulo CRUD de Cotizaciones (v2)
    cliente = Column(String(150), default="")
    items = Column(JSON, default=list)
    dimensiones = Column(String(150), default="")
    tipo_madera = Column(String(100), default="")
    precio_unitario = Column(Float, default=0.0)
    cantidad = Column(Integer, default=1)
    costo_mano_obra = Column(Float, default=0.0)
    flete = Column(Float, default=0.0)
    subtotal = Column(Float, default=0.0)
    iva = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    estado = Column(String(30), default="Borrador")

class LoteProduccionDB(Base):
    __tablename__ = "lotes_produccion"

    id = Column(Integer, primary_key=True, index=True)
    folio_lote = Column(String(30), unique=True, index=True, nullable=False)
    producto = Column(String(150), nullable=False)
    piezas_totales = Column(Integer, nullable=False)
    piezas_completadas = Column(Integer, default=0)
    etapa_actual = Column(String(50), default="ASERRADERO")  # ASERRADERO, ARMADO, HT_FITOSANITARIO, EMBARQUE
    fecha_inicio = Column(Date)
    fecha_fin_estimada = Column(Date)
    area_asignada = Column(String(100))

class FleteTarifaDB(Base):
    __tablename__ = "fletes_tarifas"

    id = Column(Integer, primary_key=True, index=True)
    estado = Column(String(100), nullable=False, index=True)
    municipio = Column(String(150), nullable=False, index=True)
    empresa = Column(String(150), default="")
    kilometros = Column(Float, default=0.0)
    precio_flete = Column(Float, default=0.0)
    costo_km = Column(Float, default=0.0)
    capacidad_tarimas = Column(Integer, default=0)
    precio_unitario = Column(Float, default=0.0)
    precio_reducido = Column(Float, default=0.0)

    viajes = relationship("ViajeLogisticaDB", back_populates="tarifa")

class ViajeLogisticaDB(Base):
    __tablename__ = "viajes_logistica"

    id = Column(Integer, primary_key=True, index=True)
    folio_cotizacion_id = Column(Integer, nullable=True)
    tarifa_id = Column(Integer, ForeignKey("fletes_tarifas.id"), nullable=False)
    operador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    unidad = Column(String(100), default="")
    cantidad_tarimas = Column(Integer, default=1)
    costo_total_flete = Column(Float, default=0.0)
    estado = Column(String(30), default="Pendiente")  # Pendiente, En Tránsito, Completado, Rechazado
    fecha_salida = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

    tarifa = relationship("FleteTarifaDB", back_populates="viajes")
    operador = relationship("UsuarioDB")