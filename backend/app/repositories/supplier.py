from math import ceil

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.supplier import Supplier


class SupplierRepository:

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
        query = db.query(Supplier)

        if search and search.strip():
            keyword = f"%{search.strip()}%"

            query = query.filter(
                or_(
                    Supplier.nama.ilike(keyword),
                    Supplier.alamat.ilike(keyword),
                    Supplier.telepon.ilike(keyword),
                    Supplier.email.ilike(keyword),
                    Supplier.kontak.ilike(keyword),
                    Supplier.kode_supplier.ilike(keyword),
                )
            )

        total = query.count()

        offset = (page - 1) * size

        items = (
            query
            .order_by(Supplier.nama.asc())
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
    # Ambil supplier berdasarkan ID
    # =====================================
    def get_by_id(
        self,
        db: Session,
        supplier_id: int,
    ):
        return (
            db.query(Supplier)
            .filter(
                Supplier.id == supplier_id
            )
            .first()
        )

    # =====================================
    # Ambil supplier berdasarkan nama
    # =====================================
    def get_by_nama(
        self,
        db: Session,
        nama: str,
    ):
        return (
            db.query(Supplier)
            .filter(
                Supplier.nama == nama
            )
            .first()
        )

    # =====================================
    # Tambah supplier
    # Kode otomatis SUP001, SUP002, dst.
    # =====================================
    def create(
        self,
        db: Session,
        data,
    ):
        last_supplier = (
            db.query(Supplier)
            .filter(
                Supplier.kode_supplier.like("SUP%")
            )
            .order_by(
                Supplier.id.desc()
            )
            .first()
        )

        nomor = 1

        if last_supplier and last_supplier.kode_supplier:
            try:
                nomor = int(
                    last_supplier.kode_supplier[3:]
                ) + 1
            except ValueError:
                nomor = 1

        kode_supplier = f"SUP{nomor:03d}"

        supplier = Supplier(
            **data.model_dump(),
            kode_supplier=kode_supplier,
        )

        db.add(supplier)
        db.commit()
        db.refresh(supplier)

        return supplier

    # =====================================
    # Update supplier
    # =====================================
    def update(
        self,
        db: Session,
        supplier: Supplier,
        data,
    ):
        values = data.model_dump(
            exclude_unset=True
        )

        for key, value in values.items():
            setattr(supplier, key, value)

        db.commit()
        db.refresh(supplier)

        return supplier

    # =====================================
    # Hapus supplier
    # =====================================
    def delete(
        self,
        db: Session,
        supplier: Supplier,
    ):
        db.delete(supplier)
        db.commit()