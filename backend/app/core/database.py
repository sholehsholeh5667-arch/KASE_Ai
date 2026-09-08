from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


DATABASE_URL = settings.DATABASE_URL

# ==========================================================
# AIVEN SSL
# ==========================================================

BASE_DIR = Path(__file__).resolve().parents[2]
CA_FILE = BASE_DIR / "certs" / "aiven-ca.pem"


# ==========================================================
# DEBUG DATABASE
# ==========================================================

print("=" * 70)
print("DATABASE URL :", DATABASE_URL)
print("CA FILE      :", CA_FILE)
print("CA EXISTS    :", CA_FILE.exists())
print("=" * 70)


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
    echo=True,
)


# ==========================================================
# TEST DATABASE
# ==========================================================

try:
    with engine.connect() as conn:

        db_name = conn.execute(
            text("SELECT DATABASE()")
        ).scalar()

        print("=" * 70)
        print("DATABASE AKTIF :", db_name)
        print("KONEKSI AIVEN  : BERHASIL")
        print("=" * 70)

except Exception as e:

    print("=" * 70)
    print("GAGAL KONEK DATABASE")
    print(e)
    print("=" * 70)


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