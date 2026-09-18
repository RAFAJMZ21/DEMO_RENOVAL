import sqlite3
conn = sqlite3.connect('renoval_system.db')
c = conn.cursor()
c.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = c.fetchall()
print('Tablas:', tables)
for t in tables:
    c.execute(f'SELECT COUNT(*) FROM {t[0]}')
    count = c.fetchone()[0]
    print(f'  {t[0]}: {count} registros')
conn.close()