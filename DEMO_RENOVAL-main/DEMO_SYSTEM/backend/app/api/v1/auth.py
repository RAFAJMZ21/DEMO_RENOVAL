from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError

from app.core.database import get_db
from app.models.entities import UsuarioDB

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

SECRET_KEY = "renoval_secret_key_2026_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    nombre_completo: str
    rol: str

class UserLogin(BaseModel):
    email: str
    password: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UsuarioDB:
    if not credentials:
        raise HTTPException(status_code=401, detail="Token de autorización requerido")
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    usuario = db.query(UsuarioDB).filter(UsuarioDB.email == email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    
    return usuario

def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[UsuarioDB]:
    if not credentials:
        return None
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None

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