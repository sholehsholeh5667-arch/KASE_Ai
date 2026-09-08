from sqlalchemy.orm import Session

from app.models.pelanggan import Pelanggan
from app.schemas.pelanggan import (
    PelangganCreate,
    PelangganUpdate,
)


class PelangganService:

    # =====================================
    # GET ALL
    # =====================================

    def get_all(self, db: Session):

        return db.query(Pelanggan).all()

    # =====================================
    # GET BY ID
    # =====================================

    def get(self, db: Session, pelanggan_id: int):

        return (
            db.query(Pelanggan)
            .filter(Pelanggan.id == pelanggan_id)
            .first()
        )

    # =====================================
    # CREATE
    # =====================================

    def create(
        self,
        db: Session,
        data: PelangganCreate,
    ):

        obj = Pelanggan(**data.model_dump())

        db.add(obj)
        db.commit()
        db.refresh(obj)

        return obj

    # =====================================
    # UPDATE
    # =====================================

    def update(
        self,
        db: Session,
        pelanggan_id: int,
        data: PelangganUpdate,
    ):

        obj = (
            db.query(Pelanggan)
            .filter(Pelanggan.id == pelanggan_id)
            .first()
        )

        if obj is None:
            return None

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(obj, key, value)

        db.commit()
        db.refresh(obj)

        return obj

    # =====================================
    # DELETE
    # =====================================

    def delete(
        self,
        db: Session,
        pelanggan_id: int,
    ):

        obj = (
            db.query(Pelanggan)
            .filter(Pelanggan.id == pelanggan_id)
            .first()
        )

        if obj is None:
            return False

        db.delete(obj)
        db.commit()

        return True


pelanggan_service = PelangganService()