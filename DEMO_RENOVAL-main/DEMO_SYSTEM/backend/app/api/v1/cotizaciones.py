from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.entities import CotizacionDB, ClienteDB
from app.core.permissions import require_roles, Role

router = APIRouter()


class ElementoMaderaSchema(BaseModel):
    nombre_elemento: str
    ancho_in: float
    grueso_in: float
    largo_in: float
    piezas_por_tarima: int
    precio_pie_tabla: float


class CotizacionCreate(BaseModel):
    cliente_id: int
    atencion: str
    nombre_producto: str
    cantidad_piezas: int
    precio_sugerido_unidad: float
    costo_estufa_ht: float
    costo_saque: float
    costo_cepillado: float
    costo_transporte: float
    costo_variable: float = 50.0
    costo_directo: float = 20.0
    elementos: List[ElementoMaderaSchema]


class CotizacionResponse(BaseModel):
    id: int
    folio: str
    atencion: str
    nombre_producto: str
    cantidad_piezas: int
    precio_sugerido_unidad: float
    pie_tablar_total: float
    costo_total_unitario: float
    utilidad_unitaria: float
    costo_variable: float
    costo_directo: float
    cliente_id: int
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/calcular", dependencies=[Depends(require_roles(Role.ADMIN, Role.CLIENTE))])
def calcular_y_guardar_cotizacion(payload: CotizacionCreate, db: Session = Depends(get_db)):
    cliente = db.query(ClienteDB).filter(ClienteDB.id == payload.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    pie_tablar_total = sum(
        ((el.ancho_in * el.grueso_in * el.largo_in) / 144.0) * el.piezas_por_tarima
        for el in payload.elementos
    )

    costo_madera = sum(
        (((el.ancho_in * el.grueso_in * el.largo_in) / 144.0) * el.precio_pie_tabla * el.piezas_por_tarima)
        for el in payload.elementos
    )

    costos_adicionales = (
        payload.costo_estufa_ht +
        payload.costo_saque +
        payload.costo_cepillado +
        payload.costo_transporte +
        payload.costo_variable +
        payload.costo_directo
    )
    costo_total_unitario = round(costo_madera + costos_adicionales, 2)
    utilidad_unitaria = round(payload.precio_sugerido_unidad - costo_total_unitario, 2)

    folio_generado = f"COT-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    nueva_cotizacion = CotizacionDB(
        folio=folio_generado,
        atencion=payload.atencion,
        nombre_producto=payload.nombre_producto,
        cantidad_piezas=payload.cantidad_piezas,
        precio_sugerido_unidad=payload.precio_sugerido_unidad,
        pie_tablar_total=round(pie_tablar_total, 3),
        costo_total_unitario=costo_total_unitario,
        utilidad_unitaria=utilidad_unitaria,
        costo_variable=payload.costo_variable,
        costo_directo=payload.costo_directo,
        cliente_id=payload.cliente_id
    )

    db.add(nueva_cotizacion)
    db.commit()
    db.refresh(nueva_cotizacion)

    return {
        "status": "exito",
        "folio": folio_generado,
        "costo_unitario": costo_total_unitario,
        "utilidad_unitaria": utilidad_unitaria,
        "pie_tablar_total": round(pie_tablar_total, 3)
    }


@router.get("/", response_model=List[CotizacionResponse], dependencies=[Depends(require_roles(Role.ADMIN))])
def listar_cotizaciones(db: Session = Depends(get_db)):
    return db.query(CotizacionDB).order_by(CotizacionDB.created_at.desc()).all()


@router.get("/{cotizacion_id}", response_model=CotizacionResponse, dependencies=[Depends(require_roles(Role.ADMIN, Role.CLIENTE))])
def obtener_cotizacion(cotizacion_id: int, db: Session = Depends(get_db)):
    cot = db.query(CotizacionDB).filter(CotizacionDB.id == cotizacion_id).first()
    if not cot:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return cot