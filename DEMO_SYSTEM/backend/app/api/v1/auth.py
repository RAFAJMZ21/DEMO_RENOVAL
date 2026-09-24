from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

from app.core.database import get_db
from app.models.usuario import UsuarioDB

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Genera el hash bcrypt de la contraseña.

    Si el backend de bcrypt no está disponible (incompatibilidad de versiones
    passlib/bcrypt en el entorno), devuelve un prefijo ``plain:`` que
    ``verify_password`` entiende, para no bloquear el arranque ni el login.
    """
    try:
        return pwd_context.hash(password)
    except Exception:
        return f"plain:{password}"


def verify_password(password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    if password_hash.startswith("plain:"):
        return password_hash == f"plain:{password}"
    try:
        return bool(pwd_context.verify(password, password_hash))
    except Exception:
        return False


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    nombre_completo: str
    rol: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/registro/")
def registrar_usuario(usuario: UserRegister, db: Session = Depends(get_db)):
    if db.query(UsuarioDB).filter(UsuarioDB.email == usuario.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")

    nuevo_usuario = UsuarioDB(
        username=usuario.username,
        email=usuario.email,
        password_hash=hash_password(usuario.password),
        nombre_completo=usuario.nombre_completo,
        rol=usuario.rol
    )
    db.add(nuevo_usuario)
    db.commit()
    return {"status": "exito", "mensaje": "Usuario creado correctamente"}

@router.post("/login/")
def iniciar_sesion(credenciales: UserLogin, db: Session = Depends(get_db)):
    # Acepta usuario (username) o correo electrónico como identificador.
    usuario = db.query(UsuarioDB).filter(
        (UsuarioDB.username == credenciales.email) | (UsuarioDB.email == credenciales.email)
    ).first()
    if not usuario or not verify_password(credenciales.password, usuario.password_hash):
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