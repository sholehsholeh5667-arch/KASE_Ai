from datetime import date
from typing import List

from pydantic import BaseModel


# ==========================================================
# PENJUALAN
# ==========================================================

class LaporanPenjualanItem(BaseModel):
    id: int
    tanggal: date
    nomor: str
    pelanggan: str | None = None
    total: float

    model_config = {
        "from_attributes": True
    }


class LaporanPenjualanResponse(BaseModel):
    total_transaksi: int
    total_penjualan: float
    data: List[LaporanPenjualanItem]


# ==========================================================
# PEMBELIAN
# ==========================================================

class LaporanPembelianItem(BaseModel):
    id: int
    tanggal: date
    nomor: str
    supplier: str | None = None
    total: float

    model_config = {
        "from_attributes": True
    }


class LaporanPembelianResponse(BaseModel):
    total_transaksi: int
    total_pembelian: float
    data: List[LaporanPembelianItem]


# ==========================================================
# STOK
# ==========================================================

class LaporanStokItem(BaseModel):
    kode_barang: str
    nama_barang: str
    stok: float
    stok_minimum: float
    harga_beli: float
    harga_jual: float

    model_config = {
        "from_attributes": True
    }


class LaporanStokResponse(BaseModel):
    total_barang: int
    data: List[LaporanStokItem]


# ==========================================================
# MUTASI STOK
# ==========================================================

class LaporanMutasiItem(BaseModel):
    tanggal: date
    barang: str
    jenis: str
    qty: float
    keterangan: str | None = None

    model_config = {
        "from_attributes": True
    }


class LaporanMutasiResponse(BaseModel):
    total_data: int
    data: List[LaporanMutasiItem]


# ==========================================================
# LABA RUGI
# ==========================================================

class LaporanLabaRugiResponse(BaseModel):
    total_penjualan: float
    total_pembelian: float
    retur_penjualan: float
    retur_pembelian: float
    laba_kotor: float
    laba_bersih: float