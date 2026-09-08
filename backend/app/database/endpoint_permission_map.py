# ==========================================================
# FINAL ENDPOINT -> PERMISSION
# ==========================================================

ENDPOINT_PERMISSION_MAP = {

    # ==========================
    # BARANG
    # ==========================

    ("GET", "/barang/"):
        "barang.view",

    ("POST", "/barang/"):
        "barang.create",

    ("GET", "/barang/{barang_id}"):
        "barang.view",

    ("PUT", "/barang/{barang_id}"):
        "barang.update",

    ("DELETE", "/barang/{barang_id}"):
        "barang.delete",


    # ==========================
    # KATEGORI
    # ==========================

    ("GET", "/kategori/"):
        "kategori.view",

    ("POST", "/kategori/"):
        "kategori.create",

    ("GET", "/kategori/{kategori_id}"):
        "kategori.view",

    ("PUT", "/kategori/{kategori_id}"):
        "kategori.update",

    ("DELETE", "/kategori/{kategori_id}"):
        "kategori.delete",


    # ==========================
    # PELANGGAN
    # ==========================

    ("GET", "/pelanggan/"):
        "pelanggan.view",

    ("POST", "/pelanggan/"):
        "pelanggan.create",

    ("GET", "/pelanggan/{id}"):
        "pelanggan.view",

    ("PUT", "/pelanggan/{id}"):
        "pelanggan.update",

    ("DELETE", "/pelanggan/{id}"):
        "pelanggan.delete",


    # ==========================
    # PENJUALAN
    # ==========================

    ("GET", "/penjualan/"):
        "penjualan.view",

    ("POST", "/penjualan/"):
        "penjualan.create",

    ("GET", "/penjualan/{penjualan_id}"):
        "penjualan.view",

    ("GET", "/penjualan/{penjualan_id}/print-preview"):
        "penjualan.view",

    ("DELETE", "/penjualan/{penjualan_id}"):
        "penjualan.delete",


    # ==========================
    # LAPORAN
    # ==========================

    ("GET", "/laporan/laba-rugi"):
        "laporan.laba_rugi",
}