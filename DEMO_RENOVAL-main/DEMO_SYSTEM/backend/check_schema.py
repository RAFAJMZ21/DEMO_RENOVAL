import sqlite3
conn = sqlite3.connect('renoval_system_db')
cursor = conn.cursor()

tables = ['lotes_produccion', 'insumos_clavado', 'certificados_fitosanitarios', 'embarques_despacho', 'fletes_tarifas', 'control_mermas', 'fichas_normativas', 'usuarios', 'clientes']
for t in tables:
    cursor.execute(f'PRAGMA table_info({t})')
    cols = cursor.fetchall()
    print(f'\n=== {t} ===')
    for c in cols:
        print(f'  {c[1]} ({c[2]})')

conn.close()