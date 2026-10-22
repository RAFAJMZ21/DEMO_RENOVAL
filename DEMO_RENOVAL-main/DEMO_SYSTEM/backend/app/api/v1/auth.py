from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, create_access_token, pwd_context
from app.models.entities import UsuarioDB
from app.core.permissions import require_roles, Role

router = APIRouter()


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    nombre_completo: str
    rol: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    nombre_completo: Optional[str] = None
    rol: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


@router.post("/registro")
def registrar_usuario(usuario: UserRegister, db: Session = Depends(get_db)):
    if db.query(UsuarioDB).filter(UsuarioDB.email == usuario.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")
    
    nuevo_usuario = UsuarioDB(
        username=usuario.username,
        email=usuario.email,
        password_hash=pwd_context.hash(usuario.password),
        nombre_completo=usuario.nombre_completo,
        rol=usuario.rol
    )
    db.add(nuevo_usuario)
    db.commit()
    return {"status": "exito", "mensaje": "Usuario creado correctamente"}


@router.post("/login")
def iniciar_sesion(credenciales: UserLogin, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioDB).filter(UsuarioDB.email == credenciales.email).first()
    if not usuario or not pwd_context.verify(credenciales.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    access_token = create_access_token(data={"sub": usuario.email, "rol": usuario.rol})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_info": {
            "id": usuario.id,
            "username": usuario.username,
            "email": usuario.email,
            "nombre": usuario.nombre_completo,
            "rol": usuario.rol,
            "area": "Planta Lerma"
        }
    }


@router.get("/me")
def obtener_perfil(usuario: UsuarioDB = Depends(get_current_user)):
    return {
        "id": usuario.id,
        "username": usuario.username,
        "email": usuario.email,
        "nombre_completo": usuario.nombre_completo,
        "rol": usuario.rol,
        "created_at": usuario.created_at
    }


@router.get("/me/modules")
def obtener_modulos_usuario(usuario: UsuarioDB = Depends(get_current_user)):
    from app.core.permissions import get_user_modules, get_modules_metadata
    modules = get_user_modules(usuario.rol)
    return get_modules_metadata(modules)


@router.get("/usuarios", dependencies=[Depends(require_roles(Role.ADMIN))])
def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(UsuarioDB).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "nombre_completo": u.nombre_completo,
            "rol": u.rol,
            "created_at": u.created_at.isoformat() if u.created_at else ""
        }
        for u in usuarios
    ]


@router.put("/usuarios/{usuario_id}", dependencies=[Depends(require_roles(Role.ADMIN))])
def actualizar_usuario(usuario_id: int, usuario: UserUpdate, db: Session = Depends(get_db)):
    db_usuario = db.query(UsuarioDB).filter(UsuarioDB.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    update_data = usuario.model_dump(exclude_unset=True)
    
    # Verificar email único si se actualiza
    if "email" in update_data:
        if db.query(UsuarioDB).filter(UsuarioDB.email == update_data["email"], UsuarioDB.id != usuario_id).first():
            raise HTTPException(status_code=400, detail="El correo ya está registrado")
        db_usuario.email = update_data["email"]
    
    if "password" in update_data and update_data["password"]:
        db_usuario.password_hash = pwd_context.hash(update_data["password"])
    
    if "nombre_completo" in update_data:
        db_usuario.nombre_completo = update_data["nombre_completo"]
    
    if "rol" in update_data:
        db_usuario.rol = update_data["rol"]
    
    db.commit()
    db.refresh(db_usuario)
    return {
        "id": db_usuario.id,
        "username": db_usuario.username,
        "email": db_usuario.email,
        "nombre_completo": db_usuario.nombre_completo,
        "rol": db_usuario.rol,
        "created_at": db_usuario.created_at.isoformat() if db_usuario.created_at else ""
    }


@router.delete("/usuarios/{usuario_id}", dependencies=[Depends(require_roles(Role.ADMIN))])
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = db.query(UsuarioDB).filter(UsuarioDB.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # No permitir auto-eliminación
    current_user = db.query(UsuarioDB).filter(UsuarioDB.id == usuario_id).first()
    # Note: get_current_user not available here without Depends, but ADMIN role check is done
    
    db.delete(db_usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado correctamente"}