import sqlite3
from datetime import datetime, timedelta

conn = sqlite3.connect('renoval_system_db')
cursor = conn.cursor()

now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# Seed lotes_produccion (no porcentaje_avance column)
lotes = [
    ('LOT-2026-001', 'Tarima Barrote 40" x 48"', 800, 568, 'HT_FITOSANITARIO', '2026-09-14', '2026-09-18', 'Horno HT-01', now, now),
    ('LOT-2026-002', 'Tarima Tacón Perimetral', 500, 200, 'ARMADO', '2026-09-15', '2026-09-20', 'Línea Clavado B', now, now),
    ('LOT-2026-003', 'Caja Industrial Reforzada', 150, 150, 'EMBARQUE', '2026-09-10', '2026-09-17', 'Almacén PT', now, now),
    ('LOT-2026-004', 'Tarima Barrote 40" x 48"', 600, 0, 'ASERRADERO', '2026-09-16', '2026-09-22', 'Aserradero A', now, now),
    ('LOT-2026-005', 'Tarima Euro 1200x800', 400, 120, 'ARMADO', '2026-09-17', '2026-09-25', 'Línea Clavado A', now, now),
]

cursor.executemany('''
    INSERT INTO lotes_produccion (folio_lote, producto, piezas_totales, piezas_completadas, etapa_actual, fecha_inicio, fecha_fin_estimada, area_asignada, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', lotes)

# Seed insumos_clavado
insumos = [
    ('CLAVE-001', 'Clavo Espiral en Rollo 2 1/2"', 'CLAVO_ESPIRAL', '2 1/2"', 1200, 300, 'Línea 1', now, now),
    ('CLAVE-002', 'Clavo Estándar 3"', 'CLAVO_ESPIRAL', '3"', 250, 300, 'Línea 2', now, now),
    ('GRAPA-001', 'Grapas de Sujeción 1"', 'GRAPA', '1"', 400, 200, 'Línea 1', now, now),
    ('GRAPA-002', 'Grapas de Sujeción 1 1/4"', 'GRAPA', '1 1/4"', 600, 200, 'Línea 2', now, now),
    ('ESQ-001', 'Esquineros Metálicos 50mm', 'ESQUINERO', '50mm', 800, 150, 'Línea 1', now, now),
    ('PINT-001', 'Pintura Marcado Roja 19L', 'PINTURA', '19L', 45, 10, 'Línea 1', now, now),
    ('PINT-002', 'Pintura Marcado Azul 19L', 'PINTURA', '19L', 30, 10, 'Línea 2', now, now),
]

cursor.executemany('''
    INSERT INTO insumos_clavado (codigo, descripcion, tipo, medida, existencia_kg, stock_minimo_kg, linea_asignada, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
''', insumos)

# Seed certificados_fitosanitarios
certificados = [
    ('CERT-HT-2026-015', 'LOT-2026-001', 'Logística & Embalajes del Valle S.A.', 'MX-144-HT-089', 58.4, 42, '2026-09-17', now),
    ('CERT-HT-2026-014', 'LOT-2026-002', 'Automotive Freight Mexico', 'MX-144-HT-088', 57.2, 38, '2026-09-15', now),
    ('CERT-HT-2026-013', 'LOT-2026-003', 'Empaques Industriales Lerma', 'MX-144-HT-087', 56.8, 35, '2026-09-14', now),
]

cursor.executemany('''
    INSERT INTO certificados_fitosanitarios (folio_certificado, folio_lote, cliente, codigo_sello_ht, temperatura_alcanzada, tiempo_sostenimiento_min, fecha_emision, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
''', certificados)

# Seed embarques_despacho
embarques = [
    ('EMB-2026-045', 'Logística & Embalajes del Valle S.A.', 'Roberto M.', 'TR-4567', 45, '2026-09-18', 'ENTREGADO', now, now),
    ('EMB-2026-046', 'Automotive Freight Mexico', 'Carlos R.', 'TR-4568', 32, '2026-09-19', 'EN_TRANSITO', now, now),
    ('EMB-2026-047', 'Maderas del Norte', 'Miguel T.', 'TR-4569', 28, '2026-09-20', 'PROGRAMADO', now, now),
    ('EMB-2026-048', 'Logística & Embalajes del Valle S.A.', 'Roberto M.', 'TR-4570', 50, '2026-09-21', 'PROGRAMADO', now, now),
]

cursor.executemany('''
    INSERT INTO embarques_despacho (folio_embarque, cliente, chofer, placas_trailer, tarimas_cargadas, fecha_despacho, estatus, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
''', embarques)

# Seed fletes_tarifas
fletes = [
    ('CDMX', 'Miguel Hidalgo', 51, 1200, 200, 6.0, 1, now),
    ('Querétaro', 'Parque Industrial Aerotech', 205, 4800, 200, 24.0, 1, now),
    ('Guadalajara', 'Zapopan', 540, 12000, 180, 66.7, 1, now),
    ('Monterrey', 'Apodaca', 720, 15000, 180, 83.3, 1, now),
    ('Puebla', 'San Martín Texmelucan', 180, 4000, 200, 20.0, 1, now),
    ('Toluca', 'Lerma', 45, 1000, 200, 5.0, 1, now),
]

cursor.executemany('''
    INSERT INTO fletes_tarifas (estado, municipio, km, precio_flete, capacidad, costo_tarima_unitario, activo, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
''', fletes)

# Seed control_mermas
mermas = [
    ('LOT-2026-001', 12500, 11800, 700, 5.6, 'Corte incorrecto en barrote', now),
    ('LOT-2026-002', 8500, 8200, 300, 3.5, 'Defectos en madera', now),
    ('LOT-2026-003', 3200, 3150, 50, 1.6, 'Error de medida', now),
]

cursor.executemany('''
    INSERT INTO control_mermas (folio_lote, pt_teoricos, pt_reales_utilizados, pt_desperdicio, porcentaje_scrap, causa_principal, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
''', mermas)

# Seed fichas_normativas
fichas = [
    ('Ficha Tarima Barrote 40x48', 'NOM-144-SEMARNAT', '1,200 kg dinámica / 4,000 kg estática', 'Pino Tratado HT', 'Especificación técnica para tarima de barrote estándar 40" x 48"', 'https://docs.renoval.com/fichas/tarima-barrote-40x48.pdf', now, now),
    ('Ficha Tarima Tacón Perimetral', 'NIMF-15', '1,500 kg dinámica / 4,500 kg estática', 'Pino Tratado HT', 'Tarima con tacón perimetral para carga pesada', 'https://docs.renoval.com/fichas/tarima-tacon-perimetral.pdf', now, now),
    ('Ficha Caja Industrial Reforzada', 'ASTM D7032', '800 kg dinámica / 2,500 kg estática', 'Pino Tratado HT', 'Caja de madera industrial con refuerzos metálicos', 'https://docs.renoval.com/fichas/caja-industrial.pdf', now, now),
]

cursor.executemany('''
    INSERT INTO fichas_normativas (titulo, norma, capacidad, madera, descripcion, archivo_pdf, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
''', fichas)

# Seed usuarios adicionales
usuarios = [
    ('operador1', 'operador@renoval.com', '$2b$12$2tbMO.6BVOpTpGnFEuSd6ud88Y1wrF3bQ1jksYSVgmpVWuYkQsuKi', 'Juan Pérez', 'OPERADOR', now),
    ('almacenista1', 'almacen@renoval.com', '$2b$12$2tbMO.6BVOpTpGnFEuSd6ud88Y1wrF3bQ1jksYSVgmpVWuYkQsuKi', 'María García', 'ALMACENISTA', now),
    ('cliente1', 'cliente@logistica.com', '$2b$12$2tbMO.6BVOpTpGnFEuSd6ud88Y1wrF3bQ1jksYSVgmpVWuYkQsuKi', 'Carlos López', 'CLIENTE', now),
    ('proveedor1', 'proveedor@aserradero.com', '$2b$12$2tbMO.6BVOpTpGnFEuSd6ud88Y1wrF3bQ1jksYSVgmpVWuYkQsuKi', 'Roberto Aserradero', 'PROVEEDOR', now),
]

cursor.executemany('''
    INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
''', usuarios)

conn.commit()
conn.close()
print("OK: Datos de demo insertados correctamente")