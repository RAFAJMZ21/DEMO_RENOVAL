import requests
import json

# Login
r = requests.post('http://127.0.0.1:8000/api/v1/auth/login', json={'email': 'admin@renoval.com', 'password': 'admin123'})
print('Login:', r.status_code, r.json())
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Test endpoints
endpoints = [
    '/api/v1/auth/me/modules',
    '/api/v1/clientes/',
    '/api/v1/almacen/inventario-materia-prima/',
    '/api/v1/almacen/insumos-clavado/',
    '/api/v1/produccion/gantt/',
    '/api/v1/fitosanitario/certificados/',
    '/api/v1/logistica/embarques/',
    '/api/v1/logistica/fletes-destino/',
    '/api/v1/produccion/mermas-scrap/',
    '/api/v1/fichas-normativas/',
    '/api/v1/dashboard/metrics'
]

for ep in endpoints:
    r = requests.get(f'http://127.0.0.1:8000{ep}', headers=headers)
    data = r.json()
    count = len(data) if isinstance(data, list) else 'object'
    print(f'{ep}: {r.status_code} - {count} items')