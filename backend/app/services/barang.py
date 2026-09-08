from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.barang import BarangRepository
from app.schemas.barang import BarangCreate, BarangUpdate


class BarangService:

    def __init__(self):
        self.repo = BarangRepository()

    # =====================================
    # Ambil semua barang
    # Search + Pagination
    # =====================================
    def get_all(
        self,
        db: Session,
        search: str | None = None,
        page: int = 1,
        size: int = 10,
    ):
        return self.repo.get_all(
            db=db,
            search=search,
            page=page,
            size=size,
        )

    # =====================================
    # Ambil barang berdasarkan ID
    # =====================================
    def get_by_id(
        self,
        db: Session,
        barang_id: int,
    ):
        barang = self.repo.get_by_id(
            db,
            barang_id,
        )

        if barang is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Barang tidak ditemukan",
            )

        return barang

    # =====================================
    # Tambah barang
    # =====================================
    def create(
        self,
        db: Session,
        data: BarangCreate,
    ):
        existing = self.repo.get_by_kode(
            db,
            data.kode_barang,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kode barang sudah digunakan",
            )

        return self.repo.create(
            db,
            data,
        )

    # =====================================
    # Update barang
    # =====================================
    def update(
        self,
        db: Session,
        barang_id: int,
        data: BarangUpdate,
    ):
        barang = self.get_by_id(
            db,
            barang_id,
        )

        if data.kode_barang is not None:

            existing = self.repo.get_by_kode(
                db,
                data.kode_barang,
            )

            if existing and existing.id != barang.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Kode barang sudah digunakan",
                )

        return self.repo.update(
            db,
            barang,
            data,
        )

    # =====================================
    # Hapus barang
    # =====================================
    def delete(
        self,
        db: Session,
        barang_id: int,
    ):
        barang = self.get_by_id(
            db,
            barang_id,
        )

        self.repo.delete(
            db,
            barang,
        )

        return {
            "message": "Barang berhasil dihapus"
        }


barang_service = BarangService()