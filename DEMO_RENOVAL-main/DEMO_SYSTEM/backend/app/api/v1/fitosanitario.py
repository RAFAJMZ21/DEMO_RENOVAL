from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from datetime import date
from sqlalchemy.orm import Session
from io import BytesIO

from app.core.database import get_db
from app.models.entities import CertificadoFitosanitarioDB, LoteProduccionDB
from app.core.permissions import require_roles, Role
from fpdf import FPDF

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

    class Config:
        from_attributes = True


class CertificadoCreate(BaseModel):
    folio_certificado: str
    folio_lote: str
    cliente: str
    codigo_sello_ht: str
    temperatura_alcanzada: float
    tiempo_sostenimiento_min: int
    fecha_emision: date


@router.get("/certificados", response_model=List[CertificadoSchema], dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def obtener_certificados_ht(db: Session = Depends(get_db)):
    return db.query(CertificadoFitosanitarioDB).order_by(CertificadoFitosanitarioDB.fecha_emision.desc()).all()


@router.post("/certificados", response_model=CertificadoSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR))])
def crear_certificado(cert: CertificadoCreate, db: Session = Depends(get_db)):
    if db.query(CertificadoFitosanitarioDB).filter(CertificadoFitosanitarioDB.folio_certificado == cert.folio_certificado).first():
        raise HTTPException(status_code=400, detail="Folio de certificado ya existe")
    
    lote = db.query(LoteProduccionDB).filter(LoteProduccionDB.folio_lote == cert.folio_lote).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    
    lote.etapa_actual = "EMBARQUE"
    lote.piezas_completadas = lote.piezas_totales
    
    nuevo = CertificadoFitosanitarioDB(**cert.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/certificados/{cert_id}", response_model=CertificadoSchema, dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def obtener_certificado(cert_id: int, db: Session = Depends(get_db)):
    cert = db.query(CertificadoFitosanitarioDB).filter(CertificadoFitosanitarioDB.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificado no encontrado")
    return cert


# --- GENERAR PDF CERTIFICADO FITOSANITARIO ---
class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 10)
        self.cell(0, 6, 'RENOVAL SYS - Certificado Fitosanitario NOM-144-SEMARNAT', 0, 1, 'C')
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Pagina {self.page_no()}/{{nb}}', 0, 0, 'C')


def generar_pdf_certificado(cert: CertificadoFitosanitarioDB) -> bytes:
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)

    # Título
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 10, 'CERTIFICADO DE TRATAMIENTO TERMICO (HT)', 0, 1, 'C')
    pdf.ln(2)

    # Folio
    pdf.set_font('Helvetica', 'B', 11)
    pdf.cell(0, 8, f'Folio: {cert.folio_certificado}', 0, 1, 'C')
    pdf.ln(4)

    # Datos en tabla
    pdf.set_font('Helvetica', '', 10)
    col_w = 60
    val_w = 120

    def row(label, value, bold=False):
        pdf.set_font('Helvetica', 'B' if bold else '', 10)
        pdf.cell(col_w, 7, label, 1, 0, 'L')
        pdf.set_font('Helvetica', '', 10)
        pdf.cell(val_w, 7, str(value), 1, 1, 'L')

    row('Folio Lote:', cert.folio_lote)
    row('Cliente:', cert.cliente)
    row('Sello HT Autorizado:', cert.codigo_sello_ht)
    row('Temperatura Alcanzada (Centro Madera):', f'{cert.temperatura_alcanzada} °C')
    row('Tiempo Sostenimiento:', f'{cert.tiempo_sostenimiento_min} minutos')
    row('Fecha Emision:', cert.fecha_emision.strftime('%d/%m/%Y'))
    row('Norma Aplicable:', 'NOM-144-SEMARNAT-2017', bold=True)
    row('Requisito Minimo:', '>= 56 °C por 30 min (centro madera)', bold=True)

    pdf.ln(6)

    # Verificación
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(0, 7, 'VERIFICACION DE CUMPLIMIENTO:', 0, 1)
    pdf.set_font('Helvetica', '', 10)
    temp_ok = 'CUMPLE' if cert.temperatura_alcanzada >= 56 else 'NO CUMPLE'
    time_ok = 'CUMPLE' if cert.tiempo_sostenimiento_min >= 30 else 'NO CUMPLE'
    pdf.cell(0, 7, f'Temperatura minima 56 °C: {temp_ok}', 0, 1)
    pdf.cell(0, 7, f'Tiempo minimo 30 min: {time_ok}', 0, 1)

    pdf.ln(8)

    # Firma
    pdf.cell(90, 7, '___________________________', 0, 0)
    pdf.cell(0, 7, '___________________________', 0, 1)
    pdf.cell(90, 5, 'Responsable Calidad / Sello HT', 0, 0)
    pdf.cell(0, 5, 'Autoridad Fitosanitaria', 0, 1)
    pdf.ln(4)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.multi_cell(0, 5, 'Este certificado avala que la madera ha sido tratada termicamente conforme a la NOM-144-SEMARNAT-2017 para uso en embalajes de madera destinados a exportacion internacional.')

    # Output to bytes (fpdf2 returns bytes or bytearray with dest='S')
    output = pdf.output(dest='S')
    if isinstance(output, bytes):
        return output
    elif isinstance(output, bytearray):
        return bytes(output)
    else:
        return output.encode('latin-1')


@router.get("/certificados/{cert_id}/pdf", dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def descargar_certificado_pdf(cert_id: int, db: Session = Depends(get_db)):
    cert = db.query(CertificadoFitosanitarioDB).filter(CertificadoFitosanitarioDB.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificado no encontrado")
    
    pdf_bytes = generar_pdf_certificado(cert)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename="Certificado_{cert.folio_certificado}.pdf"'}
    )


@router.get("/certificados/folio/{folio_certificado}/pdf", dependencies=[Depends(require_roles(Role.ADMIN, Role.OPERADOR, Role.ALMACENISTA, Role.CLIENTE, Role.PROVEEDOR))])
def descargar_certificado_pdf_por_folio(folio_certificado: str, db: Session = Depends(get_db)):
    cert = db.query(CertificadoFitosanitarioDB).filter(CertificadoFitosanitarioDB.folio_certificado == folio_certificado).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificado no encontrado")
    
    pdf_bytes = generar_pdf_certificado(cert)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename="Certificado_{cert.folio_certificado}.pdf"'}
    )