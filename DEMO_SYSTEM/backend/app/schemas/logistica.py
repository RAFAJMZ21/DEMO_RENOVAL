from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from datetime import date, datetime


def _coerce_float(v) -> float:
    """Acepta None, '', NaN o números/strings y devuelve float >= 0."""
    if v is None:
        return 0.0
    try:
        f = float(v)
    except (TypeError, ValueError):
        return 0.0
    if f != f:  # NaN
        return 0.0
    return max(0.0, f)


def _coerce_int_min1(v) -> int:
    if v is None:
        return 1
    try:
        i = int(float(v))
    except (TypeError, ValueError):
        return 1
    return max(1, i)


def _coerce_int_ge0(v) -> int:
    if v is None:
        return 0
    try:
        i = int(float(v))
    except (TypeError, ValueError):
        return 0
    return max(0, i)


def _coerce_str(v) -> str:
    if v is None:
        return ""
    return str(v).strip()


def _coerce_optional_int(v):
    """Convierte a int >= 1 o None (acepta '' y NaN)."""
    if v is None or v == "":
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if f != f:  # NaN
        return None
    return max(1, int(f))


class FleteTarifaCreate(BaseModel):
    estado: str = ""
    municipio: str = ""
    empresa: str = ""
    kilometros: float = Field(default=0.0, ge=0)
    precio_flete: float = Field(default=0.0, ge=0)
    costo_km: float = Field(default=0.0, ge=0)
    capacidad_tarimas: int = Field(default=0, ge=0)
    precio_unitario: float = Field(default=0.0, ge=0)
    precio_reducido: float = Field(default=0.0, ge=0)

    model_config = {"extra": "ignore"}

    @field_validator("estado", "municipio", "empresa", mode="before")
    @classmethod
    def _v_str(cls, v):
        return _coerce_str(v)

    @field_validator("kilometros", "precio_flete", "costo_km", "precio_unitario", "precio_reducido", mode="before")
    @classmethod
    def _v_floats(cls, v):
        return _coerce_float(v)

    @field_validator("capacidad_tarimas", mode="before")
    @classmethod
    def _v_capacidad(cls, v):
        return _coerce_int_ge0(v)


class FleteTarifaUpdate(BaseModel):
    estado: Optional[str] = None
    municipio: Optional[str] = None
    empresa: Optional[str] = None
    kilometros: Optional[float] = None
    precio_flete: Optional[float] = None
    costo_km: Optional[float] = None
    capacidad_tarimas: Optional[int] = None
    precio_unitario: Optional[float] = None
    precio_reducido: Optional[float] = None

    model_config = {"extra": "ignore"}

    @field_validator("estado", "municipio", "empresa", mode="before")
    @classmethod
    def _v_str(cls, v):
        return _coerce_str(v)

    @field_validator("kilometros", "precio_flete", "costo_km", "precio_unitario", "precio_reducido", mode="before")
    @classmethod
    def _v_floats(cls, v):
        return _coerce_float(v)

    @field_validator("capacidad_tarimas", mode="before")
    @classmethod
    def _v_capacidad(cls, v):
        return _coerce_int_ge0(v)


class FleteTarifaResponse(BaseModel):
    id: int
    estado: str = ""
    municipio: str = ""
    empresa: str = ""
    kilometros: float = 0.0
    precio_flete: float = 0.0
    costo_km: float = 0.0
    capacidad_tarimas: int = 0
    precio_unitario: float = 0.0
    precio_reducido: float = 0.0

    model_config = {"from_attributes": True}


class ViajeLogisticaCreate(BaseModel):
    folio_cotizacion_id: Optional[int] = None
    tarifa_id: int
    operador_id: Optional[int] = None
    unidad: str = ""
    cantidad_tarimas: int = Field(default=1, ge=1)
    fecha_salida: Optional[date] = None

    model_config = {"extra": "ignore"}

    @field_validator("folio_cotizacion_id", "operador_id", mode="before")
    @classmethod
    def _v_opt_int(cls, v):
        return _coerce_optional_int(v)

    @field_validator("tarifa_id", mode="before")
    @classmethod
    def _v_tarifa(cls, v):
        return _coerce_int_min1(v)

    @field_validator("unidad", mode="before")
    @classmethod
    def _v_unidad(cls, v):
        return _coerce_str(v)

    @field_validator("cantidad_tarimas", mode="before")
    @classmethod
    def _v_cantidad(cls, v):
        return _coerce_int_min1(v)


class ViajeLogisticaResponse(BaseModel):
    id: int
    folio_cotizacion_id: Optional[int] = None
    tarifa_id: int
    operador_id: Optional[int] = None
    unidad: str = ""
    cantidad_tarimas: int = 1
    costo_total_flete: float = 0.0
    estado: str = "Pendiente"
    fecha_salida: Optional[date] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ViajeLogisticaDetalle(ViajeLogisticaResponse):
    folio_cotizacion: str = ""
    operador_nombre: str = ""
    destino: str = ""
    estado_tarifa: str = ""
    municipio: str = ""
    empresa: str = ""
    kilometros: float = 0.0
    costo_km: float = 0.0
    precio_flete: float = 0.0
    capacidad_tarimas: int = 0
    precio_unitario: float = 0.0
    precio_reducido: float = 0.0


class ViajeEstadoUpdate(BaseModel):
    estado: Literal["En Tránsito", "Completado", "Rechazado", "Pendiente"] = "En Tránsito"