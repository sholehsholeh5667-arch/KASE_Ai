from math import ceil

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.kategori import Kategori


class KategoriRepository:

    # =====================================
    # Ambil semua kategori
    # Search + Pagination
    # =====================================
    def get_all(
        self,
        db: Session,
        search: str | None = None,
        page: int = 1,
        size: int = 10,
    ):
        query = db.query(Kategori)

        if search and search.strip():
            keyword = f"%{search.strip()}%"

            query = query.filter(
                or_(
                    Kategori.nama.ilike(keyword),
                    Kategori.deskripsi.ilike(keyword),
                )
            )

        total = query.count()

        offset = (page - 1) * size

        items = (
            query
            .order_by(Kategori.nama.asc())
            .offset(offset)
            .limit(size)
            .all()
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "size": size,
            "pages": ceil(total / size) if total else 1,
        }

    # =====================================
    # Ambil kategori berdasarkan ID
    # =====================================
    def get_by_id(
        self,
        db: Session,
        kategori_id: int,
    ):
        return (
            db.query(Kategori)
            .filter(
                Kategori.id == kategori_id
            )
            .first()
        )

    # =====================================
    # Ambil kategori berdasarkan nama
    # =====================================
    def get_by_nama(
        self,
        db: Session,
        nama: str,
    ):
        return (
            db.query(Kategori)
            .filter(
                Kategori.nama == nama
            )
            .first()
        )

    # =====================================
    # Tambah kategori
    # =====================================
    def create(
        self,
        db: Session,
        data,
    ):
        kategori = Kategori(
            **data.model_dump()
        )

        db.add(kategori)
        db.commit()
        db.refresh(kategori)

        return kategori

    # =====================================
    # Update kategori
    # =====================================
    def update(
        self,
        db: Session,
        kategori: Kategori,
        data,
    ):
        values = data.model_dump(
            exclude_unset=True
        )

        for key, value in values.items():
            setattr(kategori, key, value)

        db.commit()
        db.refresh(kategori)

        return kategori

    # =====================================
    # Hapus kategori
    # =====================================
    def delete(
        self,
        db: Session,
        kategori: Kategori,
    ):
        db.delete(kategori)
        db.commit()