from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class InsumoSchema(BaseModel):
    item: str
    existencia: str
    proveedor: str

class InventarioRespuesta(BaseModel):
    area: str
    insumos: List[InsumoSchema]

@router.get("/inventario-materia-prima/", response_model=InventarioRespuesta)
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

class InsumoClavadoSchema(BaseModel):
    id: int
    codigo: str
    descripcion: str
    tipo: str  # CLAVO_ESPIRAL, GRAPA, ESQUINERO, PINTURA
    medida: str
    existencia_kg: float
    stock_minimo_kg: float
    linea_asignada: str

@router.get("/insumos-clavado/", response_model=List[InsumoClavadoSchema])
def obtener_insumos_clavado():
    return [
        {"id": 1, "codigo": "CLV-ESP-250", "descripcion": "Clavo Espiral en Rollo 2 1/2\"", "tipo": "CLAVO_ESPIRAL", "medida": "2 1/2\"", "existencia_kg": 1200.0, "stock_minimo_kg": 300.0, "linea_asignada": "Línea A de Clavado"},
        {"id": 2, "codigo": "CLV-STD-300", "descripcion": "Clavo Estándar 3\"", "tipo": "CLAVO_ESPIRAL", "medida": "3\"", "existencia_kg": 250.0, "stock_minimo_kg": 400.0, "linea_asignada": "Línea B de Clavado"},
        {"id": 3, "codigo": "GRP-100", "descripcion": "Grapas de Sujeción 1\"", "tipo": "GRAPA", "medida": "1\"", "existencia_kg": 400.0, "stock_minimo_kg": 150.0, "linea_asignada": "Línea A de Clavado"},
        {"id": 4, "codigo": "PINT-LER-5G", "descripcion": "Pintura de Marcado Epóxico 5 gal", "tipo": "PINTURA", "medida": "5 galones", "existencia_kg": 18.9, "stock_minimo_kg": 10.0, "linea_asignada": "Almacén PT"}
    ]