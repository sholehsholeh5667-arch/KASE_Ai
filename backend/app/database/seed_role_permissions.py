from app.core.database import SessionLocal
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission


# ==========================================================
# PEMETAAN ROLE -> PERMISSION
# ==========================================================

ROLE_PERMISSIONS = {

    # ======================================================
    # OWNER
    # ======================================================

    "owner": [
        "barang.view",
        "barang.create",
        "barang.update",
        "barang.delete",

        "kategori.view",
        "kategori.create",
        "kategori.update",
        "kategori.delete",

        "supplier.view",
        "supplier.create",
        "supplier.update",
        "supplier.delete",

        "pelanggan.view",
        "pelanggan.create",
        "pelanggan.update",
        "pelanggan.delete",

        "penjualan.view",
        "penjualan.create",
        "penjualan.update",
        "penjualan.delete",

        "pembelian.view",
        "pembelian.create",
        "pembelian.update",
        "pembelian.delete",

        "stok.view",
        "stok.adjust",
        "mutasi_stok.view",

        "retur_penjualan.view",
        "retur_penjualan.create",
        "retur_penjualan.update",
        "retur_penjualan.delete",

        "retur_pembelian.view",
        "retur_pembelian.create",
        "retur_pembelian.update",
        "retur_pembelian.delete",
        "retur_pembelian.approve",
        "retur_pembelian.reject",

        "stock_opname.view",
        "stock_opname.create",
        "stock_opname.update",
        "stock_opname.approve",

        "laporan.view",
        "laporan.export",
        "laporan.laba_rugi",

        "dashboard.view",

        "muamalah.view",

        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",

        "zakat.view",

        "user.view",
        "user.create",
        "user.update",
        "user.delete",

        "hak_akses.view",
        "hak_akses.update",
    ],


    # ======================================================
    # ADMINISTRATOR
    # ======================================================

    "admin": [
        "barang.view",
        "barang.create",
        "barang.update",
        "barang.delete",

        "kategori.view",
        "kategori.create",
        "kategori.update",
        "kategori.delete",

        "supplier.view",
        "supplier.create",
        "supplier.update",
        "supplier.delete",

        "pelanggan.view",
        "pelanggan.create",
        "pelanggan.update",
        "pelanggan.delete",

        "penjualan.view",
        "penjualan.create",
        "penjualan.update",
        "penjualan.delete",

        "pembelian.view",
        "pembelian.create",
        "pembelian.update",
        "pembelian.delete",

        "stok.view",
        "stok.adjust",
        "mutasi_stok.view",

        "retur_penjualan.view",
        "retur_penjualan.create",
        "retur_penjualan.update",
        "retur_penjualan.delete",

        "retur_pembelian.view",
        "retur_pembelian.create",
        "retur_pembelian.update",
        "retur_pembelian.delete",
        "retur_pembelian.approve",
        "retur_pembelian.reject",

        "stock_opname.view",
        "stock_opname.create",
        "stock_opname.update",
        "stock_opname.approve",

        "laporan.view",
        "laporan.export",
        "laporan.laba_rugi",

        "dashboard.view",

        "muamalah.view",

        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",

        "zakat.view",

        "user.view",
        "user.create",
        "user.update",
        "user.delete",

        "hak_akses.view",
        "hak_akses.update",
    ],


    # ======================================================
    # KASIR
    # ======================================================

    "kasir": [
        "dashboard.view",

        "barang.view",
        "kategori.view",

        "pelanggan.view",
        "pelanggan.create",
        "pelanggan.update",

        "penjualan.view",
        "penjualan.create",
        "penjualan.update",

        "retur_penjualan.view",
        "retur_penjualan.create",

        "muamalah.view",

        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",

        "zakat.view",
    ],


    # ======================================================
    # GUDANG
    # ======================================================

    "gudang": [
        "dashboard.view",

        "barang.view",
        "barang.create",
        "barang.update",

        "kategori.view",
        "kategori.create",
        "kategori.update",

        "supplier.view",
        "supplier.create",
        "supplier.update",

        "stok.view",
        "stok.adjust",
        "mutasi_stok.view",

        "pembelian.view",
        "pembelian.create",
        "pembelian.update",

        "retur_pembelian.view",
        "retur_pembelian.create",
        "retur_pembelian.update",

        "stock_opname.view",
        "stock_opname.create",
        "stock_opname.update",

        "muamalah.view",

        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",
    ],


    # ======================================================
    # AKUNTAN
    # ======================================================

    "akuntan": [
        "dashboard.view",

        "barang.view",
        "pelanggan.view",
        "supplier.view",

        "penjualan.view",
        "pembelian.view",

        "retur_penjualan.view",
        "retur_pembelian.view",

        "stok.view",
        "mutasi_stok.view",

        "laporan.view",
        "laporan.export",
        "laporan.laba_rugi",

        "zakat.view",

        "muamalah.view",

        "kitab.view",
        "kitab.search",
        "kitab.translate",
        "kitab.explain",
    ],
}