from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import EmbarqueDespachoDB, FleteTarifaDB, DestinoLogisticaDB
from app.core.permissions import require_roles, Role

router = APIRouter()


class FleteTarifaSchema(BaseModel):
    id: int
    estado: str
    municipio: str
    km: int
    precio_flete: float
    capacidad: int
    costo_tarima_unitario: float
    activo: bool = True

    class Config:
        from_attributes = True


class EmbarqueSchema(BaseModel):
    id: int
    folio_embarque: str
    cliente: str
    chofer: str
    placas_trailer: str
    tarimas_cargadas: int
    fecha_despacho: date
    estatus: str

    class Config:
        from_attributes = True


class EmbarqueCreate(BaseModel):
    folio_embarque: str
    cliente: str
    chofer: str
    placas_trailer: str
    tarimas_cargadas: int
    fecha_despacho: date
    estatus: str = "PROGRAMADO"


# --- DESTINOS LOGÍSTICOS (Nuevo CRUD completo) ---
class DestinoCreateSchema(BaseModel):
    estado: str
    municipio: str
    km: float
    costo_gasolina: float
    costo_casetas: float
    precio_flete_total: float
    capacidad_tarimas: int


class DestinoResponseSchema(DestinoCreateSchema):
    id: int
    costo_tarima_unitario: float
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/fletes-destino", response_model=List[FleteTarifaSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def obtener_fletes_destino(db: Session = Depends(get_db)):
    return db.query(FleteTarifaDB).filter(FleteTarifaDB.activo == True).all()


@router.post("/fletes-destino", response_model=FleteTarifaSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def crear_flete(flete: FleteTarifaSchema, db: Session = Depends(get_db)):
    nuevo = FleteTarifaDB(**flete.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


# --- NUEVOS ENDPOINTS PARA DESTINOS LOGÍSTICOS (con desglose de costos) ---
@router.get("/destinos", response_model=List[DestinoResponseSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def obtener_destinos_logistica(db: Session = Depends(get_db)):
    destinos = db.query(DestinoLogisticaDB).all()
    return destinos


@router.post("/destinos", response_model=DestinoResponseSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def crear_destino_logistica(payload: DestinoCreateSchema, db: Session = Depends(get_db)):
    if payload.capacidad_tarimas <= 0:
        raise HTTPException(status_code=400, detail="La capacidad de tarimas debe ser mayor a 0.")

    costo_unitario = round(payload.precio_flete_total / payload.capacidad_tarimas, 2)

    nuevo_destino = DestinoLogisticaDB(
        estado=payload.estado,
        municipio=payload.municipio,
        km=payload.km,
        costo_gasolina=payload.costo_gasolina,
        costo_casetas=payload.costo_casetas,
        precio_flete_total=payload.precio_flete_total,
        capacidad_tarimas=payload.capacidad_tarimas,
        costo_tarima_unitario=costo_unitario
    )

    db.add(nuevo_destino)
    db.commit()
    db.refresh(nuevo_destino)
    return nuevo_destino


@router.put("/destinos/{destino_id}", response_model=DestinoResponseSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def actualizar_destino_logistica(destino_id: int, payload: DestinoCreateSchema, db: Session = Depends(get_db)):
    destino = db.query(DestinoLogisticaDB).filter(DestinoLogisticaDB.id == destino_id).first()
    if not destino:
        raise HTTPException(status_code=404, detail="Destino de logística no encontrado.")

    if payload.capacidad_tarimas <= 0:
        raise HTTPException(status_code=400, detail="La capacidad de tarimas debe ser mayor a 0.")

    costo_unitario = round(payload.precio_flete_total / payload.capacidad_tarimas, 2)

    destino.estado = payload.estado
    destino.municipio = payload.municipio
    destino.km = payload.km
    destino.costo_gasolina = payload.costo_gasolina
    destino.costo_casetas = payload.costo_casetas
    destino.precio_flete_total = payload.precio_flete_total
    destino.capacidad_tarimas = payload.capacidad_tarimas
    destino.costo_tarima_unitario = costo_unitario

    db.commit()
    db.refresh(destino)
    return destino


@router.delete("/destinos/{destino_id}", dependencies=[Depends(require_roles(Role.ADMIN))])
def eliminar_destino_logistica(destino_id: int, db: Session = Depends(get_db)):
    destino = db.query(DestinoLogisticaDB).filter(DestinoLogisticaDB.id == destino_id).first()
    if not destino:
        raise HTTPException(status_code=404, detail="Destino de logística no encontrado.")

    db.delete(destino)
    db.commit()
    return {"mensaje": "Destino eliminado correctamente"}


@router.get("/embarques", response_model=List[EmbarqueSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def obtener_embarques(db: Session = Depends(get_db)):
    return db.query(EmbarqueDespachoDB).order_by(EmbarqueDespachoDB.fecha_despacho.desc()).all()


@router.post("/embarques", response_model=EmbarqueSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def crear_embarque(embarque: EmbarqueCreate, db: Session = Depends(get_db)):
    if db.query(EmbarqueDespachoDB).filter(EmbarqueDespachoDB.folio_embarque == embarque.folio_embarque).first():
        raise HTTPException(status_code=400, detail="Folio de embarque ya existe")
    nuevo = EmbarqueDespachoDB(**embarque.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/embarques/{embarque_id}", response_model=EmbarqueSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def actualizar_embarque(embarque_id: int, embarque: EmbarqueCreate, db: Session = Depends(get_db)):
    db_embarque = db.query(EmbarqueDespachoDB).filter(EmbarqueDespachoDB.id == embarque_id).first()
    if not db_embarque:
        raise HTTPException(status_code=404, detail="Embarque no encontrado")
    for key, value in embarque.model_dump().items():
        setattr(db_embarque, key, value)
    db.commit()
    db.refresh(db_embarque)
    return db_embarque


class FleteUpdate(BaseModel):
    estado: Optional[str] = None
    municipio: Optional[str] = None
    km: Optional[int] = None
    precio_flete: Optional[float] = None
    capacidad: Optional[int] = None
    costo_tarima_unitario: Optional[float] = None
    activo: Optional[bool] = None


@router.put("/fletes-destino/{flete_id}", response_model=FleteTarifaSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA))])
def actualizar_flete(flete_id: int, flete: FleteUpdate, db: Session = Depends(get_db)):
    db_flete = db.query(FleteTarifaDB).filter(FleteTarifaDB.id == flete_id).first()
    if not db_flete:
        raise HTTPException(status_code=404, detail="Flete no encontrado")
    update_data = flete.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_flete, key, value)
    db.commit()
    db.refresh(db_flete)
    return db_flete


@router.delete("/fletes-destino/{flete_id}", dependencies=[Depends(require_roles(Role.ADMIN))])
def eliminar_flete(flete_id: int, db: Session = Depends(get_db)):
    db_flete = db.query(FleteTarifaDB).filter(FleteTarifaDB.id == flete_id).first()
    if not db_flete:
        raise HTTPException(status_code=404, detail="Flete no encontrado")
    db.delete(db_flete)
    db.commit()
    return {"mensaje": "Flete eliminado correctamente"}


@router.delete("/embarques/{embarque_id}", dependencies=[Depends(require_roles(Role.ADMIN))])
def eliminar_embarque(embarque_id: int, db: Session = Depends(get_db)):
    db_embarque = db.query(EmbarqueDespachoDB).filter(EmbarqueDespachoDB.id == embarque_id).first()
    if not db_embarque:
        raise HTTPException(status_code=404, detail="Embarque no encontrado")
    db.delete(db_embarque)
    db.commit()
    return {"mensaje": "Embarque eliminado correctamente"}