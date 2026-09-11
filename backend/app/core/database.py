from sqlalchemy.engine import URL
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=settings.DB_USER,
    password=settings.DB_PASSWORD,
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    database=settings.DB_NAME,
)



# ==========================================================
# AIVEN SSL
# ==========================================================

BASE_DIR = Path(__file__).resolve().parents[2]
CA_FILE = BASE_DIR / "certs" / "aiven-ca.pem"


# ==========================================================
# DATABASE ENGINE
# ==========================================================

connect_args = {
    "ssl": {
        "ca": str(CA_FILE),
    }
}


engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False,
)


# ==========================================================
# TEST DATABASE
# ==========================================================

try:
    with engine.connect() as conn:

        db_name = conn.execute(
            text("SELECT DATABASE()")
        ).scalar()

        print("DATABASE AKTIF :", db_name)
        print("KONEKSI AIVEN  : BERHASIL")

except Exception as e:

    print("GAGAL KONEK DATABASE")
    print(e)


# ==========================================================
# SESSION
# ==========================================================

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)


# ==========================================================
# BASE MODEL
# ==========================================================

class Base(DeclarativeBase):
    pass


# ==========================================================
# DATABASE DEPENDENCY
# ==========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()