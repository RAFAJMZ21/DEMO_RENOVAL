from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.models.entities import InsumoClavadoDB
from app.core.permissions import require_roles, Role
from sqlalchemy.orm import Session

router = APIRouter()


class InsumoSchema(BaseModel):
    id: int
    codigo: str
    descripcion: str
    tipo: str
    medida: str
    existencia_kg: float
    stock_minimo_kg: float
    linea_asignada: str

    class Config:
        from_attributes = True


class InventarioItemSchema(BaseModel):
    item: str
    existencia: str
    proveedor: str


class InventarioRespuesta(BaseModel):
    area: str
    insumos: List[InventarioItemSchema]


@router.get("/inventario-materia-prima", response_model=InventarioRespuesta, dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR, Role.ALMACENISTA))])
def obtener_inventario_materia_prima(db: Session = Depends(get_db)):
    insumos = db.query(InsumoClavadoDB).all()
    return {
        "area": "Planta Lerma - Almacén Principal",
        "insumos": [
            {
                "item": i.descripcion,
                "existencia": f"{i.existencia_kg:,.0f} kg",
                "proveedor": "Sistemas de Sujeción Industrial"
            }
            for i in insumos
        ]
    }


@router.get("/insumos-clavado", response_model=List[InsumoSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA, Role.OPERADOR))])
def obtener_insumos_clavado(db: Session = Depends(get_db)):
    return db.query(InsumoClavadoDB).all()


@router.post("/insumos-clavado", response_model=InsumoSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def crear_insumo(insumo: InsumoSchema, db: Session = Depends(get_db)):
    if db.query(InsumoClavadoDB).filter(InsumoClavadoDB.codigo == insumo.codigo).first():
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Código ya existe")
    nuevo = InsumoClavadoDB(**insumo.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/insumos-clavado/{insumo_id}", response_model=InsumoSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def actualizar_insumo(insumo_id: int, insumo: InsumoSchema, db: Session = Depends(get_db)):
    db_insumo = db.query(InsumoClavadoDB).filter(InsumoClavadoDB.id == insumo_id).first()
    if not db_insumo:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    for key, value in insumo.model_dump().items():
        setattr(db_insumo, key, value)
    db.commit()
    db.refresh(db_insumo)
    return db_insumo