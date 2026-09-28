from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from datetime import datetime


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
    """Acepta None, '', floats/strings y devuelve int >= 1."""
    if v is None:
        return 1
    try:
        i = int(float(v))
    except (TypeError, ValueError):
        return 1
    return max(1, i)


def _coerce_str(v) -> str:
    if v is None:
        return ""
    return str(v).strip()


class ItemCotizacion(BaseModel):
    descripcion: str = ""
    cantidad: int = Field(default=1, ge=1)
    precio_unitario: float = Field(default=0.0, ge=0)

    @field_validator("descripcion", mode="before")
    @classmethod
    def _v_desc(cls, v):
        return _coerce_str(v)

    @field_validator("cantidad", mode="before")
    @classmethod
    def _v_cant(cls, v):
        return _coerce_int_min1(v)

    @field_validator("precio_unitario", mode="before")
    @classmethod
    def _v_pu(cls, v):
        return _coerce_float(v)


class CotizacionCreate(BaseModel):
    cliente: str = Field("", min_length=0)
    items: List[ItemCotizacion] = Field(default_factory=list)
    dimensiones: str = ""
    tipo_madera: str = ""
    precio_unitario: float = Field(default=0.0, ge=0)
    cantidad: int = Field(default=1, ge=1)
    costo_mano_obra: float = Field(default=0.0, ge=0)
    flete: float = Field(default=0.0, ge=0)

    model_config = {"extra": "ignore"}

    @field_validator("cliente", "dimensiones", "tipo_madera", mode="before")
    @classmethod
    def _v_str(cls, v):
        return _coerce_str(v)

    @field_validator("items", mode="before")
    @classmethod
    def _v_items(cls, v):
        return v or []

    @field_validator("cantidad", mode="before")
    @classmethod
    def _v_cantidad(cls, v):
        return _coerce_int_min1(v)

    @field_validator("precio_unitario", "costo_mano_obra", "flete", mode="before")
    @classmethod
    def _v_floats(cls, v):
        return _coerce_float(v)


class CotizacionResponse(BaseModel):
    id: int
    folio: str = ""
    cliente: str = ""
    items: List[ItemCotizacion] = Field(default_factory=list)
    dimensiones: str = ""
    tipo_madera: str = ""
    precio_unitario: float = 0.0
    cantidad: int = 1
    costo_mano_obra: float = 0.0
    flete: float = 0.0
    subtotal: float = 0.0
    iva: float = 0.0
    total: float = 0.0
    estado: str = "Borrador"
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CotizacionEstadoUpdate(BaseModel):
    estado: Literal["Borrador", "Aprobada", "Rechazada"]


class CotizacionResumen(BaseModel):
    id: int
    folio: str = ""
    cliente: str = ""
    tipo_madera: str = ""
    dimensiones: str = ""
    cantidad: int = 1
    subtotal: float = 0.0
    iva: float = 0.0
    total: float = 0.0
    estado: str = "Borrador"
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}