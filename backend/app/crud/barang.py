from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.barang import Barang
from app.schemas.barang import BarangCreate, BarangUpdate


crud = CRUDBase(Barang)


def get_all(db: Session):
    return crud.get_all(db)


def get_by_id(db: Session, barang_id: int):
    return crud.get(db, barang_id)


def create(db: Session, data: BarangCreate):

    barang = Barang(**data.model_dump())

    return crud.create(db, barang)


def update(db: Session, barang: Barang, data: BarangUpdate):

    for key, value in data.model_dump().items():
        setattr(barang, key, value)

    db.commit()

    db.refresh(barang)

    return barang


def delete(db: Session, barang: Barang):

    crud.delete(db, barang)