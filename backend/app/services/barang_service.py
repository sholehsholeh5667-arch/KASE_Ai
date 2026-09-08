from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.kategori import KategoriRepository
from app.schemas.kategori import KategoriCreate, KategoriUpdate


class KategoriService:

    def __init__(self):
        self.repo = KategoriRepository()

    def get_all(self, db: Session):
        return self.repo.get_all(db)

    def get_by_id(self, db: Session, kategori_id: int):
        kategori = self.repo.get_by_id(db, kategori_id)

        if kategori is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kategori tidak ditemukan"
            )

        return kategori

    def create(self, db: Session, data: KategoriCreate):
        # Cek nama kategori sudah ada
        existing = self.repo.get_by_nama(db, data.nama)

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nama kategori sudah digunakan"
            )

        return self.repo.create(db, data)

    def update(
        self,
        db: Session,
        kategori_id: int,
        data: KategoriUpdate
    ):
        kategori = self.get_by_id(db, kategori_id)

        if data.nama:
            existing = self.repo.get_by_nama(db, data.nama)

            if existing and existing.id != kategori.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nama kategori sudah digunakan"
                )

        return self.repo.update(db, kategori, data)

    def delete(self, db: Session, kategori_id: int):
        kategori = self.get_by_id(db, kategori_id)

        self.repo.delete(db, kategori)

        return {
            "message": "Kategori berhasil dihapus"
        }