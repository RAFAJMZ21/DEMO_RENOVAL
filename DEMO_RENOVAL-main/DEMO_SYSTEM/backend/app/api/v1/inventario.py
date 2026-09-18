from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from app.core.permissions import require_roles, Role

router = APIRouter()

class InsumoSchema(BaseModel):
    item: str
    existencia: str
    proveedor: str

class InventarioRespuesta(BaseModel):
    area: str
    insumos: List[InsumoSchema]

@router.get("/inventario-materia-prima", response_model=InventarioRespuesta, dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR, Role.ALMACENISTA))])
def obtener_inventario_materia_prima():
    return {
        "area": "Planta Lerma - Almacén Principal",
        "insumos": [
            {"item": "Madera Pino Verde (Troza/Tabla)", "existencia": "450 m³ (~190,800 PT)", "proveedor": "Aserraderos del Valle"},
            {"item": "Madera Pino Estufada HT", "existencia": "125 m³ (~53,000 PT)", "proveedor": "Interno (Horno HT-01)"},
            {"item": "Clavo Espiral en Rollo 2 1/2\"", "existencia": "1,200 kg", "proveedor": "Sistemas de Sujeción Industrial"},
            {"item": "Clavo Estándar 3\"", "existencia": "250 kg", "proveedor": "Sistemas de Sujeción Industrial"},
            {"item": "Grapas de Sujeción 1\"", "existencia": "400 kg", "proveedor": "Fijaciones Lerma"}
        ]
    }