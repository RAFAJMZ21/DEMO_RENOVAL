from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from app.core.permissions import require_roles, Role

router = APIRouter()

class FleteTarifaSchema(BaseModel):
    estado: str
    municipio: str
    km: int
    precio_flete: float
    capacidad: int
    costo_tarima_unitario: float

@router.get("/fletes-destino", response_model=List[FleteTarifaSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def obtener_fletes_destino():
    return [
        {"estado": "CDMX", "municipio": "Miguel Hidalgo", "km": 51, "precio_flete": 4300.0, "capacidad": 200, "costo_tarima_unitario": 21.50},
        {"estado": "Querétaro", "municipio": "Parque Industrial Aerotech", "km": 205, "precio_flete": 11500.0, "capacidad": 200, "costo_tarima_unitario": 57.50},
        {"estado": "CDMX", "municipio": "Ixtapaluca", "km": 80, "precio_flete": 6000.0, "capacidad": 200, "costo_tarima_unitario": 30.00},
        {"estado": "CDMX", "municipio": "Azcapotzalco", "km": 55, "precio_flete": 4600.0, "capacidad": 200, "costo_tarima_unitario": 23.00},
        {"estado": "CDMX", "municipio": "Atizapán", "km": 59, "precio_flete": 4800.0, "capacidad": 200, "costo_tarima_unitario": 24.00},
        {"estado": "Edomex", "municipio": "Cuautitlán", "km": 48, "precio_flete": 9300.0, "capacidad": 480, "costo_tarima_unitario": 19.38}
    ]