from datetime import datetime

from sqlalchemy.orm import Session, selectinload

from app.models.barang import Barang
from app.models.detail_penjualan import DetailPenjualan
from app.models.penjualan import Penjualan


class PenjualanRepository:

    # =====================================================
    # GENERATE NOMOR FAKTUR
    # =====================================================

    def generate_nomor_faktur(
        self,
        db: Session,
    ) -> str:

        tanggal = datetime.now().strftime("%Y%m%d")

        prefix = f"PJ-{tanggal}-"

        terakhir = (
            db.query(Penjualan)
            .filter(
                Penjualan.no_faktur.like(f"{prefix}%")
            )
            .order_by(Penjualan.id.desc())
            .first()
        )

        if terakhir is None:
            nomor = 1
        else:
            nomor = (
                int(
                    terakhir.no_faktur.split("-")[-1]
                )
                + 1
            )

        return f"{prefix}{nomor:06d}"

    # =====================================================
    # BARANG
    # =====================================================

    def get_barang(
        self,
        db: Session,
        barang_id: int,
    ):

        return (
            db.query(Barang)
            .filter(
                Barang.id == barang_id
            )
            .first()
        )

    # =====================================================
    # PENJUALAN
    # =====================================================

    def get_all(
        self,
        db: Session,
    ):

        return (
            db.query(Penjualan)
            .options(
                selectinload(
                    Penjualan.detail
                ),
                selectinload(
                    Penjualan.pelanggan
                ),
            )
            .order_by(
                Penjualan.id.desc()
            )
            .all()
        )

    def get_by_id(
        self,
        db: Session,
        penjualan_id: int,
    ):

        return (
            db.query(Penjualan)
            .options(
                selectinload(
                    Penjualan.detail
                ),
                selectinload(
                    Penjualan.pelanggan
                ),
            )
            .filter(
                Penjualan.id == penjualan_id
            )
            .first()
        )

    # =====================================================
    # CREATE
    # =====================================================

    def create_penjualan(
        self,
        db: Session,
        penjualan: Penjualan,
    ):

        db.add(penjualan)

        db.flush()

        db.refresh(penjualan)

        return penjualan

    # =====================================================
    # DETAIL
    # =====================================================

    def create_detail(
        self,
        db: Session,
        detail: DetailPenjualan,
    ):

        db.add(detail)

        db.flush()

        db.refresh(detail)

        return detail

    # =====================================================
    # UPDATE
    # =====================================================

    def update(
        self,
        db: Session,
        penjualan: Penjualan,
    ):

        db.flush()

        db.refresh(penjualan)

        return penjualan

    # =====================================================
    # DELETE
    # =====================================================

    def delete(
        self,
        db: Session,
        penjualan: Penjualan,
    ):

        db.delete(penjualan)

        db.flush()

    # =====================================================
    # TRANSAKSI DATABASE
    # =====================================================

    def commit(
        self,
        db: Session,
    ):

        db.commit()

    def rollback(
        self,
        db: Session,
    ):

        db.rollback()


penjualan_repository = PenjualanRepository()