from sqlalchemy.orm import Session

from app.models.kategori import Kategori
from app.schemas.kategori import (
    KategoriCreate,
    KategoriUpdate,
)


def get_all(db: Session):
    return db.query(Kategori).order_by(Kategori.nama).all()


def get_by_id(db: Session, kategori_id: int):
    return db.query(Kategori).filter(
        Kategori.id == kategori_id
    ).first()


def create(db: Session, data: KategoriCreate):
    kategori = Kategori(**data.model_dump())

    db.add(kategori)
    db.commit()
    db.refresh(kategori)

    return kategori


def update(
    db: Session,
    kategori: Kategori,
    data: KategoriUpdate
):
    for key, value in data.model_dump().items():
        setattr(kategori, key, value)

    db.commit()
    db.refresh(kategori)

    return kategori


def delete(db: Session, kategori: Kategori):
    db.delete(kategori)
    db.commit()