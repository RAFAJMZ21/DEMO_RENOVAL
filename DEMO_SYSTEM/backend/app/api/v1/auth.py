from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

from app.core.database import get_db
from app.models.entities import UsuarioDB

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    nombre_completo: str
    rol: str

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
    if not usuario or not (usuario.password_hash == credenciales.password or pwd_context.verify(credenciales.password, usuario.password_hash)):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return {
        "access_token": "token_renoval_2026",
        "token_type": "bearer",
        "user_info": {
            "email": usuario.email,
            "nombre": usuario.nombre_completo,
            "rol": usuario.rol,
            "area": "Planta Lerma"
        }
    }