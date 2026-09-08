from datetime import datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.barang import Barang
from app.models.mutasi_stok import MutasiStok
from app.models.stock_opname import StockOpname
from app.models.stock_opname_detail import StockOpnameDetail


class StokRepository:

    # =====================================================
    # BARANG
    # =====================================================

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

    def update_stok(
        self,
        db: Session,
        barang: Barang,
        stok_baru
    ):
        barang.stok = stok_baru
        db.flush()

    def get_barang_minimum(
        self,
        db: Session
    ):
        return (
            db.query(Barang)
            .filter(
                Barang.stok <= Barang.stok_minimum
            )
            .order_by(Barang.stok.asc())
            .all()
        )

    # =====================================================
    # MUTASI STOK
    # =====================================================

    def create_mutasi(
        self,
        db: Session,
        mutasi: MutasiStok
    ):
        db.add(mutasi)
        db.flush()
        db.refresh(mutasi)
        return mutasi

    def get_mutasi(
        self,
        db: Session,
        barang_id: int | None = None,
        jenis=None,
        tanggal_awal=None,
        tanggal_akhir=None
    ):

        query = db.query(MutasiStok)

        if barang_id:
            query = query.filter(
                MutasiStok.barang_id == barang_id
            )

        if jenis:
            query = query.filter(
                MutasiStok.jenis == jenis
            )

        if tanggal_awal:
            query = query.filter(
                MutasiStok.tanggal >= tanggal_awal
            )

        if tanggal_akhir:
            query = query.filter(
                MutasiStok.tanggal <= tanggal_akhir
            )

        return (
            query
            .order_by(
                MutasiStok.tanggal.desc(),
                MutasiStok.id.desc()
            )
            .all()
        )

    # =====================================================
    # STOCK OPNAME
    # =====================================================

    def generate_nomor_opname(
        self,
        db: Session
    ):

        tanggal = datetime.now().strftime("%Y%m%d")

        prefix = f"SO-{tanggal}-"

        terakhir = (
            db.query(StockOpname)
            .filter(
                StockOpname.nomor.like(f"{prefix}%")
            )
            .order_by(
                StockOpname.id.desc()
            )
            .first()
        )

        if terakhir is None:
            nomor = 1
        else:
            nomor = int(
                terakhir.nomor.split("-")[-1]
            ) + 1

        return f"{prefix}{nomor:06d}"

    def create_stock_opname(
        self,
        db: Session,
        opname: StockOpname
    ):
        db.add(opname)
        db.flush()
        db.refresh(opname)
        return opname

    def create_stock_opname_detail(
        self,
        db: Session,
        detail: StockOpnameDetail
    ):
        db.add(detail)
        db.flush()
        db.refresh(detail)
        return detail

    def get_stock_opname(
        self,
        db: Session,
        opname_id: int
    ):
        return (
            db.query(StockOpname)
            .filter(
                StockOpname.id == opname_id
            )
            .first()
        )

    def get_all_stock_opname(
        self,
        db: Session
    ):
        return (
            db.query(StockOpname)
            .order_by(
                StockOpname.id.desc()
            )
            .all()
        )

    # =====================================================
    # KARTU STOK
    # =====================================================

    def get_kartu_stok(
        self,
        db: Session,
        barang_id: int
    ):
        return (
            db.query(MutasiStok)
            .filter(
                MutasiStok.barang_id == barang_id
            )
            .order_by(
                MutasiStok.tanggal.asc(),
                MutasiStok.id.asc()
            )
            .all()
        )

    # =====================================================
    # TRANSACTION
    # =====================================================

    def commit(
        self,
        db: Session
    ):
        db.commit()

    def rollback(
        self,
        db: Session
    ):
        db.rollback()


stok_repository = StokRepository()