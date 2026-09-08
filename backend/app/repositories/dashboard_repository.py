from datetime import date, timedelta

from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.models.barang import Barang
from app.models.supplier import Supplier
from app.models.pelanggan import Pelanggan
from app.models.penjualan import Penjualan
from app.models.pembelian import Pembelian
from app.models.detail_penjualan import DetailPenjualan


class DashboardRepository:

    # =====================================================
    # PENJUALAN HARI INI
    # =====================================================

    def penjualan_hari_ini(self, db: Session):

        total = (
            db.query(func.sum(Penjualan.grand_total))
            .filter(
                func.date(Penjualan.tanggal) == date.today()
            )
            .scalar()
        )

        return float(total or 0)

    # =====================================================
    # PEMBELIAN HARI INI
    # =====================================================

    def pembelian_hari_ini(self, db: Session):

        total = (
            db.query(func.sum(Pembelian.grand_total))
            .filter(
                func.date(Pembelian.tanggal) == date.today()
            )
            .scalar()
        )

        return float(total or 0)

    # =====================================================
    # LABA KOTOR
    #
    # Laba Kotor =
    # Total Penjualan Hari Ini
    # - HPP Barang yang Terjual Hari Ini
    #
    # BUKAN:
    # Total Penjualan - Total Pembelian Hari Ini
    #
    # Pembelian hari ini adalah penambahan persediaan,
    # bukan otomatis menjadi HPP.
    # =====================================================

    def laba_kotor(self, db: Session):

        # -------------------------------------------------
        # Ambil total omzet penjualan hari ini
        # -------------------------------------------------

        omzet = (
            db.query(
                func.sum(
                    DetailPenjualan.qty
                    * DetailPenjualan.harga_jual
                )
            )
            .join(
                Penjualan,
                Penjualan.id == DetailPenjualan.penjualan_id
            )
            .filter(
                func.date(Penjualan.tanggal) == date.today()
            )
            .scalar()
        )

        omzet = float(omzet or 0)

        # -------------------------------------------------
        # Ambil HPP barang yang benar-benar terjual
        # -------------------------------------------------
        #
        # harga_beli diambil dari Barang pada saat
        # dashboard dihitung.
        #
        # HPP = qty terjual x harga beli
        # -------------------------------------------------

        hpp = (
            db.query(
                func.sum(
                    DetailPenjualan.qty
                    * Barang.harga_beli
                )
            )
            .join(
                Barang,
                Barang.id == DetailPenjualan.barang_id
            )
            .join(
                Penjualan,
                Penjualan.id == DetailPenjualan.penjualan_id
            )
            .filter(
                func.date(Penjualan.tanggal) == date.today()
            )
            .scalar()
        )

        hpp = float(hpp or 0)

        # -------------------------------------------------
        # LABA KOTOR
        # -------------------------------------------------

        return omzet - hpp

    # =====================================================
    # JUMLAH TRANSAKSI
    # =====================================================

    def jumlah_transaksi(self, db: Session):

        jual = (
            db.query(func.count(Penjualan.id))
            .filter(
                func.date(Penjualan.tanggal) == date.today()
            )
            .scalar()
            or 0
        )

        beli = (
            db.query(func.count(Pembelian.id))
            .filter(
                func.date(Pembelian.tanggal) == date.today()
            )
            .scalar()
            or 0
        )

        return jual + beli

    # =====================================================
    # JUMLAH BARANG
    # =====================================================

    def jumlah_barang(self, db: Session):

        return (
            db.query(func.count(Barang.id))
            .scalar()
            or 0
        )

    # =====================================================
    # JUMLAH SUPPLIER
    # =====================================================

    def jumlah_supplier(self, db: Session):

        return (
            db.query(func.count(Supplier.id))
            .scalar()
            or 0
        )

    # =====================================================
    # JUMLAH PELANGGAN
    # =====================================================

    def jumlah_pelanggan(self, db: Session):

        return (
            db.query(func.count(Pelanggan.id))
            .scalar()
            or 0
        )

    # =====================================================
    # STOK HAMPIR HABIS
    # =====================================================

    def stok_hampir_habis(self, db: Session):

        return (
            db.query(func.count(Barang.id))
            .filter(
                Barang.stok <= Barang.stok_minimum
            )
            .scalar()
            or 0
        )

    # =====================================================
    # BARANG HAMPIR HABIS
    # =====================================================

    def barang_hampir_habis(self, db: Session):

        rows = (
            db.query(
                Barang.nama_barang,
                Barang.stok,
            )
            .filter(
                Barang.stok <= Barang.stok_minimum
            )
            .order_by(
                Barang.stok.asc()
            )
            .limit(10)
            .all()
        )

        return [
            {
                "nama": r.nama_barang,
                "stok": float(r.stok),
            }
            for r in rows
        ]

    # =====================================================
    # BARANG TERLARIS
    # =====================================================

    def barang_terlaris(self, db: Session):

        rows = (
            db.query(
                Barang.nama_barang,
                func.sum(
                    DetailPenjualan.qty
                ).label("qty")
            )
            .join(
                DetailPenjualan,
                Barang.id == DetailPenjualan.barang_id
            )
            .group_by(
                Barang.id,
                Barang.nama_barang
            )
            .order_by(
                desc("qty")
            )
            .limit(10)
            .all()
        )

        return [
            {
                "nama": r.nama_barang,
                "qty": float(r.qty),
            }
            for r in rows
        ]

    # =====================================================
    # GRAFIK PENJUALAN 30 HARI
    # =====================================================

    def grafik_penjualan(self, db: Session):

        awal = date.today() - timedelta(days=29)

        rows = (
            db.query(
                func.date(
                    Penjualan.tanggal
                ).label("tgl"),
                func.sum(
                    Penjualan.grand_total
                ).label("total"),
            )
            .filter(
                Penjualan.tanggal >= awal
            )
            .group_by(
                func.date(Penjualan.tanggal)
            )
            .order_by(
                func.date(Penjualan.tanggal)
            )
            .all()
        )

        return [
            {
                "label": r.tgl.strftime("%d %b"),
                "total": float(r.total),
            }
            for r in rows
        ]


dashboard_repository = DashboardRepository()