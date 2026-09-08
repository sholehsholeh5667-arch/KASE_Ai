from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import (
    dashboard_repository,
)


class DashboardService:

    def get_dashboard(
        self,
        db: Session,
    ):

        return {

            # ==========================================
            # Statistik
            # ==========================================

            "penjualan_hari_ini":
                dashboard_repository.penjualan_hari_ini(db),

            "pembelian_hari_ini":
                dashboard_repository.pembelian_hari_ini(db),

            "laba_kotor":
                dashboard_repository.laba_kotor(db),

            "jumlah_transaksi":
                dashboard_repository.jumlah_transaksi(db),

            "jumlah_barang":
                dashboard_repository.jumlah_barang(db),

            "jumlah_supplier":
                dashboard_repository.jumlah_supplier(db),

            "jumlah_pelanggan":
                dashboard_repository.jumlah_pelanggan(db),

            "stok_hampir_habis":
                dashboard_repository.stok_hampir_habis(db),

            # ==========================================
            # Dashboard
            # ==========================================

            "barang_terlaris":
                dashboard_repository.barang_terlaris(db),

            "barang_hampir_habis":
                dashboard_repository.barang_hampir_habis(db),

            "grafik":
                dashboard_repository.grafik_penjualan(db),
        }


dashboard_service = DashboardService()