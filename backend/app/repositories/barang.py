from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.barang import Barang


class BarangRepository:

    # ==========================
    # Ambil semua barang
    # Search + Pagination
    # ==========================

    def get_all(
        self,
        db: Session,
        search: str | None = None,
        page: int = 1,
        size: int = 10
    ):
        query = db.query(Barang)

        # ==========================
        # Search
        # ==========================

        if search and search.strip():
            keyword = f"%{search.strip()}%"

            query = query.filter(
                or_(
                    Barang.kode_barang.ilike(keyword),
                    Barang.nama_barang.ilike(keyword),
                    Barang.alias_barang.ilike(keyword)
                )
            )

        # ==========================
        # Total data
        # ==========================

        total = query.count()

        # ==========================
        # Pagination
        # ==========================

        offset = (page - 1) * size

        items = (
            query
            .order_by(
                Barang.nama_barang.asc()
            )
            .offset(offset)
            .limit(size)
            .all()
        )

        # ==========================
        # Response pagination
        # ==========================

        return {
            "items": items,
            "total": total,
        }

    # ==========================
    # Ambil barang berdasarkan ID
    # ==========================

    def get_by_id(
        self,
        db: Session,
        barang_id: int
    ):
        return (
            db.query(Barang)
            .filter(
                Barang.id == barang_id
            )
            .first()
        )

    # ==========================
    # Ambil barang berdasarkan kode
    # ==========================

    def get_by_kode(
        self,
        db: Session,
        kode_barang: str
    ):
        return (
            db.query(Barang)
            .filter(
                Barang.kode_barang == kode_barang
            )
            .first()
        )

    # ==========================
    # Ambil barang berdasarkan nama
    # ==========================

    def get_by_nama(
        self,
        db: Session,
        nama_barang: str
    ):
        return (
            db.query(Barang)
            .filter(
                Barang.nama_barang == nama_barang
            )
            .first()
        )

    # ==========================
    # Pencarian barang
    # ==========================

    def search(
        self,
        db: Session,
        keyword: str
    ):
        keyword = f"%{keyword.strip()}%"

        return (
            db.query(Barang)
            .filter(
                or_(
                    Barang.kode_barang.ilike(keyword),
                    Barang.nama_barang.ilike(keyword),
                    Barang.alias_barang.ilike(keyword)
                )
            )
            .order_by(
                Barang.nama_barang.asc()
            )
            .all()
        )

    # ==========================
    # Tambah barang
    # ==========================

    def create(
        self,
        db: Session,
        data
    ):
        barang = Barang(
            **data.model_dump()
        )

        db.add(barang)
        db.commit()
        db.refresh(barang)

        return barang

    # ==========================
    # Update barang
    # ==========================

    def update(
        self,
        db: Session,
        barang: Barang,
        data
    ):
        values = data.model_dump(
            exclude_unset=True
        )

        for key, value in values.items():
            setattr(
                barang,
                key,
                value
            )

        db.commit()
        db.refresh(barang)

        return barang

    # ==========================
    # Hapus barang
    # ==========================

    def delete(
        self,
        db: Session,
        barang: Barang
    ):
        db.delete(barang)
        db.commit()