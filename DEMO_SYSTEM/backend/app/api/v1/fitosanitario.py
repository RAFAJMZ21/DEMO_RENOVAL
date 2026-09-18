from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import date

router = APIRouter()

class CertificadoSchema(BaseModel):
    id: int
    folio_certificado: str
    folio_lote: str
    cliente: str
    codigo_sello_ht: str
    temperatura_alcanzada: float
    tiempo_sostenimiento_min: int
    fecha_emision: date

@router.get("/certificados", response_model=List[CertificadoSchema])
def obtener_certificados_ht():
    return [
        {
            "id": 1,
            "folio_certificado": "CERT-HT-2026-001",
            "folio_lote": "LOT-2026-001",
            "cliente": "Logística & Embalajes del Valle S.A.",
            "codigo_sello_ht": "MX-144-HT-089",
            "temperatura_alcanzada": 58.4,
            "tiempo_sostenimiento_min": 42,
            "fecha_emision": date(2026, 9, 17)
        },
        {
            "id": 2,
            "folio_certificado": "CERT-HT-2026-002",
            "folio_lote": "LOT-2026-003",
            "cliente": "Automotive Freight Mexico",
            "codigo_sello_ht": "MX-144-HT-089",
            "temperatura_alcanzada": 61.2,
            "tiempo_sostenimiento_min": 55,
            "fecha_emision": date(2026, 9, 15)
        }
    ]