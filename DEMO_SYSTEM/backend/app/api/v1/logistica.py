from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.models.entities import DestinoLogisticaDB

router = APIRouter()

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

    class Config:
        from_attributes = True

@router.get("/fletes-destino", response_model=List[DestinoResponseSchema])
def obtener_fletes_destino(db: Session = Depends(get_db)):
    destinos = db.query(DestinoLogisticaDB).all()
    return destinos

@router.post("/fletes-destino", response_model=DestinoResponseSchema)
def crear_destino_logistica(payload: DestinoCreateSchema, db: Session = Depends(get_db)):
    if payload.capacidad_tarimas <= 0:
        raise HTTPException(status_code=400, detail="La capacidad de tarimas debe ser mayor a 0.")
    
    # Cálculo automático del costo por tarima basado en el flete total y la capacidad del camión
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

@router.put("/fletes-destino/{destino_id}", response_model=DestinoResponseSchema)
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

@router.delete("/fletes-destino/{destino_id}")
def eliminar_destino_logistica(destino_id: int, db: Session = Depends(get_db)):
    destino = db.query(DestinoLogisticaDB).filter(DestinoLogisticaDB.id == destino_id).first()
    if not destino:
        raise HTTPException(status_code=404, detail="Destino de logística no encontrado.")
    
    db.delete(destino)
    db.commit()
    return {"mensaje": "Destino eliminado correctamente"}