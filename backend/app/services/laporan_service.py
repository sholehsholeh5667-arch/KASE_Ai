"""
Laporan Service
===============

Business logic untuk modul laporan.
"""

from app.repositories.laporan_repository import LaporanRepository


class LaporanService:
    """
    Service laporan.
    """

    def __init__(self, db):
        self.repository = LaporanRepository(db)

    # ==========================================
    # Dashboard
    # ==========================================

    def get_dashboard_summary(self):
        return self.repository.get_dashboard_summary()

    # ==========================================
    # Penjualan
    # ==========================================

    def get_penjualan(self):
        return self.repository.get_penjualan()

    # ==========================================
    # Pembelian
    # ==========================================

    def get_pembelian(self):
        return self.repository.get_pembelian()

    # ==========================================
    # Retur Penjualan
    # ==========================================

    def get_retur_penjualan(self):
        return self.repository.get_retur_penjualan()

    # ==========================================
    # Retur Pembelian
    # ==========================================

    def get_retur_pembelian(self):
        return self.repository.get_retur_pembelian()

    # ==========================================
    # Persediaan
    # ==========================================

    def get_stock(self):
        return self.repository.get_stock()

    # ==========================================
    # Mutasi Stok
    # ==========================================

    def get_stock_mutation(self):
        return self.repository.get_stock_mutation()

    # ==========================================
    # Produk Terlaris
    # ==========================================

    def get_top_product(self, limit: int = 10):
        return self.repository.get_top_product(limit)

    # ==========================================
    # Pelanggan
    # ==========================================

    def get_customer_report(self):
        return self.repository.get_customer_report()

    # ==========================================
    # Supplier
    # ==========================================

    def get_supplier_report(self):
        return self.repository.get_supplier_report()

    # ==========================================
    # Laba Rugi
    # ==========================================

    def get_profit_loss(
        self,
        tanggal_awal=None,
        tanggal_akhir=None
    ):
        return self.repository.get_profit_loss(
            tanggal_awal=tanggal_awal,
            tanggal_akhir=tanggal_akhir
        )

    # ==========================================
    # Nilai Persediaan
    # ==========================================

    def get_inventory_value(self):
        return self.repository.get_inventory_value()

    # ==========================================
    # Ringkasan Lengkap
    # ==========================================

    def get_summary(self):
        return {
            "dashboard": self.get_dashboard_summary(),
            "profit_loss": self.get_profit_loss(),
            "inventory": self.get_inventory_value(),
            "top_product": self.get_top_product(),
        }

    # ==========================================
    # Filter Penjualan
    # ==========================================

    def filter_penjualan(
        self,
        tanggal_awal=None,
        tanggal_akhir=None,
        kategori_id=None,
        supplier_id=None,
        pelanggan_id=None,
        barang_id=None,
        kasir_id=None,
        metode_bayar=None,
        status=None,
        keyword=None,
        sort_by="created_at",
        sort_order="DESC",
        page=1,
        limit=20
    ):
        """
        Filter laporan penjualan.
        """

        # --------------------------------------
        # Validasi Pagination
        # --------------------------------------

        if page is None or page < 1:
            page = 1

        if limit is None or limit < 1:
            limit = 20

        if limit > 100:
            limit = 100

        # --------------------------------------
        # Validasi Sorting
        # --------------------------------------

        allowed_sort = {
            "created_at",
            "tanggal",
            "total",
            "no_faktur",
        }

        if sort_by not in allowed_sort:
            sort_by = "created_at"

        if not sort_order:
            sort_order = "DESC"

        sort_order = sort_order.upper()

        if sort_order not in ("ASC", "DESC"):
            sort_order = "DESC"

        # --------------------------------------
        # Kirim ke Repository
        # --------------------------------------

        return self.repository.filter_penjualan(
            tanggal_awal=tanggal_awal,
            tanggal_akhir=tanggal_akhir,
            kategori_id=kategori_id,
            supplier_id=supplier_id,
            pelanggan_id=pelanggan_id,
            barang_id=barang_id,
            kasir_id=kasir_id,
            metode_bayar=metode_bayar,
            status=status,
            keyword=keyword,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            limit=limit,
        )