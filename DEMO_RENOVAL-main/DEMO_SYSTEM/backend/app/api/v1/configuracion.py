from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.entities import ConfiguracionDB
from app.core.permissions import require_roles, Role

router = APIRouter()


class ConfiguracionSchema(BaseModel):
    id: int
    clave: str
    valor: str
    descripcion: Optional[str]
    categoria: str
    tipo: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ConfiguracionCreate(BaseModel):
    clave: str
    valor: str
    descripcion: Optional[str] = None
    categoria: str
    tipo: str


class ConfiguracionUpdate(BaseModel):
    valor: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    tipo: Optional[str] = None


@router.get("/", response_model=List[ConfiguracionSchema], dependencies=[Depends(require_roles(Role.ADMIN))])
def obtener_configuraciones(
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    db: Session = Depends(get_db)
):
    query = db.query(ConfiguracionDB)
    if categoria:
        query = query.filter(ConfiguracionDB.categoria == categoria)
    return query.order_by(ConfiguracionDB.categoria, ConfiguracionDB.clave).all()


@router.post("/", response_model=ConfiguracionSchema, dependencies=[Depends(require_roles(Role.ADMIN))])
def crear_configuracion(config: ConfiguracionCreate, db: Session = Depends(get_db)):
    if db.query(ConfiguracionDB).filter(ConfiguracionDB.clave == config.clave).first():
        raise HTTPException(status_code=400, detail="La clave ya existe")
    nueva = ConfiguracionDB(**config.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.put("/{config_id}", response_model=ConfiguracionSchema, dependencies=[Depends(require_roles(Role.ADMIN))])
def actualizar_configuracion(config_id: int, config: ConfiguracionUpdate, db: Session = Depends(get_db)):
    db_config = db.query(ConfiguracionDB).filter(ConfiguracionDB.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    update_data = config.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_config, key, value)
    db.commit()
    db.refresh(db_config)
    return db_config


@router.delete("/{config_id}", dependencies=[Depends(require_roles(Role.ADMIN))])
def eliminar_configuracion(config_id: int, db: Session = Depends(get_db)):
    db_config = db.query(ConfiguracionDB).filter(ConfiguracionDB.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    db.delete(db_config)
    db.commit()
    return {"mensaje": "Configuración eliminada correctamente"}