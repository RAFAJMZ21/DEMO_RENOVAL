from enum import Enum
from typing import List, Set
from fastapi import Depends, HTTPException, status
from app.core.database import get_db
from app.models.entities import UsuarioDB
from sqlalchemy.orm import Session


class Module(str, Enum):
    DASHBOARD = "dashboard"
    CLIENTES = "clientes"
    COTIZACIONES = "cotizaciones"
    INVENTARIO_MADERA = "inventario_madera"
    INSUMOS = "insumos"
    PRODUCCION = "produccion"
    GANTT = "gantt"
    FITOSANITARIO = "fitosanitario"
    LOGISTICA = "logistica"
    CERTIFICADOS = "certificados"
    USUARIOS = "usuarios"
    REPORTES = "reportes"
    CONFIGURACION = "configuracion"


class Role(str, Enum):
    ADMIN = "ADMIN"
    CLIENTE = "CLIENTE"
    OPERADOR = "OPERADOR"
    ALMACENISTA = "ALMACENISTA"
    PROVEEDOR = "PROVEEDOR"


ROLE_MODULES: dict[Role, List[Module]] = {
    Role.ADMIN: list(Module),
    Role.CLIENTE: [
        Module.DASHBOARD,
        Module.COTIZACIONES,
        Module.LOGISTICA,
        Module.CERTIFICADOS,
    ],
    Role.OPERADOR: [
        Module.DASHBOARD,
        Module.PRODUCCION,
        Module.GANTT,
        Module.FITOSANITARIO,
        Module.INVENTARIO_MADERA,
    ],
    Role.ALMACENISTA: [
        Module.DASHBOARD,
        Module.INVENTARIO_MADERA,
        Module.INSUMOS,
        Module.LOGISTICA,
        Module.CERTIFICADOS,
    ],
    Role.PROVEEDOR: [
        Module.DASHBOARD,
        Module.LOGISTICA,
        Module.CERTIFICADOS,
    ],
}

MODULE_METADATA = {
    Module.DASHBOARD: {"label": "Dashboard", "icon": "LayoutDashboard", "path": "/dashboard"},
    Module.CLIENTES: {"label": "Clientes", "icon": "Users", "path": "/clientes"},
    Module.COTIZACIONES: {"label": "Cotizaciones", "icon": "Calculator", "path": "/cotizaciones"},
    Module.INVENTARIO_MADERA: {"label": "Inventario Madera", "icon": "Trees", "path": "/almacen/madera"},
    Module.INSUMOS: {"label": "Insumos", "icon": "Package", "path": "/almacen/insumos"},
    Module.PRODUCCION: {"label": "Producción", "icon": "Factory", "path": "/produccion"},
    Module.GANTT: {"label": "Diagrama de Gantt", "icon": "GanttChart", "path": "/produccion/gantt"},
    Module.FITOSANITARIO: {"label": "Fitosanitario (NOM-144)", "icon": "Shield", "path": "/fitosanitario"},
    Module.LOGISTICA: {"label": "Logística y Despacho", "icon": "Truck", "path": "/logistica"},
    Module.CERTIFICADOS: {"label": "Certificados HT", "icon": "Award", "path": "/certificados"},
    Module.USUARIOS: {"label": "Gestión de Usuarios", "icon": "UserCog", "path": "/usuarios"},
    Module.REPORTES: {"label": "Reportes", "icon": "FileText", "path": "/reportes"},
    Module.CONFIGURACION: {"label": "Configuración", "icon": "Settings", "path": "/configuracion"},
}


def get_user_modules(role: str) -> List[Module]:
    try:
        user_role = Role(role)
        return ROLE_MODULES.get(user_role, [])
    except ValueError:
        return []


def get_modules_metadata(modules: List[Module]) -> List[dict]:
    return [
        {"module": m.value, **MODULE_METADATA[m]}
        for m in modules
        if m in MODULE_METADATA
    ]


def require_roles(*allowed_roles: Role):
    def dependency(current_user: UsuarioDB = Depends(get_current_user)):
        if current_user.rol not in [r.value for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Rol '{current_user.rol}' no autorizado. Requerido: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return dependency


from app.api.v1.auth import get_current_user


def require_module(module: Module):
    def dependency(current_user: UsuarioDB = Depends(get_current_user)):
        user_modules = get_user_modules(current_user.rol)
        if module not in user_modules:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Módulo '{module.value}' no disponible para rol '{current_user.rol}'"
            )
        return current_user
    return dependency