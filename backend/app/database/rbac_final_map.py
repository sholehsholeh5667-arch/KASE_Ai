# ==========================================================
# RBAC FINAL MAP
# ==========================================================
#
# Sumber kebenaran pemetaan:
# METHOD + PATH -> PERMISSION
#
# Nilai khusus:
# PROGRAMMER_ONLY
# AUTHENTICATED
# PUBLIC
# AI_DYNAMIC
# IMMUTABLE
# ==========================================================


ENDPOINT_RBAC = {

    # ======================================================
    # BARANG
    # ======================================================

    ("GET", "/barang/"): "barang.view",
    ("GET", "/barang/{barang_id}"): "barang.view",
    ("POST", "/barang/"): "barang.create",
    ("PUT", "/barang/{barang_id}"): "barang.update",
    ("DELETE", "/barang/{barang_id}"): "barang.delete",


    # ======================================================
    # KATEGORI
    # ======================================================

    ("GET", "/kategori/"): "kategori.view",
    ("GET", "/kategori/{kategori_id}"): "kategori.view",
    ("POST", "/kategori/"): "kategori.create",
    ("PUT", "/kategori/{kategori_id}"): "kategori.update",
    ("DELETE", "/kategori/{kategori_id}"): "kategori.delete",


    # ======================================================
    # SUPPLIER
    # ======================================================

    ("GET", "/supplier/"): "supplier.view",
    ("GET", "/supplier/{supplier_id}"): "supplier.view",
    ("POST", "/supplier/"): "supplier.create",
    ("PUT", "/supplier/{supplier_id}"): "supplier.update",
    ("DELETE", "/supplier/{supplier_id}"): "supplier.delete",


    # ======================================================
    # PELANGGAN
    # ======================================================

    ("GET", "/pelanggan/"): "pelanggan.view",
    ("GET", "/pelanggan/{id}"): "pelanggan.view",
    ("POST", "/pelanggan/"): "pelanggan.create",
    ("PUT", "/pelanggan/{id}"): "pelanggan.update",
    ("DELETE", "/pelanggan/{id}"): "pelanggan.delete",


    # ======================================================
    # PENJUALAN
    # ======================================================

    ("GET", "/penjualan/"): "penjualan.view",
    ("GET", "/penjualan/{penjualan_id}"): "penjualan.view",
    ("GET", "/penjualan/{penjualan_id}/print-preview"):
        "penjualan.view",
    ("POST", "/penjualan/"): "penjualan.create",
    ("DELETE", "/penjualan/{penjualan_id}"):
        "penjualan.delete",


    # ======================================================
    # PEMBELIAN
    # ======================================================

    ("GET", "/pembelian/"): "pembelian.view",
    ("GET", "/pembelian/{pembelian_id}/print-preview"):
        "pembelian.view",
    ("POST", "/pembelian/"): "pembelian.create",


    # ======================================================
    # STOK
    # ======================================================
    ("GET", "/stok/mutasi"):
    "mutasi_stok.view",

    ("GET", "/stok/kartu/{barang_id}"): "stok.view",
    ("GET", "/stok/minimum"): "stok.view",

    ("POST", "/stok/opname"): "stock_opname.create",
    ("GET", "/stok/opname"): "stock_opname.view",
    ("GET", "/stok/opname/{opname_id}"):
        "stock_opname.view",
    ("POST", "/stok/opname/{opname_id}/approve"):
        "stock_opname.approve",


    # ======================================================
    # MUTASI STOK
    # ======================================================

    ("GET", "/mutasi-stok"): "mutasi_stok.view",
    ("GET", "/mutasi-stok/{mutasi_id}"):
        "mutasi_stok.view",

    ("POST", "/mutasi-stok"):
        "stok.adjust",

    ("PUT", "/mutasi-stok/{mutasi_id}"):
        "stok.adjust",

    # DELETE sengaja tidak menggunakan permission.
    # Endpoint tersebut harus IMMUTABLE.


    # ======================================================
    # DASHBOARD
    # ======================================================

    ("GET", "/dashboard/"): "dashboard.view",


    # ======================================================
    # MUAMALAH - BACA
    # ======================================================

    ("GET", "/muamalah/"): "muamalah.view",
    ("GET", "/muamalah/search/"): "muamalah.view",
    ("GET", "/muamalah/ai/search/"): "muamalah.view",
    ("GET", "/muamalah/kategori/{kategori}"):
        "muamalah.view",
    ("GET", "/muamalah/{materi_id}"):
        "muamalah.view",


    # ======================================================
    # MUAMALAH - PROGRAMMER
    # ======================================================

    ("POST", "/muamalah/"):
        "PROGRAMMER_ONLY",

    ("PUT", "/muamalah/{materi_id}"):
        "PROGRAMMER_ONLY",

    ("POST", "/muamalah/{materi_id}/activate"):
        "PROGRAMMER_ONLY",

    ("POST", "/muamalah/{materi_id}/deactivate"):
        "PROGRAMMER_ONLY",

    ("DELETE", "/muamalah/{materi_id}"):
        "PROGRAMMER_ONLY",


    # ======================================================
    # KITAB KUNING - BACA
    # ======================================================

    ("GET", "/kitab-kuning/books"):
        "kitab.view",

    ("GET", "/kitab-kuning/books/{kitab_file_id}"):
        "kitab.view",

    ("GET", "/kitab-kuning/books/{kitab_file_id}/pages"):
        "kitab.view",

    ("GET", "/kitab-kuning/books/{kitab_file_id}/pages/{page_id}"):
        "kitab.view",

    ("GET", "/kitab-kuning/books/{kitab_file_id}/search"):
        "kitab.search",

    ("GET", "/kitab-kuning/search"):
        "kitab.search",


    # ======================================================
    # KITAB KUNING - PROGRAMMER
    # ======================================================

    ("POST", "/kitab-kuning/scan-folder"):
        "PROGRAMMER_ONLY",


    # ======================================================
    # RETUR PENJUALAN
    # ======================================================

    ("GET", "/retur-penjualan/"):
        "retur_penjualan.view",

    ("GET", "/retur-penjualan/{retur_id}"):
        "retur_penjualan.view",

    ("POST", "/retur-penjualan/"):
        "retur_penjualan.create",

    ("PUT", "/retur-penjualan/{retur_id}"):
        "retur_penjualan.update",

    ("DELETE", "/retur-penjualan/{retur_id}"):
        "retur_penjualan.delete",

    ("POST", "/retur-penjualan/{retur_id}/approve"):
        "retur_penjualan.update",

    ("POST", "/retur-penjualan/{retur_id}/reject"):
        "retur_penjualan.update",


    # ======================================================
    # RETUR PEMBELIAN
    # ======================================================

    ("GET", "/retur-pembelian/"):
        "retur_pembelian.view",

    ("GET", "/retur-pembelian/{retur_id}"):
        "retur_pembelian.view",

    ("POST", "/retur-pembelian/"):
        "retur_pembelian.create",

    ("PUT", "/retur-pembelian/{retur_id}"):
        "retur_pembelian.update",

    ("DELETE", "/retur-pembelian/{retur_id}"):
        "retur_pembelian.delete",

    ("POST", "/retur-pembelian/{retur_id}/approve"):
      "retur_pembelian.approve",

    ("POST", "/retur-pembelian/{retur_id}/reject"):
       "retur_pembelian.reject",


    # ======================================================
    # LAPORAN
    # ======================================================

    ("GET", "/laporan/summary"):
        "laporan.view",

    ("GET", "/laporan/penjualan"):
        "laporan.view",

    ("GET", "/laporan/pembelian"):
        "laporan.view",

    ("GET", "/laporan/retur-penjualan"):
        "laporan.view",

    ("GET", "/laporan/retur-pembelian"):
        "laporan.view",

    ("GET", "/laporan/stok"):
        "laporan.view",

    ("GET", "/laporan/mutasi-stok"):
        "laporan.view",

    ("GET", "/laporan/produk-terlaris"):
        "laporan.view",

    ("GET", "/laporan/pelanggan"):
        "laporan.view",

    ("GET", "/laporan/supplier"):
        "laporan.view",

    ("GET", "/laporan/nilai-persediaan"):
        "laporan.view",

    ("GET", "/laporan/penjualan/filter"):
        "laporan.view",

    ("GET", "/laporan/penjualan/pdf"):
        "laporan.export",

    ("GET", "/laporan/penjualan/excel"):
        "laporan.export",

    ("GET", "/laporan/laba-rugi"):
        "laporan.laba_rugi",


    # ======================================================
    # SETTINGS
    # ======================================================

    ("GET", "/settings"):
        "ROLE_OWNER_ADMIN",

    ("PUT", "/settings"):
        "ROLE_OWNER_ADMIN",


    # ======================================================
    # USERS
    # ======================================================

    ("GET", "/users/me"):
        "AUTHENTICATED",


    # ======================================================
    # TOKO
    # ======================================================

    ("GET", "/toko/current"):
        "AUTHENTICATED",


    # ======================================================
    # AI CORE
    # ======================================================

    ("POST", "/ai/process"):
        "AI_DYNAMIC",
}


# ==========================================================
# ENDPOINT YANG MEMANG TIDAK BOLEH DIHAPUS
# ==========================================================

IMMUTABLE_ENDPOINTS = {
    (
        "DELETE",
        "/mutasi-stok/{mutasi_id}",
    ),
}


# ==========================================================
# ENDPOINT PUBLIK
# ==========================================================

PUBLIC_ENDPOINTS = {
    (
        "POST",
        "/auth/login",
    ),
    (
        "POST",
        "/auth/forgot-password",
    ),
    (
        "POST",
        "/auth/reset-password",
    ),
}