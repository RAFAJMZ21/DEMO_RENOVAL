from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import date
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import LoteProduccionDB, ControlMermaDB
from app.core.permissions import require_roles, Role

router = APIRouter()


class LoteGanttSchema(BaseModel):
    id: int
    folio_lote: str
    producto: str
    piezas_totales: int
    piezas_completadas: int
    etapa_actual: str
    fecha_inicio: date
    fecha_fin_estimada: date
    porcentaje_avance: float
    area_asignada: str

    class Config:
        from_attributes = True


class LoteCreate(BaseModel):
    folio_lote: str
    producto: str
    piezas_totales: int
    piezas_completadas: int = 0
    etapa_actual: str = "ASERRADERO"
    fecha_inicio: date
    fecha_fin_estimada: date
    area_asignada: str


class ControlMermaSchema(BaseModel):
    id: int
    folio_lote: str
    pt_teoricos: float
    pt_reales_utilizados: float
    pt_desperdicio: float
    porcentaje_scrap: float
    causa_principal: str

    class Config:
        from_attributes = True


@router.get("/gantt", response_model=List[LoteGanttSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR))])
def obtener_produccion_gantt(db: Session = Depends(get_db)):
    lotes = db.query(LoteProduccionDB).order_by(LoteProduccionDB.fecha_inicio).all()
    return [
        LoteGanttSchema(
            id=l.id,
            folio_lote=l.folio_lote,
            producto=l.producto,
            piezas_totales=l.piezas_totales,
            piezas_completadas=l.piezas_completadas,
            etapa_actual=l.etapa_actual,
            fecha_inicio=l.fecha_inicio,
            fecha_fin_estimada=l.fecha_fin_estimada,
            porcentaje_avance=round((l.piezas_completadas / l.piezas_totales * 100) if l.piezas_totales else 0, 1),
            area_asignada=l.area_asignada
        )
        for l in lotes
    ]


@router.post("/gantt", response_model=LoteGanttSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR))])
def crear_lote(lote: LoteCreate, db: Session = Depends(get_db)):
    if db.query(LoteProduccionDB).filter(LoteProduccionDB.folio_lote == lote.folio_lote).first():
        raise HTTPException(status_code=400, detail="Folio de lote ya existe")
    nuevo = LoteProduccionDB(**lote.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return LoteGanttSchema(
        id=nuevo.id,
        folio_lote=nuevo.folio_lote,
        producto=nuevo.producto,
        piezas_totales=nuevo.piezas_totales,
        piezas_completadas=nuevo.piezas_completadas,
        etapa_actual=nuevo.etapa_actual,
        fecha_inicio=nuevo.fecha_inicio,
        fecha_fin_estimada=nuevo.fecha_fin_estimada,
        porcentaje_avance=round((nuevo.piezas_completadas / nuevo.piezas_totales * 100) if nuevo.piezas_totales else 0, 1),
        area_asignada=nuevo.area_asignada
    )


@router.put("/gantt/{lote_id}", response_model=LoteGanttSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR))])
def actualizar_lote(lote_id: int, lote: LoteCreate, db: Session = Depends(get_db)):
    db_lote = db.query(LoteProduccionDB).filter(LoteProduccionDB.id == lote_id).first()
    if not db_lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    for key, value in lote.model_dump().items():
        setattr(db_lote, key, value)
    db.commit()
    db.refresh(db_lote)
    return LoteGanttSchema(
        id=db_lote.id,
        folio_lote=db_lote.folio_lote,
        producto=db_lote.producto,
        piezas_totales=db_lote.piezas_totales,
        piezas_completadas=db_lote.piezas_completadas,
        etapa_actual=db_lote.etapa_actual,
        fecha_inicio=db_lote.fecha_inicio,
        fecha_fin_estimada=db_lote.fecha_fin_estimada,
        porcentaje_avance=round((db_lote.piezas_completadas / db_lote.piezas_totales * 100) if db_lote.piezas_totales else 0, 1),
        area_asignada=db_lote.area_asignada
    )


@router.get("/mermas-scrap", response_model=List[ControlMermaSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR))])
def obtener_mermas(db: Session = Depends(get_db)):
    return db.query(ControlMermaDB).order_by(ControlMermaDB.created_at.desc()).all()