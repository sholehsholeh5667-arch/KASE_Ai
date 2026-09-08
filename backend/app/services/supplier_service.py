from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.supplier import SupplierRepository
from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
)


class SupplierService:

    def __init__(self):
        self.repo = SupplierRepository()

    # =====================================
    # Ambil semua supplier
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
    # Ambil berdasarkan ID
    # =====================================
    def get_by_id(
        self,
        db: Session,
        supplier_id: int,
    ):
        supplier = self.repo.get_by_id(
            db,
            supplier_id,
        )

        if supplier is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier tidak ditemukan",
            )

        return supplier

    # =====================================
    # Tambah supplier
    # =====================================
    def create(
        self,
        db: Session,
        data: SupplierCreate,
    ):
        existing = self.repo.get_by_nama(
            db,
            data.nama,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nama supplier sudah digunakan",
            )

        return self.repo.create(
            db,
            data,
        )

    # =====================================
    # Update supplier
    # =====================================
    def update(
        self,
        db: Session,
        supplier_id: int,
        data: SupplierUpdate,
    ):
        supplier = self.get_by_id(
            db,
            supplier_id,
        )

        if data.nama:
            existing = self.repo.get_by_nama(
                db,
                data.nama,
            )

            if existing and existing.id != supplier.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nama supplier sudah digunakan",
                )

        return self.repo.update(
            db,
            supplier,
            data,
        )

    # =====================================
    # Hapus supplier
    # =====================================
    def delete(
        self,
        db: Session,
        supplier_id: int,
    ):
        supplier = self.get_by_id(
            db,
            supplier_id,
        )

        self.repo.delete(
            db,
            supplier,
        )

        return {
            "message": "Supplier berhasil dihapus"
        }