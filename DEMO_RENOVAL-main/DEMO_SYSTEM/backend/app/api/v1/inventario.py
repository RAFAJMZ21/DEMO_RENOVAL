from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import InsumoClavadoDB, EntradaMaderaDB
from app.core.permissions import require_roles, Role

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
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    for key, value in insumo.model_dump().items():
        setattr(db_insumo, key, value)
    db.commit()
    db.refresh(db_insumo)
    return db_insumo


# --- ENTRADAS MADERA ---
class EntradaMaderaSchema(BaseModel):
    id: int
    tipo: str
    metros_cubicos: float
    proveedor: str
    fecha: date
    observaciones: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class EntradaMaderaCreate(BaseModel):
    tipo: str
    metros_cubicos: float
    proveedor: str
    fecha: date
    observaciones: Optional[str] = None


@router.get("/entradas-madera", response_model=List[EntradaMaderaSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA, Role.OPERADOR))])
def obtener_entradas_madera(db: Session = Depends(get_db)):
    return db.query(EntradaMaderaDB).order_by(EntradaMaderaDB.fecha.desc()).all()


@router.post("/entradas-madera", response_model=EntradaMaderaSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def crear_entrada_madera(entrada: EntradaMaderaCreate, db: Session = Depends(get_db)):
    nueva = EntradaMaderaDB(**entrada.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.delete("/entradas-madera/{entrada_id}", dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def eliminar_entrada_madera(entrada_id: int, db: Session = Depends(get_db)):
    db_entrada = db.query(EntradaMaderaDB).filter(EntradaMaderaDB.id == entrada_id).first()
    if not db_entrada:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")
    db.delete(db_entrada)
    db.commit()
    return {"mensaje": "Entrada eliminada correctamente"}


class InsumoUpdate(BaseModel):
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    tipo: Optional[str] = None
    medida: Optional[str] = None
    existencia_kg: Optional[float] = None
    stock_minimo_kg: Optional[float] = None
    linea_asignada: Optional[str] = None


@router.put("/insumos-clavado/{insumo_id}", response_model=InsumoSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def actualizar_insumo_parcial(insumo_id: int, insumo: InsumoUpdate, db: Session = Depends(get_db)):
    db_insumo = db.query(InsumoClavadoDB).filter(InsumoClavadoDB.id == insumo_id).first()
    if not db_insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    update_data = insumo.model_dump(exclude_unset=True)
    if "codigo" in update_data and update_data["codigo"] != db_insumo.codigo:
        if db.query(InsumoClavadoDB).filter(InsumoClavadoDB.codigo == update_data["codigo"]).first():
            raise HTTPException(status_code=400, detail="Código ya existe")
    for key, value in update_data.items():
        setattr(db_insumo, key, value)
    db.commit()
    db.refresh(db_insumo)
    return db_insumo


@router.delete("/insumos-clavado/{insumo_id}", dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def eliminar_insumo(insumo_id: int, db: Session = Depends(get_db)):
    db_insumo = db.query(InsumoClavadoDB).filter(InsumoClavadoDB.id == insumo_id).first()
    if not db_insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    db.delete(db_insumo)
    db.commit()
    return {"mensaje": "Insumo eliminado correctamente"}


class EntradaMaderaUpdate(BaseModel):
    tipo: Optional[str] = None
    metros_cubicos: Optional[float] = None
    proveedor: Optional[str] = None
    fecha: Optional[date] = None
    observaciones: Optional[str] = None


@router.put("/entradas-madera/{entrada_id}", response_model=EntradaMaderaSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def actualizar_entrada_madera(entrada_id: int, entrada: EntradaMaderaUpdate, db: Session = Depends(get_db)):
    db_entrada = db.query(EntradaMaderaDB).filter(EntradaMaderaDB.id == entrada_id).first()
    if not db_entrada:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")
    update_data = entrada.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_entrada, key, value)
    db.commit()
    db.refresh(db_entrada)
    return db_entrada