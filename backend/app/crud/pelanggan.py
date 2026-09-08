from sqlalchemy.orm import Session
from app.models.pelanggan import Pelanggan


def create_pelanggan(db: Session, data):
    pelanggan = Pelanggan(**data.model_dump())

    db.add(pelanggan)
    db.commit()
    db.refresh(pelanggan)

    return pelanggan


def get_all_pelanggan(db: Session):
    return db.query(Pelanggan).all()