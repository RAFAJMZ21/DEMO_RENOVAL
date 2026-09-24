from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.entities import CotizacionDB
from app.schemas.cotizacion import (
    CotizacionCreate,
    CotizacionResponse,
    CotizacionEstadoUpdate,
    CotizacionResumen,
)

router = APIRouter()

IVA_RATE = 0.16
ESTADOS_VALIDOS = {"Borrador", "Aprobada", "Rechazada"}


def _generar_folio() -> str:
    # Microsegundos + sufijo corto aleatorio para evitar colisiones en insert simultáneos
    ts = datetime.now().strftime('%Y%m%d%H%M%S') + f"{datetime.now().microsecond:06d}"
    return f"COT-{ts}"


def _calcular_totales(payload: CotizacionCreate) -> tuple[float, float, float]:
    """Calcula subtotal, IVA (16%) y total estimado a partir del payload."""
    subtotal = round(payload.precio_unitario * payload.cantidad + payload.costo_mano_obra + payload.flete, 2)
    iva = round(subtotal * IVA_RATE, 2)
    total = round(subtotal + iva, 2)
    return subtotal, iva, total


# ------------------------------------------------------------------------------
# CRUD de Cotizaciones
# ------------------------------------------------------------------------------

@router.post("/", response_model=CotizacionResponse, status_code=status.HTTP_201_CREATED)
def crear_cotizacion(payload: CotizacionCreate, db: Session = Depends(get_db)):
    subtotal, iva, total = _calcular_totales(payload)

    nueva_cotizacion = CotizacionDB(
        folio=_generar_folio(),
        atencion=payload.cliente,
        nombre_producto=f"{payload.tipo_madera} {payload.dimensiones}".strip() or "Cotización",
        cantidad_piezas=payload.cantidad,
        precio_sugerido_unidad=payload.precio_unitario,
        pie_tablar_total=0.0,
        costo_total_unitario=subtotal,
        utilidad_unitaria=0.0,
        cliente_id=None,
        # Campos v2
        cliente=payload.cliente,
        items=[item.model_dump() for item in payload.items],
        dimensiones=payload.dimensiones,
        tipo_madera=payload.tipo_madera,
        precio_unitario=payload.precio_unitario,
        cantidad=payload.cantidad,
        costo_mano_obra=payload.costo_mano_obra,
        flete=payload.flete,
        subtotal=subtotal,
        iva=iva,
        total=total,
        estado="Borrador",
    )

    db.add(nueva_cotizacion)
    db.commit()
    db.refresh(nueva_cotizacion)
    return nueva_cotizacion


@router.get("/", response_model=List[CotizacionResumen])
def listar_cotizaciones(db: Session = Depends(get_db)):
    return db.query(CotizacionDB).order_by(CotizacionDB.id.desc()).all()


@router.get("/{cotizacion_id}/", response_model=CotizacionResponse)
def obtener_cotizacion(cotizacion_id: int, db: Session = Depends(get_db)):
    cotizacion = db.query(CotizacionDB).filter(CotizacionDB.id == cotizacion_id).first()
    if not cotizacion:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return cotizacion


@router.patch("/{cotizacion_id}/estado/", response_model=CotizacionResponse)
def actualizar_estado_cotizacion(
    cotizacion_id: int,
    payload: CotizacionEstadoUpdate,
    db: Session = Depends(get_db),
):
    if payload.estado not in ESTADOS_VALIDOS:
        raise HTTPException(
            status_code=422,
            detail=f"Estado inválido. Valores permitidos: {', '.join(sorted(ESTADOS_VALIDOS))}",
        )

    cotizacion = db.query(CotizacionDB).filter(CotizacionDB.id == cotizacion_id).first()
    if not cotizacion:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")

    cotizacion.estado = payload.estado
    db.commit()
    db.refresh(cotizacion)
    return cotizacion


# ------------------------------------------------------------------------------
# Endpoint legado: Cotizador Paramétrico (Fórmula de Pies Tabla)
# ------------------------------------------------------------------------------

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

@router.post("/calcular")
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
    folio_generado = _generar_folio()

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
        cliente_id=payload.cliente_id,
        cliente="",
        items=[],
        dimensiones="",
        tipo_madera="",
        precio_unitario=payload.precio_sugerido_unidad,
        cantidad=payload.cantidad_piezas,
        costo_mano_obra=0.0,
        flete=0.0,
        subtotal=costo_total_unitario,
        iva=0.0,
        total=costo_total_unitario,
        estado="Borrador",
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