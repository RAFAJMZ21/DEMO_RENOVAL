import sqlite3
conn = sqlite3.connect('renoval_system_db')
cursor = conn.cursor()

# Check usuarios
cursor.execute('SELECT * FROM usuarios')
print('=== USUARIOS ===')
for row in cursor.fetchall():
    print(row)

# Check clientes
cursor.execute('SELECT * FROM clientes')
print('\n=== CLIENTES ===')
for row in cursor.fetchall():
    print(row)

# Check destinos_logistica
cursor.execute('SELECT * FROM destinos_logistica')
print('\n=== DESTINOS LOGISTICA ===')
for row in cursor.fetchall():
    print(row)

# Check cotizaciones
cursor.execute('SELECT * FROM cotizaciones')
print('\n=== COTIZACIONES ===')
for row in cursor.fetchall():
    print(row)

conn.close()