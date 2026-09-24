from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.models.entities import FleteTarifaDB, ViajeLogisticaDB, UsuarioDB, CotizacionDB
from app.schemas.logistica import (
    FleteTarifaCreate,
    FleteTarifaUpdate,
    FleteTarifaResponse,
    ViajeLogisticaCreate,
    ViajeLogisticaDetalle,
    ViajeEstadoUpdate,
)

router = APIRouter()

ESTADOS_VIAJE = {"Pendiente", "En Tránsito", "Completado", "Rechazado"}


# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

def _redondear(valor: float, decimales: int = 2) -> float:
    if valor is None or valor != valor:  # None o NaN
        return 0.0
    return round(valor, decimales)


def _completar_tarifa(tarifa: FleteTarifaDB) -> FleteTarifaDB:
    """Calcula y persiste los campos derivados de la matriz de fletes."""
    if tarifa.kilometros and tarifa.precio_flete:
        tarifa.costo_km = _redondear(tarifa.precio_flete / tarifa.kilometros)
    if tarifa.capacidad_tarimas and tarifa.precio_flete:
        pu = _redondear(tarifa.precio_flete / tarifa.capacidad_tarimas)
        if not tarifa.precio_unitario:
            tarifa.precio_unitario = pu
    if not tarifa.precio_reducido and tarifa.precio_unitario:
        tarifa.precio_reducido = _redondear(tarifa.precio_unitario * 0.95)
    return tarifa


def _resolver_operador(db: Session, operador_id: Optional[int] = None) -> UsuarioDB:
    if operador_id is not None:
        usuario = db.query(UsuarioDB).filter(UsuarioDB.id == operador_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Operador no encontrado")
        return usuario
    # En el demo se asigna al primer usuario con rol de operador, o al primero disponible.
    operador = (
        db.query(UsuarioDB)
        .filter(UsuarioDB.rol.in_(["OPERADOR", "OPERADOR_PLANTA"]))
        .order_by(UsuarioDB.id)
        .first()
    )
    if not operador:
        operador = db.query(UsuarioDB).order_by(UsuarioDB.id).first()
    if not operador:
        raise HTTPException(status_code=400, detail="No hay usuarios registrados para asociar el viaje")
    return operador


def _serializar_viaje(viaje: ViajeLogisticaDB, db: Session) -> ViajeLogisticaDetalle:
    tarifa = db.query(FleteTarifaDB).filter(FleteTarifaDB.id == viaje.tarifa_id).first()
    operador = db.query(UsuarioDB).filter(UsuarioDB.id == viaje.operador_id).first()
    cotizacion = None
    if viaje.folio_cotizacion_id:
        cotizacion = db.query(CotizacionDB).filter(CotizacionDB.id == viaje.folio_cotizacion_id).first()

    costo_km = round((tarifa.precio_flete / tarifa.kilometros), 2) if (tarifa and tarifa.kilometros) else 0.0

    return ViajeLogisticaDetalle(
        id=viaje.id,
        folio_cotizacion_id=viaje.folio_cotizacion_id,
        folio_cotizacion=cotizacion.folio if cotizacion else "",
        tarifa_id=viaje.tarifa_id,
        operador_id=viaje.operador_id,
        operador_nombre=operador.nombre_completo if operador else "Sin operador",
        unidad=viaje.unidad or "",
        cantidad_tarimas=viaje.cantidad_tarimas,
        costo_total_flete=viaje.costo_total_flete,
        estado=viaje.estado,
        fecha_salida=viaje.fecha_salida,
        created_at=viaje.created_at,
        destino=f"{tarifa.municipio}, {tarifa.estado}" if tarifa else "—",
        estado_tarifa=tarifa.estado if tarifa else "",
        municipio=tarifa.municipio if tarifa else "",
        empresa=tarifa.empresa if tarifa else "",
        kilometros=tarifa.kilometros if tarifa else 0.0,
        costo_km=costo_km,
        precio_flete=tarifa.precio_flete if tarifa else 0.0,
        capacidad_tarimas=tarifa.capacidad_tarimas if tarifa else 0,
        precio_unitario=tarifa.precio_unitario if tarifa else 0.0,
        precio_reducido=tarifa.precio_reducido if tarifa else 0.0,
    )


# ------------------------------------------------------------------------------
# Matriz de Tarifas de Fletes (Autocompletado de Destinos + CRUD)
# ------------------------------------------------------------------------------

@router.get("/tarifas/", response_model=List[FleteTarifaResponse])
def listar_tarifas(db: Session = Depends(get_db)):
    """Lista de municipios/destinos disponibles para autocompletar."""
    return (
        db.query(FleteTarifaDB)
        .order_by(FleteTarifaDB.estado, FleteTarifaDB.municipio)
        .all()
    )


@router.post("/tarifas/", response_model=FleteTarifaResponse, status_code=status.HTTP_201_CREATED)
def crear_tarifa(payload: FleteTarifaCreate, db: Session = Depends(get_db)):
    if not payload.municipio.strip():
        raise HTTPException(status_code=422, detail="El municipio/destino es obligatorio")
    tarifa = FleteTarifaDB(**payload.model_dump())
    tarifa = _completar_tarifa(tarifa)
    db.add(tarifa)
    db.commit()
    db.refresh(tarifa)
    return tarifa


@router.patch("/tarifas/{tarifa_id}", response_model=FleteTarifaResponse)
def actualizar_tarifa(tarifa_id: int, payload: FleteTarifaUpdate, db: Session = Depends(get_db)):
    tarifa = db.query(FleteTarifaDB).filter(FleteTarifaDB.id == tarifa_id).first()
    if not tarifa:
        raise HTTPException(status_code=404, detail="Tarifa no encontrada")
    datos = {k: v for k, v in payload.model_dump().items() if v is not None}
    for campo, valor in datos.items():
        setattr(tarifa, campo, valor)
    tarifa = _completar_tarifa(tarifa)
    db.commit()
    db.refresh(tarifa)
    return tarifa


@router.delete("/tarifas/{tarifa_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_tarifa(tarifa_id: int, db: Session = Depends(get_db)):
    tarifa = db.query(FleteTarifaDB).filter(FleteTarifaDB.id == tarifa_id).first()
    if not tarifa:
        raise HTTPException(status_code=404, detail="Tarifa no encontrada")
    db.delete(tarifa)
    db.commit()


# ------------------------------------------------------------------------------
# Viajes de Logística (Operador -> Administrador)
# ------------------------------------------------------------------------------

@router.post("/viajes/", response_model=ViajeLogisticaDetalle, status_code=status.HTTP_201_CREATED)
def crear_viaje(payload: ViajeLogisticaCreate, db: Session = Depends(get_db)):
    tarifa = db.query(FleteTarifaDB).filter(FleteTarifaDB.id == payload.tarifa_id).first()
    if not tarifa:
        raise HTTPException(status_code=404, detail="Tarifa/destino no encontrado")

    operador = _resolver_operador(db, payload.operador_id)

    precio_unitario = tarifa.precio_unitario or (
        round(tarifa.precio_flete / tarifa.capacidad_tarimas, 2) if tarifa.capacidad_tarimas else 0.0
    )
    precio_reducido = tarifa.precio_reducido or round(precio_unitario * 0.95, 2)

    if payload.cantidad_tarimas > tarifa.capacidad_tarimas:
        costo_total_flete = _redondear(payload.cantidad_tarimas * precio_reducido)
    else:
        costo_total_flete = _redondear(payload.cantidad_tarimas * precio_unitario)

    viaje = ViajeLogisticaDB(
        folio_cotizacion_id=payload.folio_cotizacion_id,
        tarifa_id=tarifa.id,
        operador_id=operador.id,
        unidad=payload.unidad,
        cantidad_tarimas=payload.cantidad_tarimas,
        costo_total_flete=costo_total_flete,
        estado="Pendiente",
        fecha_salida=payload.fecha_salida or date.today(),
    )
    db.add(viaje)
    db.commit()
    db.refresh(viaje)
    return _serializar_viaje(viaje, db)


@router.get("/viajes/", response_model=List[ViajeLogisticaDetalle])
def listar_viajes(db: Session = Depends(get_db)):
    viajes = db.query(ViajeLogisticaDB).order_by(ViajeLogisticaDB.id.desc()).all()
    return [_serializar_viaje(v, db) for v in viajes]


@router.get("/viajes/pendientes/", response_model=List[ViajeLogisticaDetalle])
def listar_viajes_pendientes(db: Session = Depends(get_db)):
    viajes = (
        db.query(ViajeLogisticaDB)
        .filter(ViajeLogisticaDB.estado == "Pendiente")
        .order_by(ViajeLogisticaDB.id.desc())
        .all()
    )
    return [_serializar_viaje(v, db) for v in viajes]


@router.patch("/viajes/{viaje_id}/aprobar", response_model=ViajeLogisticaDetalle)
def aprobar_viaje(viaje_id: int, payload: ViajeEstadoUpdate, db: Session = Depends(get_db)):
    viaje = db.query(ViajeLogisticaDB).filter(ViajeLogisticaDB.id == viaje_id).first()
    if not viaje:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    viaje.estado = payload.estado
    db.commit()
    db.refresh(viaje)
    return _serializar_viaje(viaje, db)


# ------------------------------------------------------------------------------
# Endpoints legados (compatibilidad con CotizadorForm/LogisticaDespachoView)
# ------------------------------------------------------------------------------

class FleteDestinoLegacySchema(BaseModel):
    estado: str
    municipio: str
    km: int
    precio_flete: float
    capacidad: int
    costo_tarima_unitario: float


@router.get("/fletes-destino/", response_model=List[FleteDestinoLegacySchema])
def obtener_fletes_destino(db: Session = Depends(get_db)):
    return [
        {
            "estado": t.estado,
            "municipio": t.municipio,
            "km": int(t.kilometros or 0),
            "precio_flete": t.precio_flete,
            "capacidad": t.capacidad_tarimas,
            "costo_tarima_unitario": t.precio_unitario
            or (round(t.precio_flete / t.capacidad_tarimas, 2) if t.capacidad_tarimas else 0.0),
        }
        for t in db.query(FleteTarifaDB).order_by(FleteTarifaDB.estado, FleteTarifaDB.municipio).all()
    ]


class EmbarqueDespachoSchema(BaseModel):
    id: int
    folio_embarque: str
    cliente: str
    chofer: str
    placas_trailer: str
    tarimas_cargadas: int
    fecha_despacho: str
    estatus: str  # PROGRAMADO, EN_TRANSITO, ENTREGADO


@router.get("/embarques/", response_model=List[EmbarqueDespachoSchema])
def obtener_embarques_despacho():
    return [
        {"id": 1, "folio_embarque": "EMB-2026-881", "cliente": "Logística & Embalajes del Valle", "chofer": "Carlos Mendoza", "placas_trailer": "77-AB-9X", "tarimas_cargadas": 600, "fecha_despacho": "2026-09-17", "estatus": "EN_TRANSITO"},
        {"id": 2, "folio_embarque": "EMB-2026-880", "cliente": "Automotive Freight Mexico", "chofer": "María Torres", "placas_trailer": "44-KL-2M", "tarimas_cargadas": 450, "fecha_despacho": "2026-09-20", "estatus": "PROGRAMADO"},
        {"id": 3, "folio_embarque": "EMB-2026-879", "cliente": "Empaques Industriales Lerma", "chofer": "Rubén Gutiérrez", "placas_trailer": "12-CV-7N", "tarimas_cargadas": 800, "fecha_despacho": "2026-09-12", "estatus": "ENTREGADO"}
    ]