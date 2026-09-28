from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import date

router = APIRouter()

class LoteGanttSchema(BaseModel):
    id: int
    folio_lote: str
    producto: str
    piezas_totales: int
    piezas_completadas: int
    etapa_actual: str
    fecha_inicio: date
    fecha_fin_estimada: date
    porcentaje_avance: float
    area_asignada: str

class ControlMermaSchema(BaseModel):
    id: int
    folio_lote: str
    pt_teoricos: float
    pt_reales_utilizados: float
    pt_desperdicio: float
    porcentaje_scrap: float
    causa_principal: str

@router.get("/mermas-scrap/", response_model=List[ControlMermaSchema])
def obtener_mermas_scrap():
    return [
        {"id": 1, "folio_lote": "LOT-2026-001", "pt_teoricos": 12450.0, "pt_reales_utilizados": 12110.0, "pt_desperdicio": 340.0, "porcentaje_scrap": 2.73, "causa_principal": "Nudos y grietas en tablas"},
        {"id": 2, "folio_lote": "LOT-2026-002", "pt_teoricos": 8300.0, "pt_reales_utilizados": 8120.0, "pt_desperdicio": 180.0, "porcentaje_scrap": 2.17, "causa_principal": "Despuntes en cepillado"},
        {"id": 3, "folio_lote": "LOT-2026-003", "pt_teoricos": 6400.0, "pt_reales_utilizados": 6230.0, "pt_desperdicio": 170.0, "porcentaje_scrap": 2.66, "causa_principal": "Astillado en clavado"}
    ]

@router.get("/gantt/", response_model=List[LoteGanttSchema])
def obtener_produccion_gantt():
    return [
        {
            "id": 1,
            "folio_lote": "LOT-2026-001",
            "producto": "Tarima Barrote 40\" x 48\" (NOM-144)",
            "piezas_totales": 1200,
            "piezas_completadas": 850,
            "etapa_actual": "HT_FITOSANITARIO",
            "fecha_inicio": date(2026, 9, 14),
            "fecha_fin_estimada": date(2026, 9, 19),
            "porcentaje_avance": 70.8,
            "area_asignada": "Horno de Estufado HT-01"
        },
        {
            "id": 2,
            "folio_lote": "LOT-2026-002",
            "producto": "Tarima Tacón Perimetral 1200x1000mm",
            "piezas_totales": 800,
            "piezas_completadas": 320,
            "etapa_actual": "ARMADO",
            "fecha_inicio": date(2026, 9, 16),
            "fecha_fin_estimada": date(2026, 9, 21),
            "porcentaje_avance": 40.0,
            "area_asignada": "Línea de Clavado B"
        },
        {
            "id": 3,
            "folio_lote": "LOT-2026-003",
            "producto": "Caja Industrial Madera Reforzada",
            "piezas_totales": 450,
            "piezas_completadas": 450,
            "etapa_actual": "EMBARQUE",
            "fecha_inicio": date(2026, 9, 10),
            "fecha_fin_estimada": date(2026, 9, 17),
            "porcentaje_avance": 100.0,
            "area_asignada": "Almacén PT"
        }
    ]