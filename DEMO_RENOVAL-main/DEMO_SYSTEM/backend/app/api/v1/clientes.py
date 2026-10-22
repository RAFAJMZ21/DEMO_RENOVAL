from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.entities import ClienteDB, CotizacionDB
from app.core.permissions import require_roles, Role

router = APIRouter()


class ClienteSchema(BaseModel):
    id: int
    razon_social: str
    rfc: str
    limite_credito: float
    credito_utilizado: float
    anticipos_registrados: float
    created_at: datetime

    class Config:
        from_attributes = True


class ClienteCreate(BaseModel):
    razon_social: str
    rfc: str
    limite_credito: float = 0.0
    credito_utilizado: float = 0.0
    anticipos_registrados: float = 0.0


class EstadoCuentaResponse(BaseModel):
    cliente_id: int
    razon_social: str
    limite_credito: float
    credito_utilizado: float
    credito_disponible: float
    anticipos_registrados: float
    saldo_pendiente: float
    historial_pedidos: List[dict]


@router.get("/", response_model=List[ClienteSchema], dependencies=[Depends(require_roles(Role.ADMIN))])
def obtener_clientes(db: Session = Depends(get_db)):
    return db.query(ClienteDB).all()


@router.post("/", response_model=ClienteSchema, dependencies=[Depends(require_roles(Role.ADMIN))])
def crear_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    if db.query(ClienteDB).filter(ClienteDB.rfc == cliente.rfc).first():
        raise HTTPException(status_code=400, detail="RFC ya registrado")
    nuevo = ClienteDB(**cliente.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/{cliente_id}", response_model=ClienteSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.CLIENTE))])
def obtener_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(ClienteDB).filter(ClienteDB.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.put("/{cliente_id}", response_model=ClienteSchema, dependencies=[Depends(require_roles(Role.ADMIN))])
def actualizar_cliente(cliente_id: int, cliente: ClienteCreate, db: Session = Depends(get_db)):
    db_cliente = db.query(ClienteDB).filter(ClienteDB.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    for key, value in cliente.model_dump().items():
        setattr(db_cliente, key, value)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


@router.get("/{cliente_id}/estado-cuenta", response_model=EstadoCuentaResponse, dependencies=[Depends(require_roles(Role.ADMIN, Role.CLIENTE))])
def obtener_estado_cuenta(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(ClienteDB).filter(ClienteDB.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    saldo_pendiente = cliente.credito_utilizado - cliente.anticipos_registrados
    credito_disponible = cliente.limite_credito - cliente.credito_utilizado

    cotizaciones = db.query(CotizacionDB).filter(CotizacionDB.cliente_id == cliente_id).all()
    historial = [
        {
            "pedido_id": c.folio,
            "fecha": c.created_at.isoformat() if c.created_at else "",
            "total": c.precio_sugerido_unidad * c.cantidad_piezas,
            "estatus": "Cotizado"
        }
        for c in cotizaciones
    ]

    return EstadoCuentaResponse(
        cliente_id=cliente.id,
        razon_social=cliente.razon_social,
        limite_credito=cliente.limite_credito,
        credito_utilizado=cliente.credito_utilizado,
        credito_disponible=credito_disponible,
        anticipos_registrados=cliente.anticipos_registrados,
        saldo_pendiente=saldo_pendiente,
        historial_pedidos=historial
    )


@router.delete("/{cliente_id}", dependencies=[Depends(require_roles(Role.ADMIN))])
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    db_cliente = db.query(ClienteDB).filter(ClienteDB.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    db.delete(db_cliente)
    db.commit()
    return {"mensaje": "Cliente eliminado correctamente"}