from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.models.entities import FichaNormativaDB
from app.core.permissions import require_roles, Role

router = APIRouter()


class FichaNormativaSchema(BaseModel):
    id: int
    titulo: str
    norma: str
    capacidad: str
    madera: str
    descripcion: Optional[str] = None
    archivo_pdf: Optional[str] = None

    class Config:
        from_attributes = True


class FichaNormativaCreate(BaseModel):
    titulo: str
    norma: str
    capacidad: str
    madera: str
    descripcion: Optional[str] = None
    archivo_pdf: Optional[str] = None


@router.get("/", response_model=List[FichaNormativaSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def obtener_fichas_normativas(db: Session = Depends(get_db)):
    return db.query(FichaNormativaDB).all()


@router.post("/", response_model=FichaNormativaSchema, dependencies=[Depends(require_roles(Role.ADMIN))])
def crear_ficha_normativa(ficha: FichaNormativaCreate, db: Session = Depends(get_db)):
    nueva = FichaNormativaDB(**ficha.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.put("/{ficha_id}", response_model=FichaNormativaSchema, dependencies=[Depends(require_roles(Role.ADMIN))])
def actualizar_ficha_normativa(ficha_id: int, ficha: FichaNormativaCreate, db: Session = Depends(get_db)):
    db_ficha = db.query(FichaNormativaDB).filter(FichaNormativaDB.id == ficha_id).first()
    if not db_ficha:
        raise HTTPException(status_code=404, detail="Ficha no encontrada")
    for key, value in ficha.model_dump().items():
        setattr(db_ficha, key, value)
    db.commit()
    db.refresh(db_ficha)
    return db_ficha


@router.delete("/{ficha_id}", dependencies=[Depends(require_roles(Role.ADMIN))])
def eliminar_ficha_normativa(ficha_id: int, db: Session = Depends(get_db)):
    db_ficha = db.query(FichaNormativaDB).filter(FichaNormativaDB.id == ficha_id).first()
    if not db_ficha:
        raise HTTPException(status_code=404, detail="Ficha no encontrada")
    db.delete(db_ficha)
    db.commit()
    return {"status": "ok"}