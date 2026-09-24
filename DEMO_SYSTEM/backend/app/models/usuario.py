from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.core.database import Base


class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nombre_completo = Column(String(150))
    # ADMIN, OPERADOR, CLIENTE, ALMACENISTA, PROVEEDOR
    rol = Column(String(30), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)