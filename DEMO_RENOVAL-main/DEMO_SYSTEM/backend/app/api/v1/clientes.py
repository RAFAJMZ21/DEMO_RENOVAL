from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.models.entities import ClienteDB
from app.core.permissions import require_roles, Role

router = APIRouter()

class ClienteSchema(BaseModel):
    id: int
    razon_social: str
    rfc: str
    limite_credito: float
    credito_utilizado: float
    anticipos_registrados: float

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ClienteSchema], dependencies=[Depends(require_roles(Role.ADMIN))])
def obtener_clientes(db: Session = Depends(get_db)):
    return db.query(ClienteDB).all()

@router.get("/{cliente_id}/estado-cuenta", dependencies=[Depends(require_roles(Role.ADMIN, Role.CLIENTE))])
def obtener_estado_cuenta(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(ClienteDB).filter(ClienteDB.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    saldo_pendiente = cliente.credito_utilizado - cliente.anticipos_registrados
    credito_disponible = cliente.limite_credito - cliente.credito_utilizado

    return {
        "cliente_id": cliente.id,
        "razon_social": cliente.razon_social,
        "limite_credito": cliente.limite_credito,
        "credito_utilizado": cliente.credito_utilizado,
        "credito_disponible": credito_disponible,
        "anticipos_registrados": cliente.anticipos_registrados,
        "saldo_pendiente": saldo_pendiente,
        "historial_pedidos": []
    }