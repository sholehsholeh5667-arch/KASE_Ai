from pydantic import BaseModel
from typing import List


class DashboardBarangTerlaris(BaseModel):
    nama: str
    qty: float


class DashboardBarangHampirHabis(BaseModel):
    nama: str
    stok: float


class DashboardResponse(BaseModel):
    penjualan_hari_ini: float
    pembelian_hari_ini: float
    laba_kotor: float
    jumlah_transaksi: int
    jumlah_barang: int
    stok_hampir_habis: int
    jumlah_supplier: int
    jumlah_pelanggan: int
    barang_terlaris: List[DashboardBarangTerlaris]
    barang_hampir_habis: List[DashboardBarangHampirHabis]

    model_config = {
        "from_attributes": True
    }