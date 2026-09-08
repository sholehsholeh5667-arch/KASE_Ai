from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

# ==========================================================
# DEBUG DATABASE
# ==========================================================

print("=" * 70)
print("DATABASE URL :", DATABASE_URL)
print("=" * 70)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=True,
)

try:
    with engine.connect() as conn:
        db_name = conn.execute(text("SELECT DATABASE()")).scalar()

        print("=" * 70)
        print("DATABASE AKTIF :", db_name)
        print("=" * 70)

except Exception as e:
    print("=" * 70)
    print("GAGAL KONEK DATABASE")
    print(e)
    print("=" * 70)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()