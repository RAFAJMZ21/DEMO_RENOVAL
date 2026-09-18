from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Date
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
    rol = Column(String(30), nullable=False)  # ADMIN, CLIENTE, OPERADOR, ALMACENISTA, PROVEEDOR
    created_at = Column(DateTime, default=datetime.utcnow)

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