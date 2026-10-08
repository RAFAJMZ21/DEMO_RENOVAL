from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import date
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import CertificadoFitosanitarioDB, LoteProduccionDB
from app.core.permissions import require_roles, Role

router = APIRouter()


class CertificadoSchema(BaseModel):
    id: int
    folio_certificado: str
    folio_lote: str
    cliente: str
    codigo_sello_ht: str
    temperatura_alcanzada: float
    tiempo_sostenimiento_min: int
    fecha_emision: date

    class Config:
        from_attributes = True


class CertificadoCreate(BaseModel):
    folio_certificado: str
    folio_lote: str
    cliente: str
    codigo_sello_ht: str
    temperatura_alcanzada: float
    tiempo_sostenimiento_min: int
    fecha_emision: date


@router.get("/certificados", response_model=List[CertificadoSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def obtener_certificados_ht(db: Session = Depends(get_db)):
    return db.query(CertificadoFitosanitarioDB).order_by(CertificadoFitosanitarioDB.fecha_emision.desc()).all()


@router.post("/certificados", response_model=CertificadoSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR))])
def crear_certificado(cert: CertificadoCreate, db: Session = Depends(get_db)):
    if db.query(CertificadoFitosanitarioDB).filter(CertificadoFitosanitarioDB.folio_certificado == cert.folio_certificado).first():
        raise HTTPException(status_code=400, detail="Folio de certificado ya existe")
    
    lote = db.query(LoteProduccionDB).filter(LoteProduccionDB.folio_lote == cert.folio_lote).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    
    lote.etapa_actual = "EMBARQUE"
    lote.piezas_completadas = lote.piezas_totales
    
    nuevo = CertificadoFitosanitarioDB(**cert.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/certificados/{cert_id}", response_model=CertificadoSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def obtener_certificado(cert_id: int, db: Session = Depends(get_db)):
    cert = db.query(CertificadoFitosanitarioDB).filter(CertificadoFitosanitarioDB.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificado no encontrado")
    return cert