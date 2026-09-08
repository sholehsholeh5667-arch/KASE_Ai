from datetime import datetime

from sqlalchemy.orm import Session

from app.models.pembelian import Pembelian
from app.models.detail_pembelian import DetailPembelian
from app.models.barang import Barang
from app.models.supplier import Supplier


class PembelianRepository:

    # ======================================
    # Generate Nomor Faktur
    # ======================================
    def generate_nomor_faktur(
        self,
        db: Session
    ):

        tanggal = datetime.now().strftime("%Y%m%d")

        prefix = f"PB-{tanggal}-"

        terakhir = (
            db.query(Pembelian)
            .filter(
                Pembelian.no_faktur.like(f"{prefix}%")
            )
            .order_by(Pembelian.id.desc())
            .first()
        )

        if terakhir is None:
            nomor = 1
        else:
            nomor = int(
                terakhir.no_faktur.split("-")[-1]
            ) + 1

        return f"{prefix}{nomor:06d}"

    # ======================================
    # Simpan Header Pembelian
    # ======================================
    def create_pembelian(
        self,
        db: Session,
        pembelian: Pembelian
    ):
        db.add(pembelian)
        db.flush()
        return pembelian

    # ======================================
    # Simpan Detail Pembelian
    # ======================================
    def create_detail(
        self,
        db: Session,
        detail: DetailPembelian
    ):
        db.add(detail)
        db.flush()
        return detail

    # ======================================
    # Cari Barang
    # ======================================
    def get_barang(
        self,
        db: Session,
        barang_id: int
    ):
        return (
            db.query(Barang)
            .filter(Barang.id == barang_id)
            .first()
        )

    # ======================================
    # Cari Supplier
    # ======================================
    def get_supplier(
        self,
        db: Session,
        supplier_id: int
    ):
        return (
            db.query(Supplier)
            .filter(Supplier.id == supplier_id)
            .first()
        )

    # ======================================
    # Tambah Stok
    # ======================================
    def tambah_stok(
        self,
        db: Session,
        barang: Barang,
        qty: int
    ):
        barang.stok += qty
        db.flush()

    # ======================================
    # Update Harga Beli Terakhir
    # ======================================
    def update_harga_beli(
        self,
        db: Session,
        barang: Barang,
        harga_beli
    ):
        barang.harga_beli = harga_beli
        db.flush()

    # ======================================
    # Cari Pembelian
    # ======================================
    def get_by_id(
        self,
        db: Session,
        pembelian_id: int
    ):
        return (
            db.query(Pembelian)
            .filter(
                Pembelian.id == pembelian_id
            )
            .first()
        )

    # ======================================
    # Semua Pembelian
    # ======================================
    def get_all(
        self,
        db: Session
    ):
        return (
            db.query(Pembelian)
            .order_by(
                Pembelian.id.desc()
            )
            .all()
        )

    # ======================================
    # Hapus Pembelian
    # ======================================
    def delete(
        self,
        db: Session,
        pembelian: Pembelian
    ):
        db.delete(pembelian)
        db.flush()

    # ======================================
    # Commit
    # ======================================
    def commit(
        self,
        db: Session
    ):
        db.commit()

    # ======================================
    # Rollback
    # ======================================
    def rollback(
        self,
        db: Session
    ):
        db.rollback()


pembelian_repository = PembelianRepository()