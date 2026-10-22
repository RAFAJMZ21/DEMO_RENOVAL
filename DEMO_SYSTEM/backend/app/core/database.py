import os

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuración de conexión a MySQL.
# Se puede sobreescribir con la variable de entorno DATABASE_URL para no
# hardcodear credenciales dentro del código.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:1234@localhost:3306/renoval_system_db",
)

# create_engine() es perezoso: no abre la conexión hasta que se ejecuta una
# consulta, por lo que su construcción nunca rompe el arranque del servidor.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"connect_timeout": 5},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def verificar_conexion() -> bool:
    """Comprueba si MySQL responde. Devuelve True/False sin lanzar excepciones."""
    try:
        with engine.connect() as conexion:
            conexion.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError:
        return False
    except Exception:
        return False


# Generador para la inyección de dependencias en FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
