from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.entities import CotizacionDB
from app.core.permissions import require_roles, Role

router = APIRouter()

class ElementoMaderaSchema(BaseModel):
    nombre_elemento: str
    ancho_in: float
    grueso_in: float
    largo_in: float
    piezas_por_tarima: int
    precio_pie_tabla: float

class CotizacionSchema(BaseModel):
    cliente_id: int
    atencion: str
    nombre_producto: str
    cantidad_piezas: int
    precio_sugerido_unidad: float
    costo_estufa_ht: float
    costo_saque: float
    costo_cepillado: float
    costo_transporte: float
    elementos: List[ElementoMaderaSchema]

@router.post("/calcular", dependencies=[Depends(require_roles(Role.ADMIN, Role.CLIENTE))])
def calcular_y_guardar_cotizacion(payload: CotizacionSchema, db: Session = Depends(get_db)):
    # 1. Cálculo de Pies Tabla (PT)
    pie_tablar_total = sum(
        ((el.ancho_in * el.grueso_in * el.largo_in) / 144.0) * el.piezas_por_tarima
        for el in payload.elementos
    )
    
    # 2. Cálculo de Costos
    costo_madera = sum(
        (((el.ancho_in * el.grueso_in * el.largo_in) / 144.0) * el.precio_pie_tabla * el.piezas_por_tarima)
        for el in payload.elementos
    )
    costos_adicionales = payload.costo_estufa_ht + payload.costo_saque + payload.costo_cepillado + payload.costo_transporte
    costo_total_unitario = round(costo_madera + costos_adicionales, 2)
    utilidad_unitaria = round(payload.precio_sugerido_unidad - costo_total_unitario, 2)

    # 3. Generar Folio
    folio_generado = f"COT-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    # 4. Guardar en Base de Datos MySQL
    nueva_cotizacion = CotizacionDB(
        folio=folio_generado,
        atencion=payload.atencion,
        nombre_producto=payload.nombre_producto,
        cantidad_piezas=payload.cantidad_piezas,
        precio_sugerido_unidad=payload.precio_sugerido_unidad,
        pie_tablar_total=round(pie_tablar_total, 3),
        costo_total_unitario=costo_total_unitario,
        utilidad_unitaria=utilidad_unitaria,
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